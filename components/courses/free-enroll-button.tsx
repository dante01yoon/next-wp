'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, Loader2 } from 'lucide-react';
import { 
  enrollInFreeCourseSync, 
  isEnrolledInCourseSync, 
} from '@/lib/tutor-enrollment-sync';
import { getCourseLearnUrl } from '@/lib/tutor-enrollment';
import { 
  isWooCommerceProductFree, 
  getTutorCourseIdFromProduct 
} from '@/lib/tutor-course-utils';
import { getCurrentUserId, getAuthCredentials } from '@/lib/auth-context';

interface FreeEnrollButtonProps {
  course: {
    id: number;
    slug: string;
    name: string;
    price?: string;
    price_type?: 'free' | 'paid';
    meta?: {
      _tutor_course_price_type?: 'free' | 'paid';
      _tutor_course_price?: string;
    };
  };
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function FreeEnrollButton({ 
  course, 
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  children 
}: FreeEnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [tutorCourseId, setTutorCourseId] = useState<number | null>(null);
  const router = useRouter();
  const userId = getCurrentUserId();
  const credentials = getAuthCredentials();
  
  // Get Tutor LMS course ID from WooCommerce product
  useEffect(() => {
    const fetchTutorCourseId = async () => {
      const courseId = await getTutorCourseIdFromProduct(course as any);
      setTutorCourseId(courseId);
    };
    fetchTutorCourseId();
  }, [course]);
  
  // Check enrollment status on mount
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!tutorCourseId) return;
      const enrolled = await isEnrolledInCourseSync(tutorCourseId, userId, credentials);
      setIsEnrolled(enrolled);
    };
    checkEnrollment();
  }, [tutorCourseId, userId, credentials]);
  
  // Check if course is free
  const isFree = isWooCommerceProductFree(course as any);
  
  // Don't render if course is not free
  if (!isFree) {
    return null;
  }
  
  const handleEnrollment = async () => {
    if (!tutorCourseId) {
      console.error('No Tutor course ID available');
      return;
    }
    
    if (isEnrolled) {
      // Navigate to course learning page using WooCommerce product slug
      const learnUrl = getCourseLearnUrl(course.id, course.slug);
      router.push(learnUrl);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use Tutor LMS course ID for enrollment
      const success = await enrollInFreeCourseSync(tutorCourseId, userId, credentials);
      
      if (success) {
        setIsEnrolled(true);
        
        // Show success message (you might want to use a toast library)
        console.log(`Successfully enrolled in ${course.name}`);
        
        // Navigate to course learning page after short delay using WooCommerce product slug
        setTimeout(() => {
          const learnUrl = getCourseLearnUrl(course.id, course.slug);
          router.push(learnUrl);
        }, 1000);
      } else {
        // Handle enrollment failure
        console.error('Failed to enroll in course');
        // You might want to show an error toast here
      }
    } catch (error) {
      console.error('Error during enrollment:', error);
      // Handle error - show error message
    } finally {
      setIsLoading(false);
    }
  };
  
  const buttonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Enrolling...
        </>
      );
    }
    
    if (isEnrolled) {
      return (
        <>
          {showIcon && <CheckCircle className="w-4 h-4 mr-2" />}
          {children || 'Continue Learning'}
        </>
      );
    }
    
    return (
      <>
        {showIcon && <BookOpen className="w-4 h-4 mr-2" />}
        {children || 'Enroll for Free'}
      </>
    );
  };
  
  return (
    <div className="space-y-2">
      {/* Free Badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
          Free Course
        </Badge>
      </div>
      
      {/* Enrollment Button */}
      <Button
        variant={isEnrolled ? 'secondary' : variant}
        size={size}
        className={`w-full ${className}`}
        onClick={handleEnrollment}
        disabled={isLoading}
      >
        {buttonContent()}
      </Button>
      
      {/* Enrolled Status */}
      {isEnrolled && (
        <div className="text-center">
          <p className="text-sm text-green-600 font-medium">
            ✓ You're enrolled in this course
          </p>
        </div>
      )}
    </div>
  );
}

// Simplified version for use in cards
export function QuickEnrollButton({ 
  course,
  className = ''
}: {
  course: FreeEnrollButtonProps['course'];
  className?: string;
}) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [tutorCourseId, setTutorCourseId] = useState<number | null>(null);
  const userId = getCurrentUserId();
  const credentials = getAuthCredentials();
  
  // Get Tutor LMS course ID from WooCommerce product
  useEffect(() => {
    const fetchTutorCourseId = async () => {
      const courseId = await getTutorCourseIdFromProduct(course as any);
      setTutorCourseId(courseId);
    };
    fetchTutorCourseId();
  }, [course]);
  
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!tutorCourseId) return;
      const enrolled = await isEnrolledInCourseSync(tutorCourseId, userId, credentials);
      setIsEnrolled(enrolled);
    };
    checkEnrollment();
  }, [tutorCourseId, userId, credentials]);
  
  return (
    <FreeEnrollButton
      course={course}
      variant="outline"
      size="sm"
      className={className}
      showIcon={false}
    >
      {isEnrolled ? 'Continue' : 'Start Free'}
    </FreeEnrollButton>
  );
}
