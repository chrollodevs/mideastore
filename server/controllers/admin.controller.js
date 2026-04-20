import { getDb } from '../config/database.js';

export async function getStats(req, res) {
  try {
    const db = await getDb();
    const { count: products } = await db.get('SELECT COUNT(*) as count FROM products');
    const { count: brands } = await db.get('SELECT COUNT(*) as count FROM brands');
    const { count: requests } = await db.get('SELECT COUNT(*) as count FROM requests');
    const { count: pendingRequests } = await db.get("SELECT COUNT(*) as count FROM requests WHERE status = 'pending'");

    res.json({
      products,
      brands,
      requests,
      pendingRequests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
