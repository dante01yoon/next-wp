// Tutor LMS API Client for Server-Side Operations
// This handles enrollment, progress tracking, and user authentication

import { TutorCourse, TutorEnrollment, TutorCourseProgress } from './tutor-lms-types';

// ============= Configuration =============

const TUTOR_API_BASE = process.env.WORDPRESS_URL + '/wp-json/tutor/v1';
const WP_API_BASE = process.env.WORDPRESS_URL + '/wp-json/wp/v2';

interface ApiCredentials {
  username?: string;
  password?: string;
  token?: string; // JWT or Application Password
  nonce?: string; // WordPress nonce
}

// Default API credentials from environment variables
const defaultCredentials: ApiCredentials = {
  username: process.env.TUTOR_LMS_API_KEY,
  password: process.env.TUTOR_LMS_SECRET,
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

// ============= Authentication Helper =============

class TutorApiClient {
  private credentials: ApiCredentials;
  private headers: Record<string, string>;

  constructor(credentials: ApiCredentials = {}) {
    // Merge provided credentials with defaults
    this.credentials = {
      ...defaultCredentials,
      ...credentials,
    };
    
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication headers
    if (this.credentials.token) {
      this.headers['Authorization'] = `Bearer ${this.credentials.token}`;
    } else if (this.credentials.username && this.credentials.password) {
      const auth = btoa(`${this.credentials.username}:${this.credentials.password}`);
      this.headers['Authorization'] = `Basic ${auth}`;
    }

    if (this.credentials.nonce) {
      this.headers['X-WP-Nonce'] = this.credentials.nonce;
    }
  }

  private async makeRequest<T>(
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const config: RequestInit = {
        method,
        headers: this.headers,
        credentials: 'include', // Include cookies for WordPress auth
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || data.error || 'Unknown error',
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // ============= Enrollment APIs =============

  /**
   * Enroll user in a course (Free courses)
   */
  async enrollInCourse(courseId: number, userId?: number): Promise<ApiResponse<any>> {
    // For Tutor LMS, enrollment might need to be done through WordPress user system
    // This is a placeholder for the actual API call
    
    const enrollmentData = {
      course_id: courseId,
      user_id: userId,
      enrollment_method: 'free',
      enrollment_date: new Date().toISOString(),
    };

    // Try Tutor LMS specific endpoint first
    let result = await this.makeRequest(
      `${TUTOR_API_BASE}/enrollments`,
      'POST',
      enrollmentData
    );

    // If Tutor LMS endpoint doesn't exist, try WordPress user meta approach
    if (!result.success && result.status === 404) {
      result = await this.makeRequest(
        `${WP_API_BASE}/users/${userId}/meta`,
        'POST',
        {
          key: `_tutor_enrolled_course_${courseId}`,
          value: {
            enrolled_date: new Date().toISOString(),
            enrollment_method: 'free'
          }
        }
      );
    }

    return result;
  }

  /**
   * Get user's enrolled courses
   */
  async getUserEnrollments(userId: number): Promise<ApiResponse<TutorEnrollment[]>> {
    return this.makeRequest<TutorEnrollment[]>(
      `${TUTOR_API_BASE}/users/${userId}/enrollments`
    );
  }

  /**
   * Check if user is enrolled in course
   */
  async isUserEnrolled(courseId: number, userId: number): Promise<ApiResponse<boolean>> {
    const result = await this.makeRequest<any>(
      `${TUTOR_API_BASE}/users/${userId}/enrollments/${courseId}`
    );
    
    return {
      ...result,
      data: result.success && result.data ? true : false
    };
  }

  // ============= Progress Tracking APIs =============

  /**
   * Update lesson completion status
   */
  async markLessonCompleted(
    lessonId: number, 
    courseId: number, 
    userId: number
  ): Promise<ApiResponse<any>> {
    const progressData = {
      lesson_id: lessonId,
      course_id: courseId,
      user_id: userId,
      completion_date: new Date().toISOString(),
      status: 'completed'
    };

    // Try Tutor LMS progress endpoint
    let result = await this.makeRequest(
      `${TUTOR_API_BASE}/progress/lessons`,
      'POST',
      progressData
    );

    // Fallback to WordPress user meta
    if (!result.success && result.status === 404) {
      result = await this.makeRequest(
        `${WP_API_BASE}/users/${userId}/meta`,
        'POST',
        {
          key: `_tutor_lesson_completed_${lessonId}`,
          value: {
            course_id: courseId,
            completed_date: new Date().toISOString()
          }
        }
      );
    }

    return result;
  }

  /**
   * Update course progress
   */
  async updateCourseProgress(
    courseId: number, 
    userId: number, 
    progressData: Partial<TutorCourseProgress>
  ): Promise<ApiResponse<any>> {
    const data = {
      course_id: courseId,
      user_id: userId,
      ...progressData,
      last_updated: new Date().toISOString()
    };

    return this.makeRequest(
      `${TUTOR_API_BASE}/progress/courses/${courseId}`,
      'PUT',
      data
    );
  }

  /**
   * Get course progress for user
   */
  async getCourseProgress(
    courseId: number, 
    userId: number
  ): Promise<ApiResponse<TutorCourseProgress>> {
    return this.makeRequest<TutorCourseProgress>(
      `${TUTOR_API_BASE}/progress/courses/${courseId}/users/${userId}`
    );
  }

  /**
   * Get all course progress for user
   */
  async getUserProgress(userId: number): Promise<ApiResponse<TutorCourseProgress[]>> {
    return this.makeRequest<TutorCourseProgress[]>(
      `${TUTOR_API_BASE}/users/${userId}/progress`
    );
  }

  // ============= Quiz & Assignment APIs =============

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(
    quizId: number,
    courseId: number,
    userId: number,
    answers: Record<string, any>
  ): Promise<ApiResponse<any>> {
    const data = {
      quiz_id: quizId,
      course_id: courseId,
      user_id: userId,
      answers,
      submitted_at: new Date().toISOString()
    };

    return this.makeRequest(
      `${TUTOR_API_BASE}/quiz-attempts`,
      'POST',
      data
    );
  }

  /**
   * Submit assignment
   */
  async submitAssignment(
    assignmentId: number,
    courseId: number,
    userId: number,
    submissionData: any
  ): Promise<ApiResponse<any>> {
    const data = {
      assignment_id: assignmentId,
      course_id: courseId,
      user_id: userId,
      ...submissionData,
      submitted_at: new Date().toISOString()
    };

    return this.makeRequest(
      `${TUTOR_API_BASE}/assignments/submissions`,
      'POST',
      data
    );
  }

  // ============= User Activity Tracking =============

  /**
   * Track lesson access
   */
  async trackLessonAccess(
    lessonId: number,
    courseId: number,
    userId: number,
    accessData?: any
  ): Promise<ApiResponse<any>> {
    const data = {
      lesson_id: lessonId,
      course_id: courseId,
      user_id: userId,
      accessed_at: new Date().toISOString(),
      ...accessData
    };

    return this.makeRequest(
      `${TUTOR_API_BASE}/activity/lessons`,
      'POST',
      data
    );
  }

  /**
   * Update lesson watch time (for videos)
   */
  async updateLessonWatchTime(
    lessonId: number,
    courseId: number,
    userId: number,
    watchTime: number,
    totalDuration?: number
  ): Promise<ApiResponse<any>> {
    const data = {
      lesson_id: lessonId,
      course_id: courseId,
      user_id: userId,
      watch_time: watchTime,
      total_duration: totalDuration,
      updated_at: new Date().toISOString()
    };

    return this.makeRequest(
      `${TUTOR_API_BASE}/activity/watch-time`,
      'PUT',
      data
    );
  }
}

// ============= Factory Functions =============

/**
 * Create authenticated API client for current user
 */
export function createTutorApiClient(credentials?: ApiCredentials): TutorApiClient {
  return new TutorApiClient(credentials);
}

/**
 * Create API client with WordPress authentication
 */
export function createAuthenticatedClient(
  username: string, 
  password: string
): TutorApiClient {
  return new TutorApiClient({ username, password });
}

/**
 * Create API client with JWT token
 */
export function createTokenClient(token: string): TutorApiClient {
  return new TutorApiClient({ token });
}

/**
 * Create API client with WordPress nonce (for logged-in users)
 */
export function createNonceClient(nonce: string): TutorApiClient {
  return new TutorApiClient({ nonce });
}

// ============= Convenience Functions =============

/**
 * Enroll in free course with automatic client creation
 */
export async function enrollInFreeCourseAPI(
  courseId: number,
  userId: number,
  credentials?: ApiCredentials
): Promise<ApiResponse<any>> {
  const client = createTutorApiClient(credentials);
  return client.enrollInCourse(courseId, userId);
}

/**
 * Mark lesson as completed with automatic client creation
 */
export async function markLessonCompletedAPI(
  lessonId: number,
  courseId: number,
  userId: number,
  credentials?: ApiCredentials
): Promise<ApiResponse<any>> {
  const client = createTutorApiClient(credentials);
  return client.markLessonCompleted(lessonId, courseId, userId);
}

/**
 * Get course progress with automatic client creation
 */
export async function getCourseProgressAPI(
  courseId: number,
  userId: number,
  credentials?: ApiCredentials
): Promise<ApiResponse<TutorCourseProgress>> {
  const client = createTutorApiClient(credentials);
  return client.getCourseProgress(courseId, userId);
}

export { TutorApiClient };
