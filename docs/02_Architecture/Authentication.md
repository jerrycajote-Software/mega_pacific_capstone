# Authentication Architecture

## Overview

The system uses **JWT (JSON Web Tokens)** for stateless authentication with **bcryptjs** for password hashing and **Nodemailer** for OTP email delivery.

---

## Authentication Flows

### Customer Registration Flow

```
1. POST /api/auth/register
   ├── Validate input (authValidator)
   ├── Check email uniqueness
   ├── Hash password (bcryptjs, 10 rounds)
   ├── Create user with isEmailVerified: false
   ├── Generate 6-digit OTP
   ├── Send OTP via email (Nodemailer)
   └── Return success message

2. POST /api/auth/verify-otp
   ├── Find user by email
   ├── Check OTP matches + not expired
   ├── Set isEmailVerified: true
   ├── Clear OTP fields
   └── Return success

3. POST /api/auth/resend-otp
   ├── Rate-limit check (lastOtpSentAt)
   ├── Generate new OTP
   ├── Send via email
   └── Return success
```

### Login Flow

```
POST /api/auth/login
├── Find user by email
├── Check account status (not deleted/suspended)
├── Check isEmailVerified
├── Compare password (bcryptjs)
├── Generate JWT token containing:
│   ├── userId
│   ├── email
│   ├── role
│   └── sessionToken (admin/sales only)
├── For admin/sales: save sessionToken to DB
│   (invalidates previous sessions)
└── Return { token, user }
```

### Forgot Password Flow

```
1. POST /api/auth/forgot-password
   ├── Find user by email
   ├── Generate resetOtpCode
   ├── Set resetOtpExpiresAt
   ├── Send OTP via email
   └── Return success

2. POST /api/auth/reset-password
   ├── Validate new password (authValidator)
   ├── Find user by email
   ├── Verify resetOtpCode + not expired
   ├── Hash new password
   ├── Clear reset OTP fields
   └── Return success
```

---

## Middleware

### `verifyToken`
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature using `JWT_SECRET`
- **Single-session check** for admin/sales:
  - Queries DB for user's `sessionToken`
  - Compares with token's `sessionToken` claim
  - Returns 401 if mismatch (logged in from another device)
- Attaches decoded payload to `req.user`

### `verifyAdmin`
- Calls `verifyToken` first
- Checks `req.user.role === "admin"`
- Returns 403 if not admin

### `verifySales`
- Calls `verifyToken` first
- Checks `req.user.role === "sales"` OR `req.user.role === "admin"`
- Returns 403 if neither

---

## JWT Token Payload

```json
{
  "userId": 1,
  "email": "user@example.com",
  "role": "customer",
  "sessionToken": "uuid-string",  // Only for admin/sales
  "iat": 1234567890,
  "exp": 1234571490
}
```

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs (10 salt rounds) |
| Token-based auth | JWT with secret key |
| Single-session enforcement | sessionToken in DB for admin/sales |
| Email verification | 6-digit OTP with expiration |
| Rate limiting (OTP) | lastOtpSentAt timestamp check |
| Input validation | Express validators on register & reset-password |
| Separate reset OTP | `resetOtpCode` is distinct from `otpCode` |

---

## Environment Variables

```env
JWT_SECRET="your-super-secret-jwt-key-here"
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"
SMTP_FROM="noreply@megapacific.com"
```
