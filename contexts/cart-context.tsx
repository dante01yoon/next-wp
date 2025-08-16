'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCart } from '@/hooks/use-cart';
import { CartItem } from '@/lib/cart';
import { WooCommerceProduct } from '@/lib/woocommerce-types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addItem: (product: WooCommerceProduct, quantity?: number) => boolean;
  removeItem: (productId: number) => boolean;
  updateQuantity: (productId: number, quantity: number) => boolean;
  clearCart: () => boolean;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
