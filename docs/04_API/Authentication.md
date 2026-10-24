# Authentication API Reference

Base Endpoint: `/api/auth`

---

## 1. Customer Registration

- **URL**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new customer account and sends an email verification OTP code.

### Request Body
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "SecurePassword123!",
  "contactNumber": "09123456789",
  "address": "123 Main St",
  "city": "Manila",
  "province": "Metro Manila",
  "zipCode": "1000"
}
```

### Success Response (`201 Created`)
```json
{
  "message": "User created successfully. OTP verification code sent.",
  "userId": 5,
  "email": "johndoe@example.com",
  "emailSent": true,
  "emailWarning": null
}
```

---

## OTP Format Standards

The platform enforces dedicated, purpose-bound OTP prefixes for strict domain separation and spoofing prevention:

| Flow | OTP Format | Example | Endpoint | Verification Field |
| :--- | :--- | :--- | :--- | :--- |
| **Registration Verification** | `REG-######` | `REG-123456` | `POST /api/auth/verify-otp` | `otpCode` |
| **Login Multi-Factor (2FA)** | `LOG-######` | `LOG-654321` | `POST /api/auth/login` | `otpCode` |
| **Password Reset** | `RST-######` | `RST-987654` | `POST /api/auth/reset-password` | `resetOtpCode` |

> Cross-domain OTP verification is strictly rejected: a login code (`LOG-`) cannot be used to verify email registration (`REG-`) or complete a password reset (`RST-`).

---

## 2. Login

- **URL**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates users (Customer, Admin, Owner, Sales, Finance, Logistic, Super Admin). If two-factor authentication or device verification is triggered, responds with `{ requiresOtp: true }` and sends a `LOG-######` OTP code.

### Request Body (Standard)
```json
{
  "email": "johndoe@example.com",
  "password": "SecurePassword123!"
}
```

### Request Body (With 2FA / Login OTP)
```json
{
  "email": "johndoe@example.com",
  "password": "SecurePassword123!",
  "otp": "LOG-654321"
}
```

### 2FA Required Response (`200 OK`)
```json
{
  "requiresOtp": true,
  "message": "OTP sent to your email to verify login."
}
```

### Success Response (`200 OK`)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "name": "John Doe",
    "email": "johndoe@example.com",
    "role": "customer",
    "isEmailVerified": true
  }
}
```

---

## 3. Verify Email OTP

- **URL**: `POST /api/auth/verify-otp`
- **Access**: Public
- **Description**: Verifies customer account using Registration OTP code (`REG-######`). Also accepts raw 6-digit digits.

### Request Body
```json
{
  "email": "johndoe@example.com",
  "otp": "REG-123456"
}
```

### Success Response (`200 OK`)
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

---

## 4. Resend OTP

- **URL**: `POST /api/auth/resend-otp`
- **Access**: Public
- **Description**: Resends email verification OTP (enforces rate-limiting delay).

### Request Body
```json
{
  "email": "johndoe@example.com"
}
```

---

## 5. Forgot Password

- **URL**: `POST /api/auth/forgot-password`
- **Access**: Public
- **Description**: Verifies if the email address exists in the database as an active customer account. If not registered, immediately returns `404 Not Found` without sending an OTP. If registered, generates a secure 6-digit verification code and emails it to the user.

### Request Body
```json
{
  "email": "johndoe@gmail.com"
}
```

### Validation & Error Responses
- Missing email or invalid syntax (`400 Bad Request`): `"Please enter a complete email address including domain (@gmail.com)."`
- Fake or short Gmail usernames (`400 Bad Request`): `"Gmail usernames must be at least 6 characters long."`
- Disposable or burner domains (`400 Bad Request`): `"Disposable or test email addresses are not allowed. Please enter an active, realistic email."`
- Unregistered email address (`404 Not Found`): `"This email address is not registered in our system. Please check your email or sign up."`
- Non-customer accounts (`403 Forbidden`): `"Password reset is only available for customer accounts."`

### Success Response (`200 OK`)
```json
{
  "message": "Password reset code sent to your email."
}
```

---

## 6. Reset Password

- **URL**: `POST /api/auth/reset-password`
- **Access**: Public
- **Description**: Resets account password using the 6-digit reset code received via email. Enforces realistic email validation, non-expired code, and prevents reuse of current password.

### Request Body
```json
{
  "email": "johndoe@gmail.com",
  "otp": "654321",
  "newPassword": "NewSecurePassword123!"
}
```

### Success Response (`200 OK`)
```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

---

## 7. Get Current User Profile

- **URL**: `GET /api/auth/profile`
- **Access**: Private (`Bearer <token>`)
- **Description**: Retrieves detailed profile of currently logged-in user.

---

## 8. Update Profile

- **URL**: `PUT /api/auth/profile`
- **Access**: Private (`Bearer <token>`)
- **Description**: Updates current user's profile information.
