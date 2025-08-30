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
import { TutorCourseWithPricing } from '@/lib/tutor-course-utils';
import { useCartContext } from '@/contexts/cart-context';
import { FreeEnrollButton } from './free-enroll-button';

interface CourseCardProps {
  course: TutorCourseWithPricing;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { addItem, isInCart } = useCartContext();
  const courseImage = course.featured_media ? `/api/media/${course.featured_media}` : '/placeholder-course.jpg';
  const isOnSale = course.on_sale || false;
  const price = course.price || course.regular_price;
  const salePrice = course.sale_price;
  const isInCartAlready = course.woocommerce_product_id ? isInCart(course.woocommerce_product_id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (course.woocommerce_product_id) {
      // Create a simplified product object for cart
      const cartProduct = {
        id: course.woocommerce_product_id,
        name: course.title.rendered,
        price: course.price,
        sale_price: course.sale_price,
        regular_price: course.regular_price,
        images: [{ src: courseImage }],
        slug: course.slug,
      };
      addItem(cartProduct as any, 1);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-video">
        <Image
          src={courseImage}
          alt={course.title.rendered}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {isOnSale && (
          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
            Sale
          </Badge>
        )}
        {/* Show Free badge for free courses */}
        {course.is_free && (
          <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
            Free
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg leading-tight">
            {course.title.rendered}
          </CardTitle>
          <div className="flex flex-col items-end">
            {isOnSale && salePrice ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  {course.formatted_sale_price}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {course.formatted_regular_price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">
                {course.formatted_price}
              </span>
            )}
          </div>
        </div>
        
        {course.excerpt?.rendered && (
          <CardDescription 
            className="line-clamp-3"
            dangerouslySetInnerHTML={{ __html: course.excerpt.rendered }}
          />
        )}
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Course level badge */}
          {course.course_level && (
            <Badge variant="secondary" className="text-xs">
              {course.course_level}
            </Badge>
          )}
          {/* Course duration badge */}
          {course.course_duration && (
            <Badge variant="outline" className="text-xs">
              {course.course_duration}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {course.rating && course.rating.rating_avg > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span>{course.rating.rating_avg.toFixed(1)}</span>
                <span>({course.rating.rating_count})</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {course.total_enrolled && course.total_enrolled > 0 && (
              <Badge variant="outline" className="text-xs">
                {course.total_enrolled} enrolled
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          {/* Check if course is free using TutorLMS data */}
          {course.is_free ? (
            <div className="w-full space-y-2">
              <FreeEnrollButton 
                course={{
                  id: course.id,
                  slug: course.slug,
                  name: course.title.rendered,
                  price: course.price,
                  price_type: course.price_type || 'free'
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
              
              {course.woocommerce_product_id && price !== '0' && price !== '' && (
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
