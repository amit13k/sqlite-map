import BetterSqlite3 from "better-sqlite3";
import { Serializer, SuperMap } from "../factory/factory.js";

export function create<T>(
  database: BetterSqlite3.Database,
  name: string,
  serializer: Serializer<any>,
): SuperMap<T> {
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

    set(key, value) {
      database
        .prepare(`REPLACE INTO ${name} (key, value) VALUES (?, ?)`)
        .run(key, serializer.encode(value));
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
  } satisfies SuperMap<T>;
}
