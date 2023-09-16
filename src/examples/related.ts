import Database from "better-sqlite3";
import { createBetterSqlite3Factory } from "../index.js";

const database = new Database(":memory:");

const factory = createBetterSqlite3Factory({
  database,
});

type User = {
  id: string;
};

type Post = {
  content: string;
};

const users = factory.getMap<User>("users");

const posts = factory.getMap<Post, ["user_id"]>("posts");

users.set("user1", { id: "user1" });

// we can associate one or more user_ids with the post
posts.set("post1", { content: "post1" }, { user_id: ["user1"] });
posts.set("post2", { content: "post2" }, { user_id: ["user1"] });

// we can get all posts that match any of the user_ids
console.log([...posts.getRelated({ user_id: ["user1"] })]);
