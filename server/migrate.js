import { getDb } from './config/database.js';

async function migrate() {
  try {
    const db = await getDb();
    await db.exec("ALTER TABLE products ADD COLUMN display_sections TEXT DEFAULT '[]';");
    console.log("Migration successful: added display_sections");
  } catch (err) {
    if (err.message.includes("duplicate column name")) {
      console.log("Migration already applied.");
    } else {
      console.error(err);
    }
  }
}

migrate();
