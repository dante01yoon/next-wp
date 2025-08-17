// Tutor LMS API functions
// Description: Functions to fetch data from Tutor LMS using the REST API
// Types are imported from `tutor-lms-types.ts`

import querystring from "query-string";

import {
  TutorCourse,
  TutorCourseTopic,
  TutorLesson,
  TutorQuiz,
  TutorQuizQuestion,
  TutorCourseAnnouncement,
  TutorCourseRating,
  TutorInstructor,
  TutorCourseContent,
  TutorCoursesQueryParams,
  TutorTopicsQueryParams,
  TutorLessonsQueryParams,
  TutorQuizQueryParams,
  TutorApiResponse,
  TutorPaginatedResponse,
} from "./tutor-lms-types";

// Tutor LMS Config
const baseUrl = process.env.WORDPRESS_URL; // Same as WordPress URL since Tutor LMS extends WP
const tutorApiPath = "/wp-json/tutor/v1";
const tutorApiKey = process.env.TUTOR_LMS_API_KEY;
const tutorApiSecret = process.env.TUTOR_LMS_SECRET;

if (!baseUrl) {
  throw new Error("WORDPRESS_URL environment variable is not defined");
}

if (!tutorApiKey || !tutorApiSecret) {
  throw new Error("TUTOR_LMS_API_KEY and TUTOR_LMS_SECRET environment variables are required");
}

// Utility type for fetch options
interface FetchOptions {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  headers?: HeadersInit;
}

function getTutorUrl(path: string, query?: Record<string, any>) {
  const params = query ? querystring.stringify(query) : null;
  return `${baseUrl}${tutorApiPath}${path}${params ? `?${params}` : ""}`;
}

// Create Basic Auth header for Tutor LMS API
const createAuthHeader = () => {
  const credentials = `${tutorApiKey}:${tutorApiSecret}`;
  return `Basic ${btoa(credentials)}`;
};

// Default fetch options for Tutor LMS API calls
const defaultFetchOptions: FetchOptions = {
  next: {
    tags: ["tutor-lms"],
    revalidate: 3600, // Revalidate every hour by default
  },
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: createAuthHeader(),
  },
};

async function tutorFetch<T>(
  path: string,
  options: FetchOptions = {},
  query?: Record<string, any>
): Promise<T> {
  const url = getTutorUrl(path, query);
  const mergedOptions = {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
    },
    next: {
      ...defaultFetchOptions.next,
      ...options.next,
      tags: [
        ...(defaultFetchOptions.next?.tags || []),
        ...(options.next?.tags || []),
      ],
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      throw new Error(`Tutor LMS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Tutor LMS API fetch error:", error);
    throw error;
  }
}

// ============= Course Functions =============

/**
 * Get all courses with optional filtering and pagination
 * URL: /wp-json/tutor/v1/courses
 */
export async function getTutorCourses(
  params: TutorCoursesQueryParams = {},
  options: FetchOptions = {}
): Promise<TutorCourse[]> {
  return tutorFetch<TutorCourse[]>("/courses", options, params);
}

/**
 * Get course details by course ID
 * URL: /wp-json/tutor/v1/courses/{course_id}
 */
export async function getTutorCourse(
  courseId: number,
  options: FetchOptions = {}
): Promise<TutorCourse> {
  return tutorFetch<TutorCourse>(`/courses/${courseId}`, options);
}

/**
 * Get course content structure by course ID
 * URL: /wp-json/tutor/v1/course-contents/{course_id}
 */
export async function getTutorCourseContent(
  courseId: number,
  options: FetchOptions = {}
): Promise<TutorCourseContent> {
  return tutorFetch<TutorCourseContent>(`/course-contents/${courseId}`, options);
}

// ============= Course Topics (Sections) Functions =============

/**
 * Get course topics by course ID
 * URL: /wp-json/tutor/v1/topics?course_id={course_id}
 */
export async function getTutorCourseTopics(
  courseId: number,
  params: Omit<TutorTopicsQueryParams, 'course_id'> = {},
  options: FetchOptions = {}
): Promise<TutorCourseTopic[]> {
  return tutorFetch<TutorCourseTopic[]>("/topics", options, {
    course_id: courseId,
    ...params,
  });
}

// ============= Lesson Functions =============

/**
 * Get lessons by topic ID
 * URL: /wp-json/tutor/v1/lessons?topic_id={topic_id}
 */
export async function getTutorLessons(
  topicId: number,
  params: Omit<TutorLessonsQueryParams, 'topic_id'> = {},
  options: FetchOptions = {}
): Promise<TutorLesson[]> {
  return tutorFetch<TutorLesson[]>("/lessons", options, {
    topic_id: topicId,
    ...params,
  });
}

/**
 * Get single lesson by lesson ID
 * Note: This might require additional endpoint or using topics with filtering
 */
export async function getTutorLesson(
  lessonId: number,
  options: FetchOptions = {}
): Promise<TutorLesson> {
  // This endpoint might not exist in free version, would need to fetch through topics
  // For now, returning a placeholder implementation
  throw new Error("Single lesson endpoint not available in Tutor LMS free version");
}

// ============= Quiz Functions =============

/**
 * Get quizzes by topic ID
 * URL: /wp-json/tutor/v1/quiz/{topic_id}
 */
export async function getTutorQuizzes(
  topicId: number,
  params: Omit<TutorQuizQueryParams, 'topic_id'> = {},
  options: FetchOptions = {}
): Promise<TutorQuiz[]> {
  return tutorFetch<TutorQuiz[]>(`/quiz/${topicId}`, options, params);
}

/**
 * Get quiz questions by quiz ID
 * URL: /wp-json/tutor/v1/quiz-question-answer/{quiz_id}
 */
export async function getTutorQuizQuestions(
  quizId: number,
  options: FetchOptions = {}
): Promise<TutorQuizQuestion[]> {
  return tutorFetch<TutorQuizQuestion[]>(`/quiz-question-answer/${quizId}`, options);
}

// ============= Course Announcements Functions =============

/**
 * Get course announcements by course ID
 * URL: /wp-json/tutor/v1/course-annoucement/{course_id}
 */
export async function getTutorCourseAnnouncements(
  courseId: number,
  options: FetchOptions = {}
): Promise<TutorCourseAnnouncement[]> {
  return tutorFetch<TutorCourseAnnouncement[]>(`/course-annoucement/${courseId}`, options);
}

// ============= Instructor Functions =============

/**
 * Get author/instructor information by author ID
 * URL: /wp-json/tutor/v1/author-information/{author_id}
 */
export async function getTutorInstructor(
  authorId: number,
  options: FetchOptions = {}
): Promise<TutorInstructor> {
  return tutorFetch<TutorInstructor>(`/author-information/${authorId}`, options);
}

// ============= Course Ratings Functions =============

/**
 * Get course ratings by course ID
 * URL: /wp-json/tutor/v1/course-rating/{course_id}
 */
export async function getTutorCourseRatings(
  courseId: number,
  options: FetchOptions = {}
): Promise<TutorCourseRating[]> {
  return tutorFetch<TutorCourseRating[]>(`/course-rating/${courseId}`, options);
}

// ============= Utility Functions =============

/**
 * Revalidate Tutor LMS cache
 * Only works on server-side
 */
export async function revalidateTutorCache() {
  // Only execute on server-side
  if (typeof window === 'undefined') {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag("tutor-lms");
    } catch (error) {
      console.warn('Failed to revalidate cache:', error);
    }
  }
}

/**
 * Revalidate specific course cache
 * Only works on server-side
 */
export async function revalidateTutorCourse(courseId: number) {
  // Only execute on server-side
  if (typeof window === 'undefined') {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(`tutor-course-${courseId}`);
    } catch (error) {
      console.warn('Failed to revalidate course cache:', error);
    }
  }
}

/**
 * Get full course data with all related content
 * This combines multiple API calls to get complete course information
 */
export async function getTutorCourseComplete(
  courseId: number,
  options: FetchOptions = {}
): Promise<{
  course: TutorCourse;
  topics: TutorCourseTopic[];
  content: TutorCourseContent;
  instructor: TutorInstructor;
  ratings: TutorCourseRating[];
  announcements: TutorCourseAnnouncement[];
}> {
  try {
    // Fetch course details first to get author ID
    const course = await getTutorCourse(courseId, options);
    
    // Fetch all related data in parallel
    const [topics, content, instructor, ratings, announcements] = await Promise.all([
      getTutorCourseTopics(courseId, {}, options),
      getTutorCourseContent(courseId, options),
      getTutorInstructor(course.author, options),
      getTutorCourseRatings(courseId, options),
      getTutorCourseAnnouncements(courseId, options),
    ]);

    return {
      course,
      topics,
      content,
      instructor,
      ratings,
      announcements,
    };
  } catch (error) {
    console.error("Error fetching complete course data:", error);
    throw error;
  }
}

/**
 * Search courses with full-text search
 * Uses the courses endpoint with search parameter
 */
export async function searchTutorCourses(
  searchTerm: string,
  params: Omit<TutorCoursesQueryParams, 'search'> = {},
  options: FetchOptions = {}
): Promise<TutorCourse[]> {
  return getTutorCourses({
    search: searchTerm,
    ...params,
  }, options);
}

/**
 * Get featured courses
 */
export async function getFeaturedTutorCourses(
  params: Omit<TutorCoursesQueryParams, 'featured'> = {},
  options: FetchOptions = {}
): Promise<TutorCourse[]> {
  return getTutorCourses({
    featured: true,
    ...params,
  }, options);
}

/**
 * Get courses by category
 */
export async function getTutorCoursesByCategory(
  categories: string | string[],
  params: Omit<TutorCoursesQueryParams, 'categories'> = {},
  options: FetchOptions = {}
): Promise<TutorCourse[]> {
  const categoryString = Array.isArray(categories) ? categories.join(',') : categories;
  return getTutorCourses({
    categories: categoryString,
    ...params,
  }, options);
}

/**
 * Get courses by tag
 */
export async function getTutorCoursesByTag(
  tags: string | string[],
  params: Omit<TutorCoursesQueryParams, 'tags'> = {},
  options: FetchOptions = {}
): Promise<TutorCourse[]> {
  const tagString = Array.isArray(tags) ? tags.join(',') : tags;
  return getTutorCourses({
    tags: tagString,
    ...params,
  }, options);
}

/**
 * Get courses by instructor
 */
export async function getTutorCoursesByInstructor(
  instructorId: number,
  params: Omit<TutorCoursesQueryParams, 'author'> = {},
  options: FetchOptions = {}
): Promise<TutorCourse[]> {
  return getTutorCourses({
    author: instructorId,
    ...params,
  }, options);
}

// ============= Error Handling =============

export class TutorLmsError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TutorLmsError';
  }
}

// ============= Type Guards =============

export function isTutorCourse(data: any): data is TutorCourse {
  return data && typeof data === 'object' && typeof data.id === 'number' && data.type === 'courses';
}

export function isTutorLesson(data: any): data is TutorLesson {
  return data && typeof data === 'object' && typeof data.lesson_id === 'number';
}

export function isTutorQuiz(data: any): data is TutorQuiz {
  return data && typeof data === 'object' && typeof data.quiz_id === 'number';
}
