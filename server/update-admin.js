import { getDb } from './config/database.js';
import bcrypt from 'bcryptjs';

async function updateSuperAdmin(newEmail, newPassword) {
  if (!newEmail || !newPassword) {
    console.error('Usage: node update-admin.js <new_email> <new_password>');
    process.exit(1);
  }

  try {
    const db = await getDb();
    const hash = bcrypt.hashSync(newPassword, 10);
    
    // Check if the super_admin exists
    const admin = await db.get('SELECT * FROM users WHERE role = ?', ['super_admin']);
    
    if (!admin) {
      console.error('No super_admin found in the database!');
      process.exit(1);
    }
    
    await db.run(
      'UPDATE users SET email = ?, password_hash = ? WHERE role = ?',
      [newEmail, hash, 'super_admin']
    );
    
    console.log(`Successfully updated super_admin credentials!`);
    console.log(`New Email: ${newEmail}`);
    console.log(`New Password: [Hidden for security]`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
}

const newEmail = process.argv[2];
const newPassword = process.argv[3];

updateSuperAdmin(newEmail, newPassword);
