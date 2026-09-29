import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { AddToCartInput, AddToCartResult, CartContextType, CartItem } from '@/types';
import { MIN_QUANTITY, MAX_QUANTITY, STORAGE_KEYS } from '@/lib/constants';
import { generateId, storage } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage
    return storage.get<CartItem[]>(STORAGE_KEYS.CART, []);
  });
  const { store } = useStore();

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    storage.set(STORAGE_KEYS.CART, items);
  }, [items]);

  const buildItem = useCallback((input: AddToCartInput): CartItem => {
    const addonsTotal = input.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;

    return {
      id: generateId(),
      productId: String(input.productSizeId || Date.now()),
      productSizeId: input.productSizeId,
      storeId: input.storeId,
      storeSlug: input.storeSlug,
      storeName: input.storeName,
      name: input.name,
      size: input.size,
      quantity: Math.min(input.quantity, MAX_QUANTITY),
      price: input.price + addonsTotal,
      addons: input.addons,
      imageUrl: input.imageUrl,
    };
  }, []);

  // Add item to cart. Returns { ok: false } instead of mutating state if the
  // cart already has items from a different store — callers should confirm
  // with the user and call replaceCart() instead.
  const addToCart = useCallback((input: AddToCartInput): AddToCartResult => {
    const existingStoreId = items[0]?.storeId;

    if (existingStoreId !== undefined && existingStoreId !== input.storeId) {
      return { ok: false, reason: 'different-store', existingStoreName: items[0].storeName };
    }

    setItems((currentItems) => {
      const addonIds = input.addons?.map((a) => a.id).sort().join(',') || '';

      const existingItem = currentItems.find((item) => {
        const itemAddonIds = item.addons?.map((a) => a.id).sort().join(',') || '';
        return item.name === input.name && item.size === input.size && itemAddonIds === addonIds;
      });

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + input.quantity, MAX_QUANTITY);
        return currentItems.map((item) =>
          item.id === existingItem.id ? { ...item, quantity: newQuantity } : item
        );
      }

      return [...currentItems, buildItem(input)];
    });

    return { ok: true };
  }, [items, buildItem]);

  // Clears the cart and adds this item — used after the user confirms
  // switching stores.
  const replaceCart = useCallback((input: AddToCartInput) => {
    setItems([buildItem(input)]);
  }, [buildItem]);

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

  // Delivery fee comes from the store the cart's items belong to — falls
  // back to the currently-loaded store context if it matches, else 0.
  const cartStoreId = items[0]?.storeId ?? null;
  const deliveryFee = isCartEmpty
    ? 0
    : (store && store.id === cartStoreId ? store.delivery_fee : 0);
  const total = subtotal + deliveryFee;

  const contextValue: CartContextType = {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    storeId: items[0]?.storeId ?? null,
    storeSlug: items[0]?.storeSlug ?? null,
    storeName: items[0]?.storeName ?? null,
    addToCart,
    replaceCart,
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
