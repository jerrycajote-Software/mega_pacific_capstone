# Database Seeding Documentation

This document describes the initial database seeding procedure and default account creation.

---

## Seeding Script (`backend/prisma/seed.js`)

The seeding script populates initial administrative credentials required to access the system upon fresh database deployment.

### Execution Command

```bash
cd backend
npm run seed
# or
npx prisma db seed
```

---

## Initial Default Data Created

### Default Admin User
If no admin user exists in the `User` table, the script creates:

- **Name**: System Admin
- **Email**: `SEED_ADMIN_EMAIL` (Defaults to `admin@megapacific.com`)
- **Password**: `SEED_ADMIN_PASSWORD` (Defaults to `megapacific@123` hashed with `bcryptjs`)
- **Role**: `admin`
- **isEmailVerified**: `true`

---

## Safety Controls

- The seeder checks for any existing user with `role === "admin"`. If found, it skips admin creation to prevent overwriting modified passwords.
- Always change default passwords after deploying to staging or production environments.
