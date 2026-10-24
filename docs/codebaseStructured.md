# Freebuff conversation
_3 messages_

---

## Assistant

## User

Give me a high-level overview of how this codebase is structured and what the main parts do.

## Assistant

> _Reasoning_
> The user is asking for a high-level overview of the codebase structure. This is a question, not a code change, so I don't need to implement anything. Let me explore the codebase to give them a comprehensive overview.
> 
> I should:
> 1. Look at the project structure
> 2. Read key configuration files (package.json, etc.)
> 3. Understand the main directories and their purposes
> 
> Let me start by exploring the codebase structure.

**🛠 Read Subtree**

```json
{
  "paths": [
    "backend",
    "frontend/src",
    "frontend/package.json",
    "backend/package.json"
  ],
  "maxTokens": 8000
}
```

```

- path: backend
  type: directory
  printedTree: |
      backend/
       .env.example
       .gitignore
       config/
        db.js
       controllers/
        admin/
         dashboardController.js
         salesController.js
         orderController.js
         productController.js
         productTypeController.js
         userController.js
         variantController.js
        authController.js
        customer/
         orderController.js
         productController.js
         reviewController.js
        sales/
         dashboardController.js
         reviewController.js
        inquiryController.js
       middleware/
        authMiddleware.js
       package.json
       prisma/
        migrations/
         20260409124141_init/
          migration.sql
         20260410161620_add_admin_ecommerce_models/
          migration.sql
         20260601095053_add_product_variants/
          migration.sql
         20260602103029_add_product_type_table/
          migration.sql
         migration_lock.toml
        schema.prisma
        seed.js
       prisma.config.ts
       routes/
        admin/
         dashboardRoutes.js
         salesRoutes.js
         orderRoutes.js
         productRoutes.js
         productTypeRoutes.js
         reviewRoutes.js
         userRoutes.js
        authRoutes.js
        customer/
         orderRoutes.js
         productRoutes.js
         reviewRoutes.js
        sales/
         dashboardRoutes.js
         reviewRoutes.js
        inquiryRoutes.js
       scripts/
        cleanupUser.js
       server.js
       services/
        deliveryScheduler.js
       utils/
        deliveryHelper.js
        emailService.js
        EstimatedDeliveryValidator.js
       validators/
        authValidator.js
      
  tokenCount: 460
  truncationLevel: none
- path: frontend/src
  errorMessage: "Path not found or ignored: frontend/src"
- path: frontend/package.json
  errorMessage: "Path not found or ignored: frontend/package.json"
- path: backend/package.json
  errorMessage: "Path not found or ignored: backend/package.json"
```

> _Reasoning_
> The user is asking for a high-level overview of the codebase structure. I have the project file tree and some initial context. Let me explore more to understand the structure better by reading key configuration files and understanding the tech stack.

Let me explore the key configuration files and frontend structure to give you a comprehensive overview.

**🛠 Read Files**

```json
{
  "paths": [
    "backend/package.json",
    "frontend/package.json",
    "backend/server.js",
    "backend/prisma/schema.prisma"
  ]
}
```

```

- path: backend\package.json
  content: |
      {
        "name": "backend",
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
          "start": "node server.js",
          "dev": "node --watch server.js",
          "build": "prisma generate",
          "test": "echo \"Error: no test specified\" && exit 1",
          "seed": "prisma db seed"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "type": "commonjs",
        "prisma": {
          "seed": "node prisma/seed.js"
        },
        "dependencies": {
          "@hono/node-server": "^1.19.13",
          "@prisma/adapter-pg": "^7.7.0",
          "@prisma/client": "^7.7.0",
          "bcryptjs": "^3.0.3",
          "cors": "^2.8.6",
          "dotenv": "^17.4.1",
          "express": "^5.2.1",
          "jsonwebtoken": "^9.0.3",
          "nodemailer": "^9.0.1",
          "pg": "^8.20.0",
          "prisma": "^7.7.0",
          "socket.io": "^4.8.3"
        }
      }
      
  referencedBy: {}
- path: frontend\package.json
  content: |
      {
        "name": "frontend",
        "private": true,
        "version": "0.0.0",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "lint": "eslint .",
          "preview": "vite preview"
        },
        "dependencies": {
          "@emotion/react": "^11.14.0",
          "@emotion/styled": "^11.14.1",
          "@mui/icons-material": "^9.1.1",
          "@mui/material": "^9.1.1",
          "@mui/x-data-grid": "^9.7.0",
          "@react-three/drei": "^10.7.7",
          "@react-three/fiber": "^9.5.0",
          "axios": "^1.14.0",
          "i18next": "^26.3.0",
          "jspdf": "^4.2.1",
          "jspdf-autotable": "^5.0.8",
          "lucide-react": "^1.8.0",
          "react": "^19.2.4",
          "react-dom": "^19.2.4",
          "react-i18next": "^17.0.8",
          "react-quill-new": "^3.8.3",
          "react-router-dom": "^7.14.0",
          "socket.io-client": "^4.8.3",
          "tailwindcss": "^4.2.2",
          "three": "^0.183.2",
          "xlsx": "^0.18.5"
        },
        "devDependencies": {
          "@eslint/js": "^9.39.4",
          "@tailwindcss/vite": "^4.3.0",
          "@types/react": "^19.2.14",
          "@types/react-dom": "^19.2.3",
          "@vitejs/plugin-react": "^6.0.1",
          "eslint": "^9.39.4",
          "eslint-plugin-react-hooks": "^7.0.1",
          "eslint-plugin-react-refresh": "^0.5.2",
          "globals": "^17.4.0",
          "vite": "^8.0.4"
        }
      }
      
  referencedBy: {}
- path: backend\server.js
  content: |
      const express = require("express");
      const cors = require("cors");
      const http = require("http");
      const { Server } = require("socket.io");
      require("dotenv").config();
      
      const app = express();
      const server = http.createServer(app);
      const io = new Server(server, {
        cors: {
          origin: "*", // allow frontend origins
          methods: ["GET", "POST", "PUT", "DELETE"],
        },
      });
      
      // Make io accessible in controllers
      app.set("io", io);
      
      const PORT = process.env.PORT || 5000;
      // Middleware
      app.use(cors());
      app.use(express.json({ limit: "50mb" }));
      app.use(express.urlencoded({ limit: "50mb", extended: true }));
      
      // Routes
      const authRoutes = require("./routes/authRoutes");
      const productRoutes = require("./routes/admin/productRoutes");
      const dashboardRoutes = require("./routes/admin/dashboardRoutes");
      const orderRoutes = require("./routes/admin/orderRoutes");
      const userRoutes = require("./routes/admin/userRoutes");
      const productTypeRoutes = require("./routes/admin/productTypeRoutes");
      const salesRoutes = require("./routes/admin/salesRoutes");
      const adminReviewRoutes = require("./routes/admin/reviewRoutes");
      const salesDashboardRoutes = require("./routes/sales/dashboardRoutes");
      const salesReviewRoutes = require("./routes/sales/reviewRoutes");
      const customerProductRoutes = require("./routes/customer/productRoutes");
      const customerOrderRoutes = require("./routes/customer/orderRoutes");
      const customerReviewRoutes = require("./routes/customer/reviewRoutes");
      const inquiryRoutes = require("./routes/inquiryRoutes");
      
      app.use("/api/auth", authRoutes);
      app.use("/api/admin/products", productRoutes);
      app.use("/api/admin/dashboard", dashboardRoutes);
      app.use("/api/admin/orders", orderRoutes);
      app.use("/api/admin/users", userRoutes);
      app.use("/api/admin/product-types", productTypeRoutes);
      app.use("/api/admin/saless", salesRoutes);
      app.use("/api/admin/reviews", adminReviewRoutes);
      app.use("/api/sales/dashboard", salesDashboardRoutes);
      app.use("/api/sales/reviews", salesReviewRoutes);
      
      app.use("/api/customer/products", customerProductRoutes);
      app.use("/api/customer/orders", customerOrderRoutes);
      app.use("/api/customer/reviews", customerReviewRoutes);
      app.use("/api/inquiries", inquiryRoutes);
      
      app.get("/", (req, res) => {
        res.send("Mega Pacific Backend is running!");
      });
      
      io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        
        socket.on("join_room", (room) => {
          socket.join(room);
          console.log(`Socket ${socket.id} joined room ${room}`);
        });
      
        socket.on("disconnect", () => {
          console.log("Client disconnected:", socket.id);
        });
      });
      
      // Start Delivery Date Extension Scheduler
      const { initDeliveryScheduler } = require("./services/deliveryScheduler");
      initDeliveryScheduler();
      
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Network: http://0.0.0.0:${PORT}`);
      });
      
  referencedBy: {}
- path: backend\prisma\schema.prisma
  content: |
      // Prisma Schema - Mega Pacific Roofing System
      // Prisma v7: URL is defined in prisma.config.ts, NOT here
      
      generator client {
        provider = "prisma-client-js"
        output   = "../generated/prisma"
      }
      
      datasource db {
        provider = "postgresql"
      }
      
      model User {
        id            Int      @id @default(autoincrement())
        name          String
        email         String   @unique
        password      String
        role          String   @default("customer")
        status        String   @default("active") // active, suspended, deleted
        deletedAt     DateTime?
        avatarUrl     String? // Profile Avatar
        contactNumber String?
        address       String?
        city          String?
        province      String?
        zipCode       String?
        createdAt     DateTime @default(now())
        orders        Order[]
        reviews       Review[]
        inquiries     Inquiry[]
        sentMessages  Message[]
        isEmailVerified    Boolean   @default(false)
        otpCode            String?
        otpExpiresAt       DateTime?
        lastOtpSentAt      DateTime?
        resetOtpCode       String?   // For forgot-password flow (separate from email verification OTP)
        resetOtpExpiresAt  DateTime?
        replies            ReviewReply[]
      }
      
      model Product {
        id               Int              @id @default(autoincrement())
        name             String           @unique
        type             String // e.g. Spandrel, Rib, Flat Type
        description      String?
        price            Float // Base price (fallback when no variants)
        unit             String           @default("per meter")
        stock            Int // Base stock (fallback when no variants)
        imageUrl         String?
        imageUrls        String[]         @default([])
        averageRating    Float            @default(0)
        reviewCount      Int              @default(0)
        createdAt        DateTime         @default(now())
        updatedAt        DateTime         @updatedAt
        variants         ProductVariant[]
        orderItems       OrderItem[]
        reviews          Review[]
      }
      
      model ProductVariant {
        id         Int         @id @default(autoincrement())
        productId  Int
        product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
        name       String // e.g. "Per Meter", "2 Meters", "Bundle"
        price      Float
        stock      Int
        sku        String? // Optional SKU
        status     String      @default("available") // "available" | "out_of_stock"
        createdAt  DateTime    @default(now())
        updatedAt  DateTime    @updatedAt
        orderItems OrderItem[]
      }
      
      model Review {
        id        Int          @id @default(autoincrement())
        productId Int
        product   Product      @relation(fields: [productId], references: [id])
        userId    Int
        user      User         @relation(fields: [userId], references: [id])
        rating    Int          @default(5)
        title     String? // Review Title
        comment   String?
        imageUrls String[]     @default([]) // Array for multiple review images
        createdAt DateTime     @default(now())
        orderId   Int?
        order     Order?       @relation(fields: [orderId], references: [id])
        reply     ReviewReply?
      }
      
      model Order {
        id                    Int         @id @default(autoincrement())
        userId                Int
        user                  User        @relation(fields: [userId], references: [id])
        total                 Float
        status                String      @default("pending") // pending, processing, shipped, completed
        paymentStatus         String      @default("unpaid")
        paymentMode           String      @default("Cash on Delivery")
        customerName          String?
        customerEmail         String?
        shippingName          String?
        shippingContactNumber String?
        shippingAddress       String?
        shippingCity          String?
        shippingProvince      String?
        shippingZipCode       String?
        notes                 String?
        estimatedDeliveryDate DateTime?
        createdAt             DateTime    @default(now())
        items                 OrderItem[]
        reviews               Review[]
      }
      
      model OrderItem {
        id          Int             @id @default(autoincrement())
        orderId     Int
        order       Order           @relation(fields: [orderId], references: [id])
        productId   Int
        product     Product         @relation(fields: [productId], references: [id])
        variantId   Int? // Optional: which variant was ordered
        variant     ProductVariant? @relation(fields: [variantId], references: [id])
        variantName String? // Snapshot of variant name at time of purchase
        quantity    Int
        price       Float // Price at time of purchase (variant price or base price)
      }
      
      model ProductType {
        id          Int      @id @default(autoincrement())
        name        String   @unique
        description String?
        createdAt   DateTime @default(now())
      }
      
      model Inquiry {
        id          Int       @id @default(autoincrement())
        customerId  Int
        customer    User      @relation(fields: [customerId], references: [id])
        subject     String?
        status      String    @default("Open") // Open, In Progress, Resolved
        createdAt   DateTime  @default(now())
        updatedAt   DateTime  @updatedAt
        messages    Message[]
      }
      
      model Message {
        id          Int       @id @default(autoincrement())
        inquiryId   Int
        inquiry     Inquiry   @relation(fields: [inquiryId], references: [id], onDelete: Cascade)
        senderId    Int
        sender      User      @relation(fields: [senderId], references: [id])
        content     String
        createdAt   DateTime  @default(now())
      }
      
      model ReviewReply {
        id        Int      @id @default(autoincrement())
        reviewId  Int      @unique
        review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
        userId    Int
        user      User     @relation(fields: [userId], references: [id])
        comment   String
        createdAt DateTime @default(now())
      }
      
  referencedBy: {}
```

**🛠 Read Subtree**

```json
{
  "paths": [
    "frontend/src"
  ],
  "maxTokens": 6000
}
```

```

- path: frontend/src
  errorMessage: "Path not found or ignored: frontend/src"
```

> _Reasoning_
> The user is asking for a high-level overview of the codebase. I've already gathered a lot of context from the file tree and the files I've read. Let me also explore the frontend structure since that failed earlier.

Let me also explore the frontend pages and layouts to complete the picture.

**🛠 List Directories**

```json
{
  "path": "frontend/src/pages"
}
```

```
files: []
directories: 
  - admin
  - customer
  - sales
path: frontend/src/pages
```

**🛠 List Directories**

```json
{
  "path": "frontend/src/components"
}
```

```
files: 
  - CustomerHeader.jsx
  - CustomerServiceWidget.jsx
  - Footer.jsx
  - HeroSection.jsx
  - InventoryDataGrid.jsx
  - LogoutConfirmModal.jsx
  - ThemeSwitcher.jsx
directories: []
path: frontend/src/components
```

**🛠 List Directories**

```json
{
  "path": "frontend/src/layouts"
}
```

```
files: 
  - AdminLayout.jsx
  - CustomerLayout.jsx
  - SalesLayout.jsx
directories: []
path: frontend/src/layouts
```

> _Reasoning_
> The user is asking for a high-level overview of the codebase structure. I've already gathered a lot of context from the file tree and the files I've read. I don't need to spawn any agents for this since it's just a question. Let me provide a comprehensive overview based on what I've learned.
> 
> Let me also look at the frontend context files to understand the auth and cart systems better.

**🛠 Read Files**

```json
{
  "paths": [
    "frontend/src/context/AuthContext.jsx",
    "frontend/src/App.jsx",
    "backend/middleware/authMiddleware.js"
  ]
}
```

```

- path: frontend\src\context\AuthContext.jsx
  content: |
      import React, { createContext, useState, useContext, useEffect } from 'react';
      import axios from 'axios';
      
      const AuthContext = createContext();
      
      export const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(null);
        const [token, setToken] = useState(localStorage.getItem('appToken'));
        const [loading, setLoading] = useState(true);
      
        useEffect(() => {
          if (token) {
            
            const savedUser = localStorage.getItem('appUser');
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            delete axios.defaults.headers.common['Authorization'];
          }
          setLoading(false);
        }, [token]);
      
        const login = async (email, password) => {
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            const { token, user } = response.data;
            
            localStorage.setItem('appToken', token);
            localStorage.setItem('appUser', JSON.stringify(user));
            
            setToken(token);
            setUser(user);
            return { success: true, user };
          } catch (error) {
            console.error('Login error:', error.response?.data?.error || error.message);
            return { 
              success: false, 
              error: error.response?.data?.error || 'Login failed',
              email: error.response?.data?.email || null
            };
          }
        };
      
        const register = async (name, email, password, contactNumber, address, city, province, zipCode) => {
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${API_URL}/api/auth/register`, { 
              name, 
              email, 
              password,
              contactNumber,
              address,
              city,
              province,
              zipCode,
              role: 'customer'
            });
            return { 
              success: true, 
              userId: response.data.userId, 
              email: response.data.email,
              isRestoration: response.data.isRestoration,
              message: response.data.message 
            };
          } catch (error) {
            console.error('Registration error:', error.response?.data?.error || error.message);
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
          }
        };
      
        const logout = () => {
          localStorage.removeItem('appToken');
          localStorage.removeItem('appUser');
          localStorage.removeItem('mega_pacific_cart');
          setToken(null);
          setUser(null);
        };
      
        return (
          <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
          </AuthContext.Provider>
        );
      };
      
      export const useAuth = () => useContext(AuthContext);
      
  referencedBy: {}
- path: frontend\src\App.jsx
  content: |
      import React from 'react';
      import { Routes, Route, Navigate } from 'react-router-dom';
      import { useAuth } from './context/AuthContext';
      import { CartProvider } from './context/CartContext';
      
      
      import AdminLayout from './layouts/AdminLayout';
      import CustomerLayout from './layouts/CustomerLayout';
      import SalesLayout from './layouts/SalesLayout';
      
      
      import AdminLoginPage from './pages/admin/LoginPage';
      import AdminDashboardPage from './pages/admin/DashboardPage';
      import ProductManagement from './pages/admin/ProductManagement';
      import OrderManagement from './pages/admin/OrderManagement';
      import UserManagement from './pages/admin/UserManagement';
      import SalesManagement from './pages/admin/SalesManagement';
      import ReviewManagement from './pages/admin/ReviewManagement';
      
      
      import SalesLoginPage from './pages/sales/LoginPage';
      import SalesDashboard from './pages/sales/DashboardPage';
      import SalesOrders from './pages/sales/OrderManagement';
      import SalesInventory from './pages/sales/InventoryPage';
      import SalesCustomerService from './pages/sales/CustomerService';
      import SalesReviews from './pages/sales/ReviewManagement';
      
      
      import RegisterPage from './pages/customer/RegisterPage';
      import CustomerLoginPage from './pages/customer/LoginPage';
      import VerifyEmailPage from './pages/customer/VerifyEmailPage';
      import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
      import ResetPasswordPage from './pages/customer/ResetPasswordPage';
      import CustomerDashboardPage from './pages/customer/DashboardPage';
      import ProductDetails from './pages/customer/ProductDetails';
      import Checkout from './pages/customer/Checkout';
      import OrderDetails from './pages/customer/OrderDetails';
      import OrdersPage from './pages/customer/OrdersPage';
      import ProfilePage from './pages/customer/ProfilePage';
      
      
      const ProtectedRoute = ({ children, redirectTo = "/login", requiredRole }) => {
        const { token, user, loading } = useAuth();
      
        if (loading) {
          return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          );
        }
      
        if (!token) {
          return <Navigate to={redirectTo} />;
        }
      
      
        if (requiredRole && user?.role !== requiredRole) {
          if (user?.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
          }
          if (user?.role === 'sales') {
            return <Navigate to="/sales/dashboard" replace />;
          }
          return <Navigate to={redirectTo} replace />;
        }
      
        return children;
      };
      
      const App = () => {
        const { user } = useAuth();
        return (
          <CartProvider userId={user?.id}>
            <Routes>
             
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<CustomerLoginPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
      
            
              <Route path="/" element={
                <ProtectedRoute redirectTo="/login" requiredRole="customer">
                  <CustomerLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<CustomerDashboardPage showHero={true} />} />
                <Route path="products" element={<CustomerDashboardPage showHero={false} />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="order/:id" element={<OrderDetails />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
      
             
              <Route path="/admin/login" element={<AdminLoginPage />} />
              
              <Route path="/admin" element={
                <ProtectedRoute redirectTo="/admin/login" requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="inventory" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="saless" element={<SalesManagement />} />
                <Route path="reviews" element={<ReviewManagement />} />
                <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings coming soon...</div>} />
              </Route>
      
              {/* Sales routes */}
              <Route path="/sales/login" element={<SalesLoginPage />} />
              <Route path="/sales" element={
                <ProtectedRoute redirectTo="/sales/login" requiredRole="sales">
                  <SalesLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/sales/dashboard" />} />
                <Route path="dashboard" element={<SalesDashboard />} />
                <Route path="orders" element={<SalesOrders />} />
                <Route path="inventory" element={<SalesInventory />} />
                <Route path="reviews" element={<SalesReviews />} />
                <Route path="customer-service" element={<SalesCustomerService />} />
              </Route>
      
             
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">404 - Page Not Found</div>} />
            </Routes>
          </CartProvider>
        );
      };
      
      export default App;
      
  referencedBy: {}
- path: backend\middleware\authMiddleware.js
  content: |
      const jwt = require("jsonwebtoken");
      
      const verifyToken = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ error: "Access denied. No token provided." });
        }
      
        const token = authHeader.split(" ")[1];
        try {
          const jwtSecret = process.env.JWT_SECRET;
          if (!jwtSecret) {
            console.error("FATAL: JWT_SECRET environment variable is not set!");
            return res.status(500).json({ error: "Server configuration error." });
          }
          const decoded = jwt.verify(token, jwtSecret);
          req.user = decoded;
          next();
        } catch (error) {
          res.status(400).json({ error: "Invalid token." });
        }
      };
      
      const verifyAdmin = (req, res, next) => {
        verifyToken(req, res, () => {
          if (req.user && req.user.role === "admin") {
            next();
          } else {
            res.status(403).json({ error: "Access denied. Admin privileges required." });
          }
        });
      };
      
      const verifySales = (req, res, next) => {
        verifyToken(req, res, () => {
          if (req.user && (req.user.role === "sales" || req.user.role === "admin")) {
            next();
          } else {
            res.status(403).json({ error: "Access denied. Sales privileges required." });
          }
        });
      };
      
      module.exports = { verifyToken, verifyAdmin, verifySales };
      
  referencedBy: {}
```

> _Reasoning_
> The user is asking for a high-level overview of the codebase structure. I now have enough information from reading the package.json files, server.js, schema.prisma, App.jsx, AuthContext.jsx, and authMiddleware.js. I also have the full file tree. I can now provide a comprehensive overview without needing to spawn any agents.
> 
> Let me compose a thorough overview of the project structure.

Here's a comprehensive high-level overview of your **Mega Pacific Metal & Steel Corp — Roofing Product Management System**:

---

## 🏗️ Project Structure Overview

The codebase is a **full-stack MERN-style web application** split into two main packages:

```
mega_pacific/
├── backend/          ← Node.js/Express REST API + PostgreSQL (Prisma ORM)
├── frontend/         ← React 19 SPA (Vite + Tailwind CSS + MUI)
├── docs/             ← Feature documentation (markdown)
└── implementation/   ← Dev guides and mock-up plans
```

---

## ⚙️ Backend (`backend/`)

**Stack:** Express 5 · Prisma 7 · PostgreSQL · JWT Auth · Socket.IO · Nodemailer

| Directory | Purpose |
|---|---|
| `server.js` | Entry point. Sets up Express, CORS, Socket.IO, all route prefixes, and the delivery scheduler. |
| `prisma/schema.prisma` | Database schema — 8 models: `User`, `Product`, `ProductVariant`, `Order`, `OrderItem`, `Review`, `ReviewReply`, `ProductType`, `Inquiry`, `Message` |
| `config/db.js` | Prisma client singleton |
| `middleware/authMiddleware.js` | JWT verification + role guards (`verifyToken`, `verifyAdmin`, `verifySales`) |
| `controllers/admin/` | Admin logic: dashboard stats, CRUD products/variants/product-types, manage orders, users, saless, reviews |
| `controllers/customer/` | Customer logic: browse products, place orders (single + bulk), submit reviews |
| `controllers/sales/` | Sales logic: dashboard, manage reviews |
| `controllers/authController.js` | Registration, login, profile CRUD, email verification OTP, forgot-password OTP |
| `controllers/inquiryController.js` | Customer support inquiry system (messages/tickets) |
| `routes/` | Route definitions organized by role (admin, customer, sales) + auth + inquiries |
| `services/deliveryScheduler.js` | Automated scheduled job for delivery date management |
| `utils/` | Helpers: email service (Nodemailer), delivery helpers, estimated delivery validator |
| `validators/authValidator.js` | Input validation for auth endpoints |
| `seed.js` | Database seeder (creates default admin user) |

### API Route Map

| Prefix | Auth | Description |
|---|---|---|
| `/api/auth` | Public / Authenticated | Register, login, profile, email verification, password reset |
| `/api/admin/products` | Admin | Product & variant CRUD |
| `/api/admin/dashboard` | Admin | KPI stats, sales, stock alerts, recent data |
| `/api/admin/orders` | Admin | View/update orders, set delivery dates |
| `/api/admin/users` | Admin | User list |
| `/api/admin/product-types` | Admin | Product category management |
| `/api/admin/saless` | Admin | Sales management |
| `/api/admin/reviews` | Admin | Review moderation + replies |
| `/api/sales/*` | Sales | Limited dashboard, orders, inventory, reviews, customer service |
| `/api/customer/products` | Customer | Browse products with variants & ratings |
| `/api/customer/orders` | Customer | Place orders (single/bulk), view my orders |
| `/api/customer/reviews` | Customer | Submit reviews for delivered orders |
| `/api/inquiries` | Customer | Support ticket system |

---

## 🖥️ Frontend (`frontend/`)

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · MUI 9 (DataGrid) · React Router 7 · Three.js (3D) · i18next · Socket.IO Client · jsPDF · Lucide icons

### Architecture

```
frontend/src/
├── App.jsx              ← Route definitions + ProtectedRoute guard
├── main.jsx             ← Entry point
├── theme.js             ← MUI theme config
├── i18n.js              ← Internationalization setup
├── context/
│   ├── AuthContext.jsx  ← JWT token + user state, login/register/logout
│   ├── CartContext.jsx  ← Shopping cart state (persists per user)
│   └── ThemeContext.jsx ← Dark/light mode toggle
├── layouts/
│   ├── CustomerLayout.jsx   ← Header + sidebar nav for customers
│   ├── AdminLayout.jsx      ← Sidebar nav for admin dashboard
│   └── SalesLayout.jsx   ← Sidebar nav for saless
├── components/
│   ├── CustomerHeader.jsx       ← Top nav bar (customer)
│   ├── CustomerServiceWidget.jsx ← Floating support widget
│   ├── Footer.jsx               ← Site footer
│   ├── HeroSection.jsx          ← Landing page hero
│   ├── InventoryDataGrid.jsx    ← Reusable MUI DataGrid for inventory
│   ├── LogoutConfirmModal.jsx   ← Reusable logout confirmation
│   └── ThemeSwitcher.jsx        ← Dark/light toggle
├── pages/
│   ├── customer/   ← 11 pages: Login, Register, Dashboard, ProductDetails, Checkout, Orders, OrderDetails, Profile, email flows
│   ├── admin/      ← 8 pages: Login, Dashboard, ProductManagement, OrderManagement, UserManagement, SalesManagement, ReviewManagement, AddProductTypeModal
│   └── sales/   ← 5 pages: Login, Dashboard, OrderManagement, InventoryPage, CustomerService, ReviewManagement
└── utils/
    ├── EstimatedDeliveryValidator.js
    ├── ShippingInfoMapper.js
    ├── ProductStockCalculator.js
    ├── exportUtils.js      ← Excel/PDF export
    └── locationService.js  ← Address autocomplete
```

### Three User Portals

| Portal | Route | Role Guard | Features |
|---|---|---|---|
| **Customer** | `/dashboard`, `/product/:id`, `/checkout`, `/orders`, `/profile` | `requiredRole="customer"` | Browse products, view details/variants, add to cart, checkout, track orders, submit reviews, profile management |
| **Admin** | `/admin/dashboard`, `/admin/inventory`, `/admin/orders`, `/admin/users`, `/admin/saless`, `/admin/reviews` | `requiredRole="admin"` | KPI dashboard, full product/variant CRUD, order status management, user list, sales management, review moderation with replies |
| **Sales** | `/sales/dashboard`, `/sales/orders`, `/sales/inventory`, `/sales/customer-service`, `/sales/reviews` | `requiredRole="sales"` | Limited dashboard, view/process orders, inventory view, customer service (inquiries), review management |

---

## 🔑 Auth Flow

1. **Registration** → `POST /api/auth/register` → Password hashed with bcrypt → Stored in DB → Email verification OTP sent
2. **Login** → `POST /api/auth/login` → bcrypt compare → JWT issued (contains `userId`, `role`) → Stored in `localStorage`
3. **Protected Routes** → `ProtectedRoute` component checks `token` + `user.role` in React → Backend `authMiddleware` verifies JWT on every API call
4. **Role-based access** → Admin routes use `verifyAdmin`, sales routes use `verifySales`, customer routes use `verifyToken`

---

## 📊 Key Features Summary

| Feature | Implementation |
|---|---|
| **Product Catalog** | Products with multiple variants (size/length), stock tracking, average ratings |
| **Cart & Checkout** | Context-based cart, bulk checkout, stock validation before order |
| **Order Management** | Full lifecycle: pending → processing → shipped → out_for_delivery → delivered / cancelled |
| **Review System** | Star ratings + comments + images, only for delivered orders, admin/sales replies |
| **Dashboard Analytics** | Revenue KPIs, top products, stock alerts, sales summaries |
| **Real-time** | Socket.IO for live updates |
| **Email** | Nodemailer for OTP verification, password reset |
| **Export** | jsPDF + xlsx for order/product exports |
| **3D** | Three.js integration (via `@react-three/fiber`) — appears to be a leftover from the original 3D roof designer concept |
| **i18n** | Internationalization ready via i18next |
| **Dark Mode** | Theme switching via ThemeContext |

---

## 🗄️ Database (8 models)

```
User ──1:N──► Order ──1:N──► OrderItem ──N:1──► Product ──1:N──► ProductVariant
User ──1:N──► Review ──1:1──► ReviewReply
User ──1:N──► Inquiry ──1:N──► Message
Product ──1:N──► Review
Product ──1:N──► ProductVariant
ProductType (standalone category reference)
```

**🛠 Suggest Followups**

```json
{
  "followups": [
    {
      "prompt": "I'd like to understand the customer checkout flow in detail — can you walk me through the checkout page code and the order creation API?",
      "label": "Deep dive: Checkout flow"
    },
    {
      "prompt": "Can you generate a REST API reference document listing every endpoint, its method, auth requirements, request/response shape?",
      "label": "Generate API reference"
    },
    {
      "prompt": "Can you identify any architectural issues or suggest improvements to the codebase structure?",
      "label": "Code review & suggestions"
    }
  ]
}
```

```
message: Followups suggested!
```
