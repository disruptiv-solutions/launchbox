import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { User } from "lucide-react";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full bg-[var(--surface-2)] border border-[var(--border)]",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20",
        "3xl": "h-24 w-24",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const avatarImageVariants = cva("aspect-square h-full w-full object-cover");

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center bg-[var(--surface-1)] text-[var(--muted-foreground)]",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
        "3xl": "text-2xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, status, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    const showImage = src && imageLoaded && !imageError;

    // Get initials from fallback text
    const initials = fallback
      ? fallback
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '';

    return (
      <div className="relative">
        <div
          ref={ref}
          className={cn(avatarVariants({ size, className }))}
          {...props}
        >
          {src && (
            <img
              src={src}
              alt={alt || 'Avatar'}
              className={cn(
                avatarImageVariants(),
                showImage ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {(!src || !showImage) && (
            <div className={cn(avatarFallbackVariants({ size }))}>
              {initials || <User className="h-4 w-4" />}
            </div>
          )}
        </div>

        {status && (
          <div className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[var(--background)]",
            size === 'sm' && "h-2.5 w-2.5",
            size === 'default' && "h-3 w-3",
            size === 'lg' && "h-3.5 w-3.5",
            size === 'xl' && "h-4 w-4",
            size === '2xl' && "h-5 w-5",
            size === '3xl' && "h-6 w-6",
            status === 'online' && "bg-green-500",
            status === 'offline' && "bg-gray-400",
            status === 'away' && "bg-yellow-500",
            status === 'busy' && "bg-red-500"
          )} />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };