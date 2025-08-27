import { cn } from "@/lib/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--surface-2)]", 
        className
      )}
      {...props}
    />
  );
}

// Common skeleton patterns
const SkeletonText = ({ 
  lines = 1, 
  className 
}: { 
  lines?: number; 
  className?: string; 
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-4",
          i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
        )} 
      />
    ))}
  </div>
);

const SkeletonAvatar = ({ 
  size = "default", 
  className 
}: { 
  size?: "sm" | "default" | "lg" | "xl"; 
  className?: string; 
}) => (
  <Skeleton 
    className={cn(
      "rounded-full",
      size === "sm" && "h-8 w-8",
      size === "default" && "h-10 w-10", 
      size === "lg" && "h-12 w-12",
      size === "xl" && "h-16 w-16",
      className
    )} 
  />
);

const SkeletonCard = ({ 
  hasImage = false, 
  className 
}: { 
  hasImage?: boolean; 
  className?: string; 
}) => (
  <div className={cn("space-y-4 p-6", className)}>
    {hasImage && <Skeleton className="h-48 w-full rounded-lg" />}
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <SkeletonText lines={3} />
  </div>
);

const SkeletonButton = ({ 
  size = "default", 
  className 
}: { 
  size?: "sm" | "default" | "lg"; 
  className?: string; 
}) => (
  <Skeleton 
    className={cn(
      "rounded-md",
      size === "sm" && "h-8 w-20",
      size === "default" && "h-9 w-24",
      size === "lg" && "h-10 w-28",
      className
    )} 
  />
);

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonCard, 
  SkeletonButton 
};