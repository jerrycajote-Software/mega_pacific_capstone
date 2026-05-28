import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple initialization with empty resources
// since this is mainly to pass the linter and portability requirements
const resources = {
  en: {
    translation: {
      "Inventory Management": "Inventory Management",
      "Add New Product": "Add New Product",
      "Search products by name or category..": "Search products by name or category..",
      "Filters": "Filters",
      "Loading your inventory...": "Loading your inventory...",
      "No products found": "No products found",
      "Try adjusting your search or add a new product to get started.": "Try adjusting your search or add a new product to get started.",
      "Product Details": "Product Details",
      "Type": "Type",
      "Pricing": "Pricing",
      "Stock Level": "Stock Level",
      "Actions": "Actions",
      "No description": "No description",
      "units": "units",
      "Edit Product": "Edit Product",
      "Product Name": "Product Name",
      "e.g. Rib Type Blue": "e.g. Rib Type Blue",
      "Price (₱)": "Price (₱)",
      "Unit": "Unit",
      "per meter": "per meter",
      "Stock Quantity": "Stock Quantity",
      "Image URL": "Image URL",
      "https://example.com/image": "https://example.com/image",
      "Rib Type": "Rib Type",
      "Spandrel": "Spandrel",
      "Flat Type": "Flat Type",
      "Accessories": "Accessories",
      "Description": "Description",
      "Tell customers more about this product...": "Tell customers more about this product...",
      "Cancel": "Cancel",
      "Update Product": "Update Product",
      "Create Product": "Create Product"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
