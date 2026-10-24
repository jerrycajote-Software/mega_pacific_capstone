# Reviews API Reference

## Base Path
```
/api/customer/reviews
/api/sales/reviews
/api/admin/reviews
```

All requests requiring authentication must include the `Authorization: Bearer <token>` header.

---

## Customer Endpoints

### 1. Check Review Eligibility
Checks whether the authenticated customer has completed or received orders for a given product and can submit a review.

- **URL**: `GET /api/customer/reviews/eligibility/:productId`
- **Auth**: Customer (`verifyToken`)
- **URL Parameters**:
  - `productId` (integer, required): ID of the product.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "eligible": true,
  "eligibleOrder": {
    "id": 12,
    "status": "completed",
    "fulfillmentType": "Pickup",
    "deliveredAt": "2026-10-15T09:30:00.000Z",
    "updatedAt": "2026-10-15T09:30:00.000Z"
  },
  "unreviewedCount": 1,
  "message": "You are eligible to review this product."
}
```

#### Ineligible Responses (`200 OK` with `eligible: false`)
- **No orders found**:
  ```json
  {
    "success": true,
    "eligible": false,
    "message": "You can leave a review after purchasing and receiving this product."
  }
  ```
- **Orders still in transit / processing / awaiting pickup**:
  ```json
  {
    "success": true,
    "eligible": false,
    "message": "You can review this product once your order has been delivered or picked up."
  }
  ```
- **Already reviewed all purchased items**:
  ```json
  {
    "success": true,
    "eligible": false,
    "message": "You have already reviewed this product for your received orders."
  }
  ```

---

### 2. Submit Product Review
Allows verified customers to submit a rating and review for a purchased product after receiving it (status is `delivered` or `completed`).

- **URL**: `POST /api/customer/reviews`
- **Auth**: Customer (`verifyToken`)
- **Request Body**:
  ```json
  {
    "productId": 5,
    "rating": 5,
    "title": "Excellent gauge and durable color finish",
    "comment": "The corrugated sheets were cleanly cut to our specified 4.5m lengths. Perfectly bundled and no transport scratches.",
    "imageUrls": [
      "data:image/jpeg;base64,...",
      "https://example.com/photo.jpg"
    ],
    "orderId": 12
  }
  ```
- **Validation Rules**:
  - `productId`: Required, must be a valid product ID.
  - `rating`: Required, integer between 1 and 5.
  - `comment`: Required non-empty string.
  - `imageUrls`: Optional array (max 3 images).
  - `orderId`: Optional, but when provided, the order must belong to the user, contain the product, and have status `delivered` or `completed`.
  - If `orderId` is not provided, the controller verifies whether the customer has at least one qualifying delivered/completed order with an unreviewed instance of the product.

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": 8,
    "productId": 5,
    "userId": 14,
    "rating": 5,
    "title": "Excellent gauge and durable color finish",
    "comment": "The corrugated sheets were cleanly cut...",
    "imageUrls": ["..."],
    "createdAt": "2026-10-16T12:00:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: `Product ID, rating (1-5), and comment are required.`
- `400 Bad Request`: `Maximum 3 images allowed per review.`
- `400 Bad Request`: `You have already reviewed all items for this product from your delivered or completed orders.`
- `403 Forbidden`: `You can only review products from orders that have been delivered or completed.`

---

### 3. Get Product Reviews
Fetches public reviews and staff replies for a specific product.

- **URL**: `GET /api/customer/reviews/product/:productId`
- **Auth**: Public
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "productId": 5,
      "rating": 5,
      "title": "Excellent gauge and durable color finish",
      "comment": "The corrugated sheets were cleanly cut...",
      "imageUrls": ["..."],
      "createdAt": "2026-10-16T12:00:00.000Z",
      "user": {
        "id": 14,
        "name": "Juan Dela Cruz",
        "avatarUrl": null
      },
      "reply": {
        "id": 2,
        "comment": "Thank you for trusting Mega Pacific for your roofing needs!",
        "createdAt": "2026-10-16T12:15:00.000Z",
        "user": {
          "id": 2,
          "name": "Mega Pacific Sales Team",
          "role": "Sales"
        }
      }
    }
  ]
}
```

---

## Sales & Admin Endpoints

### 4. List All Reviews
- **URL**: `GET /api/sales/reviews` or `GET /api/admin/reviews`
- **Auth**: Sales or Admin (`verifySales` / `verifyAdmin`)
- **Returns**: All customer product reviews across the catalog with customer names, order references, ratings, and existing staff replies.

### 5. Reply to Review
- **URL**: `POST /api/sales/reviews/:id/reply`
- **Auth**: Sales or Admin (`verifySales`)
- **Request Body**:
  ```json
  {
    "comment": "Thank you for choosing Mega Pacific! Let us know if you need any additional flashings or gutter accessories."
  }
  ```
