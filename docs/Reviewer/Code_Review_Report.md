# Code Review Report

Scope: `frontend/src`, `backend` (controllers, routes, middleware, services, utils, scripts, tests), `backend/prisma`, dependencies. Review date: 2026-10-21.

Methods: import-graph reachability from `main.jsx` / `server.js`, unused-export scan, ESLint `no-unused-vars` without the capital-letter ignore pattern, dependency usage scan, route-to-caller cross check, manual reading of auth middleware and routes.

## 1. Changes made in this review

### Deleted dead files (17)

| File | Reason |
|------|--------|
| `frontend/src/context/CartContext.jsx` | Cart retired, never imported |
| `frontend/src/components/QuickRfqModal.jsx` | Never imported |
| `frontend/src/components/SteelWeightCalculatorModal.jsx` | Never imported |
| `frontend/src/theme.js` | Never imported |
| `frontend/test-login.js` | Hardcoded super admin credentials, needs `playwright` which is not a dependency |
| `backend/controllers/customer/cartController.js`, `backend/routes/customer/cartRoutes.js` | Router never mounted in `server.js` |
| `backend/utils/locationService.js` (61 KB) | Never imported; frontend has its own copy |
| `backend/services/orderStatusScheduler.js` | Disabled (its `require` was commented out in `server.js`) |
| `backend/checkPass.js`, `checkSessions.js`, `checkUser.js`, `clearSessions.js`, `test_prisma.js` | Ad-hoc debug scripts with hardcoded emails and passwords |
| `backend/scripts/list_customer.js`, `test_discount_flow.js`, `cleanupUser.js` | One-off debug/test scripts (cleanupUser had a hardcoded personal email) |

All are recoverable from git history.

### Code removed or fixed

- 75 unused import specifiers removed (37 whole import statements removed).
- 19 dead declarations removed: unused functions and state in `ProductManagement`, `InventoryDataGrid`, `Checkout`, `OrderManagement` (admin), `ForgotPasswordPage`, `PreOrderProductsPage`, `superadmin/DashboardPage`, `owner/DashboardPage`, `customer/DashboardPage`, `App`.
- Bug fix in `Checkout.jsx`: the stock-conflict (409) handler called undefined `updateQuantity` and `setOrderTotal`, which threw a `ReferenceError` instead of showing the adjusted quantity. Total is already derived with `useMemo`, so the calls were removed.
- Removed commented-out scheduler code from `server.js`.
- **Security hardening for Admin API**: Added `verifyStaff` and `verifyAdmin` authentication/authorization middleware across `routes/admin/productRoutes.js`, `routes/admin/orderRoutes.js`, and `routes/admin/productTypeRoutes.js`. Decoupled `customer/DashboardPage.jsx` and `AddProductToOrderModal.jsx` to consume `/api/customer/products` directly.
- **Fixed "saless" typo**: Mounted `/api/admin/sales` with `/api/admin/saless` backwards-compatible alias in `server.js`. Updated all callers in `superadmin/DashboardPage.jsx` and `admin/SalesManagement.jsx`, updated socket room joining in `CustomerService.jsx` and `inquiryController.js`, and cleaned UI text and comments in `OrderManagement.jsx`.
- **Dependency cleanup**: Removed `@hono/node-server` (backend) and `@types/react*` (frontend), and pointed backend `main` to `server.js`.

### Comments

- Removed about 456 generic JSX section labels (`{/* Header */}`, `{/* Card 1 */}`) and about 277 short restating `//` comments.
- Kept comments that explain why, hold numbers/formulas, API route docs, JSDoc, and eslint directives.
- Converted the decorative separator comments in `roofPricingData.js` to plain comments (workspace rule). No separator comments remain in `frontend/src` or `backend`.
- Not touched: `backend/tests`, `backend/scripts`, `backend/prisma`, `locationService.js`.

### Verification

See the end of this file.

## 2. Findings remaining (architectural & scope decisions)

### Critical & Security

1. **Socket.IO open rooms**: Socket.IO CORS is `origin: "*"` and any client can `join_room` arbitrary room names (including `superadmin` and `user_<id>` rooms) and receive private events. Restrict room joining to authorized sessions.

### Over-engineering and duplication

2. **Orphaned Admin pages.** Admin sidebar has only Dashboard, Users, Staff Management, Settings, but routes and APIs remain for `/admin/inventory`, `/admin/orders`, `/admin/reviews`. Related code is large: `ProductManagement` (55 KB), `OrderManagement` (35 KB), `ReviewManagement` (46 KB, also re-exported for Sales), `InventoryDataGrid`, `StockManagementTab`, `AddProductTypeModal`, backend `admin/productController` (16 KB), `variantController`, `orderController`, `productTypeController`. Docs say these duties moved to Sales/Logistics/Finance.
3. **Duplicated business logic on both sides**: `deliveryFeeCalculator.js` (frontend) vs `deliveryFeeService.js` (backend), each with its own distance matrix; `EstimatedDeliveryValidator.js` exists in both; frontend `locationService.js` is 61 KB of static data bundled into the main app.
4. **Two parallel product systems**: legacy finished-goods products (stock, `adjustStock`, audit logs) and made-to-order pre-order products with raw coil stock. The order controller still has a legacy "decrement finished stock" branch.
5. `createOrder` and `createBulkOrder` in `customer/orderController.js` (24 KB) largely duplicate each other.
6. Order listing formatting (`productsSummary`, `deliveryStatus`, id padding) is copy-pasted across the sales, finance and logistic controllers, and the padding differs (3 vs 4 digits for the same order id).
7. Placeholder endpoints returning stub JSON: `GET /api/finance/payments`, `GET /api/logistic/deliveries`, `GET /api/logistic/products` (no frontend caller).
8. Tiny re-export pages: `sales/ReviewManagement.jsx`, `logistic/ProductsPage.jsx`.
9. Giant single-file pages: `superadmin/DashboardPage` (100 KB), `PreOrderProductsPage` (87 KB), `OrderDetails` (80 KB), `Checkout` (76 KB), `SalesDashboard` (68 KB). Hard to maintain; split only if you plan further changes.
10. Three UI systems together: MUI (main), Tailwind classes (loading spinners, 404), inline styles; `lucide-react` is used in only 3 places while MUI icons are used 269 times.
11. Admin `settingController` / `SettingsPage` is a basic key/value editor ("placeholder" in the feature tracker).

### Naming and minor consistency

12. `createOwner.js` prints `owner.name`, but the name lives on `ownerProfile`.
13. `POST` and `PATCH` are both registered for `/api/finance/refunds/:id/process`.
14. `authRoutes.js` calls `require("../controllers/authController")` inline four times instead of destructuring once.
15. `deleteUser.js` sits at the backend root while other utilities are in `scripts/`.

### Lint (pre-existing, unchanged)

- 12 remaining unused variables or parameters: `ShippingInfoWidget` (`onEdit`, `onCancelEdit`), `StockManagementTab` (`currentStock`), `ExpensesPage` (`i`), `PaymentsPage` and sales `OrderManagement` (`loading`), `DeliveriesPage` (`isSignal`), owner `DashboardPage` (`stockAlerts`), sales `DashboardPage` (`recentOrders`), superadmin (`setLogsPerPage`).
- 20 `react-hooks/exhaustive-deps`, 3 `set-state-in-effect`, 3 `immutability` (function used in effect before declaration) and 4 `only-export-components` warnings.
- The ESLint config ignores unused capitalized names (`varsIgnorePattern: '^[A-Z_]'`), which is why unused component and icon imports built up. Consider removing that pattern.

### Dependencies

- `@hono/node-server` (backend): not used by any source file.
- `@types/react`, `@types/react-dom` (frontend): no TypeScript in the project.
- `@emotion/react` and `@emotion/styled` look unused but are required peers of MUI; keep.
- Backend declares `@prisma/client` but code imports the generated client in `backend/generated/prisma` (a custom output). `generated/` holds a 4.9 MB base64 WASM file.

### Repository hygiene

- Root has stray files: `2026-09-14.md`, `Untitled.base`, `Untitled.canvas`, `Untitled 1.canvas`, `plan.drawio`, `documentation_structured.md`, `flowchart.md`, `implementation/`, `other/`.
- Docs drift: `docs/06_UI/Sales.md` documents `/sales/inventory` + `InventoryPage.jsx` (file does not exist; route redirects) and `/sales/pre-orders` (actual path is `/sales/pre-order-products`).

## 3. Suggested priorities

1. Secure `/api/admin/*` product, order and product-type routes and move customer fallbacks (finding 1).
2. Restrict Socket.IO room joining (finding 2).
3. Decide on the orphaned Admin pages (finding 3); this is the largest removable block.
4. Rename "saless" (finding 13).
5. Extract shared order formatter and merge `createOrder`/`createBulkOrder` (findings 6, 7).
