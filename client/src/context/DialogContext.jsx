import { createContext, useContext, useState, useCallback } from 'react';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialogConfig, setDialogConfig] = useState(null);

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      setDialogConfig({
        ...config,
        onConfirm: () => {
          setDialogConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setDialogConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ confirm }}>
      {children}
      {dialogConfig && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            {dialogConfig.title && <h3 className="dialog-title">{dialogConfig.title}</h3>}
            <div className="dialog-message">{dialogConfig.message}</div>
            <div className="dialog-actions">
              <button 
                onClick={dialogConfig.onCancel} 
                className="admin-btn-sm"
              >
                {dialogConfig.cancelText || 'Cancel'}
              </button>
              <button 
                onClick={dialogConfig.onConfirm} 
                className={`btn btn-primary ${dialogConfig.isDestructive ? 'dialog-btn-danger' : ''}`}
                style={{ borderRadius: 'var(--admin-radius-xs)', fontSize: '0.875rem' }}
              >
                {dialogConfig.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
