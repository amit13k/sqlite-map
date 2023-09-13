import BetterSqlite3 from "better-sqlite3";

export function getAllTableNames(database: BetterSqlite3.Database) {
  return new Set(
    database
      .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
      .all()
      .map((row) => (row as any).name),
  );
}
