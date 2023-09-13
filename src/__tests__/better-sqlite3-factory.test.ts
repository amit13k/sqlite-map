import { expect, test } from "vitest";
import { create } from "../factory/better-sqlite3.js";
import BetterSqlite3 from "better-sqlite3";
import { getAllTableNames } from "../test-utils.js";

test("getMap", () => {
  const database = new BetterSqlite3(":memory:");

  const factory = create({ database });
  factory.getMap("map1");
  factory.getMap("map2");
  factory.getMap("map3");

  expect(factory.getStorageNames()).toEqual(["map1", "map2", "map3"]);

  expect(getAllTableNames(database)).toEqual(new Set(["map1", "map2", "map3"]));

  factory.deleteStorage("map2");

  expect(factory.getStorageNames()).toEqual(["map1", "map3"]);
  expect(getAllTableNames(database)).toEqual(new Set(["map1", "map3"]));

  factory.clear();

  expect(factory.getStorageNames()).toEqual([]);
  expect(getAllTableNames(database)).toEqual(new Set([]));

  factory.getMap("map1");
  factory.getMap("map2");

  expect(factory.getStorageNames()).toEqual(["map1", "map2"]);
  expect(getAllTableNames(database)).toEqual(new Set(["map1", "map2"]));
});

test("getArray", () => {
  const factory = create({ database: new BetterSqlite3(":memory:") });
  factory.getArray("array1", 0);
  factory.getArray("array2", 0);
  factory.getArray("array3", 0);

  expect(factory.getStorageNames()).toEqual(["array1", "array2", "array3"]);

  factory.deleteStorage("array2");

  expect(factory.getStorageNames()).toEqual(["array1", "array3"]);

  factory.clear();

  expect(factory.getStorageNames()).toEqual([]);

  factory.getArray("array1", 0);
  factory.getArray("array2", 0);

  expect(factory.getStorageNames()).toEqual(["array1", "array2"]);
});
