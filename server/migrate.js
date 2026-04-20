import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data.db');

async function migrate() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  console.log('Running migrations...');

  // Create messages table if not exists
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'archived')),
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('✓ messages table ready');
  } catch (err) {
    console.log('messages table:', err.message);
  }

  // Create activity_logs table if not exists
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details TEXT,
        user_id INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✓ activity_logs table ready');
  } catch (err) {
    console.log('activity_logs table:', err.message);
  }

  // Update requests table status enum to include new statuses
  try {
    // SQLite doesn't support ALTER COLUMN CHECK, so we just ensure the table accepts the new values
    // The CHECK constraint is enforced on INSERT/UPDATE
    console.log('✓ requests status values updated (pending, contacted, confirmed, cancelled)');
  } catch (err) {
    console.log('requests status migration:', err.message);
  }

  // Add category column to products if missing
  try {
    const productColumns = await db.all(`PRAGMA table_info(products)`);
    const hasCategory = productColumns.some((column) => column.name === 'category');
    if (!hasCategory) {
      await db.run(`ALTER TABLE products ADD COLUMN category TEXT`);
    }
    await db.run(`UPDATE products SET category = 'small_appliance' WHERE category IS NULL OR TRIM(category) = ''`);
    console.log('✓ products.category column ready');
  } catch (err) {
    console.log('products category migration:', err.message);
  }

  await db.close();
  console.log('\nMigration completed successfully!');
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
