# Products & Inventory API Reference

Endpoints for product management, product variants, and inventory tracking.

---

## 1. List Products

- **URL**: `GET /api/admin/products`
- **Access**: Public
- **Description**: Returns all products with their variants and image galleries.

---

## 2. Create Product

- **URL**: `POST /api/admin/products`
- **Access**: Admin / Staff
- **Description**: Adds a new roofing product to the catalog.

### Request Body
```json
{
  "name": "Mega Spandrel Premium",
  "type": "Spandrel",
  "description": "<p>High grade spandrel sheet with rust protection.</p>",
  "price": 450.00,
  "unit": "per meter",
  "stock": 100,
  "imageUrl": "https://example.com/image.jpg",
  "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

---

## 3. Update Product

- **URL**: `PUT /api/admin/products/:id`
- **Access**: Admin / Staff
- **Description**: Updates product details.

---

## 4. Delete Product

- **URL**: `DELETE /api/admin/products/:id`
- **Access**: Admin / Staff
- **Description**: Removes product (cascades to variants).

---

## 5. Stock Adjustments & Audit Logging

- **Single Stock Adjustment**: `POST /api/admin/products/stock-adjust`
- **Bulk Stock Adjustment**: `POST /api/admin/products/stock-adjust-bulk`
- **Get Stock Audit Logs**: `GET /api/admin/products/stock-logs`

### Stock Adjustment Request Body
```json
{
  "productId": 1,
  "variantId": 2,
  "addedQuantity": 50,
  "reason": "Restock shipment batch #102"
}
```

---

## 6. Product Variants

- **Get Variants**: `GET /api/admin/products/:productId/variants`
- **Create Variant**: `POST /api/admin/products/:productId/variants`
- **Delete Variant**: `DELETE /api/admin/products/:productId/variants/:id`

### Create Variant Request Body
```json
{
  "name": "2 Meters",
  "price": 900.00,
  "stock": 30,
  "sku": "SPANDREL-2M"
}
```

---

## 7. Customer Single Product View

- **URL**: `GET /api/customer/products/:id`
- **Access**: Public
- **Description**: Retrieves single product details including variants, average ratings, and customer reviews.

---

## 8. Customer Catalog & Order Add-on Products

- **URL**: `GET /api/customer/products`
- **Access**: Public
- **Description**: Returns all available products with variants and reviews for customer browsing and checkout cross-product add-ons.

---

## 9. Customer Raw Coil Availability

- **URL**: `GET /api/customer/products/coil-availability`
- **Access**: Public
- **Description**: Returns physical coil roll stock availability across all thickness gauges and color finishes. Enables client-side auto-disabling of combinations with zero raw inventory rolls.
