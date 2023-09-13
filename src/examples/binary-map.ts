/*
import Database from "better-sqlite3";
import { createBetterSqlite3Factory } from "../index.js";
import { encode, decode } from "@msgpack/msgpack";

const database = new Database(":memory:");

const factory = createBetterSqlite3Factory({
  database,
});

type BinaryData = {
  id: number;
  bytes: Uint8Array;
};

const data = factory.getMap<BinaryData>("data", {
  format: "binary",
  serializer: {
    encode,
    decode,
  },
});

data.set("message1", {
  id: 1,
  bytes: new Uint8Array([1, 2, 3]),
});

data.set("message2", {
  id: 2,
  bytes: new Uint8Array([1, 2, 3]),
});

console.log([...data.entries()]);
*/
