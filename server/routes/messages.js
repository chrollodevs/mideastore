import express from 'express';
import * as messagesController from '../controllers/messages.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating messages (contact form)
router.post('/', messagesController.create);

// Protected routes for admin
router.get('/', authenticate, authorize('admin', 'super_admin'), messagesController.getAll);
router.put('/:id/status', authenticate, authorize('admin', 'super_admin'), messagesController.updateStatus);
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), messagesController.remove);

export default router;
