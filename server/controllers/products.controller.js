import { getDb } from '../config/database.js';

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
    const parsedProducts = products.map(p => ({
      ...p,
      display_sections: JSON.parse(p.display_sections || '[]')
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
    
    product.display_sections = JSON.parse(product.display_sections || '[]');
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const { name, brand_id, price, stock, description, image_url, display_sections } = req.body;

    if (!name || !brand_id || price == null) {
      return res.status(400).json({ error: 'name, brand_id, and price are required' });
    }

    const db = await getDb();
    const result = await db.run(`
      INSERT INTO products (name, brand_id, price, stock, description, image_url, display_sections)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, brand_id, price, stock || 0, description || '', image_url || '', JSON.stringify(display_sections || [])]);

    const product = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    const { name, brand_id, price, stock, description, image_url, display_sections } = req.body;
    const db = await getDb();
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);

    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await db.run(`
      UPDATE products SET name = ?, brand_id = ?, price = ?, stock = ?, description = ?, image_url = ?, display_sections = ?
      WHERE id = ?
    `, [
      name || existing.name,
      brand_id || existing.brand_id,
      price ?? existing.price,
      stock ?? existing.stock,
      description ?? existing.description,
      image_url !== undefined ? image_url : existing.image_url,
      display_sections ? JSON.stringify(display_sections) : existing.display_sections,
      req.params.id
    ]);

    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
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
