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

const data = factory.getArray<BinaryData>("data", {
  format: "binary",
  serializer: {
    encode,
    decode,
  },
});

data.push({
  id: 1,
  bytes: new Uint8Array([1, 2, 3]),
});

data.push({
  id: 2,
  bytes: new Uint8Array([1, 2, 3]),
});

console.log([...data]);
*/
