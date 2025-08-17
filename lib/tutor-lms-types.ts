// Tutor LMS REST API TypeScript Definitions
// Based on: https://docs.themeum.com/tutor-lms/developer-documentation/rest-api/
// API Base URL: http://yoursite.com/wp-json/tutor/v1/

// ============= Common Types =============

export interface TutorBaseEntity {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  status: 'publish' | 'draft' | 'pending' | 'private';
  link: string;
}

export interface TutorRenderedContent {
  rendered: string;
  protected: boolean;
}

export interface TutorRenderedTitle {
  rendered: string;
}

// ============= Course Types =============

export interface TutorCourse extends TutorBaseEntity {
  title: TutorRenderedTitle;
  content: TutorRenderedContent;
  excerpt: TutorRenderedContent;
  author: number;
  featured_media: number;
  slug: string;
  type: 'courses';
  meta: {
    // Tutor specific course meta
    _tutor_course_level?: string;
    _tutor_course_duration?: string;
    _tutor_course_benefits?: string;
    _tutor_course_requirements?: string;
    _tutor_course_target_audience?: string;
    _tutor_course_material_includes?: string;
    _tutor_course_price_type?: 'free' | 'paid';
    _tutor_course_price?: string;
    _tutor_course_product_id?: number;
    _tutor_is_course_public?: boolean;
    _tutor_enable_qa?: boolean;
    _tutor_enable_reviews?: boolean;
    _thumbnail_id?: number;
    [key: string]: any;
  };
  // Additional course data from API
  course_duration?: string;
  course_level?: string;
  total_enrolled?: number;
  rating?: {
    rating_avg: number;
    rating_count: number;
  };
  price?: string;
  price_type?: 'free' | 'paid';
  is_enrolled?: boolean;
  course_completed?: boolean;
  course_progress?: number;
}

// ============= Course Topics (Sections) =============

export interface TutorCourseTopic {
  topic_id: number;
  topic_title: string;
  topic_summary: string;
  course_id: number;
  topic_order: number;
  topic_visibility?: 'visible' | 'hidden';
  lessons?: TutorLesson[];
  quizzes?: TutorQuiz[];
  assignments?: TutorAssignment[];
}

// ============= Lesson Types =============

export interface TutorLesson extends TutorBaseEntity {
  title: TutorRenderedTitle;
  content: TutorRenderedContent;
  lesson_id: number;
  course_id: number;
  topic_id: number;
  lesson_order: number;
  lesson_video?: {
    source: 'youtube' | 'vimeo' | 'html5' | 'external_url';
    source_video_id?: string;
    source_youtube?: string;
    source_vimeo?: string;
    source_external_url?: string;
    poster?: string;
    runtime?: {
      hours: number;
      minutes: number;
      seconds: number;
    };
  };
  lesson_attachment?: {
    id: number;
    url: string;
    title: string;
    filename: string;
  }[];
  lesson_preview?: boolean;
  is_completed?: boolean;
  access_status?: 'public' | 'logged_in' | 'enrolled';
}

// ============= Quiz Types =============

export interface TutorQuiz extends TutorBaseEntity {
  title: TutorRenderedTitle;
  content: TutorRenderedContent;
  quiz_id: number;
  course_id: number;
  topic_id: number;
  quiz_order: number;
  quiz_settings: {
    time_limit?: {
      time_type: 'minutes' | 'hours' | 'days' | 'weeks';
      time_value: number;
    };
    attempts_allowed?: number;
    passing_grade?: number;
    max_questions_for_answer?: number;
    randomize_questions?: boolean;
    questions_order?: 'rand' | 'sorting' | 'asc';
    hide_quiz_details?: boolean;
    feedback_mode?: 'default' | 'reveal' | 'retry';
    auto_start?: boolean;
  };
  total_questions?: number;
  total_marks?: number;
  duration?: string;
  is_completed?: boolean;
  user_attempts?: number;
  max_attempts?: number;
}

// ============= Quiz Question Types =============

export interface TutorQuizQuestion {
  question_id: number;
  quiz_id: number;
  question_title: string;
  question_description: string;
  question_type: 'true_false' | 'multiple_choice' | 'single_choice' | 'fill_in_the_blanks' | 'short_answer' | 'matching' | 'image_matching' | 'image_answering' | 'ordering';
  question_mark: number;
  question_settings: {
    randomize_options?: boolean;
    answer_required?: boolean;
    show_question_mark?: boolean;
  };
  question_options: TutorQuizQuestionOption[];
  answers?: TutorQuizAnswer[];
}

export interface TutorQuizQuestionOption {
  option_id: number;
  option_title: string;
  option_description?: string;
  is_correct: boolean;
  image_id?: number;
  option_order: number;
}

export interface TutorQuizAnswer {
  answer_id: number;
  user_id: number;
  question_id: number;
  quiz_id: number;
  given_answer: string | string[];
  achieved_mark: number;
  minus_mark: number;
  is_correct: boolean;
}

// ============= Assignment Types =============

export interface TutorAssignment extends TutorBaseEntity {
  title: TutorRenderedTitle;
  content: TutorRenderedContent;
  assignment_id: number;
  course_id: number;
  topic_id: number;
  assignment_order: number;
  assignment_settings: {
    total_mark?: number;
    pass_mark?: number;
    time_duration?: {
      time_value: number;
      time_type: 'minutes' | 'hours' | 'days' | 'weeks';
    };
    upload_files_limit?: number;
    upload_file_size_limit?: number;
    allowed_file_types?: string[];
  };
  attachments?: {
    id: number;
    url: string;
    title: string;
    filename: string;
  }[];
  is_submitted?: boolean;
  submission?: TutorAssignmentSubmission;
}

export interface TutorAssignmentSubmission {
  submission_id: number;
  assignment_id: number;
  user_id: number;
  submission_content: string;
  attachments: {
    id: number;
    url: string;
    filename: string;
  }[];
  submission_date: string;
  submission_status: 'pending' | 'graded';
  instructor_feedback?: string;
  achieved_mark?: number;
  total_mark: number;
}

// ============= Course Announcements =============

export interface TutorCourseAnnouncement extends TutorBaseEntity {
  announcement_id: number;
  course_id: number;
  title: TutorRenderedTitle;
  content: TutorRenderedContent;
  author: number;
  announcement_order: number;
}

// ============= Course Ratings & Reviews =============

export interface TutorCourseRating {
  rating_id: number;
  course_id: number;
  user_id: number;
  rating: number; // 1-5 stars
  review: string;
  review_title?: string;
  user_name: string;
  user_avatar?: string;
  date_created: string;
  date_created_gmt: string;
  status: 'approved' | 'pending' | 'trash';
}

export interface TutorCourseRatingStats {
  rating_avg: number;
  rating_count: number;
  rating_sum: number;
  count_by_value: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ============= Author/Instructor Types =============

export interface TutorInstructor {
  ID: number;
  user_login: string;
  user_email: string;
  user_url?: string;
  user_registered: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  description?: string;
  avatar_url: string;
  profile_photo?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
  instructor_rating?: number;
  total_students?: number;
  total_courses?: number;
  instructor_status?: 'approved' | 'pending' | 'blocked';
  meta: {
    _tutor_profile_bio?: string;
    _tutor_profile_job_title?: string;
    _tutor_profile_phone?: string;
    [key: string]: any;
  };
}

// ============= Course Content Structure =============

export interface TutorCourseContent {
  course_id: number;
  course_title: string;
  topics: (TutorCourseTopic & {
    contents: Array<{
      id: number;
      type: 'lesson' | 'quiz' | 'assignment';
      title: string;
      order: number;
      is_preview?: boolean;
      is_completed?: boolean;
      content_length?: string; // for lessons with video
      quiz_questions?: number; // for quizzes
      assignment_marks?: number; // for assignments
    }>;
  })[];
  total_lessons: number;
  total_quizzes: number;
  total_assignments: number;
  estimated_duration: string;
}

// ============= API Query Parameters =============

export interface TutorCoursesQueryParams {
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'title' | 'menu_order' | 'author' | 'modified';
  paged?: number;
  per_page?: number;
  tags?: string; // comma-separated tag names
  categories?: string; // comma-separated category names
  search?: string;
  author?: number;
  status?: 'publish' | 'draft' | 'pending' | 'private';
  include?: number[];
  exclude?: number[];
  featured?: boolean;
  price_type?: 'free' | 'paid';
  level?: string;
}

export interface TutorTopicsQueryParams {
  course_id: number;
  order?: 'asc' | 'desc';
  orderby?: 'menu_order' | 'title' | 'date';
}

export interface TutorLessonsQueryParams {
  topic_id: number;
  course_id?: number;
  order?: 'asc' | 'desc';
  orderby?: 'menu_order' | 'title' | 'date';
}

export interface TutorQuizQueryParams {
  topic_id: number;
  course_id?: number;
  order?: 'asc' | 'desc';
  orderby?: 'menu_order' | 'title' | 'date';
}

// ============= API Response Types =============

export interface TutorApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface TutorPaginatedResponse<T> {
  data: T[];
  total: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface TutorApiError {
  code: string;
  message: string;
  data: {
    status: number;
    params?: string[];
    details?: any;
  };
}

// ============= Course Categories & Tags =============

export interface TutorCourseCategory {
  term_id: number;
  name: string;
  slug: string;
  term_group: number;
  term_taxonomy_id: number;
  taxonomy: string;
  description: string;
  parent: number;
  count: number;
  filter: string;
}

export interface TutorCourseTag {
  term_id: number;
  name: string;
  slug: string;
  term_group: number;
  term_taxonomy_id: number;
  taxonomy: string;
  description: string;
  parent: number;
  count: number;
  filter: string;
}

// ============= Enrollment & Progress =============

export interface TutorEnrollment {
  enrollment_id: number;
  course_id: number;
  user_id: number;
  enrollment_date: string;
  enrollment_status: 'enrolled' | 'completed' | 'cancelled';
}

export interface TutorCourseProgress {
  course_id: number;
  user_id: number;
  completion_percentage: number;
  completed_lessons: number[];
  completed_quizzes: number[];
  completed_assignments: number[];
  total_lessons: number;
  total_quizzes: number;
  total_assignments: number;
  start_date: string;
  completion_date?: string;
}

// ============= Statistics & Analytics =============

export interface TutorCourseStats {
  course_id: number;
  total_enrolled: number;
  total_completed: number;
  completion_rate: number;
  average_rating: number;
  total_reviews: number;
  total_lessons: number;
  total_quizzes: number;
  total_assignments: number;
  estimated_duration: string;
}

export interface TutorInstructorStats {
  instructor_id: number;
  total_courses: number;
  total_students: number;
  total_revenue?: number;
  average_rating: number;
  total_reviews: number;
}
