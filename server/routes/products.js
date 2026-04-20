import express from 'express';
import * as productsController from '../controllers/products.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);

// Protected routes
router.post('/', authenticate, authorize('admin', 'super_admin'), productsController.create);
router.put('/:id', authenticate, authorize('admin', 'super_admin'), productsController.update);
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), productsController.remove);

export default router;
