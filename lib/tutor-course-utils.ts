// Tutor LMS Course Utility Functions
// Helper functions to work with Tutor LMS course data

import { TutorCourse } from './tutor-lms-types';
import { WooCommerceProduct } from './woocommerce-types';

// ============= Course Combined Types =============

/**
 * Combined course type with TutorLMS course data and WooCommerce pricing
 */
export interface TutorCourseWithPricing extends Omit<TutorCourse, 'price'> {
  // WooCommerce pricing information
  woocommerce_product_id?: number;
  price: string;
  sale_price?: string;
  regular_price?: string;
  on_sale?: boolean;
  
  // Enhanced pricing information
  is_free: boolean;
  formatted_price: string;
  formatted_sale_price?: string;
  formatted_regular_price?: string;
}

// ============= Course Price & Free Course Utilities =============

/**
 * Check if a Tutor LMS course is free
 * @param course - The Tutor course object
 * @returns boolean - true if the course is free
 */
export function isTutorCourseFree(course: TutorCourse): boolean {
  // Method 1: Check price_type field (most reliable)
  if (course.price_type === 'free') {
    return true;
  }
  
  // Method 2: Check meta price_type
  if (course.meta?._tutor_course_price_type === 'free') {
    return true;
  }
  
  // Method 3: Check if price is 0 or empty
  if (!course.price || course.price === '0' || course.price === '') {
    return true;
  }
  
  // Method 4: Check meta price
  if (!course.meta?._tutor_course_price || 
      course.meta._tutor_course_price === '0' || 
      course.meta._tutor_course_price === '') {
    return true;
  }
  
  return false;
}

/**
 * Check if a Tutor LMS course is paid
 * @param course - The Tutor course object
 * @returns boolean - true if the course is paid
 */
export function isTutorCoursePaid(course: TutorCourse): boolean {
  return !isTutorCourseFree(course);
}

// ============= WooCommerce & Tutor LMS Integration Utilities =============

/**
 * Get the Tutor LMS course ID from a WooCommerce product
 * This function checks the product's meta_data for the connected course ID
 * @param product - The WooCommerce product object
 * @returns Promise<number | null> - The Tutor LMS course ID or null if not found
 */
export async function getTutorCourseIdFromProduct(product: WooCommerceProduct): Promise<number | null> {
  // Method 1: Check common meta fields in WooCommerce product
  const possibleMetaKeys = [
    '_course_id',
    '_tutor_course',
    '_tutor_course_id',
    '_related_course',
    'course_id',
    'tutor_course_id'
  ];

  // Search through meta_data array
  for (const meta of product.meta_data || []) {
    if (possibleMetaKeys.includes(meta.key)) {
      const courseId = parseInt(String(meta.value));
      if (!isNaN(courseId) && courseId > 0) {
        return courseId;
      }
    }
  }

  // Method 2: Search Tutor LMS courses by product ID
  try {
    const { getTutorCourses } = await import('./tutor-lms');
    const tutorCourses = await getTutorCourses({ per_page: 100 });
    
    for (const course of tutorCourses) {
      if (course.meta?._tutor_course_product_id === product.id) {
        return course.id;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch Tutor courses for product mapping:', error);
  }

  return null;
}

/**
 * Check if a WooCommerce product is linked to a Tutor LMS course
 * @param product - The WooCommerce product object
 * @returns Promise<boolean> - true if the product is linked to a course
 */
export async function isProductLinkedToCourse(product: WooCommerceProduct): Promise<boolean> {
  const courseId = await getTutorCourseIdFromProduct(product);
  return courseId !== null;
}

/**
 * Check if a WooCommerce product (course) is free
 * This is a product-level check based on WooCommerce pricing
 * @param product - The WooCommerce product object
 * @returns boolean - true if the product is free
 */
export function isWooCommerceProductFree(product: WooCommerceProduct): boolean {
  // Method 1: Check if price is 0 or empty
  if (!product.price || product.price === '0' || product.price === '') {
    return true;
  }
  
  // Method 2: Check regular price if no sale price
  if (!product.regular_price || product.regular_price === '0' || product.regular_price === '') {
    return true;
  }
  
  // Method 3: Check meta data for course-related free indicators
  for (const meta of product.meta_data || []) {
    if (meta.key === '_tutor_course_price_type' && meta.value === 'free') {
      return true;
    }
    if (meta.key === '_tutor_course_price' && (!meta.value || meta.value === '0' || meta.value === '')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a WooCommerce product (course) is free by checking the linked Tutor LMS course
 * This fetches the actual Tutor course and checks its price
 * @param product - The WooCommerce product object
 * @returns Promise<boolean> - true if the linked course is free
 */
export async function isProductCourseFree(product: WooCommerceProduct): Promise<boolean> {
  // First check WooCommerce product price (faster)
  if (isWooCommerceProductFree(product)) {
    return true;
  }
  
  // Then check linked Tutor course (slower but more accurate)
  try {
    const tutorCourseId = await getTutorCourseIdFromProduct(product);
    if (!tutorCourseId) {
      // If no linked course, fall back to WooCommerce price
      return isWooCommerceProductFree(product);
    }
    
    const { getTutorCourse } = await import('./tutor-lms');
    const tutorCourse = await getTutorCourse(tutorCourseId);
    return isTutorCourseFree(tutorCourse);
  } catch (error) {
    console.warn('Failed to check Tutor course price, falling back to WooCommerce price:', error);
    return isWooCommerceProductFree(product);
  }
}

/**
 * Get formatted price for a Tutor LMS course
 * @param course - The Tutor course object
 * @returns string - Formatted price (e.g., "Free", "$49.99")
 */
export function getTutorCoursePrice(course: TutorCourse): string {
  if (isTutorCourseFree(course)) {
    return 'Free';
  }
  
  const price = course.price || course.meta?._tutor_course_price;
  
  if (!price || price === '0') {
    return 'Free';
  }
  
  // Add currency symbol (could be configurable)
  return `$${price}`;
}

/**
 * Get course price as number
 * @param course - The Tutor course object
 * @returns number - Price as number (0 for free courses)
 */
export function getTutorCoursePriceNumber(course: TutorCourse): number {
  if (isTutorCourseFree(course)) {
    return 0;
  }
  
  const price = course.price || course.meta?._tutor_course_price;
  
  if (!price) {
    return 0;
  }
  
  return parseFloat(price.toString()) || 0;
}

// ============= Course Access Utilities =============

/**
 * Check if course enrollment is open
 * @param course - The Tutor course object
 * @returns boolean - true if enrollment is open
 */
export function isTutorCourseEnrollmentOpen(course: TutorCourse): boolean {
  // Check if course is published
  if (course.status !== 'publish') {
    return false;
  }
  
  // Check if course is public or allows enrollment
  if (course.meta?._tutor_is_course_public === true) {
    return true;
  }
  
  // Additional checks can be added here for enrollment periods, etc.
  return true;
}

/**
 * Check if user can enroll in course
 * @param course - The Tutor course object
 * @param isLoggedIn - Whether user is logged in
 * @returns object with enrollment status and reason
 */
export function canEnrollInTutorCourse(
  course: TutorCourse, 
  isLoggedIn: boolean = false
): { canEnroll: boolean; reason?: string } {
  // Check if enrollment is open
  if (!isTutorCourseEnrollmentOpen(course)) {
    return { 
      canEnroll: false, 
      reason: 'Enrollment is not currently open for this course' 
    };
  }
  
  // For free courses, check if login is required
  if (isTutorCourseFree(course)) {
    // Some sites may require login even for free courses
    // This would depend on site settings
    return { canEnroll: true };
  }
  
  // For paid courses, typically need to be logged in
  if (!isLoggedIn) {
    return { 
      canEnroll: false, 
      reason: 'Please log in to enroll in this paid course' 
    };
  }
  
  return { canEnroll: true };
}

// ============= Course Filtering Utilities =============

/**
 * Filter courses by price type
 * @param courses - Array of Tutor courses
 * @param priceType - 'free', 'paid', or 'all'
 * @returns Filtered array of courses
 */
export function filterTutorCoursesByPrice(
  courses: TutorCourse[], 
  priceType: 'free' | 'paid' | 'all' = 'all'
): TutorCourse[] {
  if (priceType === 'all') {
    return courses;
  }
  
  if (priceType === 'free') {
    return courses.filter(course => isTutorCourseFree(course));
  }
  
  if (priceType === 'paid') {
    return courses.filter(course => isTutorCoursePaid(course));
  }
  
  return courses;
}

/**
 * Sort courses by price
 * @param courses - Array of Tutor courses
 * @param order - 'asc' for low to high, 'desc' for high to low
 * @returns Sorted array of courses
 */
export function sortTutorCoursesByPrice(
  courses: TutorCourse[], 
  order: 'asc' | 'desc' = 'asc'
): TutorCourse[] {
  return [...courses].sort((a, b) => {
    const priceA = getTutorCoursePriceNumber(a);
    const priceB = getTutorCoursePriceNumber(b);
    
    if (order === 'asc') {
      return priceA - priceB;
    } else {
      return priceB - priceA;
    }
  });
}

// ============= Course Level Utilities =============

/**
 * Get course difficulty level
 * @param course - The Tutor course object
 * @returns string - Course level (e.g., 'Beginner', 'Intermediate', 'Advanced')
 */
export function getTutorCourseLevel(course: TutorCourse): string {
  return course.course_level || 
         course.meta?._tutor_course_level || 
         'All Levels';
}

/**
 * Get course duration
 * @param course - The Tutor course object
 * @returns string - Course duration (e.g., '5 hours', '3 weeks')
 */
export function getTutorCourseDuration(course: TutorCourse): string {
  return course.course_duration || 
         course.meta?._tutor_course_duration || 
         'Self-paced';
}

// ============= Course Enrollment Utilities =============

/**
 * Get course enrollment count
 * @param course - The Tutor course object
 * @returns number - Number of enrolled students
 */
export function getTutorCourseEnrollmentCount(course: TutorCourse): number {
  return course.total_enrolled || 0;
}

/**
 * Check if course is popular (has many enrollments)
 * @param course - The Tutor course object
 * @param threshold - Minimum enrollments to be considered popular (default: 100)
 * @returns boolean - true if course is popular
 */
export function isTutorCoursePopular(course: TutorCourse, threshold: number = 100): boolean {
  return getTutorCourseEnrollmentCount(course) >= threshold;
}

// ============= Course Rating Utilities =============

/**
 * Get course rating information
 * @param course - The Tutor course object
 * @returns object with rating data
 */
export function getTutorCourseRating(course: TutorCourse): {
  average: number;
  count: number;
  hasRating: boolean;
} {
  const rating = course.rating;
  
  if (!rating) {
    return {
      average: 0,
      count: 0,
      hasRating: false
    };
  }
  
  return {
    average: rating.rating_avg || 0,
    count: rating.rating_count || 0,
    hasRating: (rating.rating_count || 0) > 0
  };
}

/**
 * Format course rating for display
 * @param course - The Tutor course object
 * @returns string - Formatted rating (e.g., "4.5 (123 reviews)")
 */
export function formatTutorCourseRating(course: TutorCourse): string {
  const { average, count, hasRating } = getTutorCourseRating(course);
  
  if (!hasRating) {
    return 'No ratings yet';
  }
  
  const roundedAverage = Math.round(average * 10) / 10;
  const reviewText = count === 1 ? 'review' : 'reviews';
  
  return `${roundedAverage} (${count} ${reviewText})`;
}

// ============= Type Guards =============

/**
 * Type guard to check if course data is valid
 * @param course - The course object to check
 * @returns boolean - true if valid Tutor course
 */
export function isValidTutorCourse(course: any): course is TutorCourse {
  return course && 
         typeof course === 'object' && 
         typeof course.id === 'number' && 
         course.title && 
         typeof course.title === 'object' &&
         typeof course.title.rendered === 'string';
}

// ============= Course Combination Utilities =============

/**
 * Combine TutorLMS course with WooCommerce product pricing
 * @param tutorCourse - The Tutor course object
 * @param wooProduct - The related WooCommerce product (optional)
 * @returns TutorCourseWithPricing - Combined course with pricing info
 */
export function combineTutorCourseWithPricing(
  tutorCourse: TutorCourse, 
  wooProduct?: WooCommerceProduct
): TutorCourseWithPricing {
  // Determine if course is free based on TutorLMS data
  const isFree = isTutorCourseFree(tutorCourse);
  
  let price = '0';
  let salePrice: string | undefined;
  let regularPrice = '0';
  let onSale = false;

  if (wooProduct) {
    price = wooProduct.price || '0';
    salePrice = wooProduct.sale_price;
    regularPrice = wooProduct.regular_price || '0';
    onSale = wooProduct.on_sale || false;
  } else if (!isFree) {
    // Fallback to TutorLMS pricing if no WooCommerce product
    price = tutorCourse.price || tutorCourse.meta?._tutor_course_price || '0';
    regularPrice = price;
  }

  // Format prices
  const formatPrice = (priceValue: string | undefined): string => {
    if (!priceValue || priceValue === '0' || priceValue === '') {
      return 'Free';
    }
    return `$${priceValue}`;
  };

  return {
    ...tutorCourse,
    woocommerce_product_id: wooProduct?.id,
    price,
    sale_price: salePrice,
    regular_price: regularPrice,
    on_sale: onSale,
    is_free: isFree,
    formatted_price: formatPrice(price),
    formatted_sale_price: salePrice ? formatPrice(salePrice) : undefined,
    formatted_regular_price: formatPrice(regularPrice),
  };
}

/**
 * Get courses with pricing from TutorLMS and WooCommerce
 * @param tutorCourses - Array of Tutor courses
 * @param wooProducts - Array of WooCommerce products (optional)
 * @returns Promise<TutorCourseWithPricing[]> - Combined courses with pricing
 */
export async function getCoursesWithPricing(
  tutorCourses: TutorCourse[],
  wooProducts?: WooCommerceProduct[]
): Promise<TutorCourseWithPricing[]> {
  const coursesWithPricing: TutorCourseWithPricing[] = [];

  for (const tutorCourse of tutorCourses) {
    let relatedProduct: WooCommerceProduct | undefined;

    if (wooProducts) {
      // Find related WooCommerce product
      relatedProduct = wooProducts.find(product => {
        // Method 1: Check if product meta contains course ID
        const courseIdMeta = product.meta_data?.find(meta => 
          ['_course_id', '_tutor_course', '_tutor_course_id'].includes(meta.key) && 
          parseInt(String(meta.value)) === tutorCourse.id
        );
        if (courseIdMeta) return true;

        // Method 2: Check if tutor course meta contains product ID
        if (tutorCourse.meta?._tutor_course_product_id === product.id) {
          return true;
        }

        // Method 3: Check by slug match
        if (tutorCourse.slug === product.slug) {
          return true;
        }

        return false;
      });
    }

    const combinedCourse = combineTutorCourseWithPricing(tutorCourse, relatedProduct);
    coursesWithPricing.push(combinedCourse);
  }

  return coursesWithPricing;
}
