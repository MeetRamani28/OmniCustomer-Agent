import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.resolve("data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const dbPath = path.join(DB_DIR, "omnicustomer.db");
const db = new Database(dbPath, { verbose: console.log });

export function initializeDatabase() {
  console.log("[SQLite] Running migrations...");

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      intent TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      customer_name TEXT,
      status TEXT,
      expected_delivery TEXT
    );

    INSERT OR IGNORE INTO orders (order_id, customer_name, status, expected_delivery) VALUES
    ('ORD-123', 'John Doe', 'In Transit - Out for delivery', 'Today by 8 PM'),
    ('ORD-456', 'Jane Smith', 'Processing', '2026-09-15'),
    ('ORD-789', 'Patel', 'Delayed due to weather', '2026-09-18');
  `);

  console.log("[SQLite] Migrations complete and schema is ready.");
}

export default db;
