import express from 'express';
import * as requestsController from '../controllers/requests.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requestsController.create);

// Protected routes
router.get('/', authenticate, authorize('admin', 'super_admin'), requestsController.getAll);
router.put('/:id', authenticate, authorize('admin', 'super_admin'), requestsController.updateStatus);

export default router;
