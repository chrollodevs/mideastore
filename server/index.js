import 'dotenv/config';

// ── Global Stability ────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
  // Do not exit the process to keep the server alive during transient DB errors
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './config/database.js';

import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import brandsRoutes from './routes/brands.js';
import requestsRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';
import messagesRoutes from './routes/messages.js';

import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, authorize } from './middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL.trim()]
  : (process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:5173']);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Automatically allow local development origins (localhost or 127.0.0.1 on any port)
    try {
      const parsedUrl = new URL(origin);
      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
        callback(null, true);
        return;
      }
    } catch (err) {
      // Ignore URL parsing errors
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Static Assets ─────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Multer (File Uploads) ─────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith('image/') && ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

// ── Database ──────────────────────────────────────────────────────────────────
initDatabase().then(() => {
  console.log('Database initialization check completed.');
}).catch((err) => {
  console.error('Failed to initialize database on startup. Server is running, but DB is unreachable:', err);
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messagesRoutes);

// ── Upload Endpoint (authenticated) ──────────────────────────────────────────
app.post(
  '/api/upload',
  authenticate,
  authorize('admin', 'super_admin'),
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = `prod-${uniqueSuffix}${ext}`;

      if (supabase) {
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filename, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filename);

        return res.json({ image_url: publicUrlData.publicUrl });
      } else {
        // Fallback to local storage if Supabase is not configured (e.g. local dev without env vars)
        const localPath = path.join(__dirname, 'uploads', 'products', filename);
        fs.writeFileSync(localPath, req.file.buffer);
        const relativeUrl = `/uploads/products/${filename}`;
        const isProd = process.env.NODE_ENV === 'production';
        const baseUrl = process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get('host')}`;
        const finalUrl = isProd ? `${baseUrl}${relativeUrl}` : relativeUrl;
        return res.json({ image_url: finalUrl });
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      return res.status(500).json({ error: 'Failed to upload image.' });
    }
  }
);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
