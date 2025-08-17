// Main library exports for easy importing
// This allows for clean imports like: import { getTutorCourses, TutorCourse } from '@/lib'

// WordPress exports
export * from './wordpress';
export * from './wordpress.d';

// WooCommerce exports  
export * from './woocommerce';
export * from './woocommerce-types';

// Tutor LMS exports
export * from './tutor-lms';
export * from './tutor-lms-types';
export * from './tutor-course-utils';
export * from './tutor-enrollment';
export * from './tutor-enrollment-sync';
export * from './tutor-api-client';
export * from './auth-context';

// Utility exports
export * from './utils';
export * from './cart';

// Type definitions
export * from './types.d';

// Re-export commonly used types for convenience
export type {
  // WordPress types
  Post,
  Page,
  Category,
  Tag,
  Author,
  FeaturedMedia,
} from './wordpress.d';

export type {
  // WooCommerce types
  WooCommerceProduct,
  WooCommerceCategory,
  WooCommerceTag,
  WooCommerceProductsQueryParams,
} from './woocommerce-types';

export type {
  // Tutor LMS types
  TutorCourse,
  TutorLesson,
  TutorQuiz,
  TutorInstructor,
  TutorCourseContent,
  TutorCoursesQueryParams,
  TutorCourseRating,
  TutorCourseAnnouncement,
  TutorCourseTopic,
} from './tutor-lms-types';
