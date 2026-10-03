import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    restaurantId: null,
    restaurantName: null,
    items: [],
  });

  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    newRestaurantId: null,
    newRestaurantName: null,
    pendingItem: null
  });

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('bistrobyte_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('bistrobyte_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, restaurantId, restaurantName, quantity = 1) => {
    if (cart.restaurantId && cart.restaurantId !== restaurantId && cart.items.length > 0) {
      setConflictModal({
        isOpen: true,
        newRestaurantId: restaurantId,
        newRestaurantName: restaurantName,
        pendingItem: { ...item, quantity }
      });
      return false; // Did not add
    }

    setCart(prev => {
      const existingItemIndex = prev.items.findIndex(i => i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations));
      let newItems = [...prev.items];
      
      if (existingItemIndex > -1) {
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems.push({ ...item, quantity });
      }

      return {
        restaurantId,
        restaurantName,
        items: newItems
      };
    });
    return true; // Added successfully
  };

  const removeFromCart = (index) => {
    setCart(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return {
        ...prev,
        items: newItems,
        // Reset restaurant if cart is empty
        restaurantId: newItems.length === 0 ? null : prev.restaurantId,
        restaurantName: newItems.length === 0 ? null : prev.restaurantName
      };
    });
  };

  const clearCart = () => {
    setCart({ restaurantId: null, restaurantName: null, items: [] });
  };

  const handleConflictResolve = (startNewCart) => {
    if (startNewCart) {
      setCart({
        restaurantId: conflictModal.newRestaurantId,
        restaurantName: conflictModal.newRestaurantName,
        items: [conflictModal.pendingItem]
      });
    }
    setConflictModal({ isOpen: false, newRestaurantId: null, newRestaurantName: null, pendingItem: null });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
      
      {/* Conflict Modal */}
      {conflictModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Start a new cart?</h3>
            <p className="text-gray-300 mb-6">
              Your cart currently contains items from <strong className="text-primary">{cart.restaurantName}</strong>. 
              Would you like to clear it and start a new cart for <strong className="text-primary">{conflictModal.newRestaurantName}</strong>?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => handleConflictResolve(false)}
                className="flex-1 py-2.5 rounded-full font-bold bg-dark-bg text-gray-300 border border-dark-border hover:text-white transition-colors"
              >
                Keep Current Cart
              </button>
              <button 
                onClick={() => handleConflictResolve(true)}
                className="flex-1 py-2.5 rounded-full font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg"
              >
                Start New Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};
