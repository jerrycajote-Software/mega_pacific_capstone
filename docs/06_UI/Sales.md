# Sales Interface Specification

The Sales UI enables staff members to fulfill orders, monitor inventory levels, assist customers in real time, and reply to reviews.

---

## Access & Layout

- **Login URL**: `/sales-1megapacific/login`
- **Protected Layout**: `SalesLayout.jsx` (Sales Sidebar + Operational Top Bar)
- **Role Requirement**: `sales` (or `admin`)

---

## Pages & Features

### 1. Sales Dashboard (`/sales/dashboard`)
- **File**: `pages/sales/DashboardPage.jsx`
- **Design Intelligence**: UI/UX Pro Max Executive Cockpit & Operations Center.
- **Features**:
  - **Executive Header & Telemetry**: Dynamic time-of-day greeting ("Good morning / afternoon / evening"), live operations status indicator ("● Live Telemetry Stream"), and top-right quick shortcuts to Manage Orders, Support Inquiries, and animated Refresh.
  - **Urgency Alert Banner**: Smart conditional notification bar highlighting actionable items (pending orders awaiting approval, inquiries needing reply, and warehouse items below safety threshold).
  - **4-Card Bento KPI Grid**:
    - *Gross Revenue*: Tabular all-time sales total, completed order volume, and daily revenue delta.
    - *Order Pipeline*: Active orders count with breakdown pills for Pending Approval vs In Production.
    - *Active Dispatch*: Current orders out for delivery with freight and today's delivery count.
    - *Customer Sentiment*: 5-star average customer satisfaction score, unread inquiry counter, and pending review reply counter.
  - **Performance Velocity Barometer**:
    - *Today's Live Pulse*: Compact 4-tile grid for Orders Placed Today, Orders Delivered Today, Items Sold Today, and Today's Booked Revenue.
    - *7-Day Order Velocity Chart*: Interactive CSS micro-bar chart displaying weekly order volume, peak day indicator, and interactive tooltips on bar hover.
  - **Split Operations Center (2 Columns)**:
    - *Recent Orders Stream (Left)*: Segmented quick filters (`All`, `Pending`, `Approved`, `Completed`), real-time search filtering, customer avatar chips, monospace order ID pills, semantic glowing status badges, tabular totals, and quick manage actions.
    - *Top Selling Roofing Products (Left)*: Visual rank badges (🥇 #1, 🥈 #2, 🥉 #3), category tags, relative unit sales progress meter bars, tabular revenue, and stock readiness.
    - *Warehouse Stock Health (Right)*: SKU summary meters (Total SKUs, Profile Types, Net Warehouse Units, Out of Stock count), low-stock warning cards with remaining stock chips or stable buffer confirmation.
    - *Quick Operations Desk (Right)*: 1-click action shortcuts with real-time badges linking to Order Processing, Customer Support Desk, Review Management, and Warehouse Inventory.

### 2. Order Processing (`/sales/orders`)
- **File**: `pages/sales/OrderManagement.jsx`
- **Features**: Update order status, review roll-forming specifications, approve pending orders, and download/print branded Official Sales Receipts (PDF) directly from the orders table and details modal.

### 3. Inventory Monitoring (`/sales/inventory`)
- **Route**: Redirects directly to `/sales/pre-order-products` (made-to-order catalog with coil stock health).

### 4. Customer Service Workspace (`/sales/customer-service`)
- **File**: `pages/sales/CustomerService.jsx`
- **Design Intelligence**: UI/UX Pro Max Modern Support Desk (Intercom/Linear style).
- **Features**:
  - Split-pane layout: Left Ticket Inbox queue (~380px) and Right Active Conversation Desk.
  - Live WebSocket telemetry beacon (`Live Socket Stream Active`).
  - Pipeline KPI stat badges (Total, Open, In Progress, Resolved).
  - Search filtering by customer name, email, subject, or message content.
  - Segmented status tabs (`All`, `Open`, `Active`, `Resolved`).
  - Rich conversation view with customer profile chip (avatar, name, email, phone, location), relative timestamps, and color-coded sender bubbles.
  - Interactive status controls (`In Progress`, `Mark Resolved`, `Reopen Ticket`).
  - 1-click Quick Response macros (Greeting, Stock Check, Logistics ETA, Resolution).
  - Keyboard shortcut: `Enter` to send, `Shift+Enter` for new line.

### 5. Review Responses (`/sales/reviews`)
- **File**: `pages/sales/ReviewManagement.jsx`
- **Design Intelligence**: UI/UX Pro Max Executive Feedback Hub.
- **Features**:
  - 4-Card Bento KPI Summary row (Overall Rating, Awaiting Reply count, Satisfaction Score %, Sales Resolution Rate %).
  - Star breakdown meter and fast filter tabs (`All Reviews`, `Needs Reply`, `Replied`, `5 Stars`, `Critical 1-2★`).
  - Search input with clear button and multi-mode sorting (Newest, Oldest, Highest, Lowest).
  - Rich review cards with product badges, verified customer tags, and color-coded star ratings.
  - Interactive customer photo thumbnails with full-screen Lightbox viewer modal.
  - Official staff reply nested cards with staff role badge and edit controls.
  - Quick macro canned templates in reply modal (Gratitude, Quality Guarantee, Issue Follow-up, Appreciation).

### 6. Pre-Order Products Catalog Management (`/sales/pre-order-products`)
- **File**: `pages/sales/PreOrderProductsPage.jsx`
- **Features**:
  - **KPI Bento Cards**: Total Catalog Profiles (with Active vs Disabled breakdown), Industrial Thickness Gauges range, Standard 14 Finishes count, and Raw Coil Stock Health meters.
  - **Status Filtering Tabs**: `All (N)`, `Active (N)` (visible to customer), and `Disabled (N)` (hidden from customer).
  - **Interactive Customer Status Toggle**: Direct 1-click status pill button in the table row (`Active` vs `Disabled`) with glowing status dot and loading state. Toggling emits `product_catalog_updated` via Socket.IO.
  - **Create & Edit Modal**: Includes a prominent **Customer Catalog Visibility** banner and switch button allowing staff to disable or enable items during creation or editing.
  - **Dynamic Thickness Addition & Management**:
    - **Base & Variant Thickness Creation**: Sales staff can dynamically create new gauge thicknesses (e.g. `0.28mm`, `0.45mm`, `0.75mm`) directly from the Base Thickness dropdown or within variant rows via "+ Add New Thickness" modal.
    - **Persistence & Sorting**: Custom thicknesses are persisted and merged with standard roofing and decking gauges, sorted numerically in ascending order.
    - **Strict Duplicate Prevention**:
      - Global duplicate prevention stops duplicate entries in the available thickness options list.
      - Product-level duplicate prevention forbids assigning the Base Thickness to any variant, and prevents any two variants from sharing the same thickness.
      - Invariant dropdowns automatically disable and annotate thicknesses currently used by the base item or other variants (`Base Thickness: Duplicate Not Allowed`, `Used in Variant #X: Duplicate Not Allowed`).
      - Real-time reactive warnings highlight conflicting rows, and form submission is guarded against duplicates on both frontend and backend.
  - **Real-Time Client Sync**: Real-time Socket.IO synchronization instantly omits disabled items from customer view without requiring page refreshes.
  - **Safe Delete & Archiving**: Automatically detects historical customer orders and archives profiles rather than hard-deleting to preserve audit integrity.

