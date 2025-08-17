'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WooCommerceProduct } from '@/lib/woocommerce-types';
import { useCartContext } from '@/contexts/cart-context';
import { isWooCommerceProductFree } from '@/lib/tutor-course-utils';
import { FreeEnrollButton } from './free-enroll-button';

interface CourseCardProps {
  course: WooCommerceProduct;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { addItem, isInCart } = useCartContext();
  const courseImage = course.images?.[0]?.src || '/placeholder-course.jpg';
  const isOnSale = course.on_sale;
  const price = course.price || course.regular_price;
  const salePrice = course.sale_price;
  const isInCartAlready = isInCart(course.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(course, 1);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-video">
        <Image
          src={courseImage}
          alt={course.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isOnSale && (
          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
            Sale
          </Badge>
        )}
        {course.featured && (
          <Badge className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600">
            Featured
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg leading-tight">
            {course.name}
          </CardTitle>
          <div className="flex flex-col items-end">
            {isOnSale && salePrice ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  ${salePrice}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${course.regular_price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">
                {price === '0' || price === '' ? 'Free' : `$${price}`}
              </span>
            )}
          </div>
        </div>
        
        {course.short_description && (
          <CardDescription 
            className="line-clamp-3"
            dangerouslySetInnerHTML={{ __html: course.short_description }}
          />
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {course.categories.slice(0, 3).map((category) => (
            <Badge key={category.id} variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {course.average_rating && parseFloat(course.average_rating) > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span>{parseFloat(course.average_rating).toFixed(1)}</span>
                <span>({course.rating_count})</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {course.virtual && (
              <Badge variant="outline" className="text-xs">
                Online
              </Badge>
            )}
            {course.downloadable && (
              <Badge variant="outline" className="text-xs">
                Downloadable
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          {/* Check if course is free using WooCommerce product price */}
          {isWooCommerceProductFree(course) ? (
            <div className="w-full space-y-2">
              <FreeEnrollButton 
                course={{
                  id: course.id,
                  slug: course.slug,
                  name: course.name,
                  price: course.price,
                  price_type: course.price === '0' || course.price === '' ? 'free' : 'paid'
                }}
                size="sm"
                className="w-full"
              />
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/courses/${course.slug}`}>
                  View Details
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Button asChild className="flex-1">
                <Link href={`/courses/${course.slug}`}>
                  View Course
                </Link>
              </Button>
              
              {price !== '0' && price !== '' && (
                <Button 
                  variant={isInCartAlready ? "secondary" : "outline"} 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isInCartAlready}
                >
                  {isInCartAlready ? 'In Cart' : 'Add to Cart'}
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
