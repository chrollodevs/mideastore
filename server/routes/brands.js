import express from 'express';
import * as brandsController from '../controllers/brands.controller.js';

const router = express.Router();

router.get('/', brandsController.getAll);
router.get('/:slug', brandsController.getBySlug);

export default router;
