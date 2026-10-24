# Performance Optimization Guidelines

This document highlights performance considerations and optimization strategies implemented in the system.

---

## Backend Performance
- **Prisma Client Caching**: Single instantiated Prisma Client via `backend/config/db.js` prevents connection pool exhaustion.
- **Selective Field Selection**: Using `select` in Prisma queries to omit sensitive fields (e.g. `password`) and unnecessary columns.
- **Express Payload Limits**: Configured `50mb` limit for base64 image uploads without crashing the event loop.

---

## Frontend Performance
- **Vite Chunk Splitting**: Automatic code splitting for dynamic routes (`React Router`).
- **MUI DataGrid Pagination**: Server-side or lazy client pagination for large inventory tables (`InventoryDataGrid.jsx`).
- **Three.js Asset Loading**: Dynamic loading of R3F 3D assets to keep initial bundle size light.
