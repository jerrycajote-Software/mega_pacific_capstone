# User Authentication and Account Security Implementation

**Date:** June 29, 2026  
**Task File:** `0629_task1.md`  
**Scope:** Customer registration validation, password security policy, forgot password flow, and email OTP delivery

---

## Problem Encountered

### Registration Failure ("Registration failed" error)

After implementing the authentication and security features, the customer registration form returned a generic **"Registration failed"** error even when all fields were correctly filled in (as seen in the screenshot with all password checks passing).

**Root Causes Identified:**

1. **Email sending crashed registration** — The `register` function in `authController.js` called `await sendOtpEmail()` inside the same `try-catch` block as the database write. When the SMTP connection failed (due to incorrect credentials), the error propagated up and returned a 500 response — even though the user record was **not yet created**, making the error misleading.

2. **SMTP password had spaces** — The Gmail App Password was entered as `"iaga mnfy gufb zjbl"` (with spaces). Gmail App Passwords must be entered **without spaces**: `"iagamnfygubfzjbl"`.

3. **`SMTP_FROM` didn't match `SMTP_USER`** — The sender address was set to `megapacificmetalcorp@gmail.com` but the authenticated account was `jerrycajote90@gmail.com`. Gmail requires these to match.

4. **No duplicate email pre-check** — Before the fix, if a user tried registering with an already-registered email, the DB would throw a unique constraint error caught by the outer catch, returning the same generic "Registration failed" message with no clarity.

---

## Steps Taken to Resolve

### Step 1 — Read & Understand the Task File
Read `0629_task1.md` which defined 4 implementation plans:
- Plan 1: Registration form validation (required fields)
- Plan 2: Password security policy (real-time checklist)
- Plan 3: Forgot password flow (email OTP)
- Plan 4: Email OTP delivery configuration

### Step 2 — Codebase Research
Explored the existing project structure before writing any code:
- Reviewed `RegisterPage.jsx`, `LoginPage.jsx`, `VerifyEmailPage.jsx`
- Reviewed `authController.js`, `authRoutes.js`, `emailService.js`
- Inspected `prisma/schema.prisma` for the `User` model
- Confirmed the `validators/` directory existed but was empty
- Checked `backend/.env` and `backend/.env.example`

### Step 3 — Implementation Plan
Created a detailed implementation plan (`implementation_plan.md`) covering all 4 plans, proposed file changes, open questions, and a verification plan. User approved the plan with the following clarifications:
- **SMTP**: No provider yet — keep console fallback, document Gmail App Password setup
- **OTP fields**: Add **separate** `resetOtpCode` / `resetOtpExpiresAt` fields to avoid conflict with email verification OTP
- **Password policy**: Only applies to new registrations and resets (existing accounts not affected — acceptable)

### Step 4 — Prisma Schema Update
Added two new fields to the `User` model for the forgot-password flow:
```prisma
resetOtpCode       String?
resetOtpExpiresAt  DateTime?
```
Applied the schema change using `prisma db push` (used instead of `migrate dev` due to existing migration drift).

### Step 5 — Backend: Validator Middleware
Created `backend/validators/authValidator.js` with two middleware functions:
- `validateRegister` — checks all 8 required fields are non-empty, enforces password policy regex
- `validateResetPassword` — checks email, OTP, and newPassword; enforces password policy on the new password

Password policy regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$`

### Step 6 — Backend: Email Service Update
Updated `backend/utils/emailService.js`:
- Added `sendForgotPasswordEmail(email, otp)` with matching HTML email template
- Updated SMTP default port to 587 (STARTTLS for Gmail)
- Both functions have a **console fallback** when SMTP is not configured
- Exported both functions

### Step 7 — Backend: Auth Controller Update
Updated `backend/controllers/authController.js`:
- Added `forgotPassword` — finds user by email, generates 6-digit OTP, saves it to `resetOtpCode`/`resetOtpExpiresAt`, sends `sendForgotPasswordEmail`, always returns 200 (security: never reveals if email is registered)
- Added `resetPassword` — validates `resetOtpCode`, checks expiry, enforces password policy, hashes new password, clears reset OTP fields

**Bug fix applied:** Wrapped `sendOtpEmail` in its own nested `try-catch` inside `register` so email failures do **not** fail the registration. Also added a duplicate email pre-check returning a clear `409` error.

```js
// Before (buggy):
await sendOtpEmail(email, otp); // throws → registration fails

// After (fixed):
try {
  await sendOtpEmail(email, otp);
} catch (emailError) {
  console.error("WARNING: OTP email failed to send (user was still created):", emailError.message);
  // Registration still succeeds
}
```

### Step 8 — Backend: Routes Update
Updated `backend/routes/authRoutes.js`:
- Added `validateRegister` middleware to `POST /register`
- Added `validateResetPassword` middleware to `POST /reset-password`
- Registered `POST /forgot-password` and `POST /reset-password` routes

### Step 9 — Backend: `.env` Fix
Fixed three issues in `backend/.env`:
- Removed spaces from `SMTP_PASS` (`"iaga mnfy gufb zjbl"` → `"iagamnfygubfzjbl"`)
- Changed `SMTP_FROM` to match `SMTP_USER` (Gmail requirement)
- Added step-by-step Gmail App Password setup instructions as comments

### Step 10 — Frontend: RegisterPage.jsx
Complete rewrite with:
- **Per-field error state** using MUI `TextField` `error` and `helperText` props
- **Real-time password checklist** (5 rules: 8+ chars, uppercase, lowercase, number, special char)
- **`Create Account` button disabled** reactively via `useMemo` while form is invalid
- **Registration Success Dialog** (MUI `Dialog`) shown after successful registration before redirecting to email verification

### Step 11 — Frontend: LoginPage.jsx
Added **"Forgot Password?"** link below the password field navigating to `/forgot-password`.

### Step 12 — Frontend: ForgotPasswordPage.jsx (new)
New page following the existing split-panel layout:
- Email input form
- Calls `POST /api/auth/forgot-password`
- Always navigates to `/reset-password` on success (never reveals if email is registered)

### Step 13 — Frontend: ResetPasswordPage.jsx (new)
New page with:
- **6-digit OTP input boxes** (reused from `VerifyEmailPage.jsx`)
- **Real-time password checklist** (same 5 rules)
- Confirm password mismatch live error
- Submit button disabled until all checks pass
- **"Password Updated Successfully"** centered MUI Dialog on success
- Navigates to `/login` with a success message after dismissing

### Step 14 — Frontend: App.jsx
Registered two new public routes:
```jsx
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

### Step 15 — Debug: Orphaned User Cleanup
Wrote a one-off script `backend/scripts/cleanupUser.js` to check and clean up any unverified user records created during failed registration attempts. Confirmed no duplicate users existed.

---

## Specific Commands Used

```powershell
# Apply Prisma schema changes to the database
npx prisma db push

# Verify the frontend builds without errors
npx vite build --mode development

# Check and clean up orphaned user records from failed registrations
node scripts/cleanupUser.js
```

> **Note:** `prisma migrate dev` was attempted first but failed due to migration drift (existing migration files were modified after being applied). `prisma db push` was used instead for the development environment.

---

## Implementation Plan

### Plan 1: Registration Form Validation

**Objective:** Ensure all required information is completed before a customer can create a new account.

| Layer | Change |
|---|---|
| Frontend | Per-field `error`/`helperText` on all `TextField` components. Summary alert: *"Please complete all required fields before creating your account."* `Create Account` button disabled reactively. |
| Backend | `validateRegister` middleware in `authValidator.js` checks all 8 fields are non-empty. Returns `400` with list of missing fields. |

### Plan 2: Password Security Policy

**Objective:** Enforce a strong password policy during registration and password reset.

**Requirements:** At least 8 characters, one uppercase (A–Z), one lowercase (a–z), one digit (0–9), one special character (`!@#$%^&*`).

| Layer | Change |
|---|---|
| Frontend | Real-time `PasswordCheckItem` checklist renders below the password field as the user types. Button stays disabled until all 5 checks pass. |
| Backend | Password regex added to `validateRegister` and `validateResetPassword` middleware. Returns `400` if policy not met. |

### Plan 3: Forgot Password Functionality

**Objective:** Allow customers to securely reset their password using email OTP verification.

**Flow:**
1. "Forgot Password?" link on Login page
2. `ForgotPasswordPage` — enter registered email → `POST /forgot-password`
3. Backend generates OTP → saves to `resetOtpCode`/`resetOtpExpiresAt` → sends email
4. `ResetPasswordPage` — enter OTP + new password → `POST /reset-password`
5. Backend validates OTP and expiry → hashes new password → clears reset OTP fields
6. Success dialog shown → redirect to Login

**Database change:** Added `resetOtpCode String?` and `resetOtpExpiresAt DateTime?` fields to `User` model (separate from email verification `otpCode`/`otpExpiresAt`).

### Plan 4: Email OTP Delivery Configuration

**Objective:** Ensure OTP emails are reliably delivered for registration and password recovery.

| Item | Details |
|---|---|
| SMTP Provider | Gmail with App Password (`smtp.gmail.com`, port 587, STARTTLS) |
| Console Fallback | Active when `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASS` are not set |
| New email function | `sendForgotPasswordEmail(email, otp)` for password reset OTPs |
| Registration Dialog | Success dialog shown after registration before redirecting to email verification |

**How to get a Gmail App Password:**
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Search "App Passwords" → generate for "Mail"
4. Copy the 16-character password (**no spaces**) into `SMTP_PASS`

---

## List of Tasks

### Plan 1: Registration Form Validation
- [x] Backend: Create `validators/authValidator.js` (field presence check middleware)
- [x] Backend: Wire `validateRegister` middleware into `POST /register` in `authRoutes.js`
- [x] Frontend: Per-field error state + highlight empty fields in `RegisterPage.jsx`
- [x] Frontend: Disable Create Account button while form is invalid

### Plan 2: Password Security Policy
- [x] Backend: Add password policy regex to `authValidator.js`
- [x] Frontend: Add `passwordChecks` computed state + real-time checklist UI in `RegisterPage.jsx`

### Plan 3: Forgot Password Flow
- [x] Backend: Add `resetOtpCode` / `resetOtpExpiresAt` fields to Prisma schema
- [x] Backend: Apply schema change with `npx prisma db push`
- [x] Backend: Add `forgotPassword` + `resetPassword` to `authController.js`
- [x] Backend: Add `sendForgotPasswordEmail` to `emailService.js`
- [x] Backend: Register new routes in `authRoutes.js`
- [x] Frontend: Add "Forgot Password?" link to `LoginPage.jsx`
- [x] Frontend: Create `ForgotPasswordPage.jsx`
- [x] Frontend: Create `ResetPasswordPage.jsx` (OTP + new password + success dialog)
- [x] Frontend: Register `/forgot-password` and `/reset-password` routes in `App.jsx`

### Plan 4: Email OTP & Registration Success Dialog
- [x] Backend: Update `backend/.env` with SMTP variable keys + Gmail App Password instructions
- [x] Frontend: Add registration success dialog to `RegisterPage.jsx` (before redirect to verify-email)

### Bug Fix: Registration Failure
- [x] Wrap `sendOtpEmail` in a nested `try-catch` inside `register` so email failures don't fail registration
- [x] Add duplicate email pre-check returning `409` with a clear error message
- [x] Fix `SMTP_PASS` — remove spaces from Gmail App Password
- [x] Fix `SMTP_FROM` — must match `SMTP_USER` for Gmail authentication

---

## Files Changed

| File | Type | Change |
|---|---|---|
| `backend/validators/authValidator.js` | NEW | Server-side field + password policy validation middleware |
| `backend/routes/authRoutes.js` | MODIFIED | Wired validator middleware + new forgot/reset routes |
| `backend/controllers/authController.js` | MODIFIED | Added `forgotPassword`, `resetPassword`; fixed `register` email error handling |
| `backend/utils/emailService.js` | MODIFIED | Added `sendForgotPasswordEmail`; updated SMTP port to 587 |
| `backend/.env` | MODIFIED | Added SMTP, JWT, PORT vars; fixed `SMTP_PASS` (no spaces) and `SMTP_FROM` |
| `backend/prisma/schema.prisma` | MODIFIED | Added `resetOtpCode` and `resetOtpExpiresAt` fields to `User` model |
| `frontend/src/pages/customer/RegisterPage.jsx` | MODIFIED | Per-field validation, password checklist, success dialog |
| `frontend/src/pages/customer/LoginPage.jsx` | MODIFIED | Added "Forgot Password?" link |
| `frontend/src/pages/customer/ForgotPasswordPage.jsx` | NEW | Email entry form for forgot password flow |
| `frontend/src/pages/customer/ResetPasswordPage.jsx` | NEW | OTP + new password reset with success dialog |
| `frontend/src/App.jsx` | MODIFIED | Registered `/forgot-password` and `/reset-password` routes |
