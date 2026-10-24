# Database Relationships & Foreign Keys

This document details foreign key constraints and cascade rules enforced by Prisma ORM.

---

## Direct Relationships & Referential Actions

| Parent Table | Child Table | Foreign Key Field | On Delete Rule | Description |
|--------------|-------------|-------------------|----------------|-------------|
| `Product` | `ProductVariant` | `productId` | **Cascade** | Deleting a product removes all its pricing variants. |
| `Product` | `InventoryLog` | `productId` | **Cascade** | Deleting a product removes corresponding audit logs. |
| `ProductVariant` | `InventoryLog` | `variantId` | **Set Null** | Deleting a variant preserves the audit log record with `variantId = null`. |
| `User` | `InventoryLog` | `addedBy` | **Set Null** | Deleting a staff account preserves audit records with `addedBy = null`. |
| `Inquiry` | `Message` | `inquiryId` | **Cascade** | Deleting an inquiry ticket deletes all attached chat messages. |
| `Review` | `ReviewReply` | `reviewId` | **Cascade** | Deleting a review removes its staff reply. |
| `User` | `Order` | `userId` | Restrict / Default | Customer order records are retained for auditing. |
| `Order` | `OrderItem` | `orderId` | Default | Line items are attached to orders. |

| `User` | `UserSession` | `userId` | **Cascade** | Deleting a user removes all their session records. |
| `User` | `CustomerProfile` | `userId` | **Cascade** | Deleting a user deletes their customer profile details. |
| `User` | `AdminProfile` | `userId` | **Cascade** | Deleting a user deletes their admin profile details. |
| `User` | `SuperAdminProfile` | `userId` | **Cascade** | Deleting a user deletes their super admin profile details. |
| `User` | `OwnerProfile` | `userId` | **Cascade** | Deleting a user deletes their owner profile details. |
| `User` | `SalesProfile` | `userId` | **Cascade** | Deleting a user deletes their sales profile details. |
| `User` | `LogisticProfile` | `userId` | **Cascade** | Deleting a user deletes their logistic profile details. |
| `User` | `FinanceProfile` | `userId` | **Cascade** | Deleting a user deletes their finance profile details. |
| `CoilInventory` | `CoilInventoryLog` | `coilId` | **Cascade** | Deleting a raw coil deletes all its audit deduction/restock log records. |
| `User` | `CoilInventoryLog` | `userId` | **Set Null** | Deleting a user/staff account preserves coil usage audit logs with `userId = null`. |
| `Order` | `CoilInventoryLog` | `orderId` | **Set Null** | Deleting an order preserves coil deduction records with `orderId = null`. |
| `Order` | `Refund` | `orderId` | **Cascade** | Deleting an order cascades to its refund audit record. |
| `User` | `Refund` | `userId` | **Cascade** | Deleting a customer cascades to their refund records. |
| `User` | `Refund` | `processedBy` | **Set Null** | Deleting a finance staff user preserves refund records with `processedBy = null`. |
