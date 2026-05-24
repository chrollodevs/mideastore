# Multi-Brand E-Commerce Platform

Multi-brand home appliance e-commerce skeleton (Media, Arcodim, S-Challenge).

## Quick Start

```bash
# Install server deps
cd server && npm install

# Start server (runs migrations + seed on first start)
npm start

# In another terminal — install client deps
cd client && npm install

# Start client
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:3001

## Default Admin Login

Configured via your `.env` file (`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`).
If using the default `.env.example`:
- Email: `admin@yourdomain.com`
- Password: `change_this_before_first_run`

## Structure

```
client/   — React + Vite frontend
server/   — Express.js backend + SQLite
```
