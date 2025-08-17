'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function CoursePlayerSkeleton() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar Skeleton */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((topic) => (
            <div key={topic} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-1">
                {[1, 2, 3].map((lesson) => (
                  <div key={lesson} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-4 h-4 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-8">
              <Skeleton className="aspect-video w-full rounded-lg mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Skeleton */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
