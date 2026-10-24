# Finance Portal UI Documentation

## Overview
The Finance Portal provides company accountants, controllers, and finance staff with financial oversight, payment verification, expense tracking, analytical reports, and end-to-end customer refund management.

---

## Layout & Shell (`FinanceLayout.jsx`)
- **Theme Support**: Seamless switching between Dark Mode and Light Mode with CSS custom properties.
- **Top Navigation Bar**: Branded Mega Pacific Finance header with live theme switcher.
- **Left Sidebar Navigation**:
  - `Dashboard`: Executive summaries, revenue charts, and operational activity.
  - `Expenses`: Corporate operational expenses ledger and disbursements.
  - `Payments`: Order payment verification for orders approved by Sales.
  - `Refunds`: Customer refund tracking, reversal processing, and audit vouchers.
  - `Reports`: Financial analytics, monthly trends, and exportable ledgers.
- **Real-Time WebSockets**:
  - Automatically joins private user room `user_${user.id}`.
  - Listens for `new_refund_request` events emitted when Sales staff rejects an order.
  - Displays interactive toast notification with a direct link to `/finance/refunds`.

---

## Refund Management (`/finance/refunds` - `RefundsPage.jsx`)
The Refund Management view empowers finance personnel to review and disburse refunds to customers whose orders were rejected by Sales staff.

### Key Components:
1. **Header Action Strip**:
   - Page title and descriptive subtitle.
   - Live **Refresh** button with real-time polling every 25 seconds.
2. **KPI Summary Stat Cards**:
   - **Pending Action**: Count of active refund requests and total pending ₱ liability awaiting return.
   - **Total Refunded**: Cumulative count of processed refunds and total ₱ capital disbursed.
   - **Disbursed Today**: Count and total ₱ value of refunds processed within the current day.
3. **Filter & Search Bar**:
   - Status Tabs: *All Refunds*, *Pending Action*, and *Completed*.
   - Live Search: Instant filtering across Order Reference (`#ORD-XXX`), Refund ID (`#REF-XXX`), Customer Name, Email, Contact Number, Payment Channel, and Transaction Reference.
4. **Interactive Refunds Table**:
   - Columns: Refund ID, Order Ref, Customer Details, Payment Channel, Refund Amount, Rejection Reason, Status Badge, and Action buttons.
   - Payment Channel Badges: Visual icons for GCash (blue), Bank Card (purple), and Bank Transfer (green).
   - Dynamic Badges: *Pending Return* (amber) and *Refunded* (emerald).
5. **Process Refund Dialog (`handleProcessRefund`)**:
   - Order & Customer snapshot card showing original payment details and total.
   - Pre-calculated refund amount (e.g. 50% downpayment or 100% full payment).
   - Return destination channel selector.
   - Transaction Reference Number input with **Auto Generate** helper (`GCASH-TXN-XXXXXXXX` / `BANK-REF-XXXXXXXX`).
   - Finance processing notes textarea.
   - Submitting triggers:
     - Database record update (`Refund.status = 'completed'`).
     - Order record update (`Order.paymentStatus = 'refunded'`).
     - Audit Expense entry creation.
     - Customer browser push alert via WebSocket.
     - Official HTML receipt email dispatch to the buyer.
6. **Refund Audit Voucher Dialog**:
   - Printable / reviewable audit slip with transaction timestamps, staff author, and item breakdown.
