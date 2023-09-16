import BetterSqlite3 from "better-sqlite3";
import { Serializer, SuperMap } from "../factory/factory.js";
import crypto from "crypto";

export function create<T, Relations extends string[]>(
  database: BetterSqlite3.Database,
  name: string,
  serializer: Serializer<any>,
): SuperMap<T, Relations> {
  const res: [{ name: string }] = database.pragma(`table_info(${name})`) as any;
  const existingRelations = new Set(
    res.map((x) => x.name).filter((x) => x !== "key" && x !== "value"),
  );

  function addRelationsIfNotExists(relations: string[]) {
    for (const relation of relations) {
      if (existingRelations.has(relation)) {
        return;
      }
      database.prepare(`ALTER TABLE ${name} ADD COLUMN ${relation} TEXT`).run();

      existingRelations.add(relation);
    }
  }

  return {
    name,

    get(key) {
      const res: any = database
        .prepare(`SELECT value FROM ${name} WHERE key = ?`)
        .get(key);

      if (res === undefined) {
        return undefined;
      }

      return serializer.decode(res.value);
    },

    set(key, value, relations) {
      if (!relations) {
        database
          .prepare(`REPLACE INTO ${name} (key, value) VALUES (?, ?)`)
          .run(key, serializer.encode(value));
        return this;
      }

      addRelationsIfNotExists(Object.keys(relations));

      database
        .prepare(
          `REPLACE INTO ${name} (key, value, ${Object.keys(relations).join(
            ", ",
          )}) VALUES (?, ?, ${Object.values(relations)
            .map(() => "?")
            .join(", ")})`,
        )
        .run(
          key,
          serializer.encode(value),
          ...Object.values(relations).map((x) =>
            (Array.isArray(x) ? x : [x]).join(","),
          ),
        );

      return this;
    },

    clear() {
      database.prepare(`DELETE FROM ${name}`).run();
      return this;
    },

    delete(key) {
      const res = database
        .prepare(`DELETE FROM ${name} WHERE key = ?`)
        .run(key);
      return res.changes > 0;
    },

    forEach(fn: (value: T, key: string, map: Map<string, T>) => void) {
      for (const [key, value] of this) {
        fn(value, key, this);
      }
      return this;
    },

    has(key) {
      return (
        database.prepare(`SELECT value FROM ${name} WHERE key = ?`).get(key) !==
        undefined
      );
    },

    get size() {
      const res: any = database
        .prepare(`SELECT COUNT(*) AS count FROM ${name}`)
        .get();

      if (res === undefined) {
        throw new Error("Invalid state");
      }

      return Number(res.count);
    },

    *[Symbol.iterator]() {
      const res: any[] = database.prepare(`SELECT * FROM ${name}`).all();
      for (const row of res) {
        yield [row.key, serializer.decode(row.value)];
      }
    },

    keys: function* (this: Map<string, T>) {
      const res: any[] = database.prepare(`SELECT key FROM ${name}`).all();
      for (const row of res) {
        yield row.key;
      }
    },

    values: function* (this: Map<string, T>) {
      const res: any[] = database.prepare(`SELECT value FROM ${name}`).all();
      for (const row of res) {
        yield serializer.decode(row.value);
      }
    },

    entries: function* (this: Map<string, T>) {
      const res: any[] = database.prepare(`SELECT * FROM ${name}`).all();
      for (const row of res) {
        yield [row.key, serializer.decode(row.value)];
      }
    },

    [Symbol.toStringTag]: "BetterSqlite3 Persistent Map",

    toString() {
      return `BetterSqlite3 Persistent Map (${name}) { ${Array.from(this)
        .map(([key, value]) => `${key} => ${JSON.stringify(value)}`)
        .join(", ")} }`;
    },

    getRelated(relations?: Record<Relations[number], string | string[]>) {
      const rows: any = database.prepare(`SELECT * FROM ${name}`).all();

      const res: {
        key: string;
        value: T;
        relations: Record<Relations[number], string[]>;
      }[] = [];

      for (const row of rows) {
        const value = serializer.decode(row.value);

        const relationValues = {} as Record<Relations[number], string[]>;

        for (const key of existingRelations) {
          const columnValues = row[key];
          if (!columnValues) continue;

          const values = new Set(columnValues.split(","));

          if (relations) {
            let queryValues = relations[key as Relations[number]] ?? [];

            if (queryValues.length === 0) continue;

            let foundOne = false;
            for (const queryValue of queryValues) {
              if (values.has(queryValue)) {
                foundOne = true;
                break;
              }
            }
            if (!foundOne) {
              continue;
            }
          }

          relationValues[key as Relations[number]] = [...values] as string[];
        }

        if (relations && Object.values(relationValues).length === 0) continue;

        res.push({ key: row.key, value, relations: relationValues });
      }

      return res;
    },

    deleteRelated(
      this: SuperMap<T, Relations>,
      relations: Record<Relations[number], string[]>,
    ) {
      this.getRelated(relations).forEach((x) => this.delete(x.key));
    },

    addRelated(value: T, relations: Record<Relations[number], string[]>) {
      this.set(crypto.randomUUID(), value, relations);
    },
  } satisfies SuperMap<T, Relations>;
}
