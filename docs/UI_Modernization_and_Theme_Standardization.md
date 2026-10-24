# UI Modernization and Theme Standardization

## The Problem Encountered
The project originally used a basic styling setup with Tailwind CSS and Lucide React icons, which lacked the premium aesthetic and comprehensive components required for a modern e-commerce customer portal. The customer-facing UI needed to be migrated to Material UI (MUI) to achieve a vibrant, standardized design (using a permanent `#ecf39e` background and Google Fonts like Poppins and Inter), while ensuring the Admin pages remained untouched in their original Tailwind-based dark theme. 

During the final review of the migration, a specific issue was encountered when running the application: 
`[plugin:vite:import-analysis] Failed to resolve import "@mui/icons-material/ChatBubbleOutline" from "src/pages/customer/ProductDetails.jsx". Does the file exist?`
This occurred because the `ChatBubbleOutline` icon file was not found under that exact name in the installed version of `@mui/icons-material`.

## The Steps Taken to Resolve the Issue
1. **Identified the Import Error**: Read the error message provided by Vite via the browser overlay, which explicitly stated that `@mui/icons-material/ChatBubbleOutline` could not be resolved in `ProductDetails.jsx`.
2. **Investigated the Available Icons**: Ran a directory listing command within the local `node_modules/@mui/icons-material` directory to find all icons starting with `ChatBubble`.
3. **Discovered the Correct Icon Name**: The search revealed that the available icon files were named `ChatBubbleOutlined.js`, `ChatBubbleOutlineOutlined.js`, etc., rather than just `ChatBubbleOutline.js`.
4. **Updated the Source Code**: Modified the import statement in `ProductDetails.jsx` to correctly point to `@mui/icons-material/ChatBubbleOutlineOutlined`.

## The Specific Commands Used
To find the correct icon name in the `node_modules` directory:
```powershell
dir "c:\Users\Jerry Cajote\Documents\Capstone Project\mega_pacific\frontend\node_modules\@mui\icons-material\ChatBubble*.js"
```

## The Implementation Plan
This plan outlines the complete migration of the customer-facing UI to a modern, standardized design system using Material UI (MUI) and Google Fonts.

### 1. Setup & Theming
- **`theme.js`**: Create a centralized MUI Theme configuration incorporating the required color palette (`#ecf39e`, `#4f772d`, etc.) and typography (Poppins for headings, Inter for body).
- **`main.jsx`**: Wrap the `<App />` component with MUI's `<ThemeProvider>` and `<CssBaseline>` to inject the new theme globally. Load the Google Fonts via standard imports.

### 2. Layout Components
- **`CustomerHeader.jsx`**: Create a new AppBar-based navigation header matching the new aesthetic.
- **`HeroSection.jsx`**: Build a professional e-commerce hero section with CTA buttons and promotional banners using MUI.
- **`Footer.jsx`**: Implement a comprehensive footer with links, categories, and social icons.

### 3. Page Refactoring (Lucide -> MUI Icons & Custom UI -> MUI Components)
- **Authentication Pages**: Refactor `LoginPage.jsx` and `RegisterPage.jsx` to use MUI `TextField`, `Button`, and typography. Ensure the forms are wrapped in MUI `Paper` or `Card` components.
- **Product Catalog & Details**: Refactor `ProductCatalog.jsx` and `ProductDetails.jsx`. 
  - Modernize the `ProductCard` to use MUI `<Card>`, `<CardMedia>`, and `<Rating>`.
  - Use `<ImageList>` and `<Chip>` for variants and tags.
  - Update `ProductReviews` to use MUI `<Rating>` and `<Avatar>`.
- **Checkout & Cart**: Refactor `Cart.jsx`, `Checkout.jsx`, and `OrderDetails.jsx`. 
  - Replace all custom inputs and Lucide icons with MUI equivalents.
  - Apply the new light card backgrounds (`#ffffff`) against the permanent background (`#ecf39e`).
- **Dashboard & Profile**: Refactor `DashboardPage.jsx` and `ProfilePage.jsx` to align with the new structural system (SRP/ISP).

### Verification Plan
- Ensure the project builds successfully with no missing peer dependencies for MUI.
- Lint check to ensure unused Lucide imports are fully purged from customer components.
- Visual inspection of all specified customer pages (Home, Catalog, Details, Cart, Checkout, Profile, Login, Register).
- Verify the permanent background color is exactly `#ecf39e` on customer pages.
- Verify Admin pages remain untouched and retain their previous dark theme.
- Confirm fonts reflect Poppins (Headings) and Inter (Body).
- Verify responsive layouts using browser DevTools.

## The List of Tasks
- `[x]` **Setup & Theming**
  - Install MUI dependencies (`@mui/material @emotion/react @emotion/styled @mui/icons-material`).
  - Create `frontend/src/theme.js` with color palette and Google Fonts typography.
  - Update `frontend/src/main.jsx` with `<ThemeProvider>` and `<CssBaseline>`.
  - Import Google Fonts (Poppins, Inter) in `index.css` or `index.html`.
- `[x]` **Layout Components**
  - Create `CustomerHeader.jsx` with MUI components.
  - Create `Footer.jsx`.
  - Create `HeroSection.jsx`.
- `[x]` **Refactor Authentication Pages**
  - `LoginPage.jsx`
  - `RegisterPage.jsx`
- `[x]` **Refactor Product Pages**
  - `ProductCatalog.jsx` (handled in Dashboard)
  - `ProductDetails.jsx`
- `[x]` **Refactor Cart & Checkout**
  - `Cart Drawer` (in CustomerLayout.jsx)
  - `Checkout.jsx`
  - `OrderDetails.jsx`
- `[x]` **Refactor Dashboard/Profile**
  - `DashboardPage.jsx`
  - `ProfilePage.jsx`
  - `OrdersPage.jsx`
- `[x]` **Verification**
  - Verify layout responsiveness.
  - Final visual inspection and lint check to purge remaining Lucide React icons.
  - Ensure Admin pages retain their old style.
