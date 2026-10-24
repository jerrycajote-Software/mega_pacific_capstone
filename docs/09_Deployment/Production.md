# Production Deployment Guide

Guide for deploying Mega Pacific to production environments (Vercel / Netlify / Cloud Node.js Host).

---

## 1. Frontend Deployment (Vercel / Netlify)

### Vercel Deployment (`vercel.json`)
The repository includes a root `vercel.json` configured for SPA routing.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

1. Connect the repository to Vercel.
2. Set the Root Directory to `frontend`.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Configure Environment Variables:
   - `VITE_API_URL`: Production backend URL (e.g. `https://mega-pacific-backend.onrender.com`)

---

## 2. Backend Deployment (Node.js Server)

1. Provision a VPS or Cloud Host (e.g. Render, Railway, AWS EC2, DigitalOcean).
2. Install Node.js v18+ and PostgreSQL database instance.
3. Configure Environment Variables (`.env`):
   - `DATABASE_URL` (Production PostgreSQL connection string)
   - `JWT_SECRET` (Strong random 64-char key)
   - `NODE_ENV=production`
4. Run migrations: `npx prisma db push` or `npx prisma migrate deploy`
5. Start server using a process manager like PM2:
   ```bash
   pm2 start server.js --name "mega-pacific-backend"
   ```
