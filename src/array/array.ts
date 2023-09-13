import { SuperMap } from "../factory/factory.js";

export type SuperArray<T> = {
  push(value: T): void;
  pop(): T | undefined;
  shift(): T | undefined;
  unshift(value: T): void;
  splice(start: number, deleteCount?: number, ...itemList: T[]): T[];
  slice(start?: number, end?: number): T[];
  forEach(fn: (value: T, index: number, array: SuperArray<T>) => void): void;
  map<U>(fn: (value: T, index: number, array: SuperArray<T>) => U): U[];
  filter(fn: (value: T, index: number, array: SuperArray<T>) => boolean): T[];
  reduce<U>(
    fn: (acc: U, value: T, index: number, array: SuperArray<T>) => U,
    init: U,
  ): U;
  [Symbol.iterator](): Iterator<T>;
  readonly length: number;
  toString: () => string;
  get(index: number): T | undefined;
  set(index: number, value: T): void;
};

export function createArray<T, MapType extends SuperMap<T>>(
  map: MapType,
  defaultValue: T,
): SuperArray<T> {
  return {
    push(value) {
      map.set(map.size.toString(), value);
    },

    pop() {
      const index = map.size - 1;
      const value = map.get(index.toString());
      map.delete(index.toString());
      return value;
    },

    shift() {
      const firstValue = map.get("0");
      for (let i = 1; i < map.size; i++) {
        const value = map.get(i.toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        map.set((i - 1).toString(), value);
      }

      map.delete((map.size - 1).toString());

      return firstValue;
    },

    unshift(value) {
      map.forEach((value, key) => {
        map.set((parseInt(key) + 1).toString(), value);
      });
      map.set("0", value);
    },

    splice(start, deleteCount = map.size - start, ...itemList) {
      const currentMapSize = map.size;

      if (start >= currentMapSize) {
        return [];
      } else if (start < -currentMapSize) {
        start = 0;
      } else if (start >= -currentMapSize && start < 0) {
        start = currentMapSize + start;
      }

      deleteCount = Math.min(deleteCount, currentMapSize - start);

      const deleted: T[] = [];

      for (let i = start; i < start + deleteCount; i++) {
        const value = map.get(i.toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        map.delete(i.toString());
        deleted.push(value);
      }

      for (let i = start; i < currentMapSize - deleteCount; i++) {
        const value = map.get((i + deleteCount).toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        map.set(i.toString(), value);
      }

      for (let i = currentMapSize - deleteCount; i < currentMapSize; i++) {
        map.delete(i.toString());
      }

      const newMapSize = map.size;
      for (let i = 0; i < itemList.length; i++) {
        map.set((newMapSize + i).toString(), itemList[i]);
      }

      return deleted;
    },

    slice(start, end) {
      const currentMapSize = map.size;

      if (start === undefined || start < -currentMapSize) {
        start = 0;
      } else if (start >= currentMapSize) {
        return [];
      } else if (start >= -currentMapSize && start < 0) {
        start = currentMapSize + start;
      }

      if (end === undefined || end >= currentMapSize) {
        end = currentMapSize;
      } else if (end >= -currentMapSize && end < 0) {
        end = currentMapSize + end;
      } else if (end < -currentMapSize) {
        end = 0;
      }

      if (end <= start) {
        return [];
      }

      const sliced: T[] = [];

      for (let i = start; i < end; i++) {
        const value = map.get(i.toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        sliced.push(value);
      }

      return sliced;
    },

    forEach(fn) {
      for (let i = 0; i < map.size; i++) {
        const value = map.get(i.toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        fn(value, i, this);
      }
    },

    map<U>(fn: (value: T, index: number, array: SuperArray<T>) => U) {
      const mapped: U[] = [];
      for (let i = 0; i < map.size; i++) {
        const value = map.get(i.toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        mapped.push(fn(value, i, this));
      }
      return mapped;
    },

    filter(fn: (value: T, index: number, array: SuperArray<T>) => boolean) {
      const filtered: T[] = [];
      for (let i = 0; i < map.size; i++) {
        const value = map.get(i.toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        if (fn(value, i, this)) {
          filtered.push(value);
        }
      }
      return filtered;
    },

    reduce(fn, init) {
      let acc = init;
      for (let i = 0; i < map.size; i++) {
        const value = map.get(i.toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        acc = fn(acc, value, i, this);
      }
      return acc;
    },

    *[Symbol.iterator]() {
      for (let i = 0; i < map.size; i++) {
        const value = map.get(i.toString());
        if (value === undefined) {
          throw new Error("Value not found");
        }
        yield value;
      }
    },
    get length() {
      return map.size;
    },

    toString() {
      return `BetterSqlite3 Persistent Array (${map.name}) [${[...this]
        .map((x) => JSON.stringify(x))
        .join(", ")}]`;
    },

    get(index) {
      return map.get(index.toString());
    },

    set(index, value) {
      if (index >= map.size) {
        for (let i = map.size; i < index; i++) {
          map.set(i.toString(), defaultValue);
        }
      }
      return map.set(index.toString(), value);
    },
  };
}
