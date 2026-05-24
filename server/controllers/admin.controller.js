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

  const allRequests = await db.all("SELECT * FROM requests");
  const allBrands = await db.all("SELECT id, name, slug FROM brands");
  const allProducts = await db.all("SELECT id, name, brand_id FROM products");

  const brandRequestsMap = new Map();
  const topProductsMap = new Map();

  allBrands.forEach(b => brandRequestsMap.set(b.id, { ...b, count: 0 }));

  allRequests.forEach(req => {
    if (req.product_id) {
       const prod = allProducts.find(p => p.id === req.product_id);
       if (prod) {
          if (brandRequestsMap.has(prod.brand_id)) {
            brandRequestsMap.get(prod.brand_id).count++;
          }
          topProductsMap.set(prod.id, (topProductsMap.get(prod.id) || 0) + 1);
       }
    }

    if (req.type === 'cart_request' && req.products) {
       let parsed = [];
       try { parsed = JSON.parse(req.products); } catch (e) {}
       if (Array.isArray(parsed)) {
          parsed.forEach(item => {
             const prodId = Number(item.id);
             const prod = allProducts.find(p => p.id === prodId);
             if (prod) {
                if (brandRequestsMap.has(prod.brand_id)) {
                  brandRequestsMap.get(prod.brand_id).count++;
                }
                topProductsMap.set(prod.id, (topProductsMap.get(prod.id) || 0) + 1);
             }
          });
       }
    }
  });

  const brandRequests = Array.from(brandRequestsMap.values());
  const topProducts = Array.from(topProductsMap.entries())
    .map(([id, count]) => {
      const prod = allProducts.find(p => p.id === id);
      return { id, name: prod?.name, request_count: count };
    })
    .sort((a, b) => b.request_count - a.request_count)
    .slice(0, 5);

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
