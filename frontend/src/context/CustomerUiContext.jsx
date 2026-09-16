import React, { createContext, useState, useContext, useEffect } from 'react';

const CustomerUiContext = createContext();

export const CustomerUiProvider = ({ children }) => {
  const [uiVersion, setUiVersion] = useState(() => {
    return localStorage.getItem('mega_pacific_customer_ui_version') || 'v2';
  });

  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false);
  const [selectedProductForRfq, setSelectedProductForRfq] = useState(null);

  useEffect(() => {
    localStorage.setItem('mega_pacific_customer_ui_version', uiVersion);
  }, [uiVersion]);

  const toggleUiVersion = () => {
    setUiVersion((prev) => (prev === 'v1' ? 'v2' : 'v1'));
  };

  const openRfqForProduct = (product) => {
    setSelectedProductForRfq(product || null);
    setRfqModalOpen(true);
  };

  return (
    <CustomerUiContext.Provider
      value={{
        uiVersion,
        setUiVersion,
        toggleUiVersion,
        rfqModalOpen,
        setRfqModalOpen,
        calculatorModalOpen,
        setCalculatorModalOpen,
        selectedProductForRfq,
        openRfqForProduct,
      }}
    >
      {children}
    </CustomerUiContext.Provider>
  );
};

export const useCustomerUi = () => {
  const context = useContext(CustomerUiContext);
  if (!context) {
    throw new Error('useCustomerUi must be used within a CustomerUiProvider');
  }
  return context;
};
