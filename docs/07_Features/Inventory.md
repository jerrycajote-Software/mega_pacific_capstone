# Inventory Feature Specification

## Purpose
Manage stock quantities for products and variant options while recording audit trails for all manual adjustments.

---

## Architecture & Data Flow

```
Admin / Sales ──► UI Adjustment Form
                          │
                          ▼
            POST /api/admin/products/stock-adjust
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
  Update ProductVariant/Product   Create InventoryLog
  (newStock = prev + added)       (addedBy, reason, prev, new)
```

---

## Key Features

1. **Variant-Level Stock**: Individual length options (e.g. 2 Meters, 6 Meters) maintain independent stock counts.
2. **Audit Trail (`InventoryLog`)**: Every stock addition or deduction creates an immutable record capturing:
   - User ID who performed the action
   - Previous stock level
   - Added quantity (positive or negative)
   - Resulting new stock level
   - Restock reason or batch note
3. **Bulk Stock Adjustment**: Supports bulk inventory updates across multiple items simultaneously.
4. **Update Inventory Item (Base Stock Addition)**: In the logistics and admin product management modal, entering a quantity in the `BASE STOCK QTY` field adds to the existing base stock rather than overwriting it, with live preview feedback and automated `InventoryLog` tracking.
