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
      "Create Product": "Create Product",
      "MEGA PACIFIC": "MEGA PACIFIC",
      "Admin Portal": "Admin Portal",
      "Login As Admin": "Login As Admin",
      "Email": "Email",
      "Password": "Password",
      "SYSTEM ONLINE": "SYSTEM ONLINE",
      "Welcome back, ": "Welcome back, ",
      "Customer": "Customer",
      "Explore our premium selection of roofing materials. From durable Rib types to elegant Spandrel designs, find exactly what you need for your next project.": "Explore our premium selection of roofing materials. From durable Rib types to elegant Spandrel designs, find exactly what you need for your next project.",
      "AVAILABLE PRODUCT": "AVAILABLE PRODUCT",
      "Available materials from our inventory": "Available materials from our inventory",
      "Search products...": "Search products...",
      "Loading catalog...": "Loading catalog...",
      "Try adjusting your search criteria.": "Try adjusting your search criteria.",
      "Check back later for new inventory.": "Check back later for new inventory.",
      "Premium roofing material built for durability and aesthetics.": "Premium roofing material built for durability and aesthetics.",
      "Price": "Price"
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
