import { Database } from "bun:sqlite";
import { createAllTables } from "./schema";

let db: Database | null = null;

export function getDb(dbPath?: string): Database {
  if (db) return db;

  db = new Database(dbPath || ":memory:");
  db.exec("PRAGMA journal_mode=WAL");
  db.exec("PRAGMA foreign_keys=ON");

  createAllTables(db);
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
