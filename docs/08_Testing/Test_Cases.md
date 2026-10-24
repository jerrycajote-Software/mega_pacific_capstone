# Integration & System Test Cases

This document defines standard test scenarios for manual and automated verification.

---

## 1. Authentication & Security Test Suite

| Test ID | Scenario | Preconditions | Expected Result | Status |
|---------|----------|---------------|-----------------|--------|
| `TC-AUTH-01` | Customer Registration | Valid email & password | OTP email sent; user created with `isEmailVerified = false`. | Passed |
| `TC-AUTH-02` | Incorrect OTP Verification | Valid user, wrong OTP | 400 Bad Request error returned. | Passed |
| `TC-AUTH-03` | Admin Single-Session Enforcement | Admin logged in on Browser A | Admin logging in on Browser B invalidates Browser A token. | Passed |
| `TC-AUTH-04` | Role-Based Access Control | Customer token | Accessing `/api/admin/dashboard` returns 403 Forbidden. | Passed |

---

## 2. Inventory & Stock Adjustment Test Suite

| Test ID | Scenario | Preconditions | Expected Result | Status |
|---------|----------|---------------|-----------------|--------|
| `TC-INV-01` | Manual Stock Addition | Admin logged in | Stock count increases; entry appended to `InventoryLog`. | Passed |
| `TC-INV-02` | Bulk Stock Adjustment | Multiple product IDs | All target variants updated atomically in a transaction. | Passed |

---

## 3. Order Lifecycle Test Suite

| Test ID | Scenario | Preconditions | Expected Result | Status |
|---------|----------|---------------|-----------------|--------|
| `TC-ORD-01` | Single Product Order | Customer logged in | Order created as `pending`; order items linked correctly. | Passed |
| `TC-ORD-02` | Status Progression | Admin updating order | Status changes to `processing` -> `shipped` -> `completed`. | Passed |
