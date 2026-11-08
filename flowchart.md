# 🔄 System Flowchart — Mega Pacific Roofing System

This document outlines the **current, complete flow** of the **Mega Pacific Metal & Steel Corp — Roofing Product Management System**, covering Authentication, Customer Interface, Admin Dashboard, Backend API, and Database layers.

---

## 📋 Module Index

| Module | Description |
|---|---|
| [1. Authentication & Authorization](#1-authentication--authorization-module) | Registration, Login, JWT, Role-based Guards |
| [2. Customer Interface](#2-customer-interface-module) | Browse, Product Details, Cart, Checkout, Orders, Reviews |
| [3. Admin Dashboard](#3-admin-dashboard-module) | Dashboard, Inventory, Orders, Users |
| [4. Backend API & Business Logic](#4-backend-api--business-logic) | Express Routes, Controllers, Middleware |
| [5. Database & Data Models](#5-database--data-models) | PostgreSQL via Prisma ORM |

---

## 1. Authentication & Authorization Module

Handles Registration, Login, JWT token generation, and role-based route protection for both Customer and Admin portals.

```mermaid
flowchart TD
    classDef auth fill:#ffe6cc,stroke:#d79b00,stroke-width:2px;
    classDef backend fill:#f5f5f5,stroke:#666666,stroke-width:2px;
    classDef db fill:#e1d5e7,stroke:#9673a6,stroke-width:2px;
    classDef decision fill:#fff2cc,stroke:#d6b656,stroke-width:2px;

    subgraph AuthModule ["🔐 Authentication & Authorization"]
        direction TB

        subgraph CustomerAuth ["Customer Auth Flow"]
            CA1["📄 /register — RegisterPage.jsx"]
            CA2["📄 /login — CustomerLoginPage.jsx"]
        end

        subgraph AdminAuth ["Admin Auth Flow"]
            AA1["📄 /admin/login — AdminLoginPage.jsx"]
        end

        ValCreds["Validate Credentials\n(Email + Password)"]
        HashCheck{"bcrypt.compare\nPassword Match?"}
        GenToken["Generate JWT Token\n{ userId, role } — 1 Day Expiry"]
        StoreToken["Store in AuthContext\n(token + user state)"]

        RoleCheck{"User Role?"}
        RedirectCustomer["→ /dashboard (CustomerLayout)"]
        RedirectAdmin["→ /admin/dashboard (AdminLayout)"]
        ReturnError["❌ Return 401 Invalid Credentials"]

        CA1 -->|"POST /api/auth/register"| ValCreds
        CA2 -->|"POST /api/auth/login"| ValCreds
        AA1 -->|"POST /api/auth/login"| ValCreds

        ValCreds --> HashCheck
        HashCheck -->|"No Match"| ReturnError
        HashCheck -->|"Match"| GenToken
        GenToken --> StoreToken
        StoreToken --> RoleCheck
        RoleCheck -->|"role = customer"| RedirectCustomer
        RoleCheck -->|"role = admin"| RedirectAdmin
    end

    subgraph ProtectedRoute ["🛡️ ProtectedRoute Guard (App.jsx)"]
        PR1{"Token in\nAuthContext?"}
        RoleGuard{"Required\nRole Matches?"}
        PR_Deny1["→ Redirect to /login"]
        PR_Deny2["→ Redirect to /admin/login"]
        PR_Allow["✅ Render Protected Page"]

        PR1 -->|"No Token"| PR_Deny1
        PR1 -->|"Has Token"| RoleGuard
        RoleGuard -->|"Customer → Admin Route"| PR_Deny2
        RoleGuard -->|"Admin → Customer Route"| PR_Deny1
        RoleGuard -->|"Role Matches"| PR_Allow
    end

    subgraph AuthAPI ["Backend: authController.js"]
        B_Register["register()\nHash password → prisma.user.create()"]
        B_Login["login()\nprisma.user.findUnique() → bcrypt → jwt.sign()"]
        B_Profile["getProfile()\nprisma.user.findUnique() [select]"]
        B_UpdateProfile["updateProfile()\nprisma.user.update()"]
    end

    subgraph AuthMiddleware ["authMiddleware.js"]
        MW["verifyToken()\njwt.verify() → attach req.user"]
    end

    ValCreds --> B_Register
    ValCreds --> B_Login
    MW -.->|"Protects all\nauthorized routes"| AuthAPI

    class CA1,CA2,AA1,RedirectCustomer,RedirectAdmin auth;
    class ValCreds,HashCheck,GenToken,StoreToken,RoleCheck backend;
    class B_Register,B_Login,B_Profile,B_UpdateProfile backend;
    class MW backend;
    class PR1,RoleGuard decision;
```

---

## 2. Customer Interface Module

Full customer journey: browsing products, viewing details, selecting variants, managing a cart, completing checkout, tracking orders, and submitting reviews.

```mermaid
flowchart TD
    classDef page fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px;
    classDef action fill:#d5e8d4,stroke:#82b366,stroke-width:2px;
    classDef decision fill:#fff2cc,stroke:#d6b656,stroke-width:2px;
    classDef backend fill:#f5f5f5,stroke:#666666,stroke-width:2px;

    subgraph CustomerFlow ["👤 Customer Interface — CustomerLayout.jsx"]
        direction TB

        subgraph BrowseModule ["🛒 Browse & Product Discovery"]
            C1["📄 /dashboard — CustomerDashboardPage.jsx\nBrowse all products (grid)\nSearch / Filter by type\nAverage Rating display"]
            C2["📄 /product/:id — ProductDetails.jsx\nProduct images gallery\nVariant selector (size/type)\nStock availability check\nLive price computation\nAverage rating & reviews"]
        end

        subgraph CartModule ["🛍️ Cart System — CartContext.jsx"]
            Cart1["Add to Cart\n(product + variant + qty)"]
            Cart2["Cart State Management\n(CartProvider wraps all routes)"]
            Cart3["Update Qty / Remove Item"]
            Cart4["Cart Persists across\npage navigation"]
        end

        subgraph CheckoutModule ["💳 Checkout — Checkout.jsx"]
            CH1["Review Cart Items\n(Product, Variant, Qty, Price)"]
            CH2["Fill Delivery Details\n(Name, Address, City/Province, ZIP, Contact)"]
            CH3["Select Payment Mode\n(Cash on Delivery)"]
            CH4["Validate Stock\nbefore submission"]
            CH5{"Stock OK?"}
            CH6["POST /api/customer/orders/bulk\ncreateOrder or createBulkOrder"]
            CH7["❌ Show Out-of-Stock Error"]
            CH8["✅ Order Created → /orders"]
        end

        subgraph OrdersModule ["📦 Orders — OrdersPage.jsx / OrderDetails.jsx"]
            O1["📄 /orders — OrdersPage.jsx\nList all my orders (GET /api/customer/orders/my)\nStatus badges, date, total"]
            O2["📄 /order/:id — OrderDetails.jsx\nFull order breakdown\nItems, variant names, quantities\nDelivery address & contact\nPayment & order status tracking\nEstimated delivery date"]
        end

        subgraph ReviewModule ["⭐ Review System"]
            R1["Review form in OrderDetails.jsx\n(only for 'delivered' orders)"]
            R2["Rating (1–5 stars)\nTitle + Comment\nUp to 3 image URLs"]
            R3["POST /api/customer/reviews/:productId\nVerify delivered order ownership\nCheck no duplicate review"]
            R4["Update Product averageRating\n& reviewCount on submit"]
        end
    end

    C1 -->|"Click product"| C2
    C2 --> Cart1
    Cart1 --> Cart2
    Cart2 --> Cart3
    Cart2 --> Cart4
    Cart2 -->|"Go to Checkout"| CH1
    CH1 --> CH2
    CH2 --> CH3
    CH3 --> CH4
    CH4 --> CH5
    CH5 -->|"Out of Stock"| CH7
    CH5 -->|"In Stock"| CH6
    CH6 --> CH8
    CH8 --> O1
    O1 -->|"View order"| O2
    O2 -->|"Order is Delivered"| R1
    R1 --> R2
    R2 --> R3
    R3 --> R4

    class C1,C2,O1,O2 page;
    class Cart1,Cart2,Cart3,Cart4,CH1,CH2,CH3,CH4,CH6,CH8,R1,R2,R3,R4 action;
    class CH5 decision;
```

---

## 3. Admin Dashboard Module

Admin-only portal with role-guarded access, providing full visibility into system analytics, inventory, orders, and user management.

```mermaid
flowchart TD
    classDef admin fill:#d5e8d4,stroke:#82b366,stroke-width:2px;
    classDef page fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px;
    classDef action fill:#f5f5f5,stroke:#666666,stroke-width:2px;
    classDef alert fill:#ffe6cc,stroke:#d79b00,stroke-width:2px;

    subgraph AdminPortal ["🏢 Admin Portal — AdminLayout.jsx"]
        direction TB

        A_Login["📄 /admin/login — AdminLoginPage.jsx\n(role = admin required)"]
        A_Guard["ProtectedRoute\n(requiredRole = 'admin')"]

        subgraph DashboardMod ["📊 Dashboard — /admin/dashboard"]
            D1["DashboardPage.jsx"]
            D2["KPI Cards:\nTotal Revenue, Products,\nOrders, Customers"]
            D3["Sales Summary:\nToday / This Week / This Month\nAvg Order Value"]
            D4["Recent Orders Table (last 5)"]
            D5["Recent Users Table (last 5)"]
            D6["Top Selling Products (by qty sold)"]
            D7["Inventory Bars\n(stock % by product type)"]
            D8["⚠️ Stock Alerts\n(products with stock < 10)"]

            D1 --> D2
            D1 --> D3
            D1 --> D4
            D1 --> D5
            D1 --> D6
            D1 --> D7
            D1 --> D8
        end

        subgraph InventoryMod ["📦 Inventory — /admin/inventory"]
            I1["ProductManagement.jsx"]
            I2["Product List\n(name, type, price, stock, variants)"]
            I3["Add Product Modal\n(name, type, description, price, stock, images)"]
            I4["Add Variant Modal\n(name, price, stock, SKU, status)"]
            I5["Delete Product\n(cascades: variants + order items)"]
            I6["Delete Variant\n→ syncParentProductAggregates()\n(recalculate parent price & stock)"]

            subgraph ProductTypeMod ["🏷️ Product Types"]
                PT1["AddProductTypeModal.jsx\nCreate new type (name, description)"]
                PT2["Duplicate name check\n(case-insensitive)"]
                PT1 --> PT2
            end

            I1 --> I2
            I1 --> I3
            I1 --> I4
            I1 --> I5
            I1 --> I6
            I1 --> PT1
        end

        subgraph OrderMgmtMod ["📋 Order Management — /admin/orders"]
            OM1["OrderManagement.jsx"]
            OM2["Orders Table\n(ID, Customer, Products, Qty, Total,\nStatus, Payment, Date)"]
            OM3["Update Order Status\n(pending → processing → shipped\n→ out_for_delivery → delivered → cancelled)"]
            OM4["Update Payment Status\n(unpaid → paid)"]
            OM5["Set Estimated Delivery Date\n(EstimatedDeliveryValidator.js)"]
            OM6["View Full Order Details\n(items, variants, address, notes)"]

            OM1 --> OM2
            OM2 --> OM3
            OM2 --> OM4
            OM2 --> OM5
            OM2 --> OM6
        end

        subgraph UserMgmtMod ["👥 User Management — /admin/users"]
            U1["UserManagement.jsx"]
            U2["Customer list\n(name, email, role, status, joined date)"]
            U1 --> U2
        end

        NavBar["AdminLayout Sidebar Navigation\nDashboard | Inventory | Orders | Users | Settings"]
    end

    A_Login --> A_Guard
    A_Guard --> NavBar
    NavBar --> DashboardMod
    NavBar --> InventoryMod
    NavBar --> OrderMgmtMod
    NavBar --> UserMgmtMod

    class A_Login,A_Guard admin;
    class D1,I1,OM1,U1 page;
    class D2,D3,D4,D5,D6,D7 action;
    class D8 alert;
```

---

## 4. Backend API & Business Logic

All routes, controllers, and middleware that power the system. Organized by admin and customer namespaces.

```mermaid
flowchart TD
    classDef route fill:#ffe6cc,stroke:#d79b00,stroke-width:2px;
    classDef controller fill:#f5f5f5,stroke:#666666,stroke-width:2px;
    classDef middleware fill:#d5e8d4,stroke:#82b366,stroke-width:2px;
    classDef transaction fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px;

    subgraph BackendAPI ["⚙️ Backend API — Express.js (server.js)"]
        direction TB

        MW["🛡️ authMiddleware.js\njwt.verify() → req.user\n(Applied to all protected routes)"]

        subgraph AuthRoutes ["/api/auth — authRoutes.js"]
            AR1["POST /register → register()"]
            AR2["POST /login → login()"]
            AR3["GET /profile → getProfile() [auth]"]
            AR4["PUT /profile → updateProfile() [auth]"]
        end

        subgraph AdminRoutes ["🔒 Admin Routes (require admin role)"]
            subgraph AdminProduct ["/api/admin/products — productRoutes.js"]
                AP1["GET / → getProducts()"]
                AP2["POST / → createProduct()"]
                AP3["DELETE /:id → deleteProduct() [cascade]"]
                AP4["GET /:productId/variants → getVariants()"]
                AP5["POST /:productId/variants → createVariant()\n→ syncParentProductAggregates()"]
                AP6["DELETE /:productId/variants/:id → deleteVariant()\n→ syncParentProductAggregates()"]
            end

            subgraph AdminDashboard ["/api/admin/dashboard — dashboardRoutes.js"]
                AD1["GET /stats → getDashboardStats()\nAggregates: revenue, users, orders\nRecent orders, recent users\nTop products, stock alerts\nInventory bars, sales summary"]
            end

            subgraph AdminOrders ["/api/admin/orders — orderRoutes.js"]
                AO1["GET / → getOrders()\n(with user, items, product, variant)"]
                AO2["PATCH /:id/status → updateOrderStatus()\n→ EstimatedDeliveryValidator"]
            end

            subgraph AdminUsers ["/api/admin/users — userRoutes.js"]
                AU1["GET / → getUsers()"]
            end

            subgraph AdminProductTypes ["/api/admin/product-types — productTypeRoutes.js"]
                APT1["GET / → getProductTypes()"]
                APT2["POST / → createProductType()\n(duplicate check, case-insensitive)"]
            end
        end

        subgraph CustomerRoutes ["👤 Customer Routes (require customer auth)"]
            subgraph CustProducts ["/api/customer/products — productRoutes.js"]
                CP1["GET / → getAllProducts()\n(with variants, reviews, ratings)"]
                CP2["GET /:id → getProductById()"]
            end

            subgraph CustOrders ["/api/customer/orders — orderRoutes.js"]
                CO1["POST / → createOrder()\n(single product + variant)"]
                CO2["POST /bulk → createBulkOrder()\n(cart multi-item checkout)"]
                CO3["GET /my → getMyOrders()\n(ownership-scoped)"]
                CO4["GET /:id → getOrderById()\n(ownership-scoped)"]
            end

            subgraph CustReviews ["/api/customer/reviews — reviewRoutes.js"]
                CR1["POST /:productId → submitReview()\n(verify delivered order, no duplicate)"]
                CR2["GET /:productId → getProductReviews()"]
            end
        end

        subgraph TransactionLogic ["🔄 Atomic Transaction Logic"]
            T1["createOrder() / createBulkOrder()\nprisma.$transaction()\n1. Validate stock\n2. Create Order + OrderItems\n3. Deduct stock (variant or product)\n4. Rollback on STOCK_ERROR"]
            T2["createVariant() / deleteVariant()\nprisma.$transaction()\n1. Write variant change\n2. syncParentProductAggregates()\n   → recalculate product.price (min)\n   → recalculate product.stock (sum)"]
        end
    end

    MW -.->|"Injected into\nprotected routes"| AdminRoutes
    MW -.->|"Injected into\nprotected routes"| CustomerRoutes
    CO1 --> T1
    CO2 --> T1
    AP5 --> T2
    AP6 --> T2

    class AR1,AR2,AR3,AR4 route;
    class AP1,AP2,AP3,AP4,AP5,AP6,AD1,AO1,AO2,AU1,APT1,APT2 route;
    class CP1,CP2,CO1,CO2,CO3,CO4,CR1,CR2 route;
    class MW middleware;
    class T1,T2 transaction;
```

---

## 5. Database & Data Models

PostgreSQL database accessed via Prisma ORM. All models and their relationships.

```mermaid
erDiagram
    User {
        Int     id           PK
        String  name
        String  email        UK
        String  password
        String  role         "customer | admin"
        String  status       "active | suspended"
        String  avatarUrl    nullable
        String  contactNumber nullable
        String  address      nullable
        String  cityProvince nullable
        String  zipCode      nullable
        DateTime createdAt
    }

    Product {
        Int     id               PK
        String  name
        String  type             "Spandrel | Rib | Flat Type etc"
        String  shortDescription nullable
        String  longDescription  nullable
        Float   price            "Base / min variant price"
        String  unit             "per meter"
        Int     stock            "Base / sum of variant stock"
        String  imageUrl         nullable
        String[] imageUrls
        Float   averageRating
        Int     reviewCount
        DateTime createdAt
        DateTime updatedAt
    }

    ProductVariant {
        Int     id        PK
        Int     productId FK
        String  name      "e.g. Per Meter, 2 Meters"
        Float   price
        Int     stock
        String  sku       nullable
        String  status    "available | out_of_stock"
        DateTime createdAt
        DateTime updatedAt
    }

    Order {
        Int     id                    PK
        Int     userId                FK
        Float   total
        String  status                "pending|processing|shipped|out_for_delivery|delivered|cancelled"
        String  paymentStatus         "unpaid | paid"
        String  paymentMode           "Cash on Delivery"
        String  customerName          nullable
        String  customerEmail         nullable
        String  contactNumber         nullable
        String  address               nullable
        String  cityProvince          nullable
        String  zipCode               nullable
        String  notes                 nullable
        DateTime estimatedDeliveryDate nullable
        DateTime createdAt
    }

    OrderItem {
        Int     id          PK
        Int     orderId     FK
        Int     productId   FK
        Int     variantId   FK "nullable"
        String  variantName nullable "snapshot at purchase"
        Int     quantity
        Float   price       "snapshot at purchase"
    }

    Review {
        Int     id        PK
        Int     productId FK
        Int     userId    FK
        Int     rating    "1–5"
        String  title     nullable
        String  comment   nullable
        String[] imageUrls
        DateTime createdAt
    }

    ProductType {
        Int     id          PK
        String  name        UK
        String  description nullable
        DateTime createdAt
    }

    User ||--o{ Order : "places"
    User ||--o{ Review : "writes"
    Product ||--o{ ProductVariant : "has"
    Product ||--o{ OrderItem : "appears in"
    Product ||--o{ Review : "receives"
    Order ||--o{ OrderItem : "contains"
    ProductVariant ||--o{ OrderItem : "selected in"
```

---

## 6. Full System Integration Flow

End-to-end data flow from browser to database, showing how all modules connect.

```mermaid
flowchart LR
    classDef auth fill:#ffe6cc,stroke:#d79b00,stroke-width:2px;
    classDef user fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px;
    classDef admin fill:#d5e8d4,stroke:#82b366,stroke-width:2px;
    classDef backend fill:#f5f5f5,stroke:#666666,stroke-width:2px;
    classDef db fill:#e1d5e7,stroke:#9673a6,stroke-width:2px;

    subgraph Frontend ["🖥️ Frontend — React + Vite"]
        AuthCtx["AuthContext\n(JWT + user state)"]
        CartCtx["CartContext\n(Cart state)"]

        subgraph CustomerUI ["Customer UI"]
            CU1["Dashboard / Browse"]
            CU2["Product Details + Variants"]
            CU3["Cart & Checkout"]
            CU4["Orders & Order Details"]
            CU5["Review Submission"]
        end

        subgraph AdminUI ["Admin UI"]
            AU1["Dashboard KPIs & Analytics"]
            AU2["Inventory Management"]
            AU3["Order Management"]
            AU4["User Management"]
        end
    end

    subgraph Backend ["⚙️ Backend — Node.js / Express"]
        Router["Express Router"]
        AuthMW["authMiddleware\n(JWT verify)"]

        subgraph Controllers ["Controllers"]
            AC["authController"]
            APC["admin/productController\n+ variantController\n+ productTypeController"]
            ADC["admin/dashboardController"]
            AOC["admin/orderController"]
            AUC["admin/userController"]
            CPC["customer/productController"]
            COC["customer/orderController\n(createOrder, createBulkOrder,\ngetMyOrders, getOrderById)"]
            CRC["customer/reviewController"]
        end
    end

    subgraph Database ["🗄️ Database — PostgreSQL"]
        PrismaORM["Prisma ORM"]
        DB[("PostgreSQL\nUser | Product | ProductVariant\nOrder | OrderItem | Review\nProductType")]
    end

    AuthCtx -->|"Attach Bearer Token"| Router
    CartCtx -->|"Submit Cart Data"| CU3

    CU1 -->|"GET /api/customer/products"| Router
    CU2 -->|"GET /api/customer/products/:id"| Router
    CU3 -->|"POST /api/customer/orders/bulk"| Router
    CU4 -->|"GET /api/customer/orders/my"| Router
    CU5 -->|"POST /api/customer/reviews/:id"| Router

    AU1 -->|"GET /api/admin/dashboard/stats"| Router
    AU2 -->|"CRUD /api/admin/products"| Router
    AU3 -->|"GET+PATCH /api/admin/orders"| Router
    AU4 -->|"GET /api/admin/users"| Router

    Router --> AuthMW
    AuthMW --> Controllers

    AC <-->|"Query/Write"| PrismaORM
    APC <-->|"Query/Write"| PrismaORM
    ADC <-->|"Aggregate"| PrismaORM
    AOC <-->|"Query/Write"| PrismaORM
    AUC <-->|"Query"| PrismaORM
    CPC <-->|"Query"| PrismaORM
    COC <-->|"Transaction"| PrismaORM
    CRC <-->|"Query/Write"| PrismaORM

    PrismaORM <-->|"SQL Queries"| DB

    class AuthCtx,CartCtx auth;
    class CU1,CU2,CU3,CU4,CU5 user;
    class AU1,AU2,AU3,AU4 admin;
    class Router,AuthMW,AC,APC,ADC,AOC,AUC,CPC,COC,CRC backend;
    class PrismaORM,DB db;
```

---

## 📌 Flow Highlights (Current System State)

### 1. 🔐 Authentication & Authorization
- **Dual portal login** — Customers use `/login`, Admins use `/admin/login`. Both hit the same `POST /api/auth/login` endpoint; role in the JWT determines which layout they are redirected to.
- **ProtectedRoute** component in `App.jsx` enforces both token presence and role matching. Cross-role access (e.g., admin accessing `/dashboard`) is auto-redirected.
- **Profile update** supported via `PUT /api/auth/profile` — customers can update contact, address, city/province, and ZIP.

### 2. 🛒 Customer Interface (React)
- **Product browsing** on `/dashboard` fetches all products including variants and ratings. Customers filter by type and search by name.
- **ProductDetails** (`/product/:id`) supports multi-image gallery, variant picker, real-time stock & price display, and the review section.
- **CartContext** persists cart state globally across all routes using React Context.
- **Checkout** supports both single-item and cart (bulk) orders via separate API endpoints.

### 3. 📦 Inventory Management (Admin)
- Products have **base price/stock** plus optional **ProductVariants** (e.g., "Per Meter", "2 Meters").
- When variants exist, the product's `price` (min) and `stock` (sum) are auto-synced via `syncParentProductAggregates()` on every variant create/delete — wrapped in a Prisma atomic transaction.
- **Product Types** are managed separately (e.g., Spandrel, Rib, Flat Type) and used to categorize products.

### 4. 📋 Order Lifecycle (Admin + Customer)
- Orders start as `pending` (unpaid). Admin updates statuses: `pending → processing → shipped → out_for_delivery → delivered → cancelled`.
- **Estimated Delivery Date** is validated via `EstimatedDeliveryValidator.js` before storing.
- Stock is **atomically deducted** at checkout using `prisma.$transaction()`. A race condition is prevented by using `updateMany` with a `gte` guard before decrement.

### 5. ⭐ Review System
- Customers can only review a product from a **delivered** order they own.
- **Duplicate review** prevention enforced server-side.
- Upon review submission, the product's `averageRating` and `reviewCount` are recalculated and updated automatically.

### 6. 📊 Admin Dashboard Analytics
- Real-time stats aggregated server-side: **Total Revenue, Products, Orders, Customers**, **Sales breakdown** (today/week/month/avg), **Top selling products**, **Inventory stock bars by type**, **Stock alerts** (stock < 10), **Recent orders and users**.
