'use client';

import { WooCommerceProduct } from './woocommerce-types';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  image: string;
  slug: string;
  quantity: number;
  on_sale: boolean;
}

const CART_COOKIE_NAME = 'next-wp-cart';
const CART_EXPIRY_DAYS = 30;

// Utility functions for cookies
function setCookie(name: string, value: string, days: number): void {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Cart utility functions
export function getCartItems(): CartItem[] {
  try {
    const cartData = getCookie(CART_COOKIE_NAME);
    if (!cartData) return [];
    
    const parsed = JSON.parse(decodeURIComponent(cartData));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing cart data:', error);
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  try {
    const cartData = encodeURIComponent(JSON.stringify(items));
    setCookie(CART_COOKIE_NAME, cartData, CART_EXPIRY_DAYS);
  } catch (error) {
    console.error('Error saving cart data:', error);
  }
}

export function addToCart(product: WooCommerceProduct, quantity: number = 1): CartItem[] {
  const currentItems = getCartItems();
  
  const cartItem: CartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    regular_price: product.regular_price,
    sale_price: product.sale_price,
    image: product.images?.[0]?.src || '/placeholder-course.jpg',
    slug: product.slug,
    quantity,
    on_sale: product.on_sale
  };

  const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
  
  if (existingItemIndex > -1) {
    // Update quantity if item already exists
    currentItems[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    currentItems.push(cartItem);
  }

  saveCartItems(currentItems);
  return currentItems;
}

export function removeFromCart(productId: number): CartItem[] {
  const currentItems = getCartItems();
  const filteredItems = currentItems.filter(item => item.id !== productId);
  saveCartItems(filteredItems);
  return filteredItems;
}

export function updateCartItemQuantity(productId: number, quantity: number): CartItem[] {
  const currentItems = getCartItems();
  const itemIndex = currentItems.findIndex(item => item.id === productId);
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    currentItems[itemIndex].quantity = quantity;
    saveCartItems(currentItems);
  }
  
  return currentItems;
}

export function clearCart(): void {
  deleteCookie(CART_COOKIE_NAME);
}

export function getCartItemCount(): number {
  const items = getCartItems();
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(): number {
  const items = getCartItems();
  return items.reduce((total, item) => {
    const price = item.on_sale && item.sale_price ? 
      parseFloat(item.sale_price) : 
      parseFloat(item.price || item.regular_price);
    return total + (price * item.quantity);
  }, 0);
}

export function isInCart(productId: number): boolean {
  const items = getCartItems();
  return items.some(item => item.id === productId);
}
