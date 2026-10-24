# Email OTP Verification, Review/Reply System, and Smart Estimated Delivery

## 1. The Problem Encountered
The system required three major functional enhancements as defined in `@task2.md`:
1. **Email OTP Verification**: Lack of account verification for customer registration, allowing fake or unverified emails to access the customer interface.
2. **Enhanced Reviews**: Customer reviews were global per-product rather than tied to specific orders, preventing customers from writing separate reviews for separate orders of the same product, and missing support for sales replies.
3. **Smart Estimated Delivery**: Delivery dates were not automatically assigned on purchase, and did not automatically extend dynamically if delivery was delayed beyond the estimated arrival date.

---

## 2. Steps Taken to Resolve the Issues
Based on thepair programming session, we followed these steps:
1. **Database Schema Setup**: Modified the PostgreSQL database schema through Prisma to include verification status, OTP code/expiration, order-linked customer reviews, and a dedicated `ReviewReply` table.
2. **Nodemailer Setup**: Installed `nodemailer` and configured an email utility in the backend, supporting standard SMTP servers as well as a console logging fallback to allow debugging locally without SMTP credentials.
3. **OTP Controller & Routes**: Added OTP verification and resend logic, complete with a 60-second cooldown rate limiter, and updated login to block unverified customer accounts.
4. **OTP Frontend Page**: Created a premium split layout verification page with segment-style numeric OTP inputs, auto-shifting focus, and cooldown timers.
5. **Review Linking**: Altered the backend review submission to validate and record the specific order ID, and updated the order details page to hide the "Write Review" button once a review is saved.
6. **Reply Dashboards**: Created a new shared `ReviewManagement` dashboard that enables saless to post and edit support replies and provides admins with read-only views.
7. **Nested Replies**: Rendered sales replies nested directly beneath customer ratings on the product details page.
8. **Estimated Delivery Logic**: Defaulted delivery dates to order date + 2 days, and built a shared query-time auto-extension helper that increments dates on-demand when past due.
9. **Daily Background Worker**: Created a background scheduler service to scan the database periodically for delayed orders.
10. **Build Verification**: Compiled the React-Vite frontend bundle and verified that the backend starts without errors.

---

## 3. Specific Commands Used
The following shell commands were executed in the terminal during the implementation process:
```bash
# 1. Install email dispatch dependencies
cd backend
npm install nodemailer

# 2. Push Prisma schema changes to the local PostgreSQL database
npx prisma db push

# 3. Regenerate Prisma Client wrappers
npx prisma generate

# 4. Compile the Vite/React production build to verify no syntax/compilation issues
cd ../frontend
npm run build
```

---

## 4. Implementation Plan
Below is the full implementation plan approved and executed:

### Database Changes
- **User**: Add `isEmailVerified` (Boolean), `otpCode` (String), `otpExpiresAt` (DateTime), `lastOtpSentAt` (DateTime), and `replies` relationship.
- **Review**: Add `orderId` (Int, nullable), `order` (Order, optional relation), and `reply` (ReviewReply, optional relation).
- **ReviewReply**: Model containing `reviewId` (Int, unique), `userId` (Int, relation to User), `comment` (String), and `createdAt` (DateTime).

### OTP Verification Flow
- **Register**: Generate 6-digit OTP, send verification email (or print to console in dev mode), save OTP metadata.
- **Login**: If credentials match but email is not verified, fail with status `403` and return user email. Redirect customer to `/verify-email`.
- **Resend**: Allow regeneration after a 60-second cooldown.

### Reviews System
- **Single Review per Order Item**: Reject submission if a review exists with the same `orderId` and `productId`.
- **Dashboard**: Enforce sales read/write access (to reply) and admin read-only access on reviews.
- **Nested Display**: Render replies beneath review comments.

### Smart Delivery Date
- **Default**: Assign arrival date = order date + 2 days.
- **Fail-safe query check**: Check and extend `estimatedDeliveryDate` by 1 day on-demand if order is delayed.
- **Daily Scheduler**: Periodic background process doing the same.

---

## 5. List of Tasks
Here is the final execution task checklist completed during the session:

- [x] Database Schema Migration
  - [x] Modify `backend/prisma/schema.prisma`
  - [x] Generate Prisma client & apply database updates
- [x] Component 1: Email OTP Verification
  - [x] Create `backend/utils/emailService.js`
  - [x] Modify `backend/controllers/authController.js`
  - [x] Modify `backend/routes/authRoutes.js`
  - [x] Create `frontend/src/pages/customer/VerifyEmailPage.jsx`
  - [x] Modify `frontend/src/pages/customer/LoginPage.jsx`
  - [x] Modify `frontend/src/pages/customer/RegisterPage.jsx`
  - [x] Modify `frontend/src/App.jsx`
- [x] Component 2: Review and Reply System
  - [x] Modify `backend/controllers/customer/reviewController.js`
  - [x] Create `backend/controllers/sales/reviewController.js`
  - [x] Create `backend/routes/sales/reviewRoutes.js`
  - [x] Create `backend/routes/admin/reviewRoutes.js`
  - [x] Modify `backend/server.js`
  - [x] Modify `frontend/src/pages/customer/OrderDetails.jsx`
  - [x] Modify `frontend/src/pages/customer/ProductDetails.jsx`
  - [x] Create `frontend/src/pages/admin/ReviewManagement.jsx`
  - [x] Create `frontend/src/pages/sales/ReviewManagement.jsx`
  - [x] Modify layout sidebars (`AdminLayout.jsx`, `SalesLayout.jsx`)
  - [x] Add Review routes to `App.jsx`
- [x] Component 3: Smart Estimated Delivery System
  - [x] Modify `backend/controllers/customer/orderController.js`
  - [x] Modify `backend/controllers/admin/orderController.js`
  - [x] Create `backend/services/deliveryScheduler.js`
  - [x] Modify `backend/server.js`
  - [x] Modify `frontend/src/pages/admin/OrderManagement.jsx`
  - [x] Modify `frontend/src/pages/customer/OrdersPage.jsx`
- [x] Verification and Walkthrough
  - [x] Run tests and manual validations
  - [x] Create `walkthrough.md`
