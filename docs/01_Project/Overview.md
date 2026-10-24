# Project Overview

## Mega Pacific Roofing System

**Mega Pacific** is a full-stack web application for managing a roofing products business. The system provides separate interfaces for **Customers**, **Administrators**, and **Saless**, supporting end-to-end operations from product browsing and ordering to inventory management and customer service.

---

## Business Domain

Mega Pacific is a roofing materials supplier. The application digitizes:
- Product catalog management (roofing materials: Spandrel, Rib, Flat Type, etc.)
- Online ordering with variant-based pricing (per meter, bundles, etc.)
- Inventory and stock management with audit logging
- Customer service inquiries via real-time messaging
- Product reviews and ratings
- Sales/admin dashboards with analytics

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | — | Runtime environment |
| Express.js | v5.2.1 | REST API framework |
| Prisma ORM | v7.7.0 | Database ORM & migrations |
| PostgreSQL | — | Relational database |
| JWT | v9.0.3 | Authentication tokens |
| bcryptjs | v3.0.3 | Password hashing |
| Socket.IO | v4.8.3 | Real-time communication |
| Nodemailer | v9.0.1 | Email sending (OTP, notifications) |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | v19.2.4 | UI library |
| Vite | v8.0.4 | Build tool & dev server |
| React Router | v7.14.0 | Client-side routing |
| MUI (Material-UI) | v9.1.1 | Component library & DataGrid |
| Tailwind CSS | v4.2.2 | Utility CSS framework |
| Lucide React | v1.8.0 | Icon library |
| Axios | v1.14.0 | HTTP client |
| Socket.IO Client | v4.8.3 | Real-time client |
| i18next | v26.3.0 | Internationalization |
| Three.js + R3F | v0.183.2 | 3D product visualization |
| jsPDF / xlsx | — | PDF & Excel export |
| React Quill | v3.8.3 | Rich text editor |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Vercel | Frontend deployment |
| Netlify | Alternative deployment |
| Git | Version control |

---

## User Roles

| Role | Access Level | Login URL |
|------|-------------|-----------|
| **Customer** | Browse products, place orders, write reviews, manage profile | `/login` |
| **Sales** | Dashboard, inventory, orders, customer service, review management | `/sales-1megapacific/login` |
| **Finance** | Payment verification, expenses, refund management, reports | `/finance-1megapacific/login` |
| **Logistic** | Deliveries dispatch, coil stock deductions, fleet tracking | `/logistic-1megapacific/login` |
| **Admin** | Technical support, user accounts management, system status | `/admin-1megapacific/login` |
| **Owner** | Executive sales statistics, business metrics overview | `/owner-1megapacific/login` |
| **Super Admin** | Full database/system controls, staff provisioning & suspension | `/superadmin-0megapacific/login` |

---

## Key Features

- 🛒 Product catalog with variant pricing and image galleries
- 📦 Order management with status tracking and delivery scheduling
- 📊 Admin & sales dashboards with real-time statistics
- 👥 User management with soft-delete and account restoration
- ⭐ Product review system with admin/sales reply capability
- 💬 Real-time customer service inquiry system (Socket.IO)
- 📧 Email verification via OTP with forgot-password flow
- 📋 Inventory management with stock adjustment audit logging
- 🔐 JWT-based authentication with single-session enforcement for admin/sales
- 🌍 Multi-language support (i18next)
- 📄 PDF and Excel export for orders and reports
- 🎨 Dark/light theme with modern glassmorphism UI
