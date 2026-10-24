# Features by Role

Reviewer reference. Derived from `frontend/src/App.jsx` routes, layout navigation menus, `backend/routes/`, and controllers (state as of 2026-10-21).

| Role        | Portal URL                                                               | Layout                 | Backend guard                                  |
| ----------- | ------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------- |
| Customer    | `/` (login `/login`)                                                     | `CustomerLayout`       | `verifyToken` (any logged-in user)             |
| Sales       | `/sales` (login `/sales-1megapacific/login`)                             | `SalesLayout`          | `verifySales` (sales, admin)                   |
| Finance     | `/finance` (login `/finance-1megapacific/login`)                         | `FinanceLayout`        | `verifyFinance` (finance only)                 |
| Logistic    | `/logistic` (login `/logistic-1megapacific/login`)                       | `LogisticLayout`       | `verifyLogistic` (logistic, admin, superadmin) |
| Admin       | `/admin` (login `/admin-1megapacific/login`)                             | `AdminLayout`          | `verifyAdmin` (admin, superadmin)              |
| Owner       | `/owner` (login `/owner-1megapacific/login`)                             | `OwnerLayout`          | `verifyOwner` (owner only)                     |
| Super Admin | `/superadmin/dashboard` (login `/superadmin-0megapacific/login`)         | none (full-screen HUD) | `verifySuperAdmin`                             |

Order lifecycle across roles: Customer places order (`pending`) -> Sales approves (`sales_approved`) or rejects (`rejected` + refund record) -> Finance verifies payment (`finance_verified`) -> Logistic dispatches (`shipped` / `out_for_delivery` / `ready_for_pickup`) -> `delivered` / `completed`.

---

## 1. Customer

Pages: `/dashboard`, `/products`, `/product/:id`, `/checkout`, `/orders`, `/order/:id`, `/profile`, `/roof-designer`.

**Account and security**
- Register with email OTP verification (`/register`, `/verify-email`), resend OTP with 60 s cooldown.
- Login requires an OTP on every login; forgot/reset password via OTP with password policy (cannot reuse the same password).
- Soft-deleted account restoration during registration.
- Auto logout on token expiry and after 24 h inactivity; global handling of 401 and maintenance (503) responses.

**Catalog and product details**
- Active pre-order catalog with search and product-type filter, hero banner, real-time refresh when Sales enables/disables products (Socket.IO `product_catalog_updated`).
- Product details: image gallery with zoom/lightbox, thickness, color (14 standard finishes), custom cut length (up to 21 m), live price, 30% inventory discount display, ratings and reviews, disabled-item guard.
- "Add another product" modal (`AddProductToOrderModal`) to bundle multiple profiles/accessories into one order.
- Coil availability check for the chosen color and thickness.

**Checkout and payment**
- 3-step checkout: fulfillment (jobsite delivery or plant pick-up), payment, review.
- Address book selector, jobsite notes, CALABARZON province/city/barangay with auto ZIP.
- Live delivery fee (distance and vehicle based, from backend `calculate-shipping`).
- Payment options: Cash on Delivery with 50% downpayment, Bank Transfer full payment, Card and GCash detail forms.
- In-checkout quantity stepper, item removal, add more items; stock-error handling (quantity auto-adjusted).
- Browser back/forward lock and leave-checkout confirmation.
- Export formal Project Quotation (PDF).

**Orders**
- Orders list: metrics bar, status tabs, search, payment badges, priority "ready for pick-up" callouts.
- Order details: fulfillment stepper, ordered item specs, payment summary, delivery/pick-up info, digital retrieval pass for pick-up, Official Receipt PDF, order-ID copy.
- Real-time status and "ready for pick-up" notifications; refund-processed notification and email.
- Submit and view product reviews (rating, headline, comment, photos) for delivered/completed orders; see staff replies.

**Other**
- Profile page: identity overview, address CRUD with default address, delete confirmation.
- 3D Roof Designer: step-by-step 3D roof assembly with bill of materials and cost estimator (desktop only, mobile warning screen).
- Live chat support widget (Socket.IO) to Sales.
- Responsive header, mobile drawer and bottom navigation, light theme, footer.

---

## 2. Sales

Pages: Dashboard, Pre-Order Products, Orders, Reviews, Support (`/sales/customer-service`).

- **Dashboard**: revenue, pipeline, dispatch and sentiment KPIs, urgency banner, today's pulse, 7-day velocity chart, recent orders with filters/search, top products, stock readiness, shortcuts.
- **Pre-Order Products**: create/edit/delete (auto-archive when referenced by past orders) roofing products, per-product thickness variants with price, custom thickness gauges with duplicate prevention, active/disabled visibility toggle (real-time to customers), discount fields, coil stock health summary.
- **Orders**: list all orders, view details, approve pending orders (forward to Finance), reject pending orders with reason (creates refund request for Finance and notifies via Socket.IO), download Official Sales Receipt PDF.
- **Reviews**: list all reviews, KPI summary, filters/sort, photo lightbox, reply/edit reply with macro templates.
- **Support**: customer inquiry inbox, live conversation with Socket.IO, status control (open / in progress / resolved), quick-reply macros, search.
- Staff single-session enforcement; theme switcher; logout confirmation.

---

## 3. Finance

Pages: Dashboard, Expenses, Payments, Refunds, Reports.

- **Dashboard**: revenue, pending payments, expenses, net profit, 6-month revenue vs expenses chart, payment-mode breakdown, expense categories, recent activity, delivery charge and fleet fuel rate settings (`delivery-settings`).
- **Payments**: orders approved by Sales; verify payment (marks `paid`, forwards to Logistic).
- **Expenses**: expense ledger, add expense, search, summary widget.
- **Refunds**: refund queue (from Sales rejections), KPI cards, status tabs and search, process refund (channel, auto-generated transaction reference, notes), audit expense entry, customer WebSocket alert and receipt email, audit voucher view.
- **Reports**: period selector, income statement, expenses by category, order settlement ledger, export to PDF and Excel.
- Live toast on `new_refund_request`.

---

## 4. Logistic

Pages: Dashboard, Deliveries, Coil Inventory (`/logistic/products`).

- **Dashboard**: KPIs, fulfillment volume chart, distribution donut, operational alerts, recent dispatches.
- **Deliveries**: finance-verified and in-transit orders; update status (shipped, out for delivery, delivered, completed for delivery orders; ready for pick-up, completed for pick-up orders), quick pick-up signal, dispatch details modal. "Ready for pick-up" triggers email and live notification to the customer.
- **Coil Inventory**: raw material steel coil stock by thickness and color (grouped and flat views), deduct coil rolls (usage), restock coil rolls, audit logs. Read access also available to admin, owner and sales via `verifyStaff`.

---

## 5. Admin

Navigation: Dashboard, Users, Staff Management, Settings.

- **Dashboard**: technical-support landing overview.
- **Users**: customer directory, account status updates (activate/suspend).
- **Staff Management** (`/admin/accounts`): list Sales/Logistic/Finance staff, edit profile (name, contact), reset password (requires admin password), suspend/activate, delete.
- **Settings**: system settings by key (for example max concurrent staff devices).
- Routes `/admin/inventory`, `/admin/orders`, `/admin/reviews` still exist (Product Management with variants, stock adjustment, stock audit logs and product types; Order Management with Excel/PDF export; read-only Review Management) but are not in the sidebar. See open questions.
- Backend also lets admin act as Sales (`verifySales`) and Logistic.

---

## 6. Owner

Navigation: Dashboard (read-only analytics).

- Totals, 30-day revenue trend chart, recent actionable orders, low-stock alerts, inventory value, top-selling products by revenue, raw material coil health.
- Backend: `GET /api/owner/dashboard`. Owner also has read access to coil inventory. Not subject to portal maintenance mode.

---

## 7. Super Admin

Single "Mission Control" page (`/superadmin/dashboard`) with five tabs.

- **Fleet and Portals**: online/offline switches for Customer, Admin and Sales portals with confirmation guard; drives the maintenance page for those roles.
- **Accounts and Provisioning**: list all staff, filter by role/status, create Admin/Owner/Super Admin/Sales/Logistic/Finance accounts with generated password, approve or reject pending accounts (requires Super Admin password confirmation), suspend/delete.
- **Live Sockets**: currently connected users with roles and connection time.
- **Session Audit Trail**: searchable and filterable session log with pagination, device/browser parsing, CSV export.
- **Diagnostics**: gateway latency test, Node version, platform, uptime, memory usage.
- Live clock, 10 s auto refresh, secure logout dialog. Not subject to maintenance mode.
