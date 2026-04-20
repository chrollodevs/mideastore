import { getDb } from '../config/database.js';

const ALLOWED_CATEGORIES = new Set([
  'air_conditioner',
  'refrigerator',
  'freezer',
  'washing_machine',
  'small_appliance'
]);

function parseDisplaySections(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeCategory(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (!ALLOWED_CATEGORIES.has(normalized)) return '__invalid__';
  return normalized;
}

async function resolveBrandId(db, payload) {
  if (payload.brand_id !== undefined && payload.brand_id !== null && `${payload.brand_id}`.trim() !== '') {
    const parsed = Number(payload.brand_id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  if (!payload.brand) return null;
  const brandValue = `${payload.brand}`.trim();
  if (!brandValue) return null;

  if (/^\d+$/.test(brandValue)) {
    const parsed = Number(brandValue);
    return parsed > 0 ? parsed : null;
  }

  const brand = await db.get(
    'SELECT id FROM brands WHERE slug = ? OR LOWER(name) = LOWER(?)',
    [brandValue, brandValue]
  );
  return brand?.id ?? null;
}

export async function getAll(req, res) {
  try {
    const db = await getDb();
    const products = await db.all(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      ORDER BY p.created_at DESC
    `);
    
    // Parse JSON arrays for the frontend strictly
    const parsedProducts = products.map((product) => ({
      ...product,
      category: product.category || 'small_appliance',
      display_sections: parseDisplaySections(product.display_sections)
    }));

    res.json(parsedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getById(req, res) {
  try {
    const db = await getDb();
    const product = await db.get(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    product.category = product.category || 'small_appliance';
    product.display_sections = parseDisplaySections(product.display_sections);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const { name, price, stock, description, image_url, display_sections } = req.body;
    const db = await getDb();
    const brandId = await resolveBrandId(db, req.body);
    const category = normalizeCategory(req.body.category) || 'small_appliance';

    if (!name || !brandId || price == null) {
      return res.status(400).json({ error: 'name, brand_id (or brand), and price are required' });
    }

    if (category === '__invalid__') {
      return res.status(400).json({ error: `Invalid category. Allowed values: ${Array.from(ALLOWED_CATEGORIES).join(', ')}` });
    }

    const result = await db.run(`
      INSERT INTO products (name, brand_id, category, price, stock, description, image_url, display_sections)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, brandId, category, price, stock || 0, description || '', image_url || '', JSON.stringify(display_sections || [])]);

    const product = await db.get(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [result.lastID]);
    product.display_sections = parseDisplaySections(product.display_sections);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    const { name, price, stock, description, image_url, display_sections } = req.body;
    const db = await getDb();
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);

    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const resolvedBrandId = await resolveBrandId(db, req.body);
    const nextCategory = normalizeCategory(req.body.category);
    if (nextCategory === '__invalid__') {
      return res.status(400).json({ error: `Invalid category. Allowed values: ${Array.from(ALLOWED_CATEGORIES).join(', ')}` });
    }

    await db.run(`
      UPDATE products SET name = ?, brand_id = ?, category = ?, price = ?, stock = ?, description = ?, image_url = ?, display_sections = ?
      WHERE id = ?
    `, [
      name || existing.name,
      resolvedBrandId || existing.brand_id,
      nextCategory || existing.category || 'small_appliance',
      price ?? existing.price,
      stock ?? existing.stock,
      description ?? existing.description,
      image_url !== undefined ? image_url : existing.image_url,
      display_sections ? JSON.stringify(display_sections) : existing.display_sections,
      req.params.id
    ]);

    const product = await db.get(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `, [req.params.id]);
    product.display_sections = parseDisplaySections(product.display_sections);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
