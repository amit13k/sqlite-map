import Database from "better-sqlite3";
import { createBetterSqlite3Factory } from "../index.js";

const database = new Database(":memory:");

const factory = createBetterSqlite3Factory({
  database,
});

type Message = {
  id: number;
  text: string;
};

const messages = factory.getMap<Message>("messages");

messages.set("message1", {
  id: 1,
  text: "Hello, World!",
});

messages.set("message2", {
  id: 2,
  text: "Hello, World!",
});

console.log([...messages.entries()]);
