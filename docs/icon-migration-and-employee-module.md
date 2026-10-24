# Icon Migration & Sales Module Implementation

**Date:** June 22, 2026  
**Project:** Mega Pacific Metal and Steel Corp — Capstone Project  
**Stack:** React (Vite) + Express + Prisma + MySQL  

---

## Problem Encountered

### 1. Dependency Conflict — `lucide-react` Icons
The admin frontend was using `lucide-react` for all icons. This caused issues because the project was already using `@mui/icons-material` for other components, creating an inconsistent dependency footprint and potential tree-shaking/bundle conflicts.

### 2. Missing Sales Role Module
The system had `admin` and `customer` roles but no working `sales` role. The task required:
- A way for admins to create sales accounts (admin sets the initial password — no email OTP)
- Saless to have access to Products, Orders, and Inventory management
- Saless to be blocked from admin-only sections (User Management, Sales Management)

### 3. Build Error — Non-Existent MUI Icon
After migrating `LoginPage.jsx`, a Vite build error appeared:

```
[plugin:vite:import-analysis] Failed to resolve import "@mui/icons-material/ErrorOutline"
from "src/pages/admin/LoginPage.jsx". Does the file exist?
```

The icon `ErrorOutline` does not exist in `@mui/icons-material`. The correct name is `ErrorOutlined` (capital "d").

---

## Steps Taken to Resolve

### Phase 3 — Icon Migration (`lucide-react` → `@mui/icons-material`)

All admin pages were migrated one by one. For each file, the `lucide-react` named import block was replaced with individual MUI default imports, and all JSX usages were updated (changing `size={N}` prop to `sx={{ fontSize: N }}`).

**Files migrated:**

| File | Lucide Icons Replaced |
|------|-----------------------|
| `AdminLayout.jsx` | Dashboard, Inventory, ShoppingCart, People, Badge, Settings, Logout |
| `DashboardPage.jsx` | TrendingUp, Package, ShoppingCart, CheckCircle2, Clock, XCircle, Truck, RefreshCw |
| `UserManagement.jsx` | Search, Filter, RefreshCw, MoreVertical, Shield, User, CheckCircle2, XCircle, Mail, ChevronLeft, ChevronRight |
| `OrderManagement.jsx` | Search, Filter, RefreshCw, Eye, CheckCircle2, XCircle, Clock, Truck, ChevronLeft, ChevronRight, Package, MapPin, Calendar, X, Shuffle |
| `ProductManagement.jsx` | Plus, Search, Filter, Package, X, Edit2, Trash2, Loader2, ImageIcon, Tag, DollarSign, Layers, AlignLeft, UploadCloud, ChevronDown, CheckCircle2, Shuffle, Save, PlusCircle |
| `LoginPage.jsx` | Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, AlertCircle |
| `AddProductTypeModal.jsx` | X, Tag, AlignLeft, Loader2, CheckCircle2, AlertTriangle |

**Pattern used for each migration:**

```jsx
// BEFORE (lucide-react)
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react';
<Search size={16} color="#6b7280" />
<RefreshCw size={15} style={{ animation: '...' }} />
<CheckCircle2 size={12} />

// AFTER (@mui/icons-material)
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
<SearchIcon sx={{ fontSize: 16, color: '#6b7280' }} />
<RefreshIcon sx={{ fontSize: 15, animation: '...' }} />
<CheckCircleIcon sx={{ fontSize: 12 }} />
```

**Icon name mapping (Lucide → MUI):**

| Lucide | MUI (`@mui/icons-material/`) |
|--------|------------------------------|
| `RefreshCw` | `Refresh` |
| `CheckCircle2` | `CheckCircle` |
| `XCircle` | `Cancel` |
| `Clock` | `AccessTime` |
| `Truck` | `LocalShipping` |
| `Package` | `Inventory2` |
| `Shuffle` | `SwapHoriz` |
| `Filter` | `FilterList` |
| `MoreVertical` | `MoreVert` |
| `Shield` | `AdminPanelSettings` |
| `Eye` | `Visibility` |
| `EyeOff` | `VisibilityOff` |
| `MapPin` | `LocationOn` |
| `Calendar` | `CalendarToday` |
| `X` | `Close` |
| `AlertCircle` | `ErrorOutlined` |
| `AlertTriangle` | `WarningAmber` |
| `Loader2` | `CircularProgress` (from `@mui/material`) |
| `UploadCloud` | `CloudUpload` |
| `PlusCircle` | `AddCircle` |
| `Tag` | `LocalOffer` |
| `AlignLeft` | `Notes` |
| `Layers` | `Layers` |
| `ChevronDown` | `KeyboardArrowDown` |
| `DollarSign` | `AttachMoney` |

### Fix for Build Error
```jsx
// WRONG — icon does not exist
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// CORRECT — note the capital "d" at the end
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
```

Also removed the unused `GppGoodIcon` import (`@mui/icons-material/GppGood`) that was left over.

---

### Phase 4 — Sales Module

#### Backend

**1. Updated `authMiddleware.js`**
Added `verifySales` middleware that allows both `sales` and `admin` roles:

```js
const verifySales = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === "sales" || req.user.role === "admin")) {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Sales privileges required." });
    }
  });
};
```

**2. Created `salesController.js`**
Located at: `backend/controllers/admin/salesController.js`

Endpoints implemented:
- `getSaless` — List all users with `role: "sales"`
- `createSales` — Admin creates the account and sets the initial password (bcrypt hashed)
- `updateSales` — Update name, contactNumber
- `resetSalesPassword` — Admin resets password (no email OTP)
- `updateSalesStatus` — Toggle between `active` / `suspended`

**3. Created `salesRoutes.js`**
Located at: `backend/routes/admin/salesRoutes.js`

```js
router.get("/", verifyAdmin, getSaless);
router.post("/", verifyAdmin, createSales);
router.put("/:id", verifyAdmin, updateSales);
router.patch("/:id/reset-password", verifyAdmin, resetSalesPassword);
router.patch("/:id/status", verifyAdmin, updateSalesStatus);
```

**4. Registered routes in `server.js`**
```js
const salesRoutes = require("./routes/admin/salesRoutes");
app.use("/api/admin/saless", salesRoutes);
```

#### Frontend

**5. Updated `LoginPage.jsx` (Admin/Sales shared login)**
Updated `handleSubmit` so saless logging in at `/admin/login` are redirected to `/sales/dashboard` instead of being blocked:

```jsx
if (result.user?.role === 'admin') {
  navigate('/admin/dashboard');
} else if (result.user?.role === 'sales') {
  navigate('/sales/dashboard');
} else {
  logout();
  setError('Access denied. Staff privileges required.');
}
```

**6. Created `SalesManagement.jsx` (Admin Page)**
Located at: `frontend/src/pages/admin/SalesManagement.jsx`

Features:
- Table listing all saless with name, email, contact, status, created date
- **Add Sales** modal (admin sets name, email, contact, initial password)
- **Edit Sales** modal (update name/contact)
- **Reset Password** modal (admin sets new password)
- **Toggle Status** (click badge to activate/suspend)

**7. Created `SalesLayout.jsx`**
Located at: `frontend/src/layouts/SalesLayout.jsx`

- Same visual style as `AdminLayout`
- Sidebar shows only operational modules: Dashboard, Products, Orders, Inventory
- Includes ThemeSwitcher (dark/light mode)
- "EMPLOYEE PORTAL" branding label
- Sign-out button

**8. Created Sales Pages**

| File | Description |
|------|-------------|
| `pages/sales/DashboardPage.jsx` | Welcome screen with quick-access cards, overview stats, recent orders table |
| `pages/sales/ProductManagement.jsx` | Re-export of admin `ProductManagement` |
| `pages/sales/OrderManagement.jsx` | Re-export of admin `OrderManagement` |
| `pages/sales/InventoryPage.jsx` | Re-export of admin `ProductManagement` (stock view) |

**9. Updated `App.jsx`**

Added sales route guard and route tree:

```jsx
// Role-based redirect in ProtectedRoute
if (user?.role === 'sales') {
  return <Navigate to="/sales/dashboard" replace />;
}

// Sales route tree
<Route path="/sales" element={
  <ProtectedRoute redirectTo="/admin/login" requiredRole="sales">
    <SalesLayout />
  </ProtectedRoute>
}>
  <Route index element={<Navigate to="/sales/dashboard" />} />
  <Route path="dashboard"  element={<SalesDashboard />} />
  <Route path="products"   element={<SalesProducts />} />
  <Route path="orders"     element={<SalesOrders />} />
  <Route path="inventory"  element={<SalesInventory />} />
</Route>
```

Added `SalesManagement` to the admin route:
```jsx
<Route path="saless" element={<SalesManagement />} />
```

**10. Admin Sidebar — Saless link**
The `AdminLayout.jsx` already had the Saless nav item pointing to `/admin/saless`:
```jsx
{ name: 'Saless', path: '/admin/saless', icon: <BadgeIcon sx={{ fontSize: 18 }} /> },
```

---

## Specific Commands Used

> No shell commands were required for this implementation. All changes were file edits only.

The dev server (`npm run dev`) was already running. After fixing the `ErrorOutlined` import error, Vite's HMR (Hot Module Replacement) automatically reloaded the changes.

---

## Implementation Plan

### Phase 1 — Foundation (Folder Structure)
Create empty directories for future architecture separation:
- `frontend/src/hooks/`
- `frontend/src/services/`
- `backend/services/`
- `backend/repositories/`
- `backend/validators/`

### Phase 2 — Theme System (Dark/Light Mode)
- Create `ThemeContext.jsx` with `localStorage` persistence
- Create `ThemeSwitcher.jsx` toggle button component
- Wrap `main.jsx` with `AdminThemeProvider`
- Integrate `ThemeSwitcher` into `AdminLayout.jsx` and `SalesLayout.jsx`

### Phase 3 — Icon Migration (`lucide-react` → `@mui/icons-material`)
- Audit all admin pages for `lucide-react` imports
- Replace all imports with individual MUI icon default imports
- Update all JSX usages (`size={N}` → `sx={{ fontSize: N }}`)
- Verify no remaining `lucide-react` references in admin pages

### Phase 4 — Sales Module
- Backend: middleware, controller, routes, server registration
- Frontend: login redirect, layout, pages, admin management page, route guards
- Design decision: Admin sets password — no email/OTP for saless
- Design decision: Sales shares the same product/order components as admin

### Deferred
- Audit Logs module (reserved for later)
- Reports module (reserved for later)

---

## List of Tasks

### Phase 1
- [x] Create `frontend/src/hooks/`
- [x] Create `frontend/src/services/`
- [x] Create `backend/services/`
- [x] Create `backend/repositories/`
- [x] Create `backend/validators/`

### Phase 2
- [x] Create `context/ThemeContext.jsx`
- [x] Create `components/ThemeSwitcher.jsx`
- [x] Wire `ThemeSwitcher` into `AdminLayout.jsx`
- [x] Wire `ThemeSwitcher` into `SalesLayout.jsx`
- [x] Configure `main.jsx` to use dynamic `AdminThemeProvider`

### Phase 3 — Icon Migration
- [x] Migrate `layouts/AdminLayout.jsx`
- [x] Migrate `pages/admin/DashboardPage.jsx`
- [x] Migrate `pages/admin/UserManagement.jsx`
  - Bonus: Added `sales` role filter option and distinct badge
- [x] Migrate `pages/admin/OrderManagement.jsx`
- [x] Migrate `pages/admin/ProductManagement.jsx`
- [x] Migrate `pages/admin/LoginPage.jsx`
- [x] Migrate `pages/admin/AddProductTypeModal.jsx`
- [x] Fix build error: `ErrorOutline` → `ErrorOutlined`
- [x] Remove unused `GppGoodIcon` import

### Phase 4 — Sales Module
- [x] Update `authMiddleware.js` — add `verifySales`
- [x] Create `backend/controllers/admin/salesController.js`
  - [x] `getSaless`
  - [x] `createSales` (admin sets password)
  - [x] `updateSales`
  - [x] `resetSalesPassword`
  - [x] `updateSalesStatus`
- [x] Create `backend/routes/admin/salesRoutes.js`
- [x] Register routes in `backend/server.js`
- [x] Update `LoginPage.jsx` to redirect saless to `/sales/dashboard`
- [x] Create `frontend/pages/admin/SalesManagement.jsx`
- [x] Create `frontend/layouts/SalesLayout.jsx`
- [x] Create `frontend/pages/sales/DashboardPage.jsx`
- [x] Create `frontend/pages/sales/ProductManagement.jsx`
- [x] Create `frontend/pages/sales/OrderManagement.jsx`
- [x] Create `frontend/pages/sales/InventoryPage.jsx`
- [x] Add `/admin/saless` route in `App.jsx`
- [x] Add `/sales/*` route tree with `ProtectedRoute` in `App.jsx`
- [x] Add sales redirect in `ProtectedRoute` component

### Deferred
- [ ] Audit Logs module
- [ ] Reports module

---

## File Index

### Modified Files
| File | Change |
|------|--------|
| `backend/middleware/authMiddleware.js` | Added `verifySales` |
| `backend/server.js` | Registered `/api/admin/saless` route |
| `frontend/src/App.jsx` | Added sales routes + imports |
| `frontend/src/layouts/AdminLayout.jsx` | Icon migration + Saless nav link |
| `frontend/src/pages/admin/LoginPage.jsx` | Icon migration + sales redirect logic |
| `frontend/src/pages/admin/DashboardPage.jsx` | Icon migration |
| `frontend/src/pages/admin/UserManagement.jsx` | Icon migration + sales role support |
| `frontend/src/pages/admin/OrderManagement.jsx` | Icon migration |
| `frontend/src/pages/admin/ProductManagement.jsx` | Icon migration |
| `frontend/src/pages/admin/AddProductTypeModal.jsx` | Icon migration |

### New Files
| File | Purpose |
|------|---------|
| `backend/controllers/admin/salesController.js` | Sales CRUD logic |
| `backend/routes/admin/salesRoutes.js` | Sales API routes |
| `frontend/src/layouts/SalesLayout.jsx` | Sales sidebar layout |
| `frontend/src/pages/admin/SalesManagement.jsx` | Admin: manage saless |
| `frontend/src/pages/sales/DashboardPage.jsx` | Sales home dashboard |
| `frontend/src/pages/sales/ProductManagement.jsx` | Sales: product access |
| `frontend/src/pages/sales/OrderManagement.jsx` | Sales: order access |
| `frontend/src/pages/sales/InventoryPage.jsx` | Sales: inventory access |
| `frontend/src/context/ThemeContext.jsx` | Dark/light mode context |
| `frontend/src/components/ThemeSwitcher.jsx` | Theme toggle button |
