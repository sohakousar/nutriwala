import { ReactNode, Suspense, lazy, ComponentType } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  placeholder?: ReactNode;
  rootMargin?: string;
}

// Lazy section that renders children only when in viewport
export function LazySection({
  children,
  className,
  placeholder,
  rootMargin = "200px",
}: LazySectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin,
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? (
        children
      ) : (
        placeholder || (
          <div className="min-h-[200px] flex items-center justify-center">
            <Skeleton className="w-full h-48" />
          </div>
        )
      )}
    </div>
  );
}

// HOC for lazy loading components - simplified typing
export function withLazyLoad<P extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
): ComponentType<P> {
  const LazyComponent = lazy(importFn);

  // eslint-disable-next-line react/display-name
  return (props: P) => (
    <Suspense
      fallback={
        fallback || (
          <div className="min-h-[200px] flex items-center justify-center">
            <Skeleton className="w-full h-48" />
          </div>
        )
      }
    >
      {/* @ts-expect-error - lazy component types are complex */}
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Skeleton placeholders for common sections
export function HeroSkeleton() {
  return (
    <div className="w-full min-h-[600px] bg-muted animate-pulse">
      <div className="container mx-auto py-20">
        <Skeleton className="h-16 w-3/4 mb-6" />
        <Skeleton className="h-8 w-1/2 mb-8" />
        <Skeleton className="h-12 w-40" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function TestimonialsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-6 rounded-xl bg-muted">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LazySection;
