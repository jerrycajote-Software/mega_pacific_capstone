# Customer Interface Specification

The Customer UI is designed for intuitive product browsing, customized roofing order calculation, purchasing, and live support.

---

## Access & Layout

- **Login URL**: `/login`
- **Register URL**: `/register`
- **Protected Layout**: `CustomerLayout.jsx` (Header + Main Body with ErrorBoundary + Footer + CustomerServiceWidget)
- **Brand Identity & Layout Design**: Unified header, mobile navigation, and customer authentication pages (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`) to strictly match the official corporate footer logo design (`MEGA` in `#1e3a8a`, `PACIFIC` in `#0f172a` [light mode] / `#f8fafc` [dark mode], and `METAL AND STEEL CORP` subtitle in `#64748b` with `letterSpacing: 0.2em`).
- **Role Requirement**: `customer`

---

## Pages & Key Components

### 1. Customer Dashboard & Catalog (`/dashboard`, `/products`)
- **Files**: `pages/customer/DashboardPage.jsx`, `components/HeroSection.jsx`
- **Features**: Product catalog with filtering by product type, search bar, and hero banner with direct 3D Roof Designer CTA (removed redundant "Browse Products" button since the catalog is rendered directly beneath the banner).
- **Dynamic Visibility & Active Status**: Strictly displays active pre-order items (`isActive: true`). Disabled items toggled by the Sales team are excluded at both the API level (`/api/customer/products`) and the client-side state. Listens to real-time `product_catalog_updated` Socket.IO events to refresh instantly when products are enabled or disabled.

### 2. Product Details (`/product/:id`)
- **Files**: `pages/customer/ProductDetails.jsx`, `pages/customer/buildProductOptions.js`, `components/AddProductToOrderModal.jsx`
- **Features**: Multi-image thumbnail zoom gallery, variant selector (per meter, length options), custom cut-length calculation, thickness & color selection, dynamic price calculator, ratings breakdown, and primary "Pre-Order Now" action button. (Quotation export is consolidated into Checkout to ensure 100% calculation accuracy with destination freight and vehicle loading).
- **Optional Multi-Product Order Building**: Removed automatic/unsolicited recommended product suggestions ("Frequently Added Together"). Replaced with a clean, user-driven "+ Add Another Product" feature that opens the catalog modal (`AddProductToOrderModal.jsx`) allowing customers to customize and bundle additional profiles, trims, flashings, or accessories into a single order with live combined totals and instant checkout.
- **Disabled Item Guard**: If a user attempts to access a disabled item via direct URL or cached link, the page displays a clear notice that the pre-order item is currently disabled and unavailable, blocking order placement.

### 3. Direct Pre-Order Customization & Checkout (`/checkout`)
- **Files**: `pages/customer/Checkout.jsx`, `components/AddProductToOrderModal.jsx`, `components/ShippingInfoWidget.jsx`, `components/PaymentMethodWidget.jsx`
- **Design Philosophy**: All roofing products are custom made-to-order (pre-order fabrication). The generic e-commerce "Cart" was retired to streamline customer ordering directly into configuration and checkout.
- **Features**: 3-step structured workflow (`Fulfillment & Destination`, `Payment Terms & Billing`, `Review & Guarantees`), touch-target fulfillment toggle cards (Jobsite Delivery vs. Plant Pick-up), address book selector with jobsite notes, 50/50 downpayment vs. 100% upfront options, manufacturer trust badges, and BIR invoice compliance note.
- **Formal Project Quotation Export**: Features "Export Project Quotation (PDF)" in the order summary panel, producing an official trade quotation containing the exact jobsite destination, calculated distance-based fleet freight (e.g., Elf 6-Wheeler), bundled accessories, and structured 50% manufacturing downpayment terms.
- **Interactive Multi-Item Order Management**: Full in-checkout item modification allowing customers who selected 1 item to add more items before paying. Features item stepper controls (`-` / `+`), item deletion, "+ Add another cut/length of this profile" quick links, and reactive subtotal/discount/delivery fee recalculation.
- **Cross-Product Add-ons**: Built-in "Add More Items to This Order" quick-selection card and a modal catalog browser (`AddProductToOrderModal.jsx`) allowing customers to customize and add any other roofing profile, trim, or accessory (with thickness, color swatches, cut lengths, and directly editable sheet/unit quantity input with stepper controls) into the checkout order before proceeding to payment. Automatically filters to active products only.
- **Browser Navigation Lock & Exit Protection**: Employs an HTML5 History trap (`pushState` + `popstate`) and `beforeunload` guard to prevent customers from accidentally leaving checkout, losing customized configurations, or triggering double orders via browser back/forward arrows. Intercepts navigation attempts with a clear Material-UI "Leave Checkout?" confirmation modal.

### 4. Orders History & Tracking Details (`/orders`, `/order/:id`)
- **Files**: `pages/customer/OrdersPage.jsx`, `pages/customer/OrderDetails.jsx`
- **Features**: 
  - **Orders Dashboard (`/orders`)**:
    - **4-Column Key Metrics Bar**: Live summary counters for Total Orders, In Progress (active queue), Completed (delivered & picked up), and Total Spent.
    - **Categorized Status Tabs**: Clean chip filtering for *All Orders*, *In Progress*, *Ready for Pick-up*, *Completed*, and *Cancelled*.
    - **Smart Payment Parser**: Automatically cleans raw database payment strings (such as downpayment installments) into structured, readable badges and sub-captions.
    - **Priority Dispatch Alerts**: Highlights orders staged at Plant Loading Dock 1 with immediate access to retrieval passes.
    - **Streamlined Order Cards**: Displays product thumbnails, profile cut counts, item quantities, formatted price totals, and 1-click PDF receipt export.
  - **Order Tracking & Details (`/order/:id`)**:
    - Dynamic fulfillment status resolution across all order states (Pending, Processing/Fabrication, Ready for Pick-up, Out for Delivery, Delivered/Completed, and Cancelled).
    - High-clarity 2-column master-detail layout:
      - **Main Column (Left)**: Ordered Products with profile specification tags (custom length, thickness, color swatches), quantity calculations with custom length multipliers and per-meter formulas (`₱unitPrice/m × length × qty`), verified review prompts and modal, plus handover/loading dock location or jobsite delivery address.
      - **Sidebar (Right)**: Financial breakdown displaying true calculated items subtotal, dynamic fleet delivery logistics fee (or free plant pick-up handling), total order value, 50% downpayment / delivery balance split (for COD/installment plans), official receipt PDF generator action, and dispatch assistance hotline.
    - Interactive Stepper ("Order Fulfillment Journey") featuring active stage pulsing, completed checkmarks, and responsive connector tracks.
    - Digital Retrieval Pass card for Store Pick-up orders with QR pass code (`#ORD-XXXX`), plant dock operating schedule, and 1-click retrieval pass download.
    - **Official Receipt & Calculation Accuracy**: Both the automated receipt email service (`emailService.js`) and client-side PDF document generator (`documentGenerator.js`) dynamically calculate true freight fees and cut-length multipliers, eliminating hardcoded fallback fees and LAN tracking IP references.


### 5. Profile Management (`/profile`)
- **File**: `pages/customer/ProfilePage.jsx`
- **Features**: 
  - **Responsive 2-Column Master-Detail Layout**:
    - **Customer Identity Column (Left)**: Stylized user avatar, verified account chips, registration hub metadata, saved address metrics, and a direct shortcut to *Track My Orders*.
    - **Address Book Column (Right)**: Cohesive multi-card jobsite and delivery address grid (`repeat(auto-fill, minmax(290px, 1fr))`) eliminating uneven wrapping and awkward whitespace.
  - **Highlighted Default Address**: Active primary jobsite card highlighted with green border accents, soft background tint, and star badge.
  - **Modal Address Management**: Modern modal workflow for adding and editing addresses with auto-populated CALABARZON cities and automatic postal code resolution.
  - **Safety Confirmations**: Non-blocking Material-UI dialog confirmations for address deletions and auto-dismissing toast feedback.

### 6. 3D Roof Designer (`/roof-designer`)
- **Files**: `pages/customer/roof-designer/RoofDesignerPage.jsx`, `components/MobileWarningScreen.jsx`, `utils/deviceDetect.js`
- **Features**: Interactive 3D WebGL roof customizer with real-time bill-of-materials and roof pitch visualization.
- **Hardware Safeguard**: Restricted to desktop computers / high-spec devices. Mobile phones (including those with "Desktop Site" mode toggled) are intercepted by `MobileWarningScreen.jsx` to prevent WebGL context loss and device freezing.

### 7. Mobile Navigation & Responsive Experience
- **File**: `components/CustomerBottomNav.jsx`
- **Features**: Touch-optimized fixed bottom navigation bar on mobile viewports (`xs`) providing 3 clean primary tabs: Home, Catalog, and Profile (with order tracking consolidated directly inside the customer profile).

### 8. Live Support Widget
- **File**: `components/CustomerServiceWidget.jsx`
- **Features**: Floating chat widget connecting customer directly to sales staff via Socket.IO real-time channels.

### 9. Customer Registration & Authentication (`/register`)
- **File**: `pages/customer/RegisterPage.jsx`
- **Features**:
  - **MUI Grid v2 Layout Stabilization**: Resolved field squishing on Province, City/Municipality, and Barangay dropdowns by using standard `size={{ xs: 12, sm: 6 }}` properties.
  - **Structured 3-Section Grouping**: Form fields are organized into Personal Information, Account Security, and Delivery Address (CALABARZON hierarchy).
  - **Interactive Password Strength Meter**: Live 4-tier strength bar (Weak, Fair, Good, Strong) with real-time requirement indicators and password match validation badge.
  - **Mobile Browser Optimization**: Configured `fontSize: 16px` on mobile inputs to eliminate iOS Safari auto-zooming, added native `inputMode="tel"` and `autoComplete` attributes, and capped dropdown menu heights (`maxHeight: 260px`) for comfortable touch navigation.
  - **Philippine Contact Number Format Enforcement**: Enforces strict 11-digit format starting with `09` (`09XXXXXXXXX`), with real-time numeric clamping and sanitization of `+63` and `9` prefixes.

