# Checkout & Order Placement Feature Specification

## Purpose
Enables customers to configure custom roofing specifications, specify fulfillment details, add complementary trims/accessories, and place pre-orders with real-time status updates.

---

## User Flow

```
Customer ──► Configure Custom Specs (Length/Color/Thickness) ──► Direct Checkout ──► Submit Order ──► Order Created (Pending)
                                                                       │                       │
                                                                       │                       ▼
                                                                       │             Smart Delivery Scheduler
                                                                       │             (Calculates delivery date)
                                                                       ▼
                                                       In-Checkout Add-on Modal
                                                       (Add trims, flashings, screws)
```

---

## Technical Details

- **Direct Pre-Order Architecture**: Since all roofing products are custom manufactured / pre-ordered, traditional stock shopping carts are retired. Customers proceed directly from product customization to checkout with their configured parameters.
- **In-Checkout Multi-Item Ordering**: Customers can add complementary trims, gutters, and fasteners directly inside the checkout screen via `AddProductToOrderModal.jsx`.
- **Payment Method**: Supports Cash on Delivery (50% downpayment / 50% upon delivery) or full upfront card/GCash payments.
- **Delivery Date Calculation**: Background service (`deliveryScheduler.js`) calculates estimated delivery based on order volume and scheduling rules.
- **Bulk Order Support**: Endpoint `POST /api/customer/orders/bulk` handles multi-item orders and large commercial roofing project orders.
