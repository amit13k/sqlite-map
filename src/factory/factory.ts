import { SuperArray } from "../array/array.js";

export type Serializer<T> = {
  encode(value: any): T;
  decode(value: T): any;
};

export type SuperMap<T> = Map<string, T> & {
  name: string;
  toString: () => string;
};

/** A factory for creating SuperMaps and SuperArrays. */
export type StorageFactory = {
  /**
   * @param name Name of the storage (this represents the table name in the
   *   sqlite database)
   * @param options.format "text" or "binary" `format` determines how the values
   *   are stored in the database. "text" uses sqlite's TEXT type, and "binary"
   *   uses sqlite's BLOB type. The default is "text".
   * @param options.serializer A serializer for encoding and decoding values.
   *   The default text serializer is JSON.stringify and JSON.parse. For binary,
   *   consider using something like msgpack and passing the {encode, decode}
   *   functions.
   * @returns
   */
  getMap: <T = any>(
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
  ) => SuperMap<T>;

  /**
   * @param name Name of the storage (this represents the table name in the
   *   sqlite database)
   * @param options Same as getMap
   * @returns A SuperArray built on top of SuperMap backed by a sqlite database.
   */
  getArray: <T>(
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
  ) => SuperArray<T>;

  /**
   * Deletes the storage(sqlite table) from the database.
   *
   * @param name Name of the storage (this represents the table name in the
   *   sqlite database)
   */
  deleteStorage(name: string): void;

  /** @returns An array of all the storage names (sqlite tables in the database). */
  getStorageNames(): string[];

  /** Deletes all the storage (sqlite tables) from the database. */
  clear(): void;
};

export const defaultTextSerializer: Serializer<string> = {
  encode(value) {
    return JSON.stringify(value);
  },

  decode(value) {
    return JSON.parse(value);
  },
};

export const DEFAULT_SERIALIZER = {
  text: {
    encode(value) {
      return JSON.stringify(value);
    },

    decode(value) {
      return JSON.parse(value);
    },
  } satisfies Serializer<string>,

  binary: {
    encode(value) {
      return new TextEncoder().encode(JSON.stringify(value));
    },

    decode(value) {
      return JSON.parse(new TextDecoder().decode(value));
    },
  } satisfies Serializer<Uint8Array>,
};
