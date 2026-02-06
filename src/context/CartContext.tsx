import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { CartItem, CartItemAddon, FriesSize, CartContextType } from '@/types';
import { DELIVERY_FEE, MIN_QUANTITY, MAX_QUANTITY, STORAGE_KEYS } from '@/lib/constants';
import { generateId, storage } from '@/lib/utils';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage
    return storage.get<CartItem[]>(STORAGE_KEYS.CART, []);
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    storage.set(STORAGE_KEYS.CART, items);
  }, [items]);

  // Add item to cart
  const addToCart = useCallback((
    name: string,
    size: FriesSize,
    quantity: number,
    price: number,
    productSizeId?: number,
    addons?: CartItemAddon[],
    imageUrl?: string | null
  ) => {
    setItems(currentItems => {
      // Generate addon IDs string for comparison
      const addonIds = addons?.map(a => a.id).sort().join(',') || '';

      // Check if item with same name, size, and addons already exists
      const existingItem = currentItems.find(item => {
        const itemAddonIds = item.addons?.map(a => a.id).sort().join(',') || '';
        return item.name === name && item.size === size && itemAddonIds === addonIds;
      });

      if (existingItem) {
        // Update quantity of existing item (respecting max limit)
        const newQuantity = Math.min(existingItem.quantity + quantity, MAX_QUANTITY);
        return currentItems.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Calculate total price including addons
      const addonsTotal = addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
      const totalPrice = price + addonsTotal;

      // Add new item
      const newItem: CartItem = {
        id: generateId(),
        productId: String(productSizeId || Date.now()),
        productSizeId: productSizeId,
        name: name,
        size: size,
        quantity: Math.min(quantity, MAX_QUANTITY),
        price: totalPrice,
        addons: addons,
        imageUrl: imageUrl,
      };

      return [...currentItems, newItem];
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < MIN_QUANTITY) {
      // Remove item if quantity goes below minimum
      setItems(currentItems => currentItems.filter(item => item.id !== itemId));
      return;
    }

    const clampedQuantity = Math.min(quantity, MAX_QUANTITY);

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity: clampedQuantity } : item
      )
    );
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate totals
  const { itemCount, subtotal, isCartEmpty } = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const sub = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      itemCount: count,
      subtotal: sub,
      isCartEmpty: items.length === 0,
    };
  }, [items]);

  // Delivery fee is only applied if cart has items
  const deliveryFee = isCartEmpty ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const contextValue: CartContextType = {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartEmpty,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

export default CartContext;
