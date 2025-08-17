'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  HelpCircle,
  Clock,
  User,
  BookOpen,
  MoreVertical
} from 'lucide-react';
import { WooCommerceProduct } from '@/lib/woocommerce-types';
import { 
  TutorCourse, 
  TutorCourseContent, 
  TutorInstructor 
} from '@/lib/tutor-lms-types';
import { 
  getCourseProgressSync, 
  markLessonCompletedSync, 
} from '@/lib/tutor-enrollment-sync';
import {
  isLessonCompleted,
  updateLessonProgress,
} from '@/lib/tutor-enrollment';
import { getCurrentUserId, getAuthCredentials } from '@/lib/auth-context';

interface CoursePlayerProps {
  course: WooCommerceProduct;
  tutorCourse?: TutorCourse | null;
  courseContent?: TutorCourseContent | null;
  instructor?: TutorInstructor | null;
  currentLessonId?: number;
  currentTopicId?: number;
}

export function CoursePlayer({
  course,
  tutorCourse,
  courseContent,
  instructor,
  currentLessonId,
  currentTopicId
}: CoursePlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(
    currentTopicId || courseContent?.topics[0]?.topic_id || null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
    currentLessonId || null
  );
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const userId = getCurrentUserId();
  const credentials = getAuthCredentials();

  // Load course progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      const courseProgress = await getCourseProgressSync(course.id, userId, credentials);
      console.log('courseProgress: ', courseProgress);
      if (courseProgress) {
        setProgress(courseProgress.overallProgress);
        setCompletedLessons(courseProgress.completedLessons);
      }
    };
    loadProgress();
  }, [course.id]);

  // Auto-select first lesson if none selected
  useEffect(() => {
    if (!selectedLessonId && courseContent && courseContent.topics.length > 0) {
      const firstTopic = courseContent.topics[0];
      const firstLesson = firstTopic.contents.find(c => c.type === 'lesson');
      if (firstLesson) {
        setSelectedLessonId(firstLesson.id);
        setSelectedTopicId(firstTopic.topic_id);
      }
    }
  }, [selectedLessonId, courseContent]);

  const selectedTopic = courseContent?.topics.find(t => t.topic_id === selectedTopicId);
  const selectedLesson = selectedTopic?.contents.find(
    c => c.type === 'lesson' && c.id === selectedLessonId
  );

  const handleLessonSelect = (lessonId: number, topicId: number) => {
    setSelectedLessonId(lessonId);
    setSelectedTopicId(topicId);
    
    // Update URL without page reload
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('lesson', lessonId.toString());
    newSearchParams.set('topic', topicId.toString());
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    
    // Track lesson access
    updateLessonProgress(lessonId, course.id, {
      accessedAt: new Date().toISOString()
    });
  };

  const handleMarkCompleted = async (lessonId: number) => {
    await markLessonCompletedSync(lessonId, course.id, userId, credentials);
    setCompletedLessons(prev => [...prev, lessonId]);
    
    // Update overall progress
    const courseProgress = await getCourseProgressSync(course.id, userId, credentials);
    if (courseProgress) {
      setProgress(courseProgress.overallProgress);
    }
  };

  const getNextLesson = () => {
    if (!courseContent || !selectedLessonId) return null;
    
    const currentTopicIndex = courseContent.topics.findIndex(t => t.topic_id === selectedTopicId);
    const currentTopic = courseContent.topics[currentTopicIndex];
    const currentLessonIndex = currentTopic?.contents.findIndex(
      c => c.type === 'lesson' && c.id === selectedLessonId
    ) || -1;
    
    // Look for next lesson in current topic
    if (currentTopic && currentLessonIndex >= 0) {
      const nextInTopic = currentTopic.contents
        .slice(currentLessonIndex + 1)
        .find(c => c.type === 'lesson');
      
      if (nextInTopic) {
        return { lessonId: nextInTopic.id, topicId: currentTopic.topic_id };
      }
    }
    
    // Look for next lesson in next topic
    for (let i = currentTopicIndex + 1; i < courseContent.topics.length; i++) {
      const nextLesson = courseContent.topics[i].contents.find(c => c.type === 'lesson');
      if (nextLesson) {
        return { lessonId: nextLesson.id, topicId: courseContent.topics[i].topic_id };
      }
    }
    
    return null;
  };

  const getPreviousLesson = () => {
    if (!courseContent || !selectedLessonId) return null;
    
    const currentTopicIndex = courseContent.topics.findIndex(t => t.topic_id === selectedTopicId);
    const currentTopic = courseContent.topics[currentTopicIndex];
    const currentLessonIndex = currentTopic?.contents.findIndex(
      c => c.type === 'lesson' && c.id === selectedLessonId
    ) || -1;
    
    // Look for previous lesson in current topic
    if (currentTopic && currentLessonIndex > 0) {
      const prevInTopic = [...currentTopic.contents]
        .slice(0, currentLessonIndex)
        .reverse()
        .find(c => c.type === 'lesson');
      
      if (prevInTopic) {
        return { lessonId: prevInTopic.id, topicId: currentTopic.topic_id };
      }
    }
    
    // Look for previous lesson in previous topic
    for (let i = currentTopicIndex - 1; i >= 0; i--) {
      const prevLesson = [...courseContent.topics[i].contents]
        .reverse()
        .find(c => c.type === 'lesson');
      if (prevLesson) {
        return { lessonId: prevLesson.id, topicId: courseContent.topics[i].topic_id };
      }
    }
    
    return null;
  };

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  if (!courseContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Course content not available</h2>
          <p className="text-muted-foreground mb-4">
            This course doesn't have Tutor LMS content yet.
          </p>
          <Button asChild>
            <Link href={`/courses/${course.slug}`}>
              Back to Course
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Course Navigation */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Course Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/courses/${course.slug}`}>
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
          </div>
          
          <h1 className="font-semibold text-lg line-clamp-2 mb-2">
            {course.name}
          </h1>
          
          {instructor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <User className="w-4 h-4" />
              <span>{instructor.display_name}</span>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        {/* Course Content Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {courseContent.topics.map((topic) => (
              <div key={topic.topic_id} className="space-y-2">
                <h3 className="font-medium text-sm text-gray-900">
                  {topic.topic_title}
                </h3>
                
                <div className="space-y-1">
                  {topic.contents.map((content) => {
                    const isCompleted = content.type === 'lesson' && 
                      isLessonCompleted(content.id, course.id);
                    const isSelected = content.type === 'lesson' && 
                      content.id === selectedLessonId;
                    
                    return (
                      <button
                        key={content.id}
                        onClick={() => {
                          if (content.type === 'lesson') {
                            handleLessonSelect(content.id, topic.topic_id);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-200 text-blue-900' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {content.type === 'lesson' ? (
                            <PlayCircle className={`w-4 h-4 flex-shrink-0 ${
                              isCompleted ? 'text-green-500' : 'text-gray-400'
                            }`} />
                          ) : content.type === 'quiz' ? (
                            <HelpCircle className="w-4 h-4 flex-shrink-0 text-orange-500" />
                          ) : (
                            <FileText className="w-4 h-4 flex-shrink-0 text-purple-500" />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium line-clamp-2">
                              {content.title}
                            </div>
                            {content.content_length && (
                              <div className="text-xs text-muted-foreground">
                                {content.content_length}
                              </div>
                            )}
                          </div>
                          
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedLesson ? (
          <>
            {/* Lesson Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Lesson</span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    {selectedLesson.title}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isLessonCompleted(selectedLesson.id, course.id) && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkCompleted(selectedLesson.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="flex-1 p-6">
              <Card>
                <CardContent className="p-8">
                  {/* Lesson Video/Content Placeholder */}
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                    <div className="text-center">
                      <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Lesson content would be displayed here
                      </p>
                      <p className="text-sm text-gray-400">
                        This could be video, text, images, or interactive content
                      </p>
                    </div>
                  </div>
                  
                  {/* Lesson Description */}
                  <div className="prose max-w-none">
                    <h3>Lesson Overview</h3>
                    <p>
                      This lesson is part of the <strong>{course.name}</strong> course. 
                      Here you would see the actual lesson content including videos, 
                      text explanations, code examples, and interactive elements.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Controls */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (previousLesson) {
                      handleLessonSelect(previousLesson.lessonId, previousLesson.topicId);
                    }
                  }}
                  disabled={!previousLesson}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Lesson
                </Button>
                
                <Button
                  onClick={() => {
                    if (nextLesson) {
                      handleLessonSelect(nextLesson.lessonId, nextLesson.topicId);
                    }
                  }}
                  disabled={!nextLesson}
                >
                  Next Lesson
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Lesson Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a lesson to start</h2>
              <p className="text-muted-foreground">
                Choose a lesson from the sidebar to begin your learning journey.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
