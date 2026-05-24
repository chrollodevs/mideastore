import { getDb } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function buildDashboardStats(db) {
  const productsRow = await db.get('SELECT COUNT(*) as count FROM products');
  const brandsRow = await db.get('SELECT COUNT(*) as count FROM brands');
  const requestsRow = await db.get('SELECT COUNT(*) as count FROM requests');

  const pendingRow = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'pending'");
  const contactedRow = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'contacted'");
  const confirmedRow = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'confirmed'");
  const cancelledRow = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'cancelled'");

  const todayRow = await db.get("SELECT COUNT(*) as count FROM requests WHERE created_at::date = CURRENT_DATE");
  const weekRow = await db.get("SELECT COUNT(*) as count FROM requests WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'");
  const monthRow = await db.get("SELECT COUNT(*) as count FROM requests WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'");

  // Brand request counts using PostgreSQL jsonb_array_elements
  const brandRequests = await db.all(`
    WITH request_products AS (
      SELECT p.brand_id
      FROM requests r
      JOIN products p ON p.id = r.product_id
      WHERE r.product_id IS NOT NULL
      UNION ALL
      SELECT p.brand_id
      FROM requests r
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE
          WHEN r.products IS NOT NULL AND r.products != '' AND r.products::jsonb IS NOT NULL
          THEN r.products::jsonb
          ELSE '[]'::jsonb
        END
      ) AS j(elem)
      JOIN products p ON p.id = (j.elem->>'id')::INTEGER
      WHERE r.type = 'cart_request' AND r.products IS NOT NULL AND r.products != '' AND r.products != '[]'
    )
    SELECT b.name, b.slug, COUNT(rp.brand_id) as count
    FROM brands b
    LEFT JOIN request_products rp ON rp.brand_id = b.id
    GROUP BY b.id, b.name, b.slug
    ORDER BY b.id
  `);

  // Top requested products
  const topProducts = await db.all(`
    WITH request_products AS (
      SELECT r.product_id
      FROM requests r
      WHERE r.product_id IS NOT NULL
      UNION ALL
      SELECT (j.elem->>'id')::INTEGER as product_id
      FROM requests r
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE
          WHEN r.products IS NOT NULL AND r.products != '' AND r.products::jsonb IS NOT NULL
          THEN r.products::jsonb
          ELSE '[]'::jsonb
        END
      ) AS j(elem)
      WHERE r.type = 'cart_request' AND r.products IS NOT NULL AND r.products != '' AND r.products != '[]'
    )
    SELECT p.name, p.id, COUNT(*) as request_count
    FROM request_products rp
    JOIN products p ON p.id = rp.product_id
    GROUP BY p.id, p.name
    ORDER BY request_count DESC
    LIMIT 5
  `);

  const lowStockProducts = await db.all(`
    SELECT id, name, stock FROM products
    WHERE stock > 0 AND stock <= 5
    ORDER BY stock ASC
    LIMIT 5
  `);

  const recentActivity = await db.all(`
    SELECT * FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 10
  `);

  const totalMsgRow = await db.get('SELECT COUNT(*) as count FROM messages');
  const unreadMsgRow = await db.get("SELECT COUNT(*) as count FROM messages WHERE status = 'unread'");

  return {
    products: parseInt(productsRow?.count) || 0,
    brands: parseInt(brandsRow?.count) || 0,
    requests: parseInt(requestsRow?.count) || 0,
    pendingRequests: parseInt(pendingRow?.count) || 0,
    contactedRequests: parseInt(contactedRow?.count) || 0,
    confirmedRequests: parseInt(confirmedRow?.count) || 0,
    cancelledRequests: parseInt(cancelledRow?.count) || 0,
    todayRequests: parseInt(todayRow?.count) || 0,
    weekRequests: parseInt(weekRow?.count) || 0,
    monthRequests: parseInt(monthRow?.count) || 0,
    brandRequests: Array.isArray(brandRequests) ? brandRequests.map(r => ({ ...r, count: parseInt(r.count) || 0 })) : [],
    topProducts: Array.isArray(topProducts) ? topProducts.map(r => ({ ...r, request_count: parseInt(r.request_count) || 0 })) : [],
    lowStockProducts: Array.isArray(lowStockProducts) ? lowStockProducts : [],
    recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
    totalMessages: parseInt(totalMsgRow?.count) || 0,
    unreadMessages: parseInt(unreadMsgRow?.count) || 0
  };
}

export async function getStats(req, res) {
  try {
    const db = await getDb();
    const stats = await buildDashboardStats(db);
    res.json(stats);
  } catch (err) {
    console.error('[admin.getStats]', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
}

export async function getDashboard(req, res) {
  try {
    const db = await getDb();
    const stats = await buildDashboardStats(db);
    res.json({
      products: stats.topProducts,
      orders: [],
      stats
    });
  } catch (err) {
    console.error('[admin.getDashboard]', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard.' });
  }
}

export async function getAdmins(req, res) {
  try {
    const db = await getDb();
    const admins = await db.all("SELECT id, name, email, role, created_at FROM users WHERE role IN ('admin', 'super_admin')");
    res.json(admins);
  } catch (err) {
    console.error('[admin.getAdmins]', err);
    res.status(500).json({ error: 'Failed to retrieve admins.' });
  }
}

export async function createAdmin(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const assignedRole = role === 'super_admin' ? 'super_admin' : 'admin';
    
    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) return res.status(400).json({ error: 'User already exists' });
    
    const password_hash = bcrypt.hashSync(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, password_hash, assignedRole]
    );
    res.status(201).json({ id: result.lastID, name, email, role: assignedRole });
  } catch (err) {
    console.error('[admin.createAdmin]', err);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
}

export async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;
    if (id === String(req.user.id) || id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    
    const db = await getDb();
    const target = await db.get('SELECT id, role FROM users WHERE id = $1', [id]);
    if (!target) return res.status(404).json({ error: 'User not found' });

    await db.run('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[admin.deleteAdmin]', err);
    res.status(500).json({ error: 'Failed to delete admin.' });
  }
}
