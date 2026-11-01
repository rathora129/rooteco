'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProductBySlug } from '@/data/products';

const StoreContext = createContext(null);

function readStorage(key) {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setCart(readStorage('rooteco-cart'));
    setWishlist(readStorage('rooteco-wishlist'));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem('rooteco-cart', JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem('rooteco-wishlist', JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((product, { color, variant, qty = 1, note = '' } = {}) => {
    const key = `${product.slug}__${color || ''}__${variant || ''}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images[0],
          color: color || product.colors?.[0] || null,
          variant: variant || product.variants?.[0] || null,
          note: note || null,
          qty,
        },
      ];
    });
    setCartOpen(true);
  }, []);

  const updateQty = useCallback((key, qty) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty } : i))
    );
  }, []);

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((slug) => {
    setWishlist((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const value = useMemo(
    () => ({
      cart,
      cartCount: cart.reduce((n, i) => n + i.qty, 0),
      cartSubtotal: cart.reduce((n, i) => n + i.qty * i.price, 0),
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      cartOpen,
      setCartOpen,
      wishlist,
      toggleWishlist,
      hydrated,
    }),
    [cart, addToCart, updateQty, removeFromCart, clearCart, cartOpen, wishlist, toggleWishlist, hydrated]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { getProductBySlug };
