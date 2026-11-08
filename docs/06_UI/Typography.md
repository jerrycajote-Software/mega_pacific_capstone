# Mega Pacific Typography Design System

## Overview

The typography system for Mega Pacific Metal & Steel Corp. adheres to e-commerce and enterprise ERP best practices. It balances brand identity, high readability across mobile/tablet/desktop, and lightning-fast load times.

## Core Rules

1. **Strict 3-Font Limit**: To maximize performance and maintain cohesive visual hierarchy, only 3 fonts are used:
   - **Body Text & Tabular Data**: `Inter`
   - **Headings & Structural Titles**: `Montserrat`
   - **Accents & Promotional Badges**: `Bebas Neue`
2. **Brand Wordmark**: The official corporate wordmark (`MEGA PACIFIC METAL AND STEEL CORP`) retains `Arial, sans-serif` for brand asset fidelity.
3. **No Inappropriate Fonts**:
   - **Serif Fonts (Playfair Display, Merriweather, Lora)**: Excluded because editorial/fashion serifs conflict with heavy industrial steel manufacturing, coil specifications, and ERP operational workflows.
   - **Script Fonts (Lobster)**: Excluded as whimsical cursive styling is inappropriate for construction and industrial engineering.

## Font Stack Specifications

### 1. Primary Body Font: `Inter`
- **Role**: Default interface font, tables, forms, buttons, cards, list items, and modal dialogs.
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold), 800 (Extra-bold).
- **CSS Variable**: `--font-body: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
- **Why Chosen**: Tall x-height, clear numeric tabular alignment, and legibility across all screen sizes.

### 2. Primary Heading Font: `Montserrat`
- **Role**: `h1` through `h6`, section headers, modal headers, page titles, and widget headers.
- **Weights**: 600 (Semi-bold), 700 (Bold), 800 (Extra-bold), 900 (Black).
- **CSS Variable**: `--font-heading: 'Montserrat', 'Poppins', sans-serif;`
- **Why Chosen**: Geometric, architectural structure that projects strength, durability, and modern engineering.

### 3. Promotional & Display Accent Font: `Bebas Neue`
- **Role**: Promotional badges, factory-direct tags, hero ribbons, and discount percentage callouts.
- **Weights**: 400 (Regular).
- **CSS Variable**: `--font-display: 'Bebas Neue', sans-serif;`
- **Utility Classes**: `.font-display`, `.accent-display`, `.promo-badge`.
- **Why Chosen**: Compact all-caps uppercase design suited for industrial labels and sale announcements without taking excessive horizontal width.

## Portal Applicability

The typography rules apply across all Mega Pacific interfaces:
- **Customer Storefront**: E-commerce catalog, Hero section, Product details, 3D Roof Designer, Checkout, Profile, and Orders.
- **Sales Portal**: Sales dashboard, Pre-order products, Order approval management, and Customer service chat.
- **Finance Portal**: Finance dashboard, Expenses ledger, Payments verification, Refunds queue, and Reports.
- **Logistics Portal**: Logistics dashboard, Deliveries tracking, and Coil inventory management.
- **Owner Portal**: Executive analytics, Revenue monitoring, and Business health.
- **Admin Portal**: Backoffice operations, User accounts, Staff clearance, Review management, and Settings.
- **Super Admin Portal**: Live system status, Session monitoring, and Platform audit logs.

## Performance Optimization

- Fonts are loaded via Google Fonts with `preconnect` in `index.html`.
- Uses `display=swap` to avoid Flash of Invisible Text (FOIT).
- Centralized through `ThemeContext.jsx` for Material UI and `index.css` for Tailwind CSS and native HTML elements.
