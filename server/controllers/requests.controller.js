import { getDb } from '../config/database.js';

export async function create(req, res) {
  try {
    const { type, name, email, phone, message, product_id, products } = req.body;

    if (!type || !name) {
      return res.status(400).json({ error: 'type and name are required' });
    }

    const validTypes = ['contact', 'inquiry', 'purchase_intent', 'cart_request'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
    }

    const db = await getDb();

    // Serialize products array to JSON string if provided
    const productsJson = products ? JSON.stringify(products) : null;

    const result = await db.run(`
      INSERT INTO requests (type, name, email, phone, message, product_id, products)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [type, name, email || null, phone || null, message || null, product_id || null, productsJson]);

    const request = await db.get('SELECT * FROM requests WHERE id = ?', [result.lastID]);

    // Log activity for cart requests and purchase intents
    if (['cart_request', 'purchase_intent'].includes(type)) {
      await db.run(`
        INSERT INTO activity_logs (action, entity_type, entity_id, details)
        VALUES (?, ?, ?, ?)
      `, ['New request received', 'request', result.lastID, `Type: ${type}, Customer: ${name}`]);
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAll(req, res) {
  try {
    const db = await getDb();
    const { status, type, search } = req.query;

    let query = `
      SELECT r.*, p.name as product_name
      FROM requests r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND r.type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (r.name LIKE ? OR r.email LIKE ? OR r.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.created_at DESC';

    const requests = await db.all(query, params);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getById(req, res) {
  try {
    const db = await getDb();
    const request = await db.get(`
      SELECT r.*, p.name as product_name, p.image_url as product_image
      FROM requests r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'contacted', 'confirmed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const db = await getDb();
    const existing = await db.get('SELECT * FROM requests WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Request not found' });

    await db.run('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id]);

    // Log activity
    await db.run(`
      INSERT INTO activity_logs (action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?)
    `, ['Status updated', 'request', req.params.id, `Changed to: ${status}`]);

    const updated = await db.get('SELECT * FROM requests WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
