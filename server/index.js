import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/database.js';

import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import brandsRoutes from './routes/brands.js';
import requestsRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';
import messagesRoutes from './routes/messages.js';

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for local product storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads', 'products'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'prod-' + uniqueSuffix + ext);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Format de fichier non supporté.'));
  }
});

// Initialize Database DB
initDatabase().then(() => {
  console.log('Database connected and initialized.');
}).catch((err) => {
  console.error('Failed to initialize database:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messagesRoutes);

// Image Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }
  
  // Return the full relative path matching the UI expectation
  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.json({ image_url: imageUrl });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
