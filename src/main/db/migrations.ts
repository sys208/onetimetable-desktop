import { Database } from "bun:sqlite";

export function runMigrations(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    (db.query("SELECT name FROM _migrations").all() as { name: string }[]).map((r) => r.name)
  );

  for (const migration of migrations) {
    if (!applied.has(migration.name)) {
      db.exec(migration.sql);
      db.run("INSERT INTO _migrations (name) VALUES (?)", [migration.name]);
    }
  }
}

const migrations: { name: string; sql: string }[] = [
  // Future migrations go here
];
