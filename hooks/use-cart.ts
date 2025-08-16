'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CartItem, 
  getCartItems, 
  addToCart, 
  removeFromCart, 
  updateCartItemQuantity, 
  clearCart, 
  getCartItemCount, 
  getCartTotal,
  isInCart 
} from '@/lib/cart';
import { WooCommerceProduct } from '@/lib/woocommerce-types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart items on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartItems = getCartItems();
        setItems(cartItems);
      } catch (error) {
        console.error('Error loading cart:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const addItem = useCallback((product: WooCommerceProduct, quantity: number = 1) => {
    try {
      const updatedItems = addToCart(product, quantity);
      setItems(updatedItems);
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    }
  }, []);

  const removeItem = useCallback((productId: number) => {
    try {
      const updatedItems = removeFromCart(productId);
      setItems(updatedItems);
      return true;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return false;
    }
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    try {
      const updatedItems = updateCartItemQuantity(productId, quantity);
      setItems(updatedItems);
      return true;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return false;
    }
  }, []);

  const clearCartItems = useCallback(() => {
    try {
      clearCart();
      setItems([]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => {
    const price = item.on_sale && item.sale_price ? 
      parseFloat(item.sale_price) : 
      parseFloat(item.price || item.regular_price);
    return sum + (price * item.quantity);
  }, 0);

  const checkIsInCart = useCallback((productId: number) => {
    return items.some(item => item.id === productId);
  }, [items]);

  return {
    items,
    itemCount,
    total,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart: clearCartItems,
    isInCart: checkIsInCart
  };
}
