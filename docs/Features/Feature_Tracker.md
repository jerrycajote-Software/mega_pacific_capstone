# Project Feature Tracker

This document tracks feature progress, assignments, priorities, and dependency requirements.

---

## Active & Upcoming Features

| Feature Name | Status | Owner | Priority | Dependencies | Known Issues |
|--------------|--------|-------|----------|--------------|--------------|
| Email OTP Verification | Completed | Backend | High | SMTP Config | None |
| Single Session Enforcement | Completed | Backend | High | JWT Middleware | None |
| Inventory Audit Trail (`InventoryLog`) | Completed | Full-Stack | High | Prisma Schema | None |
| Real-Time Customer Chat | Completed | Full-Stack | High | Socket.IO Server | None |
| Product Variant Pricing | Completed | Full-Stack | High | Product Models | None |
| PDF / Excel Order Export | Completed | Frontend | Medium | jsPDF / XLSX | None |
| 3D Product Visualizer | Completed | Frontend | Low | Three.js | None |
| Customer UI V2 (Trade Pro Interface) | Consolidated | Frontend | High | Reverted to Standard UI | Consolidated |
| Payment Gateway Integration | Not Started | Full-Stack | Medium | Third-party API | Pending integration |
| Automated Order Status Progression | Completed | Full-Stack | High | Socket.IO, Prisma Scheduler | Testing intervals (5 min total) |
| Multi-Stage Order Workflow (Sales/Finance/Logistic) | Completed | Backend | High | Order Models | None |
| Finance & Logistics UI/UX Analytics Upgrade | Completed | Frontend / Backend | High | Recharts, jsPDF, XLSX | None |
| CALABARZON (Region IV-A) Location Hierarchy & Auto-fill ZIP | Completed | Full-Stack | High | locationService.js | None |
| Automated 30% Inventory Discount ("Less 30%") | Completed | Full-Stack | High | Prisma Schema, Catalog & Cart | None |
| Browser History Guard & Back-to-Login Prevention | Completed | Frontend | High | React Router v7, AuthContext, Popstate API | None |
| Pre-Order Roofing Products Management | Completed | Full-Stack | High | Prisma, Express, Socket.IO, SalesLayout | None |
| Custom Roll-Formed Cut Pre-Orders (0.5m-21.0m) | Completed | Full-Stack | High | ProductDetails, Cart, Checkout, OrderController | None |
| Raw Material Steel Coil Inventory & Manual Deduction | Completed | Full-Stack | High | CoilInventory, CoilController, LogisticLayout | None |
| Finished Goods Inventory Decoupling | Completed | Architecture | High | OrderController, CartContext, Schema | None |
| Customer Multi-Item Order & Cross-Product Checkout Add-ons | Completed | Full-Stack | High | Checkout, ProductDetails, AddProductToOrderModal, OrderController | None |
| Shopping Cart Deprecation & Direct Pre-Order Architecture | Completed | Architecture / Full-Stack | High | Schema, OrderController, CustomerLayout | Retired generic cart in favor of custom made-to-order flow |
| Official Sales Receipt & Formal Price Quotation PDF Generation | Completed | Frontend | High | jsPDF, autoTable, documentGenerator.js | Client-side branded PDF generator with 1-click download |
| Finance Refund System & Automatic Customer Notification | Completed | Full-Stack | High | Prisma Schema, Socket.IO, Nodemailer, FinanceLayout | Fully integrated sales order rejection refund flow with automated email & socket alert |
| Customer Register Page UI & Mobile Browser Responsiveness | Completed | Frontend | High | RegisterPage.jsx, MUI Grid v2, locationService.js | Fixed squished address dropdowns, added password strength meter & mobile optimizations |
| Admin Backoffice Operations & Support Dashboard | Completed | Full-Stack | High | DashboardPage.jsx, dashboardController.js | Replaced wrench placeholder with live customer KPIs, staff clearance directory, and system controls |
| Admin Portal UI/UX Modernization & Redesign | Completed | Full-Stack | High | UserManagement.jsx, SalesManagement.jsx, SettingsPage.jsx | Overhauled all 4 admin tabs with KPI metric cards, filters, Philippine mobile badges, and 2-column security settings |





