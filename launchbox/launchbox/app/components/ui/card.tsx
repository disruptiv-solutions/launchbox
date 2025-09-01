import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cardVariants = cva(
  "rounded-lg border text-[var(--card-foreground)] transition-all duration-200 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[var(--card)] border-[var(--border)] shadow-sm",
        elevated: "bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg",
        outlined: "bg-transparent border-2 border-[var(--border)]",
        filled: "bg-[var(--surface-1)] border-[var(--border)]",
        glass: "glass-card",
        gradient: "gradient-surface border-[var(--border)]",
        neon: "bg-[var(--card)] border-[var(--theme-primary)] shadow-glow animate-pulse-glow",
        floating: "bg-[var(--card)] border-[var(--border)] shadow-lg hover-lift",
        morphing: "bg-gradient-to-br from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-3)] border-[var(--border)]",
        shimmer: "bg-[var(--card)] border-[var(--border)] hover:animate-shimmer",
        neo: "bg-[var(--surface-1)] border-2 border-[var(--theme-primary)] shadow-[8px_8px_0px_0px_var(--theme-primary)]",
        magnetic: "bg-[var(--card)] border-[var(--border)] shadow-md hover:scale-[1.02] hover:rotate-1",
        spotlight: "bg-[var(--card)] border-[var(--border)] shadow-sm hover:bg-gradient-to-br hover:from-[var(--surface-1)] hover:to-[var(--surface-2)]",
      },
      padding: {
        none: "",
        xs: "p-2",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-lg",
        glow: "hover:shadow-glow",
        scale: "hover:scale-[1.02]",
        tilt: "hover:rotate-1 hover:scale-[1.01]",
        bounce: "hover:animate-bounce-subtle",
        float: "hover:animate-float",
        "glow-border": "hover:shadow-glow hover:border-[var(--theme-primary)]",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-lg",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none",
      rounded: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, rounded, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover, rounded, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--muted-foreground)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };