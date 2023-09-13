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

const messages = factory.getArray<Message>("messages", {
  id: 0,
  text: "",
});

messages.push({
  id: 1,
  text: "Hello, World!",
});

messages.push({
  id: 2,
  text: "Hello, World!",
});

console.log("hi");
console.log([...messages]);
