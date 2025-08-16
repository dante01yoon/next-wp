import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }, (_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <div className="relative aspect-video">
        <Skeleton className="w-full h-full" />
      </div>
      
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardFooter>
    </Card>
  );
}
