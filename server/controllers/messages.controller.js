import { getDb } from '../config/database.js';

const MAX_NAME_LEN = 200;
const MAX_EMAIL_LEN = 254;
const MAX_PHONE_LEN = 30;
const MAX_MESSAGE_LEN = 5000;

export async function create(req, res) {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required.' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Length guards
    if (name.length > MAX_NAME_LEN)
      return res.status(400).json({ error: `Name must be ${MAX_NAME_LEN} characters or fewer.` });
    if (email.length > MAX_EMAIL_LEN)
      return res.status(400).json({ error: `Email must be ${MAX_EMAIL_LEN} characters or fewer.` });
    if (phone && phone.length > MAX_PHONE_LEN)
      return res.status(400).json({ error: `Phone must be ${MAX_PHONE_LEN} characters or fewer.` });
    if (message.length > MAX_MESSAGE_LEN)
      return res.status(400).json({ error: `Message must be ${MAX_MESSAGE_LEN} characters or fewer.` });

    const db = await getDb();
    const result = await db.run(`
      INSERT INTO messages (name, phone, email, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [name, phone || null, email, message]);

    const newMessage = await db.get('SELECT * FROM messages WHERE id = $1', [result.lastID]);
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('[messages.create]', err);
    res.status(500).json({ error: 'Failed to save message.' });
  }
}

export async function getAll(req, res) {
  try {
    const db = await getDb();
    const { status } = req.query;

    let query = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (status) {
      const validStatuses = ['unread', 'read', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
      }
      query += ` AND status = $${paramIdx++}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const messages = await db.all(query, params);
    res.json(messages);
  } catch (err) {
    console.error('[messages.getAll]', err);
    res.status(500).json({ error: 'Failed to retrieve messages.' });
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
    const existing = await db.get('SELECT * FROM messages WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Message not found' });

    await db.run('UPDATE messages SET status = $1 WHERE id = $2', [status, req.params.id]);
    const updated = await db.get('SELECT * FROM messages WHERE id = $1', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error('[messages.updateStatus]', err);
    res.status(500).json({ error: 'Failed to update message status.' });
  }
}

export async function remove(req, res) {
  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM messages WHERE id = $1', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Message not found' });

    await db.run('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('[messages.remove]', err);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
}
