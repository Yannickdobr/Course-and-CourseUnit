"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, Coupon } from "@/types/cart";
import { paymentApi } from "@/lib/api";

const CART_KEY = "eduflex-cart";
const PROMO_KEY = "eduflex-promo";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;       // montant de la remise (XAF)
  total: number;
  coupon: Coupon | null;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  /* Hydratation depuis localStorage (une seule fois au montage) */
  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (rawCart) setItems(JSON.parse(rawCart));
      const rawPromo = localStorage.getItem(PROMO_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (rawPromo) setCoupon(JSON.parse(rawPromo));
    } catch {
      /* ignore */
    }
  }, []);

  /* Persistance */
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem(PROMO_KEY, JSON.stringify(coupon));
  }, [coupon]);

  const subtotal = useMemo(() => items.reduce((a, i) => a + i.unitPrice, 0), [items]);
  const discount = useMemo(
    () => (coupon ? Math.round(subtotal * (coupon.pct / 100)) : 0),
    [subtotal, coupon]
  );
  const total = Math.max(0, subtotal - discount);

  const value: CartContextValue = {
    items,
    count: items.length,
    subtotal,
    discount,
    total,
    coupon,
    add: (item) =>
      setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item])),
    remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
    clear: () => {
      setItems([]);
      setCoupon(null);
    },
    has: (id) => items.some((i) => i.id === id),
    applyCoupon: async (code) => {
      try {
        const found = await paymentApi.validateCoupon(code);
        setCoupon(found);
        return { ok: true, message: `${found.label} appliqué !` };
      } catch (err: any) {
        return { ok: false, message: err.message || "Code promo invalide ou expiré." };
      }
    },
    removeCoupon: () => setCoupon(null),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un <CartProvider>.");
  return ctx;
}
