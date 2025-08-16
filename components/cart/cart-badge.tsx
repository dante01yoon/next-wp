'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartContext } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CartBadgeProps {
  className?: string;
  showText?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartBadge({ className, showText = false, onOpenChange }: CartBadgeProps) {
  const { itemCount } = useCartContext();

  const handleClick = () => {
    onOpenChange?.(false);
  };

  return (
    <Button asChild variant="ghost" size="sm" className={className}>
      <Link href="/cart" className="relative" onClick={handleClick}>
        <ShoppingCart className="h-4 w-4" />
        {showText && <span className="ml-2">Cart</span>}
        {itemCount > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
            variant="default"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
        <span className="sr-only">
          Cart {itemCount > 0 ? `(${itemCount} items)` : '(empty)'}
        </span>
      </Link>
    </Button>
  );
}
