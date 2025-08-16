import { Suspense } from 'react';
import { getProducts } from '@/lib/woocommerce';
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
    const courses = await getProducts({
      per_page: 20,
      status: 'publish',
      orderby: 'date',
      order: 'desc'
    });

    return <CoursesList courses={courses} />;
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
