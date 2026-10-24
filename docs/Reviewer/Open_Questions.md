# Open Questions

Questions raised during the review. Please answer or mark each one so the follow-up work can be done safely.

## Decisions needed (affect code)

1. ~~**Secure the admin product/order/product-type APIs?**~~ **[RESOLVED]**: Protected with `verifyStaff` and `verifyAdmin` middleware; customer callers moved to `/api/customer/products`.
2. **Admin portal scope.** Admin sidebar only shows Dashboard, Users, Staff Management, Settings. Should the hidden Admin Inventory, Orders and Reviews pages (and their backend controllers, about 200 KB of code) be deleted, or should they come back into the sidebar? The docs say these duties belong to Sales, Logistics and Finance.
3. **Legacy finished-goods inventory.** Are legacy (non pre-order) products and the stock-adjust / stock-audit-log feature still needed, or is the system fully made-to-order with raw coil stock only?
4. ~~**Rename "saless" to "sales"**~~ **[RESOLVED]**: Renamed route to `/api/admin/sales` with `/api/admin/saless` backwards-compatibility alias, updated frontend callers, socket events, and cleaned UI labels.
5. **Scripts to keep or delete:** `backend/deleteUser.js` (hard-deletes a user and related data), `scripts/createAdmin|createOwner|createSuperAdmin.js`, one-time migrations `scripts/migrate_discounts.js`, `prisma/migrate_addresses.js`, `scripts/clean_legacy_inventory_items.js`, `scripts/sync_preorder_catalog.js`. Which are still used?
6. **Deleted `orderStatusScheduler.js`** (automatic pending to processing). It was disabled for the manual workflow. Do you want it back, or is the manual flow final? Note: `processing` is still a status Finance and Logistic read, but nothing sets it any more.
7. **Remove ESLint `varsIgnorePattern: '^[A-Z_]'`** so unused components and icons are flagged in the future?
8. ~~**Unused dependencies** `@hono/node-server` (backend) and `@types/react*` (frontend)~~ **[RESOLVED]**: Both removed from `package.json`.
9. **Root clutter** (`2026-09-14.md`, `Untitled*.canvas`, `Untitled.base`, `plan.drawio`, `implementation/`, `other/`, `documentation_structured.md`, `flowchart.md`): which are personal Obsidian notes to keep?
10. **Socket.IO rooms**: restrict `join_room` so a client can only join its own `user_<id>` room, and role rooms only if authorized?

## Possible gaps or inconsistencies in features

11. Payment: card and GCash forms collect details but there is no gateway (feature #38 "Not Started"). Is collecting card details in the app intended? Storing or transmitting card numbers has PCI implications.
12. Finance verifies payment only for `sales_approved` orders; COD with 50% downpayment is marked fully `paid` on verification. Should the 50% balance collected on delivery be tracked separately?
13. After rejection, `paymentStatus` becomes `refund_pending`; if the order was unpaid no refund is needed but a refund record with amount 0 is still created. Intended?
14. The Owner role is read-only with one dashboard page. Should the Owner get reports, staff overview or export?
15. Admin can use Sales and Logistic APIs (`verifySales`, `verifyLogistic`) but not Finance. Is that deliberate?
16. Super Admin can toggle maintenance only for customer, admin and sales portals. Finance, Logistic and Owner portals have no maintenance switch.
17. Internationalization (i18next) exists but few strings are translated. Keep or remove?
18. Customer orders list uses `#ORD-001` padding in Sales/Finance and `#ORD-0001` in Logistic. Should the order number format be unified?
19. Docs: `docs/06_UI/Sales.md` still lists `/sales/inventory` and `/sales/pre-orders`. Should I update the docs to match the real routes?
20. `backend/tests/*.test.js` need a live database and are not run by `npm test`. Should I wire them (and add an isolated test database), or leave them as manual scripts?
