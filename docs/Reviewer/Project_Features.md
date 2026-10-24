# Project Features (Mega Pacific)

Complete feature inventory of the Mega Pacific roofing e-commerce and operations platform, grouped by module. Role-specific breakdown is in [Role_Features.md](Role_Features.md). Status reflects the code as of 2026-10-21.

Stack: React 19 + Vite, MUI, Tailwind 4, react-router 7, Recharts, three.js / react-three-fiber, jsPDF, xlsx-js-style, Socket.IO; Node/Express 5, Prisma 7 (PostgreSQL via `pg` adapter), JWT, bcryptjs, Nodemailer.

Legend: Live = implemented and reachable in the UI. Hidden = implemented but not linked from navigation. Stub = placeholder only.

## Authentication and Accounts

| Feature | Status |
|---------|--------|
| Customer registration with email OTP verification | Live |
| Resend OTP with 60 s cooldown | Live |
| OTP on every customer login | Live |
| Staff logins per portal (sales, finance, logistic, admin, owner, super admin) with role-vs-portal validation | Live |
| Forgot / reset password via OTP, password policy, reuse prevention | Live |
| Single-session / device limit for staff (`max_sales_devices`), oldest session invalidated | Live |
| Session tracking and 12 h stale-session cleanup | Live |
| 24 h inactivity auto-logout, token expiry timer, global 401/503 interceptor | Live |
| Soft-delete and account restoration on re-registration | Live |
| Account statuses (active, pending, suspended, deleted) | Live |
| Browser history guard (back-to-login prevention) | Live |
| Role-protected frontend routes and backend middleware | Live (see security finding in Code_Review_Report.md) |

## Catalog and Pricing

| Feature | Status |
|---------|--------|
| Pre-order (made-to-order) roofing catalog | Live |
| Product CRUD, product types, rich text description, name validation | Live (Sales) / Hidden (Admin) |
| Thickness variants with per-variant price, custom thickness gauges, duplicate prevention | Live |
| Custom cut-to-length pricing up to 21 m, per-meter formula | Live |
| 14 standard color finishes, coil availability by color and thickness | Live |
| Automated 30% inventory discount ("Less 30%") | Live |
| Multi-image upload and gallery with zoom | Live |
| Active/disabled catalog toggle with real-time customer sync | Live |
| Safe delete: archive products referenced by past orders | Live |
| Legacy finished-goods stock management, bulk adjustment, audit logs | Hidden (Admin Product Management) |

## Ordering and Checkout

| Feature | Status |
|---------|--------|
| Direct pre-order checkout (cart retired) | Live |
| Multi-item and cross-product orders, add-on modal | Live |
| Delivery or plant pick-up fulfillment | Live |
| Address book (CRUD, default address), CALABARZON location hierarchy with auto ZIP | Live |
| Distance- and vehicle-based delivery fee (backend `deliveryFeeService`, client fallback) | Live |
| Payment modes: COD with 50% downpayment, bank transfer full payment, card/GCash forms | Live |
| Stock/coil validation at order time with automatic quantity adjustment | Live |
| Order confirmation receipt email | Live |
| Official Receipt PDF and formal Quotation PDF | Live |
| Order tracking stepper, digital pick-up pass | Live |
| Smart delivery date scheduling and 12-hourly auto-extension (`deliveryScheduler`) | Live |
| Payment gateway integration | Not started (forms collect details only) |
| Automatic order status progression scheduler | Removed (manual workflow) |

## Multi-Stage Operations Workflow

| Feature | Status |
|---------|--------|
| Sales approve / reject with reason | Live |
| Finance payment verification | Live |
| Logistic dispatch / pick-up status updates | Live |
| Ready-for-pick-up email and live notification | Live |
| Real-time `order_status_updated` broadcasts | Live |

## Finance

| Feature | Status |
|---------|--------|
| Finance dashboard with revenue, expenses, net profit, trends | Live |
| Expense ledger | Live |
| Refund system (queue, process, audit expense, notification, email) | Live |
| Financial reports with PDF and Excel export | Live |
| Delivery charge and fuel rate settings | Live |
| Payments page (verification) | Live; `GET /api/finance/payments` is a stub |

## Inventory

| Feature | Status |
|---------|--------|
| Raw material steel coil inventory (grouped by thickness and color) | Live |
| Manual coil usage deduction, restock, audit logs | Live |
| Coil health in Sales and Owner dashboards | Live |

## Reviews and Support

| Feature | Status |
|---------|--------|
| Product reviews and ratings with photos, purchase eligibility check | Live |
| Staff review replies with macros | Live |
| Customer inquiries with real-time chat (Socket.IO) | Live |
| Support status workflow and quick macros | Live |

## Dashboards and Reporting

| Dashboard | Status |
|-----------|--------|
| Customer home with hero | Live |
| Sales executive cockpit | Live |
| Finance dashboard | Live |
| Logistic dashboard | Live |
| Owner analytics | Live |
| Admin dashboard (support landing) | Live (minimal) |
| Super Admin Mission Control HUD | Live |

## Platform and System

| Feature | Status |
|---------|--------|
| Portal maintenance mode (customer, admin, sales) with real-time toggle | Live |
| Live active-user tracking and session audit trail with CSV export | Live |
| System diagnostics (latency, uptime, memory) | Live |
| Dark/light themes for staff portals, light theme for customers | Live |
| Internationalization setup (i18next) | Present, limited coverage |
| 3D Roof Designer with bill of materials and cost estimate | Live (desktop only) |
| Mobile-optimized customer layout with bottom navigation | Live |
| Error boundary on customer and sales layouts | Live |
| Admin settings page | Live (basic key/value) |
| AI agent roles, feature switches, workflow plugins (`.agents/`) | Dev tooling |

## Backend API Surface (summary)

Mounted prefixes in `server.js`: `/api/auth`, `/api/owner`, `/api/admin/{products,dashboard,orders,users,product-types,saless,settings,reviews}`, `/api/sales/{dashboard,reviews,orders,pre-order-products}`, `/api/customer/{products,orders,reviews}`, `/api/inquiries`, `/api/system`, `/api/superadmin`, `/api/finance`, `/api/logistic`.
