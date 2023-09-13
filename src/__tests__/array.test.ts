import BetterSqlite3 from "better-sqlite3";
import { expect, test } from "vitest";
import * as BetterSqlite3Factory from "../factory/better-sqlite3.js";
import { createArray } from "../array/array.js";

test("push", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");
  const array = createArray(map, "");

  expect([...array]).toEqual([]);
  expect(array.length).toBe(0);

  array.push("value1");
  expect([...array]).toEqual(["value1"]);

  array.push("value2");
  expect([...array]).toEqual(["value1", "value2"]);
});

test("pop", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");

  const array = createArray(map, "");

  array.push("value1");
  array.push("value2");

  expect(array.pop()).toBe("value2");
  expect(array.pop()).toBe("value1");
  expect(array.pop()).toBe(undefined);
});

test("shift", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");

  const array = createArray(map, "");

  array.push("value1");
  array.push("value2");

  expect(array.shift()).toBe("value1");
  expect(array.shift()).toBe("value2");
  expect(array.shift()).toBe(undefined);
});

test("unshift", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");

  const array = createArray(map, "");

  array.unshift("value1");
  array.unshift("value2");

  expect([...array]).toEqual(["value2", "value1"]);
});

test("splice", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");

  const array = createArray(map, "");

  array.push("value1");
  array.push("value2");
  array.push("value3");

  expect([...array.splice(0, 1)]).toEqual(["value1"]);

  expect([...array]).toEqual(["value2", "value3"]);

  expect([...array.splice(1, 1)]).toEqual(["value3"]);

  expect([...array]).toEqual(["value2"]);

  expect([...array.splice(0, 1)]).toEqual(["value2"]);
});

test("more splice", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");

  const array = createArray(map, "");

  array.push("value1");
  array.push("value2");
  array.push("value3");
  array.push("value4");
  array.push("value5");

  expect([...array.splice(1, 2)]).toEqual(["value2", "value3"]);

  expect([...array]).toEqual(["value1", "value4", "value5"]);

  expect([...array.splice(0, 100)]).toEqual(["value1", "value4", "value5"]);

  expect([...array.splice(200, 100)]).toEqual([]);
});

test("splice with item list", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");

  const array = createArray(map, "");

  array.push("value1");
  array.push("value2");
  array.push("value3");
  array.push("value4");
  array.push("value5");

  expect([...array.splice(1, 2, "value6", "value7")]).toEqual([
    "value2",
    "value3",
  ]);

  expect([...array]).toEqual([
    "value1",
    "value4",
    "value5",
    "value6",
    "value7",
  ]);
});

test("splice with negative start", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");

  const array = createArray(map, "");

  array.push("value1");
  array.push("value2");
  array.push("value3");
  array.push("value4");
  array.push("value5");

  expect([...array.splice(-2, 2)]).toEqual(["value4", "value5"]);

  expect([...array]).toEqual(["value1", "value2", "value3"]);

  expect([...array.splice(-1, 1)]).toEqual(["value3"]);

  expect([...array]).toEqual(["value1", "value2"]);

  expect([...array.splice(-10000, 1)]).toEqual(["value1"]);

  expect([...array]).toEqual(["value2"]);
});

test("slice", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<string>("map1");

  const array = createArray(map, "");

  array.push("value1");
  array.push("value2");
  array.push("value3");
  array.push("value4");
  array.push("value5");

  expect([...array.slice(1, 3)]).toEqual(["value2", "value3"]);

  expect([...array]).toEqual([
    "value1",
    "value2",
    "value3",
    "value4",
    "value5",
  ]);

  expect([...array.slice(0, 100)]).toEqual([
    "value1",
    "value2",
    "value3",
    "value4",
    "value5",
  ]);

  expect([...array.slice(200, 100)]).toEqual([]);

  expect([...array.slice(-2, 100)]).toEqual(["value4", "value5"]);

  expect([...array.slice(-2, -1)]).toEqual(["value4"]);

  expect([...array.slice(-2)]).toEqual(["value4", "value5"]);
});

test("forEach", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<number>("map1");

  const array = createArray(map, 0);

  array.push(1);
  array.push(2);
  array.push(3);
  array.push(4);
  array.push(5);

  const result: number[] = [];

  array.forEach((value) => {
    result.push(value);
  });

  expect(result).toEqual([1, 2, 3, 4, 5]);
});

test("map", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<number>("map1");

  const array = createArray(map, 0);

  array.push(1);
  array.push(2);
  array.push(3);
  array.push(4);
  array.push(5);

  expect(array.map((value) => value * 2)).toEqual([2, 4, 6, 8, 10]);
});

test("filter", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<number>("map1");

  const array = createArray(map, 0);

  array.push(1);
  array.push(2);
  array.push(3);
  array.push(4);
  array.push(5);

  expect(array.filter((value) => value % 2 === 0)).toEqual([2, 4]);
});

test("reduce", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<number>("map1");

  const array = createArray(map, 0);

  array.push(1);
  array.push(2);
  array.push(3);
  array.push(4);
  array.push(5);

  expect(array.reduce((acc, value) => acc + value, 0)).toEqual(15);
});

test("get", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<number>("map1");

  const array = createArray(map, 0);

  array.push(1);
  array.push(2);
  array.push(3);
  array.push(4);
  array.push(5);

  expect(array.get(0)).toEqual(1);
  expect(array.get(1)).toEqual(2);
  expect(array.get(2)).toEqual(3);
  expect(array.get(3)).toEqual(4);
  expect(array.get(4)).toEqual(5);
  expect(array.get(5)).toEqual(undefined);
});

test("set", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<number>("map1");

  const array = createArray(map, 0);

  array.set(0, 1);
  array.set(1, 2);
  array.set(2, 3);
  array.set(3, 4);
  array.set(4, 5);

  expect([...array]).toEqual([1, 2, 3, 4, 5]);
});

test("set more than capacity of array", () => {
  const database = new BetterSqlite3(":memory:");
  const map = BetterSqlite3Factory.create({ database }).getMap<number>("map1");
  const array = createArray(map, 0);

  array.set(4, 1);

  expect([...array]).toEqual([0, 0, 0, 0, 1]);
});
