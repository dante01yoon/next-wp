import { Suspense } from 'react';
import { getTutorCourse, getTutorCourses } from '@/lib/tutor-lms';
import { getProducts } from '@/lib/woocommerce';
import { getCoursesWithPricing } from '@/lib/tutor-course-utils';
import CoursesList from '@/components/courses/courses-list';
import CoursesHeader from '@/components/courses/courses-header';
import CoursesLoading from '@/components/courses/courses-loading';

export default async function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CoursesHeader />
      <Suspense fallback={<CoursesLoading />}>
        <CoursesContent />
      </Suspense>
    </div>
  );
}

async function CoursesContent() {
  try {
    // Fetch courses from TutorLMS API
    const tutorCourses = await getTutorCourses({
      per_page: 20,
      status: 'publish',
      orderby: 'date',
      order: 'desc'
    });
    console.log('tutorCourses: ', tutorCourses[0]);
    // Fetch WooCommerce products for pricing information
    const data = await getTutorCourse(tutorCourses[0].id);
    console.log('data: ', data);
    let wooProducts: any[] = [];
    try {
      wooProducts = await getProducts({
        per_page: 100, // Get more products to ensure we have pricing data
        status: 'publish'
      });
      console.log('wooProducts: ', wooProducts);
    } catch (wooError) {
      console.warn('Failed to fetch WooCommerce products for pricing:', wooError);
      wooProducts = [];
    }

    // Combine TutorLMS courses with WooCommerce pricing
    const coursesWithPricing = await getCoursesWithPricing(tutorCourses, wooProducts);

    return <CoursesList courses={coursesWithPricing} />;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Sorry, we couldn't load the courses. Please try again later.
        </p>
      </div>
    );
  }
}

export const metadata = {
  title: 'Courses',
  description: 'Browse our collection of courses and training materials.',
};
