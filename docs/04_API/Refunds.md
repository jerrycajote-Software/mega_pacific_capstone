# Refunds API Specification

## Overview
The Refunds API manages the lifecycle of customer refunds generated when Sales staff rejects an order. Finance staff can inspect customer payment channels, review amounts (50% downpayment or full payment), execute disbursements, and trigger automated customer notifications.

---

## Endpoints

### 1. Get Refunds List
- **Route**: `GET /api/finance/refunds`
- **Auth**: Required (`verifyFinance`)
- **Query Parameters**:
  - `status` (optional): `'all' | 'pending' | 'completed'` (default: `'all'`)
  - `search` (optional): Case-insensitive match on `#REF-XXX`, `#ORD-XXX`, customer name, email, or transaction reference.
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "#REF-001",
      "rawId": 1,
      "orderId": "#ORD-005",
      "rawOrderId": 5,
      "customerName": "Juan Dela Cruz",
      "customerEmail": "juan@example.com",
      "contactNumber": "09171234567",
      "amount": 7500.00,
      "orderTotal": 15000.00,
      "paymentMethod": "Cash on Delivery (50% Downpayment via GCash (09171234567), 50% on Delivery)",
      "reason": "Duplicate order submission",
      "status": "pending",
      "transactionReference": null,
      "notes": null,
      "refundedAt": null,
      "createdAt": "2026-10-19T06:00:00.000Z",
      "processedBy": null,
      "itemsSummary": "Spandrel (0.40mm) x10"
    }
  ]
}
```

---

### 2. Get Refund Statistics
- **Route**: `GET /api/finance/refunds/stats`
- **Auth**: Required (`verifyFinance`)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "pendingCount": 2,
    "pendingAmount": 15000.00,
    "completedCount": 14,
    "completedAmount": 98450.00,
    "todayCount": 3,
    "todayAmount": 21500.00,
    "totalCount": 16
  }
}
```

---

### 3. Process Customer Refund
- **Route**: `PATCH /api/finance/refunds/:id/process` or `POST /api/finance/refunds/:id/process`
- **Auth**: Required (`verifyFinance`)
- **Request Body**:
```json
{
  "transactionReference": "GCASH-REF-892318721",
  "returnMethod": "GCash (09171234567)",
  "amount": 7500.00,
  "notes": "Reversed via GCash Business portal"
}
```
- **Actions Executed**:
  1. Sets `Refund.status = 'completed'`, stamps `refundedAt`, `transactionReference`, and `processedBy`.
  2. Updates `Order.paymentStatus = 'refunded'`.
  3. Creates an audit `Expense` entry (`category: 'Refund'`).
  4. Dispatches WebSocket `order_refunded` event to customer room `user_${userId}`.
  5. Dispatches global WebSocket `order_status_updated` event.
  6. Dispatches official Mega Pacific HTML email receipt to customer.
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": 5,
    "amount": 7500.00,
    "status": "completed",
    "transactionReference": "GCASH-REF-892318721",
    "refundedAt": "2026-10-19T07:15:00.000Z"
  },
  "message": "Refund processed successfully and customer notified."
}
```
