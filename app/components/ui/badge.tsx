import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--theme-primary)] text-[var(--theme-primary-foreground)] shadow hover:brightness-90",
        secondary:
          "border-transparent bg-[var(--theme-secondary)] text-[var(--theme-secondary-foreground)]",
        tertiary:
          "border-transparent bg-[var(--theme-tertiary)] text-[var(--theme-tertiary-foreground)]",
        destructive:
          "border-transparent bg-[var(--error)] text-[var(--error-foreground)] shadow hover:brightness-90",
        success:
          "border-transparent bg-[var(--success)] text-[var(--success-foreground)]",
        warning:
          "border-transparent bg-[var(--warning)] text-[var(--warning-foreground)]",
        info:
          "border-transparent bg-[var(--info)] text-[var(--info-foreground)]",
        outline: "text-[var(--foreground)] border-[var(--border)]",
        ghost: "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        glass: "glass text-[var(--foreground)]",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };