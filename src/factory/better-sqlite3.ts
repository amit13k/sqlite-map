import BetterSqlite3 from "better-sqlite3";
import { createArray } from "../array/array.js";
import * as BetterSqlite3Map from "../map/better-sqlite3.js";
import { DEFAULT_SERIALIZER, Serializer, StorageFactory } from "./factory.js";

/**
 * Creates a StorageFactory that uses BetterSqlite3 as the underlying storage.
 *
 * @param options Database: BetterSqlite3.Database
 * @returns
 */
export function create(options: {
  database: BetterSqlite3.Database;
}): StorageFactory {
  const db = options.database;

  function getOrCreateTable(name: string, valueFormat: "text" | "binary") {
    const format = valueFormat === "text" ? "TEXT" : "BLOB";

    db.prepare(
      `CREATE TABLE IF NOT EXISTS ${name} (key TEXT PRIMARY KEY, value ${format})`,
    ).run();
  }

  const getMap: StorageFactory["getMap"] = (
    name: string,
    options?:
      | {
          format: "text";
          serializer?: Serializer<string>;
        }
      | {
          format: "binary";
          serializer?: Serializer<Uint8Array>;
        },
  ) => {
    const format = options?.format ?? "text";
    const serializer = options?.serializer ?? DEFAULT_SERIALIZER[format];

    getOrCreateTable(name, format);
    return BetterSqlite3Map.create(db, name, serializer);
  };

  const getArray: StorageFactory["getArray"] = <T>(
    name: string,
    defaultValue: T,
    options?:
      | {
          format: "text";
          serializer?: Serializer<string>;
        }
      | {
          format: "binary";
          serializer?: Serializer<Uint8Array>;
        },
  ) => {
    return createArray(getMap(name, options), defaultValue);
  };

  return {
    getMap,

    getArray,

    deleteStorage(name) {
      db.prepare(`DROP TABLE ${name}`).run();
    },

    getStorageNames() {
      const res: any[] = db
        .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
        .all();
      return res.map((x) => x.name);
    },

    clear(this: StorageFactory) {
      for (const name of this.getStorageNames()) {
        this.deleteStorage(name);
      }
    },
  } satisfies StorageFactory;
}
