import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, authorize('admin', 'super_admin'));

router.get('/stats', adminController.getStats);
router.get('/dashboard', adminController.getDashboard);

// Super admin user management endpoints
router.get('/users', authorize('super_admin'), adminController.getAdmins);
router.post('/users', authorize('super_admin'), adminController.createAdmin);
router.delete('/users/:id', authorize('super_admin'), adminController.deleteAdmin);

export default router;
