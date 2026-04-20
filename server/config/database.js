import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data.db');

let dbPromise;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: DB_PATH,
      driver: sqlite3.Database
    }).then(async (db) => {
      await db.exec('PRAGMA foreign_keys = ON;');
      return db;
    });
  }
  return dbPromise;
}

export async function initDatabase() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'super_admin')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      theme_key TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand_id INTEGER NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      description TEXT,
      image_url TEXT,
      display_sections TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('contact', 'inquiry', 'purchase_intent')),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT,
      product_id INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'completed')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  const { count } = await db.get('SELECT COUNT(*) as count FROM users');
  if (count === 0) {
    await seedDatabase(db);
  }
}

async function seedDatabase(db) {
  const hash = bcrypt.hashSync('admin123', 10);
  await db.run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['System Admin', 'admin@system.com', hash, 'super_admin']
  );

  await db.run('INSERT INTO brands (name, slug, theme_key, description) VALUES (?, ?, ?, ?)', ['Media', 'media', 'media', 'Premium home appliances for modern living']);
  await db.run('INSERT INTO brands (name, slug, theme_key, description) VALUES (?, ?, ?, ?)', ['Arcodym', 'arcodym', 'arcodym', 'Innovative kitchen and home solutions']);
  await db.run('INSERT INTO brands (name, slug, theme_key, description) VALUES (?, ?, ?, ?)', ['S-Challenge', 's-challenge', 's-challenge', 'High-performance appliances built to last']);

  // We assign null or empty strings since the dashboard will populate them with true image URLs after uploading, 
  // but for testing let's load a few placeholders mimicking the exact file names the frontend previously used safely if we want.
  // Actually, keeping them empty proves the system correctly fetches actual uploads!
  
  await db.run('INSERT INTO products (name, brand_id, price, stock, description, image_url, display_sections) VALUES (?, ?, ?, ?, ?, ?, ?)', ['Media Split AC 12000BTU', 1, 85000, 25, 'Energy-efficient split air conditioner', '', '["hot_deals"]']);
  await db.run('INSERT INTO products (name, brand_id, price, stock, description, image_url, display_sections) VALUES (?, ?, ?, ?, ?, ?, ?)', ['Media Chest Freezer 300L', 1, 62000, 15, 'Large capacity chest freezer', '', '[]']);
  await db.run('INSERT INTO products (name, brand_id, price, stock, description, image_url, display_sections) VALUES (?, ?, ?, ?, ?, ?, ?)', ['Arcodym Gas Cooker 5-Burner', 2, 48000, 20, 'Stainless steel gas cooker', '', '["hot_deals"]']);
  await db.run('INSERT INTO products (name, brand_id, price, stock, description, image_url, display_sections) VALUES (?, ?, ?, ?, ?, ?, ?)', ['S-Challenge Heating Array', 3, 32000, 18, 'Water heater system', '', '["hot_deals"]']);
}
