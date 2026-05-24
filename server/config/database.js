import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// ── Connection Pool ─────────────────────────────────────────────────────────
// Supports DATABASE_URL (Supabase, Render, Railway) or individual env vars.
const isLocalhost = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');
const sslConfig = isLocalhost ? false : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
  max: 5,                // Keep low for free-tier hosts
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// ── Adapter Layer ───────────────────────────────────────────────────────────
// Exposes db.get(), db.all(), db.run(), db.exec() for a clean controller API.
// Controllers use $1, $2, ... (PostgreSQL native placeholders).

const db = {
  /**
   * Return a single row (or undefined if not found).
   */
  async get(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows[0];
  },

  /**
   * Return all rows as an array.
   */
  async all(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows;
  },

  /**
   * Execute an INSERT/UPDATE/DELETE statement.
   * For INSERTs with RETURNING id, returns { lastID }.
   * For UPDATE/DELETE, returns { changes }.
   */
  async run(sql, params = []) {
    const result = await pool.query(sql, params);
    return {
      lastID: result.rows?.[0]?.id ?? null,
      changes: result.rowCount,
    };
  },

  /**
   * Execute raw SQL (for BEGIN/COMMIT/ROLLBACK or DDL).
   */
  async exec(sql) {
    await pool.query(sql);
  },

  /**
   * Acquire a dedicated client for transactions.
   * Usage: const client = await db.getClient();
   *        try { ... } finally { client.release(); }
   */
  async getClient() {
    const client = await pool.connect();
    // Wrap client with same adapter API for convenience
    return {
      async get(sql, params = []) {
        const result = await client.query(sql, params);
        return result.rows[0];
      },
      async all(sql, params = []) {
        const result = await client.query(sql, params);
        return result.rows;
      },
      async run(sql, params = []) {
        const result = await client.query(sql, params);
        return {
          lastID: result.rows?.[0]?.id ?? null,
          changes: result.rowCount,
        };
      },
      async exec(sql) {
        await client.query(sql);
      },
      release() {
        client.release();
      },
    };
  },
};

export async function getDb() {
  return db;
}

// ── Schema Initialization ───────────────────────────────────────────────────
export async function initDatabase() {
  // Test the connection
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT NOW()');
    console.log('[DB] PostgreSQL connection established.');
  } catch (err) {
    console.error('[DB] WARNING: Could not connect to the database on startup. Server will continue running, but DB operations will fail until it is available. Error:', err.message);
    return; // Abort schema init but don't throw, allowing server to start
  } finally {
    if (client) client.release();
  }

  try {

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'super_admin')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      theme_key TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      brand_id INTEGER NOT NULL REFERENCES brands(id),
      category TEXT DEFAULT 'small_appliance',
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      description TEXT,
      image_url TEXT,
      display_sections TEXT DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('contact', 'inquiry', 'purchase_intent', 'cart_request')),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT,
      product_id INTEGER REFERENCES products(id),
      products TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'contacted', 'confirmed', 'cancelled')),
      idempotency_key TEXT UNIQUE,
      updated_at TIMESTAMPTZ,
      total_amount REAL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'archived')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Performance indexes (IF NOT EXISTS is safe to run every startup)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
    CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
    CREATE INDEX IF NOT EXISTS idx_requests_idempotency ON requests(idempotency_key);
    CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
  `);
  console.log('[DB] Schema and indexes verified.');

  // Seed initial data if users table is empty
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
  if (parseInt(rows[0].count) === 0) {
    await seedDatabase();
  }
  } catch (err) {
    console.error('[DB] Schema initialization failed:', err.message);
  }
}

async function seedDatabase() {
  const seedEmail = process.env.SEED_ADMIN_EMAIL;
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!seedEmail || !seedPassword) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars are required when the DB is empty. ' +
      'Set them in server/.env (see server/.env.example).'
    );
  }

  const hash = bcrypt.hashSync(seedPassword, 10);
  await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
    ['System Admin', seedEmail, hash, 'super_admin']
  );

  await pool.query('INSERT INTO brands (name, slug, theme_key, description) VALUES ($1, $2, $3, $4)', ['Media', 'media', 'media', 'Premium home appliances for modern living']);
  await pool.query('INSERT INTO brands (name, slug, theme_key, description) VALUES ($1, $2, $3, $4)', ['Arcodym', 'arcodym', 'arcodym', 'Innovative kitchen and home solutions']);
  await pool.query('INSERT INTO brands (name, slug, theme_key, description) VALUES ($1, $2, $3, $4)', ['S-Challenge', 's-challenge', 's-challenge', 'High-performance appliances built to last']);

  await pool.query('INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', ['Media Split AC 12000BTU', 1, 'air_conditioner', 85000, 25, 'Energy-efficient split air conditioner', '', '["hot_deals"]']);
  await pool.query('INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', ['Media Chest Freezer 300L', 1, 'freezer', 62000, 15, 'Large capacity chest freezer', '', '[]']);
  await pool.query('INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', ['Arcodym Gas Cooker 5-Burner', 2, 'small_appliance', 48000, 20, 'Stainless steel gas cooker', '', '["hot_deals"]']);
  await pool.query('INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', ['S-Challenge Heating Array', 3, 'small_appliance', 32000, 18, 'Water heater system', '', '["hot_deals"]']);

  console.log('[DB] Seed data inserted.');
}

// Graceful shutdown
export async function closeDb() {
  await pool.end();
}
