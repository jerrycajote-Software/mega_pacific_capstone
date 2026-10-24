# User Registration Bug Fixes and Soft Delete & Account Restoration

**Date:** 2026-06-29  
**Session Focus:** Debugging new user registration failures, enabling real OTP email delivery, and implementing the Soft Delete + Account Restoration system.

---

## Problems Encountered

### 1. New Users Could Not Register
When a new user tried to register, the form returned a generic **"Registration failed"** error. No new account was created.

**Root Cause:** The frontend `.env` file had a hardcoded local IP address (`http://192.168.1.54:5000`) for `VITE_API_URL`. When the local IP changed, the frontend could no longer reach the backend server at all. This resulted in a network connection error, which was surfaced as the generic "Registration failed" fallback message in `AuthContext.jsx`.

---

### 2. OTP Emails Were Not Being Sent to the Real Gmail
After fixing registration, OTP emails were not arriving in the user's inbox.

**Root Cause:** The Gmail App Password stored in `backend/.env` (`SMTP_PASS`) was invalid or had been revoked by Google. Nodemailer was failing with a `BadCredentials` error when trying to authenticate with Gmail's SMTP server.

---

### 3. Soft-Deleted Users Were Blocked From Re-Registering
After a user account was deleted via `cleanupUser.js`, attempting to re-register with the same email still returned an error.

**Root Cause:** The `cleanupUser.js` script had a safety condition: it only hard-deleted users where `isEmailVerified: false`. Since the test account was already verified (`isEmailVerified: true`), the delete command was silently skipped — but the script still printed "✅ Deleted" unconditionally, which was misleading.

---

## Steps Taken to Resolve the Issues

### Fix 1: Hardcoded IP in Frontend `.env`
1. Opened `frontend/.env`.
2. Changed `VITE_API_URL=http://192.168.1.54:5000` to `VITE_API_URL=http://localhost:5000`.
3. Restarted the frontend Vite dev server to pick up the environment variable change.

### Fix 2: Invalid Gmail App Password
1. Generated a new **Gmail App Password** from Google Account → Security → 2-Step Verification → App Passwords.
2. Updated `SMTP_PASS` in `backend/.env` with the new password.
3. Tested the email service via a standalone Node.js script to confirm the new credentials worked before restarting the backend.

### Fix 3: `cleanupUser.js` Not Actually Deleting Verified Users
1. Identified that the `prisma.user.deleteMany({ where: { isEmailVerified: false } })` condition silently skipped verified users.
2. As part of the larger Soft Delete feature, rewrote `cleanupUser.js` to perform a **soft delete** instead of a hard delete — setting `status = 'deleted'` and `deletedAt = new Date()`.

### Feature: Soft Delete + Account Restoration (per `0629_task2.md`)
Implemented the full soft delete and restoration flow:
1. Added `deletedAt DateTime?` to the `User` model in `schema.prisma`.
2. Pushed the schema change to the database and regenerated the Prisma Client.
3. Updated the `register` endpoint in `authController.js` to detect emails belonging to soft-deleted accounts and trigger the restoration flow.
4. Updated the `verifyOtp` endpoint to restore the account (`status → active`, `deletedAt → null`) upon successful OTP verification.
5. Updated `AuthContext.jsx` to pass the `isRestoration` flag back to the caller.
6. Updated `RegisterPage.jsx` to show a new **"Account Restored"** dialog for restoration attempts instead of the standard registration success dialog.

### Minor Fix: Contact Number Field — Numbers Only
Updated the Contact Number `<TextField>` in `RegisterPage.jsx` to:
- Strip all non-numeric characters on every keystroke using `.replace(/[^0-9]/g, '')`.
- Enforce a `maxLength` of 11 via `inputProps`.

---

## Specific Commands Used

```bash
# Test the email service manually (with .env loaded)
node -r dotenv/config -e "require('./utils/emailService').sendForgotPasswordEmail('jerrycajote5@gmail.com', '123456').then(console.log).catch(console.error)"

# Soft-delete a test user for restoration flow testing
node scripts/cleanupUser.js

# Push new schema (added deletedAt field) to the database
npx prisma db push

# Regenerate the Prisma Client after schema change
npx prisma generate

# Start the frontend dev server
npm run dev

# Start the backend dev server
npm run dev
```

---

## Implementation Plan (Soft Delete + Account Restoration)

> Based on `0629_task2.md` recommendation.

### Goal
Instead of permanently deleting user accounts, mark them as "deleted" (soft delete). If the same email is re-used for registration, guide the user through OTP verification to **restore** their existing account, preserving all historical data (orders, reviews, purchase history, etc.).

### Database Schema
#### [MODIFY] `backend/prisma/schema.prisma`
- Added `deletedAt DateTime?` to the `User` model.
- Updated status comment to include `deleted`: `// active, suspended, deleted`.

---

### Backend Logic
#### [MODIFY] `backend/controllers/authController.js`
- **`register` endpoint**: Added a check for `existingUser.status === "deleted"`. If true:
  - Updates the record with new registration details.
  - Generates a fresh OTP and sends it by email.
  - Returns `{ isRestoration: true, message: "...", email: "..." }` with HTTP 200.
- **`verifyOtp` endpoint**: After validating the OTP, checks if `user.status === "deleted"`. If true, sets `status: "active"` and `deletedAt: null` to fully restore the account.

#### [MODIFY] `backend/scripts/cleanupUser.js`
- Changed from `prisma.user.deleteMany(...)` (hard delete) to `prisma.user.update({ data: { status: 'deleted', deletedAt: new Date() } })` (soft delete), enabling the restoration flow to be tested.

---

### Frontend Logic
#### [MODIFY] `frontend/src/context/AuthContext.jsx`
- Updated `register()` return value to pass `isRestoration` and `message` from the backend response to the caller.

#### [MODIFY] `frontend/src/pages/customer/RegisterPage.jsx`
- Added `restorationDialogOpen` and `restorationMessage` state variables.
- Updated `handleSubmit` to open the restoration dialog if `result.isRestoration === true`.
- Added a new JSX `<Dialog>` component for the "Account Restored" flow with an orange-themed icon and a "Continue to Verification" button.
- Updated `handleContinueToVerification` to close both the standard and restoration dialogs.

#### [MODIFY] `frontend/src/pages/customer/RegisterPage.jsx` (Contact Number field)
- Updated the `onChange` handler to strip non-numeric characters: `.replace(/[^0-9]/g, '')`.
- Added `maxLength: 11` to `inputProps`.

---

## Task List

- `[x]` **Database Schema**
  - `[x]` Add `deletedAt DateTime?` to `schema.prisma`
  - `[x]` Run `npx prisma db push` and `npx prisma generate`

- `[x]` **Backend Updates**
  - `[x]` Modify `register` in `authController.js` to handle soft-deleted users
  - `[x]` Modify `verifyOtp` in `authController.js` to restore soft-deleted users
  - `[x]` Update `cleanupUser.js` to perform soft delete

- `[x]` **Frontend Updates**
  - `[x]` Update `AuthContext.jsx` to pass `isRestoration` flag
  - `[x]` Update `RegisterPage.jsx` to show restoration dialog when `isRestoration` is true
  - `[x]` Update Contact Number field to only accept numeric input

- `[x]` **Bug Fixes**
  - `[x]` Fix hardcoded IP in `frontend/.env`
  - `[x]` Fix invalid Gmail App Password in `backend/.env`
  - `[x]` Fix `cleanupUser.js` silent skip of verified users

---

## Files Modified

| File | Change |
|---|---|
| `frontend/.env` | Changed `VITE_API_URL` from hardcoded IP to `http://localhost:5000` |
| `backend/.env` | Updated `SMTP_PASS` with a new valid Gmail App Password |
| `backend/prisma/schema.prisma` | Added `deletedAt DateTime?` to `User` model |
| `backend/controllers/authController.js` | Added soft-delete detection in `register`; added account restoration in `verifyOtp` |
| `backend/scripts/cleanupUser.js` | Changed hard delete to soft delete |
| `frontend/src/context/AuthContext.jsx` | Pass `isRestoration` and `message` from registration response |
| `frontend/src/pages/customer/RegisterPage.jsx` | Added restoration dialog; restricted Contact Number to digits only |
