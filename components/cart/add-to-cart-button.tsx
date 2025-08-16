'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/contexts/cart-context';
import { WooCommerceProduct } from '@/lib/woocommerce-types';
import { Check, ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  product: WooCommerceProduct;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function AddToCartButton({ 
  product, 
  variant = "default", 
  size = "default",
  className,
  children,
  showIcon = false
}: AddToCartButtonProps) {
  const { addItem, isInCart } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const isInCartAlready = isInCart(product.id);

  const handleAddToCart = async () => {
    if (isInCartAlready) return;
    
    setIsAdding(true);
    try {
      addItem(product, 1);
      // Brief delay to show feedback
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAdding(false);
    }
  };

  const buttonText = isInCartAlready ? 'In Cart' : isAdding ? 'Adding...' : children || 'Add to Cart';
  const icon = isInCartAlready ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />;

  return (
    <Button
      variant={isInCartAlready ? "secondary" : variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isInCartAlready || isAdding}
    >
      {showIcon && <span className="mr-2">{icon}</span>}
      {buttonText}
    </Button>
  );
}
