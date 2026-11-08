import { useState, useCallback } from 'react';

export const useCustomDialog = () => {
  const [dialogState, setDialogState] = useState({
    open: false,
    type: 'warning',
    title: '',
    message: '',
    description: '',
    confirmText: 'I Understand',
    cancelText: 'Cancel',
    showCancel: false,
    loading: false,
    inputConfig: null,
    onConfirm: null,
    onClose: null
  });

  const closeDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false, loading: false }));
  }, []);

  const showWarning = useCallback(({
    title = 'Action Warning',
    message,
    description = '',
    confirmText = 'I Understand',
    onConfirm
  }) => {
    setDialogState({
      open: true,
      type: 'warning',
      title,
      message,
      description,
      confirmText,
      cancelText: 'Cancel',
      showCancel: false,
      loading: false,
      inputConfig: null,
      onConfirm: () => {
        closeDialog();
        if (onConfirm) onConfirm();
      },
      onClose: closeDialog
    });
  }, [closeDialog]);

  const showSuccess = useCallback(({
    title = 'Success',
    message,
    description = '',
    confirmText = 'Acknowledge',
    onConfirm
  }) => {
    setDialogState({
      open: true,
      type: 'success',
      title,
      message,
      description,
      confirmText,
      cancelText: 'Cancel',
      showCancel: false,
      loading: false,
      inputConfig: null,
      onConfirm: () => {
        closeDialog();
        if (onConfirm) onConfirm();
      },
      onClose: closeDialog
    });
  }, [closeDialog]);

  const showError = useCallback(({
    title = 'Error',
    message,
    description = '',
    confirmText = 'Dismiss',
    onConfirm
  }) => {
    setDialogState({
      open: true,
      type: 'error',
      title,
      message,
      description,
      confirmText,
      cancelText: 'Cancel',
      showCancel: false,
      loading: false,
      inputConfig: null,
      onConfirm: () => {
        closeDialog();
        if (onConfirm) onConfirm();
      },
      onClose: closeDialog
    });
  }, [closeDialog]);

  const showConfirm = useCallback(({
    type = 'warning',
    title = 'Confirm Action',
    message,
    description = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
  }) => {
    setDialogState({
      open: true,
      type,
      title,
      message,
      description,
      confirmText,
      cancelText,
      showCancel: true,
      loading: false,
      inputConfig: null,
      onConfirm: async () => {
        if (onConfirm) {
          setDialogState(prev => ({ ...prev, loading: true }));
          try {
            await onConfirm();
          } finally {
            closeDialog();
          }
        } else {
          closeDialog();
        }
      },
      onClose: () => {
        closeDialog();
        if (onCancel) onCancel();
      }
    });
  }, [closeDialog]);

  const showPrompt = useCallback(({
    type = 'warning',
    title = 'Input Required',
    message,
    description = '',
    inputLabel = 'Reason',
    defaultValue = '',
    placeholder = 'ex. Duplicate order submission',
    presets = [],
    required = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
  }) => {
    setDialogState({
      open: true,
      type,
      title,
      message,
      description,
      confirmText,
      cancelText,
      showCancel: true,
      loading: false,
      inputConfig: {
        label: inputLabel,
        defaultValue,
        placeholder,
        presets,
        required
      },
      onConfirm: async (val) => {
        if (onConfirm) {
          setDialogState(prev => ({ ...prev, loading: true }));
          try {
            await onConfirm(val);
          } finally {
            closeDialog();
          }
        } else {
          closeDialog();
        }
      },
      onClose: () => {
        closeDialog();
        if (onCancel) onCancel();
      }
    });
  }, [closeDialog]);

  return {
    dialogState,
    closeDialog,
    showWarning,
    showSuccess,
    showError,
    showConfirm,
    showPrompt
  };
};

export default useCustomDialog;

