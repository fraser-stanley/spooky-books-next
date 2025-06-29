interface HomepageSkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: HomepageSkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function ContentBlockSkeleton({ layout = "full" }: { layout?: "full" | "two" | "three" }) {
  if (layout === "full") {
    return (
      <>
        {/* Full-width image skeleton */}
        <div className="col-span-12">
          <Skeleton className="w-full aspect-[3/2] rounded-none" />
        </div>
        
        {/* Title and caption skeleton */}
        <div className="col-span-12">
          <div className="inline-block normal-case mb-12 sm:mb-8">
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </>
    );
  }

  if (layout === "two") {
    return (
      <>
        {/* Left image skeleton */}
        <div className="col-span-12 sm:col-span-6">
          <Skeleton className="w-full aspect-[4/3] rounded-none" />
        </div>
        
        {/* Right image skeleton */}
        <div className="col-span-12 sm:col-span-6">
          <Skeleton className="w-full aspect-[4/3] rounded-none" />
        </div>
        
        {/* Text content skeleton */}
        <div className="col-span-12">
          <div className="inline-block mb-4 normal-case">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </>
    );
  }

  // Three-column layout
  return (
    <>
      {/* Text content skeleton */}
      <div className="col-span-12 lg:col-span-4">
        <div className="inline-block normal-case">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      
      {/* Left image skeleton */}
      <div className="col-span-6 lg:col-span-4">
        <Skeleton className="w-full aspect-[3/4] rounded-none" />
      </div>
      
      {/* Right image skeleton */}
      <div className="col-span-6 lg:col-span-4">
        <Skeleton className="w-full aspect-[3/4] rounded-none" />
      </div>
    </>
  );
}

export function HomepageSkeleton() {
  return (
    <section className="text-md sm:text-sm grid grid-cols-12 gap-2 mb-12 xl:mb-24 mt-8 sm:mt-24">
      {/* Show multiple content block skeletons */}
      <ContentBlockSkeleton layout="full" />
      <ContentBlockSkeleton layout="two" />
      <ContentBlockSkeleton layout="three" />
    </section>
  );
}