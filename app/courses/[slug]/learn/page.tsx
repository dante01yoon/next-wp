import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getProducts } from '@/lib/woocommerce';
import { 
  getTutorCourseContent, 
  getTutorCourse, 
  getTutorInstructor 
} from '@/lib/tutor-lms';
import { 
  isTutorCourseFree, 
  getTutorCourseIdFromProduct 
} from '@/lib/tutor-course-utils';
import { CoursePlayer } from '@/components/courses/course-player';
import { CoursePlayerSkeleton } from '@/components/courses/course-player-skeleton';

interface CourseLearnPageProps {
  params: {
    slug: string;
  };
  searchParams: Promise<{
    lesson?: string;
    topic?: string;
  }>;
}

export default async function CourseLearnPage({ 
  params, 
  searchParams 
}: CourseLearnPageProps) {
  try {
    // Await searchParams before using them
    const searchParamsData = await searchParams;
    
    // Fetch the course by slug
    const courses = await getProducts({
      slug: params.slug,
      per_page: 1,
      status: 'publish'
    });

    console.log('courses: ', courses);
    if (!courses || courses.length === 0) {
      notFound();
    }

    const course = courses[0];
    
    // Get the linked Tutor LMS course ID from WooCommerce product
    const tutorCourseId = await getTutorCourseIdFromProduct(course);
    
    if (!tutorCourseId) {
      console.error('No linked Tutor LMS course found for product:', course.id);
      notFound();
    }

    // Fetch the actual Tutor course to check if it's free
    const tutorCourseForCheck = await getTutorCourse(tutorCourseId).catch(() => null);
    
    // Check if course is free (only free courses can be accessed without purchase)
    if (tutorCourseForCheck && !isTutorCourseFree(tutorCourseForCheck)) {
      // For paid courses, you might want to check if user has purchased
      // For now, redirect to course detail page
      redirect(`/courses/${params.slug}`);
    }

    // Fetch course content and instructor data using the correct Tutor course ID
    const [tutorCourse, courseContent, instructor] = await Promise.all([
      getTutorCourse(tutorCourseId).catch(() => null),
      getTutorCourseContent(tutorCourseId).catch(() => null),
      // We'll try to get instructor, but it's not critical
      tutorCourseForCheck?.author ? getTutorInstructor(tutorCourseForCheck.author).catch(() => null) : Promise.resolve(null)
    ]);

    console.log('tutorCourse: ', tutorCourse);
    console.log('courseContent: ', courseContent);
    console.log('instructor: ', instructor);

    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<CoursePlayerSkeleton />}>
          <CoursePlayer
            course={course}
            tutorCourse={tutorCourse}
            courseContent={courseContent}
            instructor={instructor}
            currentLessonId={searchParamsData.lesson ? parseInt(searchParamsData.lesson) : undefined}
            currentTopicId={searchParamsData.topic ? parseInt(searchParamsData.topic) : undefined}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error loading course learning page:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: CourseLearnPageProps) {
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
      title: `Learn ${course.name}`,
      description: `Start learning ${course.name}`,
      robots: 'noindex', // Don't index learning pages
    };
  } catch (error) {
    return {
      title: 'Course Learning',
    };
  }
}
