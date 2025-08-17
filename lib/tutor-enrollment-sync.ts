// Tutor LMS Enrollment Sync
// Hybrid approach: Local storage + Server API synchronization

import { 
  EnrollmentData, 
  CourseProgress, 
  LessonProgress,
  isEnrolledInCourse as localIsEnrolled,
  enrollInFreeCourse as localEnrollInFreeCourse,
  markLessonCompleted as localMarkLessonCompleted,
  getCourseProgress as localGetCourseProgress,
  updateCourseProgress as localUpdateCourseProgress,
} from './tutor-enrollment';

import {
  TutorApiClient,
  createTutorApiClient,
  enrollInFreeCourseAPI,
  markLessonCompletedAPI,
  getCourseProgressAPI,
} from './tutor-api-client';

// ============= Types =============

interface SyncOptions {
  userId?: number;
  credentials?: {
    token?: string;
    nonce?: string;
    username?: string;
    password?: string;
  };
  offline?: boolean; // Force offline mode
  syncInterval?: number; // Auto-sync interval in ms
}

interface SyncResult {
  success: boolean;
  error?: string;
  synced: {
    enrollments: number;
    progress: number;
    lessons: number;
  };
}

// ============= Sync Manager =============

class TutorEnrollmentSync {
  private apiClient: TutorApiClient | null = null;
  private userId?: number;
  private isOnline: boolean = true;
  private syncQueue: Array<() => Promise<any>> = [];
  private autoSyncInterval?: NodeJS.Timeout;

  constructor(options: SyncOptions = {}) {
    this.userId = options.userId;
    
    if (!options.offline && options.credentials) {
      this.apiClient = createTutorApiClient(options.credentials);
    }

    // Check online status
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processSyncQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }

    // Setup auto-sync
    if (options.syncInterval && this.apiClient) {
      this.setupAutoSync(options.syncInterval);
    }
  }

  private setupAutoSync(interval: number): void {
    this.autoSyncInterval = setInterval(() => {
      if (this.isOnline && this.apiClient) {
        this.syncToServer();
      }
    }, interval);
  }

  private addToSyncQueue(operation: () => Promise<any>): void {
    this.syncQueue.push(operation);
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || !this.apiClient) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of queue) {
      try {
        await operation();
      } catch (error) {
        console.error('Sync queue operation failed:', error);
        // Re-add failed operations to queue
        this.syncQueue.push(operation);
      }
    }
  }

  // ============= Enrollment Methods =============

  async isEnrolledInCourse(courseId: number): Promise<boolean> {
    // Always check local storage first for immediate response
    const localResult = localIsEnrolled(courseId, this.userId);

    // If online and have API client, verify with server
    if (this.isOnline && this.apiClient && this.userId) {
      try {
        const serverResult = await this.apiClient.isUserEnrolled(courseId, this.userId);
        
        if (serverResult.success && serverResult.data !== localResult) {
          // Sync discrepancy - server is source of truth
          if (serverResult.data && !localResult) {
            // User is enrolled on server but not locally
            await localEnrollInFreeCourse(courseId, this.userId);
          }
          return serverResult.data;
        }
      } catch (error) {
        console.warn('Failed to check server enrollment status:', error);
      }
    }

    return localResult;
  }

  async enrollInFreeCourse(courseId: number): Promise<boolean> {
    // Always enroll locally first for immediate response
    const localSuccess = await localEnrollInFreeCourse(courseId, this.userId);

    if (!localSuccess) {
      return false;
    }

    // Try to sync with server
    if (this.isOnline && this.apiClient && this.userId) {
      try {
        const serverResult = await this.apiClient.enrollInCourse(courseId, this.userId);
        
        if (!serverResult.success) {
          console.warn('Failed to enroll on server:', serverResult.error);
          // Add to sync queue for retry
          this.addToSyncQueue(async () => {
            await this.apiClient!.enrollInCourse(courseId, this.userId!);
          });
        }
      } catch (error) {
        console.warn('Failed to sync enrollment to server:', error);
        // Add to sync queue for retry
        this.addToSyncQueue(async () => {
          await this.apiClient!.enrollInCourse(courseId, this.userId!);
        });
      }
    } else {
      // Queue for later sync
      this.addToSyncQueue(async () => {
        await this.apiClient!.enrollInCourse(courseId, this.userId!);
      });
    }

    return true;
  }

  // ============= Progress Methods =============

  async markLessonCompleted(lessonId: number, courseId: number): Promise<void> {
    // Mark locally first
    localMarkLessonCompleted(lessonId, courseId, this.userId);

    // Try to sync with server
    if (this.isOnline && this.apiClient && this.userId) {
      try {
        const serverResult = await this.apiClient.markLessonCompleted(
          lessonId, 
          courseId, 
          this.userId
        );
        
        if (!serverResult.success) {
          console.warn('Failed to mark lesson completed on server:', serverResult.error);
          this.addToSyncQueue(async () => {
            await this.apiClient!.markLessonCompleted(lessonId, courseId, this.userId!);
          });
        }
      } catch (error) {
        console.warn('Failed to sync lesson completion to server:', error);
        this.addToSyncQueue(async () => {
          await this.apiClient!.markLessonCompleted(lessonId, courseId, this.userId!);
        });
      }
    } else {
      // Queue for later sync
      this.addToSyncQueue(async () => {
        await this.apiClient!.markLessonCompleted(lessonId, courseId, this.userId!);
      });
    }
  }

  async getCourseProgress(courseId: number): Promise<CourseProgress | null> {
    // Get local progress first
    let localProgress = localGetCourseProgress(courseId, this.userId);

    // If online, try to get server progress and merge
    if (this.isOnline && this.apiClient && this.userId) {
      try {
        const serverResult = await this.apiClient.getCourseProgress(courseId, this.userId);
        
        if (serverResult.success && serverResult.data) {
          const serverProgress = serverResult.data;
          
          // Merge server and local progress (server takes precedence)
          const mergedProgress: CourseProgress = {
            courseId,
            userId: this.userId,
            completedLessons: serverProgress.completedLessons || localProgress?.completedLessons || [],
            completedQuizzes: serverProgress.completedQuizzes || localProgress?.completedQuizzes || [],
            completedAssignments: serverProgress.completedAssignments || localProgress?.completedAssignments || [],
            overallProgress: serverProgress.overallProgress || localProgress?.overallProgress || 0,
            lastAccessed: serverProgress.lastAccessed || localProgress?.lastAccessed || new Date().toISOString(),
            startDate: serverProgress.startDate || localProgress?.startDate || new Date().toISOString(),
            completionDate: serverProgress.completionDate || localProgress?.completionDate,
          };

          // Update local storage with merged data
          localUpdateCourseProgress(courseId, mergedProgress, this.userId);
          return mergedProgress;
        }
      } catch (error) {
        console.warn('Failed to get server progress:', error);
      }
    }

    return localProgress;
  }

  // ============= Sync Methods =============

  async syncToServer(): Promise<SyncResult> {
    if (!this.isOnline || !this.apiClient || !this.userId) {
      return {
        success: false,
        error: 'No server connection or authentication',
        synced: { enrollments: 0, progress: 0, lessons: 0 }
      };
    }

    const result: SyncResult = {
      success: true,
      synced: { enrollments: 0, progress: 0, lessons: 0 }
    };

    try {
      // Process sync queue
      await this.processSyncQueue();
      result.synced.enrollments = this.syncQueue.length;

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        synced: { enrollments: 0, progress: 0, lessons: 0 }
      };
    }
  }

  async syncFromServer(): Promise<SyncResult> {
    if (!this.isOnline || !this.apiClient || !this.userId) {
      return {
        success: false,
        error: 'No server connection or authentication',
        synced: { enrollments: 0, progress: 0, lessons: 0 }
      };
    }

    const result: SyncResult = {
      success: true,
      synced: { enrollments: 0, progress: 0, lessons: 0 }
    };

    try {
      // Sync enrollments
      const enrollmentsResult = await this.apiClient.getUserEnrollments(this.userId);
      if (enrollmentsResult.success && enrollmentsResult.data) {
        // Update local storage with server enrollments
        // This would require implementing a merge strategy
        result.synced.enrollments = enrollmentsResult.data.length;
      }

      // Sync progress
      const progressResult = await this.apiClient.getUserProgress(this.userId);
      if (progressResult.success && progressResult.data) {
        // Update local storage with server progress
        result.synced.progress = progressResult.data.length;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        synced: { enrollments: 0, progress: 0, lessons: 0 }
      };
    }
  }

  // ============= Cleanup =============

  destroy(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
  }
}

// ============= Global Sync Manager =============

let globalSyncManager: TutorEnrollmentSync | null = null;

export function initializeTutorSync(options: SyncOptions): TutorEnrollmentSync {
  if (globalSyncManager) {
    globalSyncManager.destroy();
  }
  
  globalSyncManager = new TutorEnrollmentSync(options);
  return globalSyncManager;
}

export function getTutorSyncManager(): TutorEnrollmentSync | null {
  return globalSyncManager;
}

// ============= Exported Functions =============

/**
 * Enhanced enrollment function with server sync
 */
export async function enrollInFreeCourseSync(
  courseId: number,
  userId?: number,
  credentials?: SyncOptions['credentials']
): Promise<boolean> {
  const syncManager = globalSyncManager || new TutorEnrollmentSync({ userId, credentials });
  return syncManager.enrollInFreeCourse(courseId);
}

/**
 * Enhanced lesson completion with server sync
 */
export async function markLessonCompletedSync(
  lessonId: number,
  courseId: number,
  userId?: number,
  credentials?: SyncOptions['credentials']
): Promise<void> {
  const syncManager = globalSyncManager || new TutorEnrollmentSync({ userId, credentials });
  return syncManager.markLessonCompleted(lessonId, courseId);
}

/**
 * Enhanced progress retrieval with server sync
 */
export async function getCourseProgressSync(
  courseId: number,
  userId?: number,
  credentials?: SyncOptions['credentials']
): Promise<CourseProgress | null> {
  const syncManager = globalSyncManager || new TutorEnrollmentSync({ userId, credentials });
  return syncManager.getCourseProgress(courseId);
}

/**
 * Check enrollment status with server sync
 */
export async function isEnrolledInCourseSync(
  courseId: number,
  userId?: number,
  credentials?: SyncOptions['credentials']
): Promise<boolean> {
  const syncManager = globalSyncManager || new TutorEnrollmentSync({ userId, credentials });
  return syncManager.isEnrolledInCourse(courseId);
}

export { TutorEnrollmentSync };
