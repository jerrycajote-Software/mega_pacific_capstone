# Orders API Reference

Endpoints for placing, tracking, exporting, and managing orders.

---

## 1. Place Single Order (Customer)

- **URL**: `POST /api/customer/orders`
- **Access**: Private (`Bearer <token>`)
- **Description**: Places an order for selected items.

### Request Body
```json
{
  "total": 2700.00,
  "paymentMode": "Cash on Delivery",
  "shippingName": "John Doe",
  "shippingContactNumber": "09123456789",
  "shippingAddress": "123 Main St",
  "shippingCity": "Manila",
  "shippingProvince": "Metro Manila",
  "shippingZipCode": "1000",
  "notes": "Please deliver in the morning.",
  "items": [
    {
      "productId": 1,
      "variantId": 2,
      "quantity": 3,
      "price": 900.00
    }
  ]
}
```

---

## 2. Place Bulk Order (Customer)

- **URL**: `POST /api/customer/orders/bulk`
- **Access**: Private (`Bearer <token>`)
- **Description**: Places bulk project orders with customized quantity requests.

---

## 3. Customer Orders History

- **URL**: `GET /api/customer/orders/my`
- **Access**: Private (`Bearer <token>`)
- **Description**: Returns all orders placed by the current customer.

---

## 4. Get Order Details

- **URL**: `GET /api/customer/orders/:id`
- **Access**: Private (`Bearer <token>`)
- **Description**: Detailed order breakdown including shipping info and line items.

---

## 5. List All Orders (Admin / Sales)

- **URL**: `GET /api/admin/orders`
- **Access**: Admin / Sales
- **Description**: Lists all orders across all customers with filter support.

---

## 6. Update Order Status

- **URL**: `PATCH /api/admin/orders/:id/status`
- **Access**: Admin / Sales
- **Description**: Updates order status (`pending` → `processing` → `shipped` → `completed`).

### Request Body
```json
{
  "status": "processing",
  "paymentStatus": "paid",
  "estimatedDeliveryDate": "2026-08-15T00:00:00.000Z"
}
```

---

## 7. Sales Order Approval

- **URL**: `PATCH /api/sales/orders/:id/approve`
- **Access**: Sales
- **Description**: Approves a pending order and forwards it to Finance.

---

## 7.1 Sales Order Rejection & Cancellation

- **URL**: `PATCH /api/sales/orders/:id/reject`
- **Access**: Sales (`Bearer <token>`)
- **Description**: Cancels or rejects a pending order (e.g., duplicate submission, invalid details, or customer request). Sets status to `cancelled` and records an optional cancellation reason.
- **Request Body**:
  ```json
  {
    "reason": "Duplicate order submission"
  }
  ```
- **Response**: HTTP 200 with updated order object (`status: "cancelled"`).

---

## 8. Finance Order Verification

- **URL**: `PATCH /api/finance/orders/:id/verify`
- **Access**: Finance
- **Description**: Verifies payment of a sales-approved order and forwards it to Logistics.

---

## 9. Logistic Order Status Update & Pick-up Signal

- **URL**: `PATCH /api/logistic/orders/:id/status`
- **Access**: Logistic (`Bearer <token>`)
- **Description**: Updates logistics tracking status. Supports delivery workflow (`shipped` → `out_for_delivery` → `completed`) and plant pickup workflow (`ready_for_pickup` → `completed`).
- **Pick-up Signal Transmission**:
  - When status is updated to `ready_for_pickup`:
    - Sets `statusUpdatedAt` to current timestamp.
    - Emits real-time Socket.IO events (`order_status_updated` and `order_ready_for_pickup`) to both global channels and customer user room `user_<userId>`.
    - Automatically sends official **Ready for Pick-up Email Pass** (`sendReadyForPickupEmail`) to the customer containing Plant Loading Dock 1 location, operating schedule (Mon-Sat 8AM-5PM), and ID requirements.

### Request Body
```json
{
  "status": "ready_for_pickup"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 104,
    "status": "ready_for_pickup",
    "statusUpdatedAt": "2026-10-14T15:35:00.000Z"
  },
  "message": "Order #104 marked Ready for Pick-up! Customer notified via email and live signal."
}
```

---

## 10. Calculate Dynamic Delivery Charge (Customer)

- **URL**: `POST /api/customer/orders/calculate-shipping`
- **Access**: Public / Private
- **Description**: Calculates exact delivery charge based on the Imus Plant distance, panel length, weight, vehicle classification (Elf, Forward, 10-Wheeler, Tractor Head), TLA surcharge, vehicle depreciation, 20% admin cost (PMS), and expressway tolls.

### Request Body
```json
{
  "province": "Batangas",
  "city": "Lipa City",
  "items": [
    {
      "productId": 1,
      "variantName": "16 Meters",
      "quantity": 2
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "origin": { "name": "Mega Pacific Imus Plant", "city": "Imus", "province": "Cavite" },
    "destination": { "province": "Batangas", "city": "Lipa City", "distanceKm": 75, "roundTripKm": 150 },
    "vehicleType": "Forward 6-Wheeler",
    "loadType": "Top Load (13.1M to 16M)",
    "breakdown": {
      "kilometersTravelled": 150,
      "fuelCost": 2640,
      "manpower": 2100,
      "topLoadAdditional": 3000,
      "vehicleDepreciation": 3000,
      "adminCost": 2148,
      "tollFee": 380,
      "totalDeliveryCharge": 13268
    },
    "totalDeliveryCharge": 13268
  }
}
```

---

## 11. Delivery Fee & Fuel Rates Configuration (Finance)

- **URL**: `GET /api/finance/delivery-settings`
- **Access**: Finance
- **Description**: Fetches current diesel price, admin cost percentage, plant origin, and vehicle fleet rate specifications.

- **URL**: `PUT /api/finance/delivery-settings`
- **Access**: Finance
- **Description**: Updates diesel price per liter and admin cost percentage.

