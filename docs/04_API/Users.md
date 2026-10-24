# Users & Sales Management API Reference

Endpoints for user directory, sales account management, and profile operations.

---

## 1. List Users (Admin)

- **URL**: `GET /api/admin/users`
- **Access**: Private (`Admin only`)
- **Description**: Returns all users (Customers, Sales, Admins, Owners) in the system, excluding Super Admin accounts.

---

## 2. Sales Account Management (Admin)

All endpoints require `verifyAdmin` middleware.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/saless` | List all staff/sales accounts |
| `POST` | `/api/admin/saless` | Create a new sales account |
| `PUT` | `/api/admin/saless/:id` | Update sales information |
| `PATCH` | `/api/admin/saless/:id/reset-password` | Reset sales password |
| `PATCH` | `/api/admin/saless/:id/status` | Update sales status (`active`, `suspended`, `deleted`) |

### Create Sales Request Body
```json
{
  "name": "Jane Sales",
  "email": "jane@megapacific.com",
  "password": "InitialPassword123!",
  "contactNumber": "09987654321"
}
```

---

## 3. Account Restoration & Soft Delete

- When an account status is set to `deleted`, `deletedAt` timestamp is recorded.
- Accounts with `deleted` status are prevented from logging in.
- Admins can restore accounts by updating status back to `active` via `PATCH /api/admin/saless/:id/status` or user restoration controller logic.
