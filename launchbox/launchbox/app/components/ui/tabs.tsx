import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const tabsVariants = cva(
  "w-full",
  {
    variants: {
      orientation: {
        horizontal: "",
        vertical: "flex gap-4",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
);

const tabsListVariants = cva(
  "inline-flex items-center text-[var(--muted-foreground)]",
  {
    variants: {
      variant: {
        default: "h-9 rounded-lg bg-[var(--muted)] p-1",
        underline: "border-b border-[var(--border)]",
        pills: "gap-2",
        glass: "glass rounded-lg p-1",
        gradient: "gradient-surface rounded-lg p-1",
      },
      orientation: {
        horizontal: "",
        vertical: "flex-col h-auto w-48",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
);

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        underline: "border-b-2 border-transparent rounded-none px-4 py-2 data-[state=active]:border-[var(--theme-primary)] data-[state=active]:text-[var(--theme-primary)]",
        pills: "rounded-full px-4 py-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-primary-foreground)] hover:bg-[var(--accent)]",
        glass: "data-[state=active]:glass-strong data-[state=active]:text-[var(--foreground)] hover:bg-[var(--surface-2)]",
        gradient: "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--theme-primary)] data-[state=active]:to-[var(--theme-secondary)] data-[state=active]:text-white hover:bg-[var(--surface-2)]",
      },
      size: {
        default: "h-7",
        sm: "h-6 text-xs",
        lg: "h-9 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const tabsContentVariants = cva(
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "mt-2",
        card: "mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6",
        glass: "mt-4 glass-card p-6",
        fade: "mt-2 animate-fade-in",
        slide: "mt-2 animate-slide-up",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsVariants> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsContentVariants> {
  value: string;
}

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
  orientation: "horizontal" | "vertical";
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component");
  }
  return context;
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className, 
    orientation = "horizontal", 
    defaultValue, 
    value: controlledValue, 
    onValueChange, 
    children, 
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleValueChange = React.useCallback((newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [isControlled, onValueChange]);

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange, orientation }}>
        <div
          ref={ref}
          className={cn(tabsVariants({ orientation, className }))}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, orientation: orientationProp, ...props }, ref) => {
    const { orientation } = useTabsContext();
    const finalOrientation = orientationProp || orientation;

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={finalOrientation}
        className={cn(tabsListVariants({ variant, orientation: finalOrientation, className }))}
        {...props}
      />
    );
  }
);

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, variant, size, value: triggerValue, icon, badge, children, ...props }, ref) => {
    const { value, onValueChange } = useTabsContext();
    const isActive = value === triggerValue;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${triggerValue}`}
        data-state={isActive ? "active" : "inactive"}
        id={`tab-${triggerValue}`}
        className={cn(tabsTriggerVariants({ variant, size, className }))}
        onClick={() => onValueChange(triggerValue)}
        {...props}
      >
        {icon && (
          <span className="mr-2 flex items-center">
            {icon}
          </span>
        )}
        {children}
        {badge && (
          <span className="ml-2 flex items-center">
            {badge}
          </span>
        )}
      </button>
    );
  }
);

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, variant, value: contentValue, children, ...props }, ref) => {
    const { value } = useTabsContext();
    const isActive = value === contentValue;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        aria-labelledby={`tab-${contentValue}`}
        id={`panel-${contentValue}`}
        tabIndex={0}
        className={cn(tabsContentVariants({ variant, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Tabs.displayName = "Tabs";
TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };