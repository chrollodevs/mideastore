import { getDb } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function buildDashboardStats(db) {
  const { count: products } = await db.get('SELECT COUNT(*) as count FROM products');
  const { count: brands } = await db.get('SELECT COUNT(*) as count FROM brands');
  const { count: requests } = await db.get('SELECT COUNT(*) as count FROM requests');

  const { count: pendingRequests } = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'pending'");
  const { count: contactedRequests } = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'contacted'");
  const { count: confirmedRequests } = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'confirmed'");
  const { count: cancelledRequests } = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'cancelled'");

  const { count: todayRequests } = await db.get("SELECT COUNT(*) as count FROM requests WHERE date(created_at) = date('now')");
  const { count: weekRequests } = await db.get("SELECT COUNT(*) as count FROM requests WHERE date(created_at) >= date('now', '-7 days')");
  const { count: monthRequests } = await db.get("SELECT COUNT(*) as count FROM requests WHERE date(created_at) >= date('now', '-30 days')");

  const brandRequests = await db.all(`
    WITH request_products AS (
      SELECT p.brand_id
      FROM requests r
      JOIN products p ON p.id = r.product_id
      WHERE r.product_id IS NOT NULL
      UNION ALL
      SELECT p.brand_id
      FROM requests r
      JOIN json_each(CASE WHEN json_valid(COALESCE(r.products, '[]')) THEN COALESCE(r.products, '[]') ELSE '[]' END) j
      JOIN products p ON p.id = CAST(json_extract(j.value, '$.id') AS INTEGER)
      WHERE r.type = 'cart_request'
    )
    SELECT b.name, b.slug, COUNT(rp.brand_id) as count
    FROM brands b
    LEFT JOIN request_products rp ON rp.brand_id = b.id
    GROUP BY b.id, b.name, b.slug
    ORDER BY b.id
  `);

  const topProducts = await db.all(`
    WITH request_products AS (
      SELECT r.product_id as product_id
      FROM requests r
      WHERE r.product_id IS NOT NULL
      UNION ALL
      SELECT CAST(json_extract(j.value, '$.id') AS INTEGER) as product_id
      FROM requests r
      JOIN json_each(CASE WHEN json_valid(COALESCE(r.products, '[]')) THEN COALESCE(r.products, '[]') ELSE '[]' END) j
      WHERE r.type = 'cart_request'
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

  const { count: totalMessages } = await db.get('SELECT COUNT(*) as count FROM messages');
  const { count: unreadMessages } = await db.get("SELECT COUNT(*) as count FROM messages WHERE status = 'unread'");

  return {
    products: products || 0,
    brands: brands || 0,
    requests: requests || 0,
    pendingRequests: pendingRequests || 0,
    contactedRequests: contactedRequests || 0,
    confirmedRequests: confirmedRequests || 0,
    cancelledRequests: cancelledRequests || 0,
    todayRequests: todayRequests || 0,
    weekRequests: weekRequests || 0,
    monthRequests: monthRequests || 0,
    brandRequests: Array.isArray(brandRequests) ? brandRequests : [],
    topProducts: Array.isArray(topProducts) ? topProducts : [],
    lowStockProducts: Array.isArray(lowStockProducts) ? lowStockProducts : [],
    recentActivity: Array.isArray(recentActivity) ? recentActivity : [],
    totalMessages: totalMessages || 0,
    unreadMessages: unreadMessages || 0
  };
}

export async function getStats(req, res) {
  try {
    const db = await getDb();
    const stats = await buildDashboardStats(db);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
}

export async function getAdmins(req, res) {
  try {
    const db = await getDb();
    const admins = await db.all("SELECT id, name, email, role, created_at FROM users WHERE role IN ('admin', 'super_admin')");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAdmin(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const assignedRole = role === 'super_admin' ? 'super_admin' : 'admin';
    
    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'User already exists' });
    
    const password_hash = bcrypt.hashSync(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, assignedRole]
    );
    res.status(201).json({ id: result.lastID, name, email, role: assignedRole });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;
    if (id === String(req.user.id) || id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    
    const db = await getDb();
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
