# System Architecture

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐     │
│  │  Customer    │  │   Admin     │  │  Sales     │     │
│  │  Dashboard   │  │  Dashboard  │  │  Dashboard    │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘     │
│         │                │                 │              │
│         └────────────────┼─────────────────┘              │
│                          │                                │
│              React (Vite) + React Router                  │
│              MUI + Tailwind CSS + Lucide                  │
│              Axios (HTTP) + Socket.IO Client              │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP / WebSocket
┌─────────────────────────┴────────────────────────────────┐
│                    SERVER (Node.js)                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐      │
│  │              Express.js (REST API)              │      │
│  │                                                │      │
│  │  Routes ─→ Middleware ─→ Controllers            │      │
│  │                              │                  │      │
│  │                         Repositories            │      │
│  │                              │                  │      │
│  │                         Prisma ORM              │      │
│  └────────────────────────────┬─────────────────────┘      │
│                               │                           │
│  ┌────────────────────────────┴─────────────────────┐      │
│  │              Socket.IO Server                    │      │
│  │         (Real-time inquiry messaging)            │      │
│  └──────────────────────────────────────────────────┘      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Services                            │      │
│  │   • Delivery Scheduler (cron-like)               │      │
│  │   • Email Service (Nodemailer)                   │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────┬────────────────────────────────┘
                          │
┌─────────────────────────┴────────────────────────────────┐
│                    DATABASE                               │
│                                                          │
│              PostgreSQL (via Prisma v7)                   │
│                                                          │
│  Tables: User, Product, ProductVariant, Order,           │
│          OrderItem, Review, ReviewReply, Inquiry,        │
│          Message, ProductType, InventoryLog              │
└──────────────────────────────────────────────────────────┘
```

---

## Communication Patterns

| Pattern | Technology | Usage |
|---------|-----------|-------|
| REST API | Express.js + Axios | All CRUD operations, authentication |
| WebSocket | Socket.IO | Real-time inquiry messaging, room-based |
| Email | Nodemailer + SMTP | OTP verification, password reset |

---

## Authentication Flow

```
User Login Request
       │
       ▼
  Validate Credentials (bcryptjs)
       │
       ▼
  Generate JWT Token (+ sessionToken for admin/sales)
       │
       ▼
  Client stores token in localStorage
       │
       ▼
  Subsequent requests include: Authorization: Bearer <token>
       │
       ▼
  authMiddleware verifies token + session constraint
```

---

## Request Processing Pipeline

```
Client Request
    │
    ▼
Express Middleware (cors, json parser, urlencoded)
    │
    ▼
Route Matching (/api/auth/*, /api/admin/*, /api/customer/*, /api/sales/*)
    │
    ▼
Auth Middleware (verifyToken / verifyAdmin / verifySales)
    │
    ▼
Controller (business logic, validation)
    │
    ▼
Repository Layer (optional - Prisma queries)
    │
    ▼
Prisma ORM → PostgreSQL
    │
    ▼
JSON Response → Client
```
