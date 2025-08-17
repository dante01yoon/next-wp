// Tutor LMS Enrollment Functions
// Functions to handle course enrollment and progress tracking

import { TutorCourse, TutorCourseContent, TutorLesson } from './tutor-lms-types';

// ============= Enrollment Types =============

export interface EnrollmentData {
  courseId: number;
  userId?: number;
  enrollmentMethod: 'free' | 'purchase' | 'admin';
  timestamp: string;
}

export interface CourseProgress {
  courseId: number;
  userId?: number;
  completedLessons: number[];
  completedQuizzes: number[];
  completedAssignments: number[];
  overallProgress: number; // 0-100
  lastAccessed: string;
  startDate: string;
  completionDate?: string;
}

export interface LessonProgress {
  lessonId: number;
  courseId: number;
  userId?: number;
  isCompleted: boolean;
  progressPercentage: number; // 0-100
  timeSpent: number; // in seconds
  lastPosition?: number; // for video lessons
  accessedAt: string;
  completedAt?: string;
}

// ============= Local Storage Keys =============

const STORAGE_KEYS = {
  ENROLLMENTS: 'tutor_enrollments',
  COURSE_PROGRESS: 'tutor_course_progress',
  LESSON_PROGRESS: 'tutor_lesson_progress',
  USER_PREFERENCES: 'tutor_user_preferences',
} as const;

// ============= Storage Utilities =============

function getStorageData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

function setStorageData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

// ============= Enrollment Functions =============

/**
 * Check if user is enrolled in a course
 */
export function isEnrolledInCourse(courseId: number, userId?: number): boolean {
  const enrollments = getStorageData<EnrollmentData[]>(STORAGE_KEYS.ENROLLMENTS, []);
  return enrollments.some(enrollment => 
    enrollment.courseId === courseId && 
    (!userId || enrollment.userId === userId)
  );
}

/**
 * Enroll user in a free course
 */
export function enrollInFreeCourse(courseId: number, userId?: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const enrollments = getStorageData<EnrollmentData[]>(STORAGE_KEYS.ENROLLMENTS, []);
      
      // Check if already enrolled
      if (isEnrolledInCourse(courseId, userId)) {
        resolve(true);
        return;
      }
      
      // Add new enrollment
      const newEnrollment: EnrollmentData = {
        courseId,
        userId,
        enrollmentMethod: 'free',
        timestamp: new Date().toISOString(),
      };
      
      enrollments.push(newEnrollment);
      setStorageData(STORAGE_KEYS.ENROLLMENTS, enrollments);
      
      // Initialize course progress
      initializeCourseProgress(courseId, userId);
      
      resolve(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      resolve(false);
    }
  });
}

/**
 * Get user's enrolled courses
 */
export function getEnrolledCourses(userId?: number): number[] {
  const enrollments = getStorageData<EnrollmentData[]>(STORAGE_KEYS.ENROLLMENTS, []);
  return enrollments
    .filter(enrollment => !userId || enrollment.userId === userId)
    .map(enrollment => enrollment.courseId);
}

/**
 * Unenroll from a course
 */
export function unenrollFromCourse(courseId: number, userId?: number): boolean {
  try {
    const enrollments = getStorageData<EnrollmentData[]>(STORAGE_KEYS.ENROLLMENTS, []);
    const filteredEnrollments = enrollments.filter(enrollment => 
      !(enrollment.courseId === courseId && (!userId || enrollment.userId === userId))
    );
    
    setStorageData(STORAGE_KEYS.ENROLLMENTS, filteredEnrollments);
    
    // Remove progress data
    removeCourseProgress(courseId, userId);
    
    return true;
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    return false;
  }
}

// ============= Progress Tracking Functions =============

/**
 * Initialize course progress for a newly enrolled user
 */
export function initializeCourseProgress(courseId: number, userId?: number): void {
  const progressData = getStorageData<CourseProgress[]>(STORAGE_KEYS.COURSE_PROGRESS, []);
  
  // Check if progress already exists
  const existingProgress = progressData.find(p => 
    p.courseId === courseId && (!userId || p.userId === userId)
  );
  
  if (!existingProgress) {
    const newProgress: CourseProgress = {
      courseId,
      userId,
      completedLessons: [],
      completedQuizzes: [],
      completedAssignments: [],
      overallProgress: 0,
      lastAccessed: new Date().toISOString(),
      startDate: new Date().toISOString(),
    };
    
    progressData.push(newProgress);
    setStorageData(STORAGE_KEYS.COURSE_PROGRESS, progressData);
  }
}

/**
 * Get course progress for a user
 */
export function getCourseProgress(courseId: number, userId?: number): CourseProgress | null {
  const progressData = getStorageData<CourseProgress[]>(STORAGE_KEYS.COURSE_PROGRESS, []);
  return progressData.find(p => 
    p.courseId === courseId && (!userId || p.userId === userId)
  ) || null;
}

/**
 * Update course progress
 */
export function updateCourseProgress(
  courseId: number, 
  updates: Partial<CourseProgress>,
  userId?: number
): void {
  const progressData = getStorageData<CourseProgress[]>(STORAGE_KEYS.COURSE_PROGRESS, []);
  const index = progressData.findIndex(p => 
    p.courseId === courseId && (!userId || p.userId === userId)
  );
  
  if (index !== -1) {
    progressData[index] = {
      ...progressData[index],
      ...updates,
      lastAccessed: new Date().toISOString(),
    };
    setStorageData(STORAGE_KEYS.COURSE_PROGRESS, progressData);
  }
}

/**
 * Remove course progress
 */
export function removeCourseProgress(courseId: number, userId?: number): void {
  const progressData = getStorageData<CourseProgress[]>(STORAGE_KEYS.COURSE_PROGRESS, []);
  const filteredProgress = progressData.filter(p => 
    !(p.courseId === courseId && (!userId || p.userId === userId))
  );
  setStorageData(STORAGE_KEYS.COURSE_PROGRESS, filteredProgress);
}

// ============= Lesson Progress Functions =============

/**
 * Mark lesson as completed
 */
export function markLessonCompleted(
  lessonId: number, 
  courseId: number, 
  userId?: number
): void {
  // Update lesson progress
  const lessonProgressData = getStorageData<LessonProgress[]>(STORAGE_KEYS.LESSON_PROGRESS, []);
  const existingIndex = lessonProgressData.findIndex(p => 
    p.lessonId === lessonId && p.courseId === courseId && (!userId || p.userId === userId)
  );
  
  const now = new Date().toISOString();
  
  if (existingIndex !== -1) {
    lessonProgressData[existingIndex] = {
      ...lessonProgressData[existingIndex],
      isCompleted: true,
      progressPercentage: 100,
      completedAt: now,
      accessedAt: now,
    };
  } else {
    lessonProgressData.push({
      lessonId,
      courseId,
      userId,
      isCompleted: true,
      progressPercentage: 100,
      timeSpent: 0,
      accessedAt: now,
      completedAt: now,
    });
  }
  
  setStorageData(STORAGE_KEYS.LESSON_PROGRESS, lessonProgressData);
  
  // Update course progress
  const courseProgress = getCourseProgress(courseId, userId);
  if (courseProgress) {
    const completedLessons = [...courseProgress.completedLessons];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }
    
    updateCourseProgress(courseId, {
      completedLessons,
      overallProgress: calculateOverallProgress(courseId, userId),
    }, userId);
  }
}

/**
 * Update lesson progress (for video position, time spent, etc.)
 */
export function updateLessonProgress(
  lessonId: number,
  courseId: number,
  updates: Partial<LessonProgress>,
  userId?: number
): void {
  const lessonProgressData = getStorageData<LessonProgress[]>(STORAGE_KEYS.LESSON_PROGRESS, []);
  const existingIndex = lessonProgressData.findIndex(p => 
    p.lessonId === lessonId && p.courseId === courseId && (!userId || p.userId === userId)
  );
  
  const now = new Date().toISOString();
  
  if (existingIndex !== -1) {
    lessonProgressData[existingIndex] = {
      ...lessonProgressData[existingIndex],
      ...updates,
      accessedAt: now,
    };
  } else {
    lessonProgressData.push({
      lessonId,
      courseId,
      userId,
      isCompleted: false,
      progressPercentage: 0,
      timeSpent: 0,
      accessedAt: now,
      ...updates,
    });
  }
  
  setStorageData(STORAGE_KEYS.LESSON_PROGRESS, lessonProgressData);
}

/**
 * Get lesson progress
 */
export function getLessonProgress(
  lessonId: number, 
  courseId: number, 
  userId?: number
): LessonProgress | null {
  const lessonProgressData = getStorageData<LessonProgress[]>(STORAGE_KEYS.LESSON_PROGRESS, []);
  return lessonProgressData.find(p => 
    p.lessonId === lessonId && p.courseId === courseId && (!userId || p.userId === userId)
  ) || null;
}

/**
 * Check if lesson is completed
 */
export function isLessonCompleted(
  lessonId: number, 
  courseId: number, 
  userId?: number
): boolean {
  const progress = getLessonProgress(lessonId, courseId, userId);
  return progress?.isCompleted || false;
}

// ============= Progress Calculation Functions =============

/**
 * Calculate overall course progress percentage
 */
export function calculateOverallProgress(courseId: number, userId?: number): number {
  const courseProgress = getCourseProgress(courseId, userId);
  if (!courseProgress) return 0;
  
  // This would ideally use the actual course content to get total counts
  // For now, we'll use a simple calculation based on completed items
  const totalCompleted = 
    courseProgress.completedLessons.length + 
    courseProgress.completedQuizzes.length + 
    courseProgress.completedAssignments.length;
  
  // This should be replaced with actual totals from course content
  const estimatedTotal = Math.max(totalCompleted, 10); // Minimum estimate
  
  return Math.min(Math.round((totalCompleted / estimatedTotal) * 100), 100);
}

/**
 * Get course completion status
 */
export function getCourseCompletionStatus(courseId: number, userId?: number): {
  isCompleted: boolean;
  progress: number;
  completedItems: number;
  totalItems: number;
} {
  const progress = getCourseProgress(courseId, userId);
  
  if (!progress) {
    return {
      isCompleted: false,
      progress: 0,
      completedItems: 0,
      totalItems: 0,
    };
  }
  
  const completedItems = 
    progress.completedLessons.length + 
    progress.completedQuizzes.length + 
    progress.completedAssignments.length;
  
  return {
    isCompleted: progress.overallProgress === 100,
    progress: progress.overallProgress,
    completedItems,
    totalItems: completedItems, // This should be replaced with actual totals
  };
}

// ============= URL Generation Functions =============

/**
 * Generate URL for course learning page
 */
export function getCourseLearnUrl(courseId: number, courseSlug?: string): string {
  if (courseSlug) {
    return `/courses/${courseSlug}/learn`;
  }
  return `/courses/learn/${courseId}`;
}

/**
 * Generate URL for specific lesson
 */
export function getLessonUrl(courseId: number, lessonId: number, courseSlug?: string): string {
  const baseUrl = getCourseLearnUrl(courseId, courseSlug);
  return `${baseUrl}/lesson/${lessonId}`;
}

/**
 * Generate next lesson URL
 */
export function getNextLessonUrl(
  currentLessonId: number, 
  courseContent: TutorCourseContent
): string | null {
  // Find current lesson in course content
  for (const topic of courseContent.topics) {
    const currentIndex = topic.contents.findIndex(
      content => content.type === 'lesson' && content.id === currentLessonId
    );
    
    if (currentIndex !== -1) {
      // Look for next lesson in current topic
      const nextInTopic = topic.contents.slice(currentIndex + 1).find(
        content => content.type === 'lesson'
      );
      
      if (nextInTopic) {
        return getLessonUrl(courseContent.course_id, nextInTopic.id);
      }
      
      // Look for next lesson in next topic
      const topicIndex = courseContent.topics.indexOf(topic);
      for (let i = topicIndex + 1; i < courseContent.topics.length; i++) {
        const nextLesson = courseContent.topics[i].contents.find(
          content => content.type === 'lesson'
        );
        if (nextLesson) {
          return getLessonUrl(courseContent.course_id, nextLesson.id);
        }
      }
    }
  }
  
  return null; // No next lesson found
}

// ============= Utility Functions =============

/**
 * Reset all course data (for development/testing)
 */
export function resetAllCourseData(): void {
  if (typeof window !== 'undefined') {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

/**
 * Export user progress data
 */
export function exportUserProgress(userId?: number): {
  enrollments: EnrollmentData[];
  courseProgress: CourseProgress[];
  lessonProgress: LessonProgress[];
} {
  const enrollments = getStorageData<EnrollmentData[]>(STORAGE_KEYS.ENROLLMENTS, []);
  const courseProgress = getStorageData<CourseProgress[]>(STORAGE_KEYS.COURSE_PROGRESS, []);
  const lessonProgress = getStorageData<LessonProgress[]>(STORAGE_KEYS.LESSON_PROGRESS, []);
  
  if (!userId) {
    return { enrollments, courseProgress, lessonProgress };
  }
  
  return {
    enrollments: enrollments.filter(e => e.userId === userId),
    courseProgress: courseProgress.filter(p => p.userId === userId),
    lessonProgress: lessonProgress.filter(p => p.userId === userId),
  };
}
