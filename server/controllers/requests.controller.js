import { getDb } from '../config/database.js';

export async function create(req, res) {
  try {
    const { type, name, email, phone, message, product_id } = req.body;

    if (!type || !name) {
      return res.status(400).json({ error: 'type and name are required' });
    }

    const validTypes = ['contact', 'inquiry', 'purchase_intent'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
    }

    const db = await getDb();
    const result = await db.run(`
      INSERT INTO requests (type, name, email, phone, message, product_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [type, name, email || null, phone || null, message || null, product_id || null]);

    const request = await db.get('SELECT * FROM requests WHERE id = ?', [result.lastID]);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAll(req, res) {
  try {
    const db = await getDb();
    const requests = await db.all(`
      SELECT r.*, p.name as product_name
      FROM requests r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'completed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const db = await getDb();
    const existing = await db.get('SELECT * FROM requests WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Request not found' });

    await db.run('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id]);
    const updated = await db.get('SELECT * FROM requests WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
