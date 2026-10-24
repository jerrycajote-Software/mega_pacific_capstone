# Raw Material Coil Inventory API Reference

Endpoints for Logistics personnel to monitor, deduct, and restock physical master steel coils (tracked in roll counts per thickness gauge and finish across 14 standard colors).

---

## 1. List Coil Inventory

- **URL**: `GET /api/logistic/coils`
- **Access**: Logistics / Staff (`verifyStaff`)
- **Query Params**:
  - `color`: filter by color name (e.g., `Marshall Dark Gray`)
  - `thickness`: filter by thickness gauge (e.g., `0.35mm`, `0.40mm`, `0.50mm`, `0.60mm`)
  - `status`: filter by stock health (`Optimal`, `Low Stock`, `Out of Stock`)
- **Description**: Returns all 56 standard coil inventory items with `coilCount`, `minAlertCount`, `thickness`, `color`, and calculated health status.

---

## 2. Get Coil Inventory Summary

- **URL**: `GET /api/logistic/coils/summary`
- **Access**: Logistics / Staff (`verifyStaff`)
- **Description**: Returns high-level warehouse telemetry:
  - `totalRolls`: Aggregate physical coil rolls across warehouse storage
  - `totalVariants`: Total number of active raw coil finishes (56)
  - `thicknessCounts`: Subtotals of rolls per thickness gauge (`0.35mm`, `0.40mm`, `0.50mm`, `0.60mm`)
  - `optimalCount`: Count of coil variants with >= 2 rolls in stock
  - `lowCount`: Count of coil variants with 1 roll in stock
  - `criticalCount`: Count of coil variants with 0 rolls in stock (Out of Stock)

---

## 3. Deduct Coil Roll Usage

- **URL**: `POST /api/logistic/coils/deduct`
- **Access**: Logistics (`verifyLogistic`)
- **Description**: Logistics staff records physical roll allocation/consumption for an order or production job. Broadcasts `coil_inventory_updated` WebSocket event.

### Request Body
```json
{
  "coilId": 14,
  "coilsDeducted": 1,
  "orderId": 105,
  "reason": "Allocated 1 roll for Pico Rib roll-forming order #ORD-105"
}
```

---

## 4. Restock Raw Coil Rolls

- **URL**: `POST /api/logistic/coils/restock`
- **Access**: Logistics (`verifyLogistic`)
- **Description**: Replenishes physical coil rolls upon receiving supplier deliveries. Broadcasts `coil_inventory_updated` WebSocket event.

### Request Body
```json
{
  "coilId": 14,
  "coilsAdded": 2,
  "reason": "Shipment delivery receipt Batch #CS-2026-10"
}
```

---

## 5. Audit Trail Logs

- **URL**: `GET /api/logistic/coils/logs`
- **Access**: Logistics / Staff (`verifyStaff`)
- **Description**: Returns chronological audit history of deductions, restocking, order references, and remaining roll balances.

---

## 6. Add Coil Specification / New Thickness Gauge

- **URL**: `POST /api/logistic/coils`
- **Access**: Logistics (`verifyLogistic`)
- **Description**: Adds new coil thickness gauge specifications or registers finishes from the 14 official colors for existing gauges. Prevents duplicate thickness + color combinations (`409 Conflict`). Broadcasts `coil_inventory_updated` WebSocket event.

### Request Body
```json
{
  "thickness": "0.70mm",
  "colors": ["Marshall Dark Gray", "Saipan Brown"],
  "coilCount": 1,
  "minAlertCount": 1
}
```
*Note: Accepts either `color` (single string) or `colors` (array of strings from the 14 official colors).*

