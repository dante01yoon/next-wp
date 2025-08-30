'use client';

import { useState } from 'react';
import CourseCard from './course-card';
import { Button } from '@/components/ui/button';
import { TutorCourseWithPricing } from '@/lib/tutor-course-utils';

interface CoursesListProps {
  courses: TutorCourseWithPricing[];
}

export default function CoursesList({ courses }: CoursesListProps) {
  const [displayCount, setDisplayCount] = useState(12);

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No courses found</h3>
        <p className="text-muted-foreground">
          We're working on adding new courses. Check back soon!
        </p>
      </div>
    );
  }

  const displayedCourses = courses.slice(0, displayCount);
  const hasMore = courses.length > displayCount;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setDisplayCount(prev => prev + 12)}
            className="px-8"
          >
            Load More Courses
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        Showing {displayedCourses.length} of {courses.length} courses
      </div>
    </div>
  );
}
