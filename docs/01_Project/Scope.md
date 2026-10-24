# Project Scope

## In Scope

### Core Modules
1. **Authentication & Authorization**
   - Customer registration with email OTP verification
   - Login/logout for all three roles (Customer, Admin, Sales)
   - Forgot password / reset password flow
   - JWT-based session management
   - Single-session enforcement for admin/sales roles

2. **Product Management**
   - CRUD operations on products (admin)
   - Product variant management (multiple pricing tiers)
   - Product type categorization
   - Image upload (multiple images per product)
   - Rich text product descriptions

3. **Inventory Management**
   - Stock level tracking per product and variant
   - Stock adjustment with audit logging
   - Bulk stock adjustment
   - Inventory logs with user attribution

4. **Order Management**
   - Single and bulk order placement (customer)
   - Order status tracking (pending → processing → shipped → completed)
   - Payment status and mode management
   - Shipping information management
   - Estimated delivery date with smart scheduling
   - Order export (PDF/Excel)

5. **Review System**
   - Product reviews with ratings (1-5 stars)
   - Review image upload support
   - Admin/sales reply to reviews
   - Average rating calculation per product

6. **Customer Service**
   - Inquiry/ticket system
   - Real-time messaging via Socket.IO
   - Inquiry status management (Open → In Progress → Resolved)

7. **Dashboards**
   - Admin dashboard with system-wide analytics
   - Sales dashboard with operational statistics
   - Customer dashboard with product browsing

8. **User Management**
   - User listing and management (admin)
   - Sales CRUD (admin)
   - Profile management (all roles)
   - Soft-delete with account restoration capability

---

## Out of Scope (Current Version)
- Payment gateway integration (currently Cash on Delivery only)
- Offline mode / PWA support
- Mobile native applications
- Advanced reporting and analytics
- Multi-tenant / multi-branch support
- Automated email marketing
- Admin settings page (placeholder exists)
