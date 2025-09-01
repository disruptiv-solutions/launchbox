import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--theme-primary)] text-[var(--theme-primary-foreground)] shadow hover:brightness-90 hover:shadow-md",
        destructive:
          "bg-[var(--error)] text-[var(--error-foreground)] shadow-sm hover:brightness-90",
        outline:
          "border border-[var(--border)] bg-transparent shadow-sm hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        secondary:
          "bg-[var(--theme-secondary)] text-[var(--theme-secondary-foreground)] shadow-sm hover:brightness-90",
        tertiary:
          "bg-[var(--theme-tertiary)] text-[var(--theme-tertiary-foreground)] shadow-sm hover:brightness-90",
        ghost: "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        link: "text-[var(--theme-primary)] underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300",
        glass:
          "glass-button text-[var(--foreground)] hover:glass-strong",
        success:
          "bg-[var(--success)] text-[var(--success-foreground)] shadow-sm hover:brightness-90",
        warning:
          "bg-[var(--warning)] text-[var(--warning-foreground)] shadow-sm hover:brightness-90",
        info:
          "bg-[var(--info)] text-[var(--info-foreground)] shadow-sm hover:brightness-90",
        neon:
          "bg-[var(--theme-primary)] text-[var(--theme-primary-foreground)] shadow-lg animate-pulse-glow hover:shadow-glow-lg",
        morphing:
          "bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-tertiary)] bg-size-200 text-white shadow-md hover:bg-pos-100 transition-all duration-500",
        floating:
          "bg-[var(--theme-primary)] text-[var(--theme-primary-foreground)] shadow-lg hover-lift hover:shadow-xl",
        shimmer:
          "bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)] hover:animate-shimmer",
        neo:
          "bg-[var(--surface-1)] text-[var(--foreground)] border-2 border-[var(--theme-primary)] shadow-[4px_4px_0px_0px_var(--theme-primary)] hover:shadow-[2px_2px_0px_0px_var(--theme-primary)] hover:translate-x-[2px] hover:translate-y-[2px]",
        "gradient-border":
          "gradient-border text-[var(--foreground)] hover:shadow-glow",
        magnetic:
          "bg-[var(--theme-primary)] text-[var(--theme-primary-foreground)] shadow-md hover:scale-[1.05] hover:rotate-1 transition-all duration-300",
      },
      size: {
        default: "h-11 px-6 py-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6 py-3",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-10 w-10",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        glow: "shadow-glow",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shadow: "sm",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    shadow,
    loading, 
    leftIcon, 
    rightIcon, 
    loadingText,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, shadow, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex items-center">
            {leftIcon}
          </span>
        )}
        {loading ? loadingText || children : children}
        {!loading && rightIcon && (
          <span className="ml-2 flex items-center">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };