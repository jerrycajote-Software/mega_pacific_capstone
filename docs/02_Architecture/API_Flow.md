# API Flow

## Base URL

```
http://localhost:5000/api
```

---

## Route Groups

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Customer registration (validates input) |
| POST | `/auth/login` | Public | Login for all roles |
| POST | `/auth/verify-otp` | Public | Email OTP verification |
| POST | `/auth/resend-otp` | Public | Resend verification OTP |
| POST | `/auth/forgot-password` | Public | Request password reset OTP |
| POST | `/auth/reset-password` | Public | Reset password with OTP |
| GET | `/auth/profile` | Token | Get current user profile |
| PUT | `/auth/profile` | Token | Update current user profile |

---

### Admin - Products (`/api/admin/products`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/products` | Public | List all products |
| POST | `/admin/products` | Public | Create a product |
| PUT | `/admin/products/:id` | Public | Update a product |
| DELETE | `/admin/products/:id` | Public | Delete a product |
| POST | `/admin/products/stock-adjust` | Token | Adjust stock for a product/variant |
| POST | `/admin/products/stock-adjust-bulk` | Token | Bulk stock adjustment |
| GET | `/admin/products/stock-logs` | Token | Get stock audit logs |
| GET | `/admin/products/:productId/variants` | Public | List variants for a product |
| POST | `/admin/products/:productId/variants` | Public | Create a variant |
| DELETE | `/admin/products/:productId/variants/:id` | Public | Delete a variant |

---

### Admin - Dashboard (`/api/admin/dashboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Get dashboard statistics |

---

### Admin - Orders (`/api/admin/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/orders` | Public | List all orders |
| PATCH | `/admin/orders/:id/status` | Public | Update order status |

---

### Admin - Users (`/api/admin/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | Public | List all users |

---

### Admin - Product Types (`/api/admin/product-types`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/product-types` | Public | List product types |
| POST | `/admin/product-types` | Public | Create a product type |

---

### Admin - Saless (`/api/admin/saless`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/saless` | Admin | List saless |
| POST | `/admin/saless` | Admin | Create an sales |
| PUT | `/admin/saless/:id` | Admin | Update sales details |
| PATCH | `/admin/saless/:id/reset-password` | Admin | Reset sales password |
| PATCH | `/admin/saless/:id/status` | Admin | Update sales status |

---

### Admin - Reviews (`/api/admin/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/reviews` | Admin | Get all reviews (read-only) |

---

### Customer - Products (`/api/customer/products`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/customer/products` | Public | List all active pre-order products for catalog and add-ons |
| GET | `/customer/products/coil-availability` | Public | Get raw coil inventory stock availability (thickness & color roll counts) |
| GET | `/customer/products/:id` | Public | Get product details by ID (including raw coilInventory) |

---

> [!NOTE]
> **Customer Cart (`/api/customer/cart`) Retired**: Shopping cart routes and controller have been retired in favor of direct made-to-order pre-order checkout (`/checkout`) with custom cut length and coil availability validation.

---

### Customer - Orders (`/api/customer/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/customer/orders` | Token | Place a single order |
| POST | `/customer/orders/bulk` | Token | Place a bulk order |
| GET | `/customer/orders/my` | Token | Get current user's orders |
| GET | `/customer/orders/:id` | Token | Get order details by ID |

---

### Customer - Reviews (`/api/customer/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/customer/reviews` | Token | Submit a product review (for delivered or completed/picked-up orders) |
| GET | `/customer/reviews/product/:productId` | Public | Get reviews for a product |
| GET | `/customer/reviews/eligibility/:productId` | Token | Check if customer is eligible to review product (verified delivered/completed purchase) |

---

### Sales - Dashboard (`/api/sales/dashboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sales/dashboard` | Sales | Get sales dashboard stats |

---

### Sales - Reviews (`/api/sales/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sales/reviews` | Sales | Get all reviews |
| POST | `/sales/reviews/:id/reply` | Sales | Reply to a review |

---

### Sales - Orders (`/api/sales/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sales/orders` | Sales | List sales orders |
| PATCH | `/sales/orders/:id/approve` | Sales | Approve order and forward to finance |

---

### Sales - Orders (`/api/sales/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sales/orders` | Sales | List all customer orders for review and approval |
| PATCH | `/sales/orders/:id/approve` | Sales | Approve order and forward to Finance |
| PATCH | `/sales/orders/:id/reject` | Sales | Reject or cancel pending order (e.g. duplicate) |

---

### Sales - Pre-Order Products (`/api/sales/pre-order-products`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sales/pre-order-products` | Sales | List all pre-order roofing products with variants |
| POST | `/sales/pre-order-products` | Sales | Create new pre-order product with thickness variants |
| GET | `/sales/pre-order-products/:id` | Sales | Get pre-order product details by ID |
| PUT | `/sales/pre-order-products/:id` | Sales | Update pre-order product specs and thickness variants |
| DELETE | `/sales/pre-order-products/:id` | Sales | Delete a pre-order product and its variants |

---

### Finance - Orders (`/api/finance/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/finance/orders` | Finance | List orders needing verification |
| PATCH | `/finance/orders/:id/verify` | Finance | Verify payment |

---

### Finance - Refunds (`/api/finance/refunds`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/finance/refunds` | Finance | List all refund requests with status filter & search |
| GET | `/finance/refunds/stats` | Finance | Aggregate stats (pending/completed counts & amounts) |
| PATCH / POST | `/finance/refunds/:id/process` | Finance | Process refund, audit expense, email customer & emit socket |

---

### Logistic - Orders (`/api/logistic/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/logistic/orders` | Logistic | List deliveries and pickups |
| PATCH | `/logistic/orders/:id/status` | Logistic | Update delivery status |

---

### Logistic - Raw Coil Inventory (`/api/logistic/coils`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/logistic/coils` | Logistic/Staff | List all steel coils with physical roll count per thickness and finish |
| GET | `/logistic/coils/summary` | Logistic/Staff | Get total warehouse rolls, dynamic gauge breakdown, optimal/low/out-of-stock stats |
| POST | `/logistic/coils` | Logistic | Add new coil thickness gauge or provision from 14 colors |
| POST | `/logistic/coils/deduct` | Logistic | Manually deduct coil roll(s) used per production job/order |
| POST | `/logistic/coils/restock` | Logistic | Restock raw master coil rolls with delivery batch notes |
| GET | `/logistic/coils/logs` | Logistic/Staff | Audit trail logs for coil roll deductions and restocking |

---

### Inquiries (`/api/inquiries`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/inquiries` | Token | Create an inquiry |
| GET | `/inquiries/customer` | Token | Get customer's inquiries |
| GET | `/inquiries/:id` | Token | Get inquiry by ID |
| POST | `/inquiries/:id/messages` | Token | Send a message in an inquiry |
| GET | `/inquiries` | Token | Get all inquiries (sales/admin) |
| PUT | `/inquiries/:id/status` | Token | Update inquiry status |

---

### Super Admin (`/api/superadmin`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/superadmin/status` | SuperAdmin | Retrieve operational statuses of all portals |
| PUT | `/superadmin/status` | SuperAdmin | Toggle portal online/offline state |
| GET | `/superadmin/active-users` | SuperAdmin | Live connected WebSocket clients list |
| GET | `/superadmin/session-logs` | SuperAdmin | Security session audit logs (recent 100) |
| GET | `/superadmin/system-info` | SuperAdmin | Low-level Node runtime, memory, and OS diagnostics |

### System Status & Email Diagnostics (`/api/system`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/system/status` | Public | Public portal operational status summary |
| GET | `/system/email-status` | Public | Live email service diagnostics, active provider, sender, and cloud warnings |
| POST | `/system/test-email` | Public | Health-check endpoint to dispatch a test email |

---

## Auth Levels

| Level | Middleware | Description |
|-------|-----------|-------------|
| **Public** | None | No authentication required |
| **Token** | `verifyToken` | Any authenticated user |
| **Admin** | `verifyAdmin` | Admin role only |
| **Sales** | `verifySales` | Sales or Admin role |
| **SuperAdmin** | `verifySuperAdmin` | Superadmin / root role only |
