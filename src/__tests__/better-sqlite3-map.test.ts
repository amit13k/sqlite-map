import BetterSqlite3 from "better-sqlite3";
import { expect, test } from "vitest";
import { Serializer } from "../factory/factory.js";
import { create } from "../map/better-sqlite3.js";

const jsonTextSerializer: Serializer<string> = {
  encode: JSON.stringify,
  decode: JSON.parse,
};

function createTable(database: BetterSqlite3.Database, name: string) {
  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS ${name} (key TEXT PRIMARY KEY, value TEXT)`,
    )
    .run();
}

test("use map", () => {
  const database = new BetterSqlite3(":memory:");
  createTable(database, "map1");

  const map = create(database, "map1", jsonTextSerializer);

  expect([...map.entries()]).toEqual([]);
  expect(map.size).toBe(0);
  expect([...map.values()]).toEqual([]);
  expect([...map.keys()]).toEqual([]);

  map.set("key1", "value1");
  expect([...map.entries()]).toEqual([["key1", "value1"]]);

  map.set("key2", "value2");
  expect([...map.entries()]).toEqual([
    ["key1", "value1"],
    ["key2", "value2"],
  ]);

  expect([...map.values()]).toEqual(["value1", "value2"]);

  expect([...map.keys()]).toEqual(["key1", "key2"]);

  expect(map.size).toBe(2);

  expect(map.get("key1")).toBe("value1");

  expect(map.has("key1")).toBe(true);

  expect(map.delete("key1")).toBe(true);

  expect(map.has("key1")).toBe(false);

  expect(map.size).toBe(1);

  expect([...map.entries()]).toEqual([["key2", "value2"]]);

  expect(map.clear()).toBe(map);

  expect([...map.entries()]).toEqual([]);

  expect(map.size).toBe(0);

  expect(map.clear()).toBe(map);

  expect([...map.entries()]).toEqual([]);
});

test("use non existent table", () => {
  const database = new BetterSqlite3(":memory:");

  const map = create(database, "map1", jsonTextSerializer);

  expect(() => map.set("key1", "value1")).throws();
  expect(() => map.get("key1")).throws();
  expect(() => map.has("key1")).throws();
  expect(() => map.delete("key1")).throws();
  expect(() => map.clear()).throws();
  expect(() => [...map.entries()]).throws();
  expect(() => [...map.values()]).throws();
  expect(() => [...map.keys()]).throws();
  expect(() => map.size).throws();
  expect(() => map.forEach(() => {})).throws();
  expect(() => [...map]).throws();
});

test("set related ids", () => {
  const database = new BetterSqlite3(":memory:");

  type User = {
    name: string;
  };

  type Post = {
    content: string;
  };

  createTable(database, "map1");
  createTable(database, "map2");

  const users = create<User, []>(database, "map1", jsonTextSerializer);
  const posts = create<Post, ["user_id"]>(database, "map2", jsonTextSerializer);

  users.set("user1", { name: "user1" });
  users.set("user2", { name: "user2" });

  posts.set("post1", { content: "post1" }, { user_id: ["user1"] });
  posts.set("post2", { content: "post2" }, { user_id: ["user2"] });

  expect(posts.getRelated({ user_id: ["user1"] })).toEqual([
    {
      key: "post1",
      value: { content: "post1" },
      relations: { user_id: ["user1"] },
    },
  ]);

  expect(posts.getRelated({ user_id: ["user2"] })).toEqual([
    {
      key: "post2",
      value: { content: "post2" },
      relations: { user_id: ["user2"] },
    },
  ]);

  expect(posts.getRelated({ user_id: ["user1", "user2"] })).toEqual([
    {
      key: "post1",
      value: { content: "post1" },
      relations: { user_id: ["user1"] },
    },
    {
      key: "post2",
      value: { content: "post2" },
      relations: { user_id: ["user2"] },
    },
  ]);

  expect(posts.getRelated()).toEqual([
    {
      key: "post1",
      value: { content: "post1" },
      relations: { user_id: ["user1"] },
    },
    {
      key: "post2",
      value: { content: "post2" },
      relations: { user_id: ["user2"] },
    },
  ]);
});

test("add related data", () => {
  const database = new BetterSqlite3(":memory:");

  type User = {
    name: string;
  };

  type Post = {
    content: string;
  };

  createTable(database, "map1");
  createTable(database, "map2");

  const users = create<User, []>(database, "map1", jsonTextSerializer);
  const posts = create<Post, ["user_id"]>(database, "map2", jsonTextSerializer);

  users.set("user1", { name: "user1" });
  users.set("user2", { name: "user2" });

  posts.addRelated({ content: "post1" }, { user_id: ["user1"] });
  posts.addRelated({ content: "post2" }, { user_id: ["user2"] });

  const user1Posts = posts.getRelated({ user_id: ["user1"] });
  const user2Posts = posts.getRelated({ user_id: ["user2"] });

  user1Posts.forEach((x) => expect(x.value.content).toBe("post1"));

  user2Posts.forEach((x) => expect(x.value.content).toBe("post2"));
});

test("delete related data", () => {
  const database = new BetterSqlite3(":memory:");

  type User = {
    name: string;
  };

  type Post = {
    content: string;
  };

  createTable(database, "map1");
  createTable(database, "map2");

  const users = create<User, []>(database, "map1", jsonTextSerializer);
  const posts = create<Post, ["user_id"]>(database, "map2", jsonTextSerializer);

  users.set("user1", { name: "user1" });
  users.set("user2", { name: "user2" });

  posts.addRelated({ content: "post1" }, { user_id: ["user1"] });
  posts.addRelated({ content: "post2" }, { user_id: ["user2"] });

  expect(posts.getRelated({ user_id: ["user1"] }).length).toBe(1);
  expect(posts.getRelated({ user_id: ["user2"] }).length).toBe(1);

  posts.deleteRelated({ user_id: ["user1"] });

  expect(posts.getRelated({ user_id: ["user1"] })).toEqual([]);

  posts.deleteRelated({ user_id: ["user2"] });

  expect(posts.getRelated({ user_id: ["user2"] })).toEqual([]);
});
