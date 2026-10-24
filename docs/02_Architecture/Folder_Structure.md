# Folder Structure

## Project Root

```
mega_pacific/
│
├── frontend/                   # React + Vite frontend application
├── backend/                    # Node.js + Express API server
├── 3d-module/                  # Three.js 3D product visualization assets
├── assets/                     # Shared project assets
├── docs/                       # Project documentation
├── implementation/             # Implementation notes & plans
│
├── .gitignore                  # Git ignore rules
├── documentation_structured.md # Documentation structure guide
├── flowchart.md                # Application flowcharts
├── netlify.toml                # Netlify deployment config
├── plan.drawio                 # Project planning diagrams
└── README.md                   # Project overview
```

---

## Backend Structure

```
backend/
│
├── config/
│   └── db.js                   # Prisma client configuration
│
├── controllers/
│   ├── authController.js       # Registration, login, OTP, password reset
│   ├── inquiryController.js    # Customer service inquiry management
│   ├── admin/
│   │   ├── dashboardController.js   # Admin dashboard statistics
│   │   ├── salesController.js    # Sales CRUD
│   │   ├── orderController.js       # Order management
│   │   ├── productController.js     # Product CRUD + stock management
│   │   ├── productTypeController.js # Product type management
│   │   ├── userController.js        # User listing
│   │   └── variantController.js     # Product variant CRUD
│   ├── customer/
│   │   ├── orderController.js       # Order placement + history
│   │   ├── productController.js     # Product detail retrieval
│   │   └── reviewController.js      # Submit reviews + view product reviews
│   └── sales/
│       ├── dashboardController.js   # Sales dashboard statistics
│       └── reviewController.js      # View all reviews + reply
│
├── middleware/
│   └── authMiddleware.js       # JWT verification, role guards
│
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── seed.js                 # Database seeder (admin account)
│   └── migrations/             # Database migration files
│
├── repositories/               # Data access layer (Prisma queries)
│
├── routes/
│   ├── authRoutes.js           # /api/auth/*
│   ├── inquiryRoutes.js        # /api/inquiries/*
│   ├── admin/
│   │   ├── dashboardRoutes.js  # /api/admin/dashboard
│   │   ├── salesRoutes.js   # /api/admin/saless
│   │   ├── orderRoutes.js      # /api/admin/orders
│   │   ├── productRoutes.js    # /api/admin/products
│   │   ├── productTypeRoutes.js # /api/admin/product-types
│   │   ├── reviewRoutes.js     # /api/admin/reviews
│   │   └── userRoutes.js       # /api/admin/users
│   ├── customer/
│   │   ├── orderRoutes.js      # /api/customer/orders
│   │   ├── productRoutes.js    # /api/customer/products
│   │   └── reviewRoutes.js     # /api/customer/reviews
│   └── sales/
│       ├── dashboardRoutes.js  # /api/sales/dashboard
│       └── reviewRoutes.js     # /api/sales/reviews
│
├── services/
│   └── deliveryScheduler.js    # Automated delivery date management
│
├── utils/                      # Utility functions
│
├── validators/
│   └── authValidator.js        # Input validation for auth endpoints
│
├── generated/                  # Prisma generated client (gitignored)
│
├── server.js                   # Application entry point
├── package.json                # Dependencies & scripts
├── prisma.config.ts            # Prisma v7 configuration
└── .env.example                # Environment variable template
```

---

## Frontend Structure

```
frontend/
│
├── public/                     # Static public assets
│
├── src/
│   ├── assets/                 # Images, icons, static assets
│   │
│   ├── components/
│   │   ├── CustomerHeader.jsx        # Customer navigation header
│   │   ├── CustomerServiceWidget.jsx # Customer service chat widget
│   │   ├── Footer.jsx                # Site footer
│   │   ├── HeroSection.jsx           # Landing hero section
│   │   ├── InventoryDataGrid.jsx     # MUI DataGrid for inventory
│   │   ├── LogoutConfirmModal.jsx    # Logout confirmation dialog
│   │   ├── PaymentMethodWidget.jsx   # Payment method selector
│   │   ├── ShippingInfoWidget.jsx    # Shipping form widget
│   │   ├── StockManagementTab.jsx    # Stock management interface
│   │   └── ThemeSwitcher.jsx         # Dark/light theme toggle
│   │
│   ├── context/
│   │   ├── AuthContext.jsx     # Authentication state management
│   │   ├── CartContext.jsx     # Shopping cart state management
│   │   └── ThemeContext.jsx    # Theme (dark/light) state management
│   │
│   ├── hooks/                  # Custom React hooks
│   │
│   ├── layouts/
│   │   ├── AdminLayout.jsx     # Admin sidebar + content layout
│   │   ├── CustomerLayout.jsx  # Customer header + footer layout
│   │   └── SalesLayout.jsx  # Sales sidebar + content layout
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProductManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── SalesManagement.jsx
│   │   │   ├── ReviewManagement.jsx
│   │   │   └── AddProductTypeModal.jsx
│   │   ├── customer/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── VerifyEmailPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── buildProductOptions.js
│   │   └── sales/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── InventoryPage.jsx
│   │       ├── OrderManagement.jsx
│   │       ├── ReviewManagement.jsx
│   │       └── CustomerService.jsx
│   │
│   ├── services/               # API service layer (currently empty)
│   ├── utils/                  # Utility functions
│   │
│   ├── App.jsx                 # Root component + routing
│   ├── App.css                 # Global styles
│   ├── index.css               # CSS variables & base styles
│   ├── main.jsx                # Application entry point
│   ├── theme.js                # MUI theme configuration
│   └── i18n.js                 # Internationalization config
│
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── vercel.json                 # Vercel deployment config
├── eslint.config.js            # ESLint configuration
└── package.json                # Dependencies & scripts
```
