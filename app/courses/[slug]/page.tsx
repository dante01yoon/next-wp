import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getProducts } from '@/lib/woocommerce';
import { ArrowLeft, Star, Clock, Users, Download, Globe } from 'lucide-react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { isWooCommerceProductFree } from '@/lib/tutor-course-utils';
import { FreeEnrollButton } from '@/components/courses/free-enroll-button';

interface CourseDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  try {
    // Fetch the course by slug
    const courses = await getProducts({
      slug,
      per_page: 1,
      status: 'publish'
    });

    if (!courses || courses.length === 0) {
      notFound();
    }

    const course = courses[0];
    const courseImage = course.images?.[0]?.src || '/placeholder-course.jpg';
    const isOnSale = course.on_sale;
    const price = course.price || course.regular_price;
    const salePrice = course.sale_price;

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/courses">
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={courseImage}
                alt={course.name}
                fill
                className="object-cover"
                priority
              />
              {course.featured && (
                <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600">
                  Featured Course
                </Badge>
              )}
            </div>

            {/* Course Title and Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {course.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl font-bold">{course.name}</h1>
                
                {course.short_description && (
                  <div 
                    className="text-lg text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: course.short_description }}
                  />
                )}
              </div>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {course.average_rating && parseFloat(course.average_rating) > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{parseFloat(course.average_rating).toFixed(1)}</span>
                    <span>({course.rating_count} reviews)</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.total_sales} students</span>
                </div>

                {course.virtual && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>Online Course</span>
                  </div>
                )}

                {course.downloadable && (
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>Downloadable Content</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Course Description */}
              {course.description && (
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-xl font-semibold mb-3">Course Description</h2>
                  <div dangerouslySetInnerHTML={{ __html: course.description }} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  {price === '0' || price === '' ? 'Free Course' : 'Purchase Course'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div className="text-center">
                  {isOnSale && salePrice ? (
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        ${salePrice}
                      </div>
                      <div className="text-lg text-muted-foreground line-through">
                        ${course.regular_price}
                      </div>
                      <Badge className="bg-red-500 hover:bg-red-600 mt-2">
                        {Math.round(((parseFloat(course.regular_price) - parseFloat(salePrice)) / parseFloat(course.regular_price)) * 100)}% OFF
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">
                      {price === '0' || price === '' ? 'Free' : `$${price}`}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isWooCommerceProductFree(course) ? (
                    <FreeEnrollButton 
                      course={{
                        id: course.id,
                        slug: course.slug,
                        name: course.name,
                        price: course.price,
                        price_type: course.price === '0' || course.price === '' ? 'free' : 'paid'
                      }}
                      size="lg"
                      className="w-full"
                    />
                  ) : (
                    <>
                      <Button className="w-full" size="lg">
                        Buy Now
                      </Button>
                      <AddToCartButton 
                        product={course} 
                        variant="outline" 
                        className="w-full"
                        showIcon
                      >
                        Add to Cart
                      </AddToCartButton>
                    </>
                  )}
                </div>

                <Separator />

                {/* Course Features */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Course Type:</span>
                    <span className="font-medium">
                      {course.virtual ? 'Online' : 'In-Person'}
                    </span>
                  </div>
                  
                  {course.downloadable && (
                    <div className="flex items-center justify-between">
                      <span>Downloads:</span>
                      <span className="font-medium">{course.downloads.length}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Last Updated:</span>
                    <span className="font-medium">
                      {new Date(course.date_modified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching course:', error);
    notFound();
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CourseDetailPageProps) {
  try {
    const courses = await getProducts({
      slug: params.slug,
      per_page: 1,
      status: 'publish'
    });

    if (!courses || courses.length === 0) {
      return {
        title: 'Course Not Found',
      };
    }

    const course = courses[0];
    
    return {
      title: course.name,
      description: course.short_description?.replace(/<[^>]*>/g, '') || course.name,
      openGraph: {
        title: course.name,
        description: course.short_description?.replace(/<[^>]*>/g, '') || course.name,
        images: course.images?.[0]?.src ? [course.images[0].src] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Course Not Found',
    };
  }
}
