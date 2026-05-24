import 'dotenv/config';
import pg from 'pg';

async function run() {
  console.log('Seeding...');
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    await pool.query("INSERT INTO brands (name, slug, theme_key, description) VALUES ('Media', 'media', 'media', 'Premium home appliances for modern living') ON CONFLICT DO NOTHING");
    await pool.query("INSERT INTO brands (name, slug, theme_key, description) VALUES ('Arcodym', 'arcodym', 'arcodym', 'Innovative kitchen and home solutions') ON CONFLICT DO NOTHING");
    await pool.query("INSERT INTO brands (name, slug, theme_key, description) VALUES ('S-Challenge', 's-challenge', 's-challenge', 'High-performance appliances built to last') ON CONFLICT DO NOTHING");
    
    await pool.query("INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections) VALUES ('Media Split AC 12000BTU', 1, 'air_conditioner', 85000, 25, 'Energy-efficient split air conditioner', '', '[\"hot_deals\"]')");
    await pool.query("INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections) VALUES ('Media Chest Freezer 300L', 1, 'freezer', 62000, 15, 'Large capacity chest freezer', '', '[]')");
    await pool.query("INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections) VALUES ('Arcodym Gas Cooker 5-Burner', 2, 'small_appliance', 48000, 20, 'Stainless steel gas cooker', '', '[\"hot_deals\"]')");
    await pool.query("INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections) VALUES ('S-Challenge Heating Array', 3, 'small_appliance', 32000, 18, 'Water heater system', '', '[\"hot_deals\"]')");
    console.log('Seeded successfully!');
  } catch(e) {
    console.error('Error seeding:', e);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
