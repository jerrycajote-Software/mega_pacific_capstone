# Database Tables Reference

This document catalogs every table in the PostgreSQL database managed by Prisma.

---

## Tables Summary

1. `User`: Customer, Admin, and Sales account details & security settings.
2. `Product`: Roofing products catalog base records.
3. `ProductVariant`: Pricing tiers and specific length/unit options per product.
4. `ProductType`: Product categories (e.g., Spandrel, Rib, Flat Type).
5. `Order`: Customer orders metadata, delivery, and billing details.
6. `OrderItem`: Line items for each order.
7. `Review`: Ratings, titles, comments, and image attachments from customers.
8. `ReviewReply`: Official response from saless/admins to customer reviews.
9. `Inquiry`: Real-time customer service tickets/threads.
10. `Message`: Individual messages within an inquiry ticket.
11. `InventoryLog`: Detailed audit trail of manual and bulk stock adjustments.

For complete field definitions and data types, refer to [`docs/02_Architecture/Database.md`](../02_Architecture/Database.md).
