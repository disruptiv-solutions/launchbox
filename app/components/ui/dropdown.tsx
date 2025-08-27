import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { ChevronDown, Check } from "lucide-react";

const dropdownVariants = cva(
  "relative inline-block text-left",
  {
    variants: {
      variant: {
        default: "",
        ghost: "",
        outline: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const dropdownMenuVariants = cva(
  "absolute right-0 mt-2 origin-top-right divide-y divide-[var(--border)] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 min-w-[8rem] max-h-[300px] overflow-auto animate-scale-in",
  {
    variants: {
      variant: {
        default: "bg-[var(--card)] border border-[var(--border)]",
        glass: "glass-card",
        elevated: "bg-[var(--card)] border border-[var(--border)] shadow-xl",
      },
      position: {
        "bottom-left": "left-0 right-auto",
        "bottom-right": "right-0 left-auto",
        "top-left": "left-0 right-auto bottom-full mt-0 mb-2",
        "top-right": "right-0 left-auto bottom-full mt-0 mb-2",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "bottom-right",
    },
  }
);

const dropdownItemVariants = cva(
  "group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150 cursor-pointer focus:outline-none",
  {
    variants: {
      variant: {
        default: "text-[var(--card-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        destructive: "text-[var(--error)] hover:bg-[var(--error-50)] hover:text-[var(--error)]",
        success: "text-[var(--success)] hover:bg-[var(--success-50)] hover:text-[var(--success)]",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed hover:bg-transparent",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      disabled: false,
    },
  }
);

export interface DropdownProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownVariants> {
  trigger: React.ReactNode;
  children: React.ReactNode;
  menuVariant?: VariantProps<typeof dropdownMenuVariants>["variant"];
  position?: VariantProps<typeof dropdownMenuVariants>["position"];
  closeOnSelect?: boolean;
}

export interface DropdownItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownItemVariants> {
  selected?: boolean;
  icon?: React.ReactNode;
  shortcut?: string;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ 
    className, 
    variant, 
    trigger, 
    children, 
    menuVariant = "default",
    position = "bottom-right",
    closeOnSelect = true,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    // Close dropdown on escape key
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
      }
    }, [isOpen]);

    const handleItemClick = (onClick?: () => void) => {
      if (closeOnSelect) {
        setIsOpen(false);
      }
      onClick?.();
    };

    return (
      <div
        ref={dropdownRef}
        className={cn(dropdownVariants({ variant, className }))}
        {...props}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {trigger}
        </div>

        {isOpen && (
          <div
            className={cn(dropdownMenuVariants({ variant: menuVariant, position }))}
            role="menu"
            aria-orientation="vertical"
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === DropdownItem) {
                return React.cloneElement(child, {
                  onClick: () => handleItemClick(child.props.onClick),
                });
              }
              return child;
            })}
          </div>
        )}
      </div>
    );
  }
);

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ 
    className, 
    variant, 
    disabled, 
    selected, 
    icon, 
    shortcut, 
    children, 
    onClick, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(dropdownItemVariants({ variant, disabled, className }))}
        onClick={disabled ? undefined : onClick}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick?.(e as any);
          }
        }}
        {...props}
      >
        <div className="flex items-center flex-1">
          {icon && (
            <span className="mr-3 flex-shrink-0">
              {icon}
            </span>
          )}
          <span className="flex-1">{children}</span>
          {selected && (
            <Check className="ml-3 h-4 w-4 text-[var(--theme-primary)]" />
          )}
        </div>
        {shortcut && (
          <span className="ml-3 text-xs text-[var(--muted-foreground)] font-mono">
            {shortcut}
          </span>
        )}
      </div>
    );
  }
);

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-1 h-px bg-[var(--border)]", className)}
    role="separator"
    {...props}
  />
));

const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider",
      className
    )}
    {...props}
  />
));

Dropdown.displayName = "Dropdown";
DropdownItem.displayName = "DropdownItem";
DropdownSeparator.displayName = "DropdownSeparator";
DropdownLabel.displayName = "DropdownLabel";

export { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel };