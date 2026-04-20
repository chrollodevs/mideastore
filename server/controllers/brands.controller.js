import { getDb } from '../config/database.js';

export async function getAll(req, res) {
  try {
    const db = await getDb();
    const brands = await db.all('SELECT * FROM brands ORDER BY id');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBySlug(req, res) {
  try {
    const db = await getDb();
    const brand = await db.get('SELECT * FROM brands WHERE slug = ?', [req.params.slug]);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    // Include products for this brand
    const products = await db.all('SELECT * FROM products WHERE brand_id = ?', [brand.id]);
    res.json({ ...brand, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
