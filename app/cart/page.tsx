'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartContext } from '@/contexts/cart-context';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, itemCount, total, removeItem, updateQuantity, clearCart, isLoading } = useCartContext();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    clearCart();
    setIsClearing(false);
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="gap-2 mb-4">
              <Link href="/courses">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Your Cart</h1>
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding some courses to your cart to see them here.
              </p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" asChild className="gap-2 mb-4">
              <Link href="/courses">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <p className="text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          {items.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleClearCart}
              disabled={isClearing}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? 'Clearing...' : 'Clear Cart'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Course Image */}
                    <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link 
                            href={`/courses/${item.slug}`}
                            className="font-semibold hover:underline line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {item.on_sale && item.sale_price ? (
                              <>
                                <span className="text-lg font-bold text-green-600">
                                  ${formatPrice(item.sale_price)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  ${formatPrice(item.regular_price)}
                                </span>
                                <Badge className="bg-red-500 hover:bg-red-600">
                                  Sale
                                </Badge>
                              </>
                            ) : (
                              <span className="text-lg font-bold">
                                ${formatPrice(item.price || item.regular_price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="space-y-3 pt-4">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/courses">Continue Shopping</Link>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  Secure checkout powered by WooCommerce
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
