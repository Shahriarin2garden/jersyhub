"use client";

import * as React from "react";
import type { CartItem } from "@/types";
import { MAX_CART_ITEMS, calcDeliveryFee } from "@/lib/constants";

const STORAGE_KEY = "jersyhub_cart";

type State = { items: CartItem[]; updatedAt: number };

type Action =
  | { type: "HYDRATE"; state: State }
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; variantId: string }
  | { type: "SET_QTY"; variantId: string; quantity: number }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "ADD": {
      const existing = state.items.find(
        (i) => i.variantId === action.item.variantId,
      );
      let items: CartItem[];
      if (existing) {
        items = state.items.map((i) =>
          i.variantId === action.item.variantId
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i,
        );
      } else {
        if (state.items.length >= MAX_CART_ITEMS) return state;
        items = [...state.items, action.item];
      }
      return { items, updatedAt: Date.now() };
    }
    case "REMOVE":
      return {
        items: state.items.filter((i) => i.variantId !== action.variantId),
        updatedAt: Date.now(),
      };
    case "SET_QTY":
      return {
        items: state.items.map((i) =>
          i.variantId === action.variantId
            ? { ...i, quantity: Math.max(1, action.quantity) }
            : i,
        ),
        updatedAt: Date.now(),
      };
    case "CLEAR":
      return { items: [], updatedAt: Date.now() };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, {
    items: [],
    updatedAt: 0,
  });
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from localStorage once on mount.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    // One-time hydration flag; intentional post-mount state set.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Persist after hydration.
  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = state.items.reduce((s, i) => s + i.quantity, 0);
  const deliveryFee = calcDeliveryFee(subtotal);

  const value: CartContextValue = {
    items: state.items,
    count,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    hydrated,
    addItem: (item) => dispatch({ type: "ADD", item }),
    removeItem: (variantId) => dispatch({ type: "REMOVE", variantId }),
    setQuantity: (variantId, quantity) =>
      dispatch({ type: "SET_QTY", variantId, quantity }),
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
