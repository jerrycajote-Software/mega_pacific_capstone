// Customer Support Event Dispatcher
// Allows any component (header, footer, product page) to open the Customer Support Workspace

export const openCustomerSupport = (initialPrompt = '') => {
  window.dispatchEvent(
    new CustomEvent('mega_open_support', {
      detail: { initialPrompt }
    })
  );
};
