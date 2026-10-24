# Environment Variables Reference

This document catalogs all environment variables used by the Mega Pacific backend and frontend applications.

---

## Backend (`backend/.env`)

| Variable Name | Required | Default / Example | Purpose |
|---------------|----------|-------------------|---------|
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@localhost:5432/megaroof_db` | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | **Yes** | `your-super-secret-jwt-key-here` | Secret key used to sign and verify JWT authentication tokens |
| `PORT` | Optional | `5000` | Port on which the Express REST server and Socket.IO listen |
| `SMTP_HOST` | **Yes** (for mail) | `smtp.mailtrap.io` | SMTP server host for sending OTP and notification emails |
| `SMTP_PORT` | **Yes** (for mail) | `2525` | SMTP port |
| `SMTP_USER` | **Yes** (for mail) | `your_smtp_username` | SMTP authentication username |
| `SMTP_PASS` | **Yes** (for mail) | `your_smtp_password` | SMTP authentication password |
| `SMTP_FROM` | Optional | `noreply@megapacific.com` | "From" sender email address |
| `SEED_ADMIN_EMAIL` | Optional | `admin@megapacific.com` | Email used when executing `npm run seed` |
| `SEED_ADMIN_PASSWORD` | Optional | `megapacific@123` | Password set for default admin account during seed |

---

## Frontend (`frontend/.env`)

| Variable Name | Required | Default / Example | Purpose |
|---------------|----------|-------------------|---------|
| `VITE_API_BASE_URL` | Optional | `http://localhost:5000/api` | Base URL for Axios HTTP requests to the backend server |

---

## Security Guidelines

- **Never commit `.env` files** to version control. They are gitignored by default.
- Always maintain an updated `.env.example` file in each module directory containing dummy values and usage notes.
- Rotate `JWT_SECRET` periodically or immediately upon security concern.
