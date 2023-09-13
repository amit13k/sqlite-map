# sqlite-map

Simple persistent map and array datastructures built on top of better-sqlite3.

## Why ?

Sometimes we just need a simple way to persist data. Maybe we are performing expensive operations and want to cache the results while exploring a problem. With better-sqlite3 we can store everything in a single file while working with just Map/Array type datastructures.

## Installation

```
pnpm i better-sqlite3 sqlite-map
pnpm i -D @types/better-sqlite3
```

## Example

```ts
import Database from "better-sqlite3";
import { createBetterSqlite3Factory } from "sqlite-map";

const database = new Database("db.sqlite");

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
```

## Storing binary data

Simplest way to store object that may contain UInt8Array data is to use a serializer such as msgpack.

```ts
import Database from "better-sqlite3";
import { createBetterSqlite3Factory } from "sqlite-map";
import { encode, decode } from "@msgpack/msgpack";

const database = new Database("mydb.sqlite");

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

console.log([...data.entries()]);
```

## Storage Factory

```ts
const factory = createBetterSqlite3Factory({ database });
```

The factory instance can be used to create multiple maps/arrays. Each map/array has a different name and represents a sqlite table in the database.

## Persistent Array

```ts
import Database from "better-sqlite3";
import { createBetterSqlite3Factory } from "sqlite-map";

const database = new Database("db.sqlite");

const factory = createBetterSqlite3Factory({
  database,
});

const messages = factory.getArray<string>(
  "messages", // name of the sqlite table
  "", // default value that will be used when performing set(index, value) operations that could resize the array creating holes
);

messages.push("value1");
console.log([...messages]);
```
