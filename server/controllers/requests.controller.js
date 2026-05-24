import { getDb } from '../config/database.js';

export async function create(req, res) {
  const db = await getDb();
  // Acquire a dedicated client for this transaction
  const client = await db.getClient();
  try {
    const { type, name, email, phone, message, product_id, products, idempotency_key } = req.body;

    if (!type || !name) {
      return res.status(400).json({ error: 'type and name are required' });
    }

    const validTypes = ['contact', 'inquiry', 'purchase_intent', 'cart_request'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
    }

    // Length guards
    if (name.length > 200) return res.status(400).json({ error: 'Name must be 200 characters or fewer.' });
    if (message && message.length > 5000) return res.status(400).json({ error: 'Message must be 5000 characters or fewer.' });

    // Idempotency check — return existing request if duplicate key detected (before transaction)
    if (idempotency_key) {
      const existing = await client.get('SELECT * FROM requests WHERE idempotency_key = $1', [idempotency_key]);
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    // BEGIN transaction — PostgreSQL uses MVCC so no need for IMMEDIATE
    await client.exec('BEGIN');

    try {
      // Deduct stock for orders
      if (type === 'purchase_intent' && product_id) {
        const p = await client.get('SELECT stock, name FROM products WHERE id = $1 FOR UPDATE', [product_id]);
        if (!p || p.stock < 1) {
          await client.exec('ROLLBACK');
          return res.status(400).json({ error: `Insufficient stock for ${p ? p.name : 'product'}.` });
        }
        await client.run('UPDATE products SET stock = stock - 1 WHERE id = $1', [product_id]);
      } else if (type === 'cart_request' && Array.isArray(products) && products.length > 0) {
        for (const item of products) {
          const p = await client.get('SELECT stock, name FROM products WHERE id = $1 FOR UPDATE', [item.id]);
          if (!p) {
            await client.exec('ROLLBACK');
            return res.status(400).json({ error: `Product "${item.name}" not found.` });
          }
          if (p.stock < item.quantity) {
            await client.exec('ROLLBACK');
            return res.status(400).json({ error: `Insufficient stock for "${p.name}". Available: ${p.stock}, Requested: ${item.quantity}` });
          }
          await client.run('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.id]);
        }
      }

      // Serialize products array to JSON string if provided
      const productsJson = Array.isArray(products) ? JSON.stringify(products) : null;

      // Calculate total amount for cart requests
      let totalAmount = null;
      if (type === 'cart_request' && Array.isArray(products)) {
        totalAmount = products.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      } else if (type === 'purchase_intent' && product_id) {
        const prod = await client.get('SELECT price FROM products WHERE id = $1', [product_id]);
        totalAmount = prod ? prod.price : null;
      }

      const result = await client.run(`
        INSERT INTO requests (type, name, email, phone, message, product_id, products, idempotency_key, total_amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [type, name, email || null, phone || null, message || null, product_id || null, productsJson, idempotency_key || null, totalAmount]);

      // Log activity for cart requests and purchase intents
      if (['cart_request', 'purchase_intent'].includes(type)) {
        await client.run(`
          INSERT INTO activity_logs (action, entity_type, entity_id, details)
          VALUES ($1, $2, $3, $4)
        `, ['New request received', 'request', result.lastID, `Type: ${type}, Customer: ${name}`]);
      }

      await client.exec('COMMIT');

      const request = await client.get('SELECT * FROM requests WHERE id = $1', [result.lastID]);
      res.status(201).json(request);
    } catch (innerErr) {
      try { await client.exec('ROLLBACK'); } catch (_) { /* already rolled back */ }
      throw innerErr;
    }
  } catch (err) {
    console.error('[requests.create]', err);
    res.status(500).json({ error: 'Failed to save request.' });
  } finally {
    client.release();
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
    let paramIdx = 1;

    if (status) {
      query += ` AND r.status = $${paramIdx++}`;
      params.push(status);
    }

    if (type) {
      query += ` AND r.type = $${paramIdx++}`;
      params.push(type);
    }

    if (search) {
      query += ` AND (r.name ILIKE $${paramIdx} OR r.email ILIKE $${paramIdx} OR r.phone ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ' ORDER BY r.created_at DESC';

    const requests = await db.all(query, params);
    res.json(requests);
  } catch (err) {
    console.error('[requests]', err);
    res.status(500).json({ error: 'Failed to process request.' });
  }
}

export async function getById(req, res) {
  try {
    const db = await getDb();
    const request = await db.get(`
      SELECT r.*, p.name as product_name, p.image_url as product_image
      FROM requests r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.id = $1
    `, [req.params.id]);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    console.error('[requests]', err);
    res.status(500).json({ error: 'Failed to process request.' });
  }
}

export async function updateStatus(req, res) {
  const db = await getDb();
  const client = await db.getClient();
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'contacted', 'confirmed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    await client.exec('BEGIN');

    try {
      const existing = await client.get('SELECT * FROM requests WHERE id = $1 FOR UPDATE', [req.params.id]);
      if (!existing) {
        await client.exec('ROLLBACK');
        return res.status(404).json({ error: 'Request not found' });
      }

      // Handle stock restoration/deduction if moving to/from cancelled
      if (existing.status !== 'cancelled' && status === 'cancelled') {
        // Restore stock
        if (existing.type === 'purchase_intent' && existing.product_id) {
          await client.run('UPDATE products SET stock = stock + 1 WHERE id = $1', [existing.product_id]);
        } else if (existing.type === 'cart_request' && existing.products) {
          const items = JSON.parse(existing.products);
          if (Array.isArray(items)) {
            for (const item of items) {
              await client.run('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity || 1, item.id]);
            }
          }
        }
      } else if (existing.status === 'cancelled' && status !== 'cancelled') {
        // Re-deduct stock when un-cancelling
        if (existing.type === 'purchase_intent' && existing.product_id) {
          const p = await client.get('SELECT stock, name FROM products WHERE id = $1 FOR UPDATE', [existing.product_id]);
          if (!p || p.stock < 1) {
            await client.exec('ROLLBACK');
            return res.status(400).json({ error: `Insufficient stock for ${p ? p.name : 'product'}. Cannot restore order.` });
          }
          await client.run('UPDATE products SET stock = stock - 1 WHERE id = $1', [existing.product_id]);
        } else if (existing.type === 'cart_request' && existing.products) {
          const items = JSON.parse(existing.products);
          if (Array.isArray(items)) {
            for (const item of items) {
              const p = await client.get('SELECT stock, name FROM products WHERE id = $1 FOR UPDATE', [item.id]);
              if (!p || p.stock < (item.quantity || 1)) {
                await client.exec('ROLLBACK');
                return res.status(400).json({ error: `Insufficient stock for "${item.name}". Cannot restore order.` });
              }
              await client.run('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity || 1, item.id]);
            }
          }
        }
      }

      await client.run('UPDATE requests SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);

      // Log activity
      await client.run(`
        INSERT INTO activity_logs (action, entity_type, entity_id, details)
        VALUES ($1, $2, $3, $4)
      `, ['Status updated', 'request', req.params.id, `Changed from: ${existing.status} → ${status}`]);

      await client.exec('COMMIT');

      const updated = await client.get('SELECT * FROM requests WHERE id = $1', [req.params.id]);
      res.json(updated);
    } catch (innerErr) {
      try { await client.exec('ROLLBACK'); } catch (_) { /* already rolled back */ }
      throw innerErr;
    }
  } catch (err) {
    console.error('[requests.updateStatus]', err);
    res.status(500).json({ error: 'Failed to process request.' });
  } finally {
    client.release();
  }
}
