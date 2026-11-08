# Custom Animated Navigation Icons Specification

## Overview

The Mega Pacific web application employs custom-crafted, full-color animated vector icons for layout navigation sidebars. Replacing generic monochrome glyphs, these icons enhance the user experience with subtle ambient animations and hover reactivity.

Each icon is maintained as an isolated, reusable React component within `frontend/src/components/icons/` with hardware-accelerated CSS animations configured in `customIcons.css`.

---

## Icon Catalog & Mapping

| Component | Target Layout | Route / Role | Visual Theme & Keyframe Animation |
| :--- | :--- | :--- | :--- |
| `CustomDashboardIcon` | **All 5 Layouts** (Sales, Finance, Logistics, Admin, Owner) | `/dashboard` | Multi-tile telemetry hub with cyan/indigo gradients, pulsating live status node, and undulating data bars. |
| `CustomPreOrderIcon` | **Sales** | `/sales/pre-order-products` | Commercial freight package with golden security straps, advance reservation clock, and glittering star. |
| `CustomOrdersIcon` | **Sales** | `/sales/orders` | Shopping trolley carrying verified order docket, emerald green check badge, and spinning alloy wheels on hover. |
| `CustomReviewsIcon` | **Sales** | `/sales/reviews` | Feedback speech bubble with 24K dimensional gold rating star and shimmering sparkles. |
| `CustomSupportIcon` | **Sales** | `/sales/customer-service` | Pro customer headset in sunset coral with sound wave pings and active microphone beacon. |
| `CustomExpensesIcon` | **Finance** | `/finance/expenses` | Itemized accounting voucher with saw-tooth edge, downward outflow arrow, and floating Philippine Peso coin. |
| `CustomPaymentIcon` | **Finance** | `/finance/payments` | Electric emerald smart credit card with radiating contactless NFC arcs and gleaming 24K gold EMV chip. |
| `CustomRefundsIcon` | **Finance** | `/finance/refunds` | Dual rotating return arrows in sapphire and amber with centered pulsing currency token. |
| `CustomReportsIcon` | **Finance** | `/finance/reports` | Analytical clipboard with rising tri-color performance metric bars and upward green trend arrow. |
| `CustomDeliveriesIcon` | **Logistics** | `/logistic/deliveries` | Heavy freight transport carrier loaded with roofing cargo, continuous wheel rotation, and wind speed dashes. |
| `CustomCoilInventoryIcon` | **Logistics** | `/logistic/products` | Industrial pre-painted steel sheet master coil roll with metallic luster sweep and barcode inventory tag. |
| `CustomUsersIcon` | **Admin** | `/admin/users` | Multi-user customer network with buoyant avatar floating motion and interconnected telemetry nodes. |
| `CustomStaffManagementIcon` | **Admin** | `/admin/accounts` | Executive security ID badge with pendulum lanyard swing motion, holographic border, and authority star. |
| `CustomSettingsIcon` | **Admin** | `/admin/settings` | Dual precision interlocking gearwheels with synchronized counter-rotations and central power core. |
| `CustomNavToggleIcon` | **All 5 Layouts** | Sidebar Header | Miniature sidebar dock panel with glowing navigation rails and animated directional toggle chevrons flipping smoothly between expanded (`<<`) and collapsed (`>>`) states. |
| `CustomGrossRevenueIcon` | **Sales** | `/sales/dashboard` (Gross Revenue KPI) | Ascending emerald financial metric bars with soaring upward trendline, gleaming Philippine Peso (₱) coin, and telemetry glow. |
| `CustomOrderPipelineIcon` | **Sales** | `/sales/dashboard` (Order Pipeline KPI) | Industrial amber chronometer timer gauge with rotating clock hand, fabrication queue channel, and flowing order telemetry capsules. |
| `CustomActiveDispatchIcon` | **Sales** | `/sales/dashboard` (Active Dispatch KPI) | High-speed commercial freight carrier loaded with roofing sheet profiles, rolling alloy wheels, velocity dashes, and live GPS radar ping. |
| `CustomCustomerSentimentIcon` | **Sales** | `/sales/dashboard` (Customer Sentiment KPI) | Sunset violet acoustic customer service headset with voice wave arcs, gleaming 24K gold rating star, and active microphone beacon. |
| `CustomFinanceRevenueIcon` | **Finance** | `/finance/dashboard` (Total Revenue KPI) | Angled security banknote with guilloche watermark, 3D cylindrical coin stack with embossed Philippine Peso (₱) symbol, and upward fiscal velocity micro-motion. |
| `CustomFinancePendingIcon` | **Finance** | `/finance/dashboard` (Pending Payments KPI) | Industrial golden chronometer with progress arc, dynamic clock sweep hand, pending verification coin stack, and pulsating amber telemetry alert beacon. |
| `CustomFinanceExpensesIcon` | **Finance** | `/finance/dashboard` (Total Expenses KPI) | Multi-category segmented financial donut chart, approved disbursal voucher ticket with serrated edge, and outbound cost-allocation trajectory micro-motion. |
| `CustomFinanceNetIncomeIcon` | **Finance** | `/finance/dashboard` (Net Operating Income KPI) | Ascending 3D financial EBITDA histogram pillars, soaring profitability sparkline curve with glowing apex beacon, and fiscal yield diamond emblem micro-motion. |
| `CustomRefundPendingIcon` | **Finance** | `/finance/refunds` (Pending Action KPI) | Precision golden hourglass with trickling sand particles, circular payment reversal return loop arc, and pulsating amber telemetry alert beacon. |
| `CustomRefundCompletedIcon` | **Finance** | `/finance/refunds` (Total Refunded KPI) | Emerald verification shield seal with dimensional checkmark, orbiting returned currency token with Philippine Peso (₱) emblem, and radiant sparkle ping. |
| `CustomRefundDisbursedTodayIcon` | **Finance** | `/finance/refunds` (Disbursed Today KPI) | Executive sapphire financial wallet, emerging disbursement banknote, metallic golden clasp, and live fiscal disbursement telemetry spark. |
| `CustomLogisticReadyToShipIcon` | **Logistics** | `/logistic/dashboard` (Orders Ready to Ship KPI) | Industrial corrugated freight carton with reinforced banding straps, courier dispatch barcode label, and pulsating amber readiness alert beacon. |
| `CustomLogisticOutForDeliveryIcon` | **Logistics** | `/logistic/dashboard` (Out for Delivery KPI) | Aerodynamic commercial delivery freight truck carrying roofing profiles, velocity wind trails, rolling alloy wheels, and active in-transit GPS radar pin. |
| `CustomLogisticCompletedTodayIcon` | **Logistics** | `/logistic/dashboard` (Completed Today KPI) | Dimensional emerald fulfillment rosette seal with beveled triumph checkmark, success fulfillment ribbon, and radiant achievement gleam spark. |
| `CustomLogisticStorePickupIcon` | **Logistics** | `/logistic/dashboard` (Store Counter Pickups KPI) | Warehouse depot counter storefront with striped awning, customer fulfillment parcel waiting at counter, and pickup retrieval telemetry radar. |
| `CustomLogisticsDetailsIcon` | **Logistics** | `/logistic/deliveries` (Quick Logistics Actions) | Digital logistics dispatch manifest docket with folded corner, itemized checklist lines, telemetry scan beam, and emerald verification badge. |
| `CustomAdminCustomersIcon` | **Admin** | `/admin/dashboard`, `/admin/users` | Customer directory network with executive avatar, connected user nodes, and pulsating blue telemetry beacon. |
| `CustomAdminStaffIcon` | **Admin** | `/admin/dashboard`, `/admin/users` | Departmental credential lanyard pass with Singleton 1:1 golden authority star and swinging pendulum micro-motion. |
| `CustomAdminVerificationIcon` | **Admin** | `/admin/dashboard` | Emerald cryptographic security shield with OTP verified checkmark and radiant gleam spark. |
| `CustomAdminSecurityFlagsIcon` | **Admin** | `/admin/dashboard` | Amber cyber threat warning triangle with radar perimeter scanning and alert beacon. |
| `CustomAdminUserAccountIcon` | **Admin** | `/admin/users` | Individual verified customer profile account with emerald badge, rotating outer disc, and avatar bob micro-motion. |
| `CustomAdminSuspendedIcon` | **Admin** | `/admin/users` | Security prohibition slash ring for suspended accounts with conditional crimson alert pulse. |
| `CustomAdminConcurrencyIcon` | **Admin** | `/admin/settings` | Multi-device workstation monitor with connected mobile phone and radiating wireless sync waves. |
| `CustomAdminFacilityIcon` | **Admin** | `/admin/settings` | Heavy steel manufacturing plant with sawtooth roof profiles, chimney smoke plumes, and rotating gear. |
| `CustomAdminPasswordGuardIcon` | **Admin** | `/admin/settings` | Fortified padlock shield with cryptographic golden key, lock shackle, and verification spark. |
| `CustomAdminPlatformGuardIcon` | **Admin** | `/admin/settings` | Emerald cybersecurity core with orbiting WebSocket satellite nodes and live network telemetry ping. |
| `CustomOwnerRevenueIcon` | **Owner** | `/owner/dashboard` (Gross Revenue KPI) | Executive gold/amber theme with ascending 3D wealth pillars, soaring profit trendline, and embossed 24K gold Philippine Peso (₱) coin. |
| `CustomOwnerCoilStockIcon` | **Owner** | `/owner/dashboard` (Raw Coil Stock KPI) | Industrial cyan/sky theme with master steel roll, concentric cylinder layer rings, arbor spindle hole, and unfurled steel sheet ribbon. |
| `CustomOwnerInventoryValueIcon` | **Owner** | `/owner/dashboard` (Total Inventory Value KPI) | Emerald/mint capital asset vault safe with recessed door, precision combination dial, and stacked gold bullion bars. |
| `CustomOwnerOrdersVolumeIcon` | **Owner** | `/owner/dashboard` (Total Orders KPI) | Executive rose/coral order fulfillment trolley with loaded parcel, verified docket manifest, and rolling alloy wheels. |
| `CustomOwnerAvgOrderValueIcon` | **Owner** | `/owner/dashboard` (Avg Order Value KPI) | Royal violet/purple analytical yield balance scale with ascending fiscal trajectory vector curve and radiant apex star. |
| `CustomCustomerTotalOrdersIcon` | **Customer** | `/customer/orders` (Total Orders KPI) | Commercial roofing tote order bag with royal blue gradient, arched gold handles, protruding order docket, and gleam star. |
| `CustomCustomerInProgressIcon` | **Customer** | `/customer/orders` (In Progress KPI) | Industrial amber chronometer timer gauge with dynamic rotating clock sweep needle, fabrication gear, and telemetry radar pulse. |
| `CustomCustomerCompletedIcon` | **Customer** | `/customer/orders` (Completed KPI) | Emerald triumph fulfillment rosette seal with golden victory ribbons, bold beveled checkmark, and victory gleam sparkles. |
| `CustomCustomerTotalSpentIcon` | **Customer** | `/customer/orders` (Total Spent KPI) | Executive forest green leather wallet, protruding banknote, 3D cylindrical gold coin with Philippine Peso (₱) glyph, and coin shimmer. |

---

## File Architecture

All custom icons adhere to clean architecture and modular separation:
```
frontend/src/components/icons/
├── customIcons.css                    # Shared GPU-accelerated CSS keyframe animations
├── index.js                           # Central barrel export
├── CustomDashboardIcon.jsx            # Reused across all 5 layouts
├── CustomNavToggleIcon.jsx            # Custom collapse/expand toggle for all 5 sidebars
├── CustomGrossRevenueIcon.jsx         # Sales Dashboard Gross Revenue KPI
├── CustomOrderPipelineIcon.jsx        # Sales Dashboard Order Pipeline KPI
├── CustomActiveDispatchIcon.jsx       # Sales Dashboard Active Dispatch KPI
├── CustomCustomerSentimentIcon.jsx    # Sales Dashboard Customer Sentiment KPI
├── CustomFinanceRevenueIcon.jsx       # Finance Dashboard Total Revenue KPI
├── CustomFinancePendingIcon.jsx       # Finance Dashboard Pending Payments KPI
├── CustomFinanceExpensesIcon.jsx      # Finance Dashboard Total Expenses KPI
├── CustomFinanceNetIncomeIcon.jsx     # Finance Dashboard Net Operating Income KPI
├── CustomRefundPendingIcon.jsx        # Finance Refunds Pending Action KPI
├── CustomRefundCompletedIcon.jsx      # Finance Refunds Total Refunded KPI
├── CustomRefundDisbursedTodayIcon.jsx # Finance Refunds Disbursed Today KPI
├── CustomLogisticReadyToShipIcon.jsx  # Logistic Dashboard Orders Ready to Ship KPI
├── CustomLogisticOutForDeliveryIcon.jsx # Logistic Dashboard Out for Delivery KPI
├── CustomLogisticCompletedTodayIcon.jsx # Logistic Dashboard Completed Today KPI
├── CustomLogisticStorePickupIcon.jsx  # Logistic Dashboard Store Counter Pickups KPI
├── CustomLogisticsDetailsIcon.jsx     # Deliveries Quick Logistics Actions Button
├── CustomAdminCustomersIcon.jsx       # Admin Dashboard & Users Customers KPI
├── CustomAdminStaffIcon.jsx           # Admin Dashboard & Users Operational Staff KPI
├── CustomAdminVerificationIcon.jsx    # Admin Dashboard Verification Health KPI
├── CustomAdminSecurityFlagsIcon.jsx   # Admin Dashboard Security Flags KPI
├── CustomAdminUserAccountIcon.jsx     # Admin Users Customer Accounts KPI
├── CustomAdminSuspendedIcon.jsx       # Admin Users Suspended Accounts KPI
├── CustomAdminConcurrencyIcon.jsx     # Admin Settings Device Concurrency KPI
├── CustomAdminFacilityIcon.jsx        # Admin Settings Manufacturing Facility KPI
├── CustomAdminPasswordGuardIcon.jsx   # Admin Settings Password Complexity Guard KPI
├── CustomAdminPlatformGuardIcon.jsx   # Admin Settings Platform Guard Status KPI
├── CustomOwnerRevenueIcon.jsx         # Owner Dashboard Gross Revenue KPI
├── CustomOwnerCoilStockIcon.jsx       # Owner Dashboard Raw Coil Stock KPI
├── CustomOwnerInventoryValueIcon.jsx  # Owner Dashboard Total Inventory Value KPI
├── CustomOwnerOrdersVolumeIcon.jsx    # Owner Dashboard Total Orders Volume KPI
├── CustomOwnerAvgOrderValueIcon.jsx   # Owner Dashboard Average Order Value KPI
├── CustomCustomerTotalOrdersIcon.jsx  # Customer Orders Total Orders KPI
├── CustomCustomerInProgressIcon.jsx   # Customer Orders In Progress KPI
├── CustomCustomerCompletedIcon.jsx    # Customer Orders Completed KPI
├── CustomCustomerTotalSpentIcon.jsx   # Customer Orders Total Spent KPI
├── CustomPreOrderIcon.jsx
├── CustomOrdersIcon.jsx
├── CustomReviewsIcon.jsx
├── CustomSupportIcon.jsx
├── CustomExpensesIcon.jsx
├── CustomPaymentIcon.jsx
├── CustomRefundsIcon.jsx
├── CustomReportsIcon.jsx
├── CustomDeliveriesIcon.jsx
├── CustomCoilInventoryIcon.jsx
├── CustomUsersIcon.jsx
├── CustomStaffManagementIcon.jsx
└── CustomSettingsIcon.jsx
```

## Selection Highlight System (Dark & Light Theme Compatible)

The navigation tabs feature a high-contrast, modern active highlight with double-layer reliability (`style` prop fallback + `.nav-link.active` / `[data-active="true"]` CSS rules):
- **Dark Mode (`[data-theme="dark"]` / staff portals default)**:
  - Background: Gradient `linear-gradient(90deg, rgba(34, 197, 94, 0.28) 0%, rgba(16, 185, 129, 0.16) 60%, rgba(34, 197, 94, 0.08) 100%)`.
  - Border: `1.5px solid rgba(74, 222, 128, 0.65)`.
  - Box Shadow: `0 4px 20px -2px rgba(34, 197, 94, 0.35)`.
  - Left Indicator Pill: 4px neon glowing vertical bar with animated pulse (`#4ade80` to `#22c55e`).
  - Typography: Emboldened `#ffffff` (font weight 750) with subtle emerald neon text glow.
- **Light Mode (`[data-theme="light"]`)**:
  - Background: Crisp mint background `#dcfce7`.
  - Border: `1.5px solid #22c55e`.
  - Box Shadow: `0 4px 14px rgba(34, 197, 94, 0.25)`.
  - Left Indicator Pill: High-contrast `#16a34a` vertical bar with soft green ambient glow.
  - Typography: High-contrast `#15803d` rich forest green (font weight 750).
- **Owner Layout Variant**:
  - Light Mode: Warm cream gold `#fef3c7`, `#92400e` amber typography, and `1.5px solid #f59e0b` border.
  - Dark Mode: Golden amber glass `linear-gradient(90deg, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.18) 60%, rgba(245, 158, 11, 0.08) 100%)` with `#fbbf24` accents.
- **Double-Layer Highlighting**:
  - Handled via `useAdminTheme()` and direct `style` callback on `<NavLink>`, ensuring instant, zero-delay rendering that is impervious to CSS cascade overrides or missing root attributes.

## Standard Props

Every custom icon component supports:
- `size` (Number, default: `20`): Icon width and height in pixels.
- `className` (String, default: `''`): Extra CSS classes passed directly to the root SVG element.
- `isCollapsed` (Boolean, on `CustomNavToggleIcon`): Directional state for sidebar expansion/collapse.

## Iconography Guidelines: Chevron Right (`>`) Standard

For all layout navigation hubs, drill-down buttons, breadcrumbs, and data table row action buttons:
- **Prohibited**: Raw horizontal arrows (ex. `ArrowForwardIcon`, `->`, `→`, `East`).
- **Required**: Sleek right chevrons (`>`) such as `ChevronRightIcon` from `@mui/icons-material/ChevronRight`.
- **Rationale**: Chevrons maintain optical alignment with text labels, eliminate harsh horizontal bar clutter in dense data grids, and provide an understated modern aesthetic across both light and dark themes.

