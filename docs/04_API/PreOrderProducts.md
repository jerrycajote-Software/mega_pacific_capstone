# Pre-Order Products API Reference

Endpoints for Sales representatives and managers to manage Made-to-Order Roofing Products and Thickness Variants available for customer pre-orders.

---

## 1. List Pre-Order Products

- **URL**: `GET /api/sales/pre-order-products`
- **Access**: Sales / Staff (`verifyStaff`)
- **Description**: Returns all roofing profiles configured for pre-order (`isPreOrder: true`) with thickness variants, profile dimensions, and color lists.

### Response
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": 1,
      "name": "Pico Rib",
      "type": "Roofing",
      "price": 315.00,
      "unit": "per meter",
      "isPreOrder": true,
      "effectiveWidth": 1000,
      "nominalWidth": 1070,
      "ribHeight": 25,
      "thickness": "0.35mm",
      "colors": ["Marshall Dark Gray", "Saipan Brown", "Tongan Red"],
      "maxMeters": 21.0,
      "variants": [
        { "id": 1, "name": "0.40mm", "thickness": "0.40mm", "price": 360.00 },
        { "id": 2, "name": "0.50mm", "thickness": "0.50mm", "price": 450.00 }
      ]
    }
  ]
}
```

---

## 2. Create Pre-Order Product

- **URL**: `POST /api/sales/pre-order-products`
- **Access**: Sales / Staff (`verifyStaff`)
- **Description**: Creates a new pre-order roofing profile and automatically creates thickness pricing variants. Broadcasts `product:created` WebSocket event.

### Request Body
```json
{
  "name": "Agua Corr",
  "type": "Roofing",
  "price": 315.00,
  "unit": "per meter",
  "effectiveWidth": 800,
  "nominalWidth": 914,
  "ribHeight": 18,
  "thickness": "0.35mm",
  "colors": ["Marshall Dark Gray", "Saipan Brown", "Maori Green"],
  "maxMeters": 21.0,
  "description": "<p>Classic corrugated profile with premium water shedding.</p>",
  "imageUrls": ["https://res.cloudinary.com/.../agua.png"],
  "variants": [
    { "name": "0.40mm", "thickness": "0.40mm", "price": 360.00 },
    { "name": "0.50mm", "thickness": "0.50mm", "price": 450.00 },
    { "name": "0.60mm", "thickness": "0.60mm", "price": 540.00 }
  ]
}
```

---

## 3. Get Pre-Order Product Details

- **URL**: `GET /api/sales/pre-order-products/:id`
- **Access**: Sales / Staff (`verifyStaff`)
- **Description**: Retrieves single pre-order product with full variant tree.

---

## 4. Update Pre-Order Product

- **URL**: `PUT /api/sales/pre-order-products/:id`
- **Access**: Sales / Staff (`verifyStaff`)
- **Description**: Updates profile details and synchronizes thickness variant pricing table. Broadcasts `product:updated` WebSocket event.

---

## 5. Delete Pre-Order Product

- **URL**: `DELETE /api/sales/pre-order-products/:id`
- **Access**: Sales / Staff (`verifyStaff`)
- **Description**: Safely removes product from active pre-order catalog. If the product has historical customer orders (`OrderItem` records), it is archived (`isPreOrder: false`, status `out_of_stock`, and cart cleanup) to prevent foreign key constraint violations (`OrderItem_productId_fkey`) and preserve audit/order integrity. If no customer orders exist, it is permanently deleted along with its variants and reviews. Broadcasts `product_catalog_updated` WebSocket event with `{ action: "delete", productId }`.
- **Response**:
  - `200 OK`: `{ "success": true, "archived": true/false, "message": "..." }`
  - `409 Conflict`: If external foreign key dependencies block hard deletion.

---

## 6. Toggle Pre-Order Product Status (Enable / Disable)

- **URL**: `PATCH /api/sales/pre-order-products/:id/status`
- **Access**: Sales / Staff (`verifySales`)
- **Description**: Toggles or updates the `isActive` status of a pre-order roofing profile. When `isActive` is set to `false`, the product is immediately disabled and omitted from the customer catalog, search results, related recommendations, and order add-ons modal. Real-time updates are broadcast to connected clients via Socket.IO.
- **Request Body**:
```json
{
  "isActive": false
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pico Rib",
    "isActive": false
  },
  "message": "Product disabled successfully. It will no longer appear on the customer side."
}
```
- **Socket Event Broadcast**:
  - Event: `product_catalog_updated`
  - Payload: `{ "productId": 1, "isActive": false, "name": "Pico Rib", "action": "disabled" }`
