import { createContext, useState, useContext, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const persist = (newItems) => {
    setItems(newItems);
    localStorage.setItem('cart_items', JSON.stringify(newItems));
  };

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      let next;
      if (existing) {
        next = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        next = [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          brand_name: product.brand_name,
          quantity: 1,
        }];
      }
      localStorage.setItem('cart_items', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => {
      const next = prev.filter(item => item.id !== productId);
      localStorage.setItem('cart_items', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setItems(prev => {
      const next = prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart_items', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
