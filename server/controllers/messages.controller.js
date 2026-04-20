import { getDb } from '../config/database.js';

export async function create(req, res) {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }

    const db = await getDb();
    const result = await db.run(`
      INSERT INTO messages (name, email, message)
      VALUES (?, ?, ?)
    `, [name, email, message]);

    const newMessage = await db.get('SELECT * FROM messages WHERE id = ?', [result.lastID]);
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAll(req, res) {
  try {
    const db = await getDb();
    const { status } = req.query;

    let query = 'SELECT * FROM messages WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const messages = await db.all(query, params);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['unread', 'read', 'archived'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const db = await getDb();
    const existing = await db.get('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Message not found' });

    await db.run('UPDATE messages SET status = ? WHERE id = ?', [status, req.params.id]);
    const updated = await db.get('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM messages WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Message not found' });

    await db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
