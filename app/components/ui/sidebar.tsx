import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { ChevronRight, X } from "lucide-react";
import { Badge } from "./badge";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { useTenant } from "../../../contexts/tenant-context";

const sidebarVariants = cva(
  "flex h-full flex-col border-r border-[var(--border)] bg-[var(--surface-0)] backdrop-blur-xl",
  {
    variants: {
      variant: {
        default: "",
        glass: "glass border-[var(--border)]",
        floating: "m-4 rounded-xl shadow-lg",
      },
      width: {
        narrow: "w-16",
        default: "w-64",
        wide: "w-80",
      },
    },
    defaultVariants: {
      variant: "default",
      width: "default",
    },
  }
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, width, isOpen = true, onClose, children, ...props }, ref) => {
    return (
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            ref={ref}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(sidebarVariants({ variant, width, className }))}
            {...props}
          >
            {children}
            {onClose && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-2 md:hidden"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
Sidebar.displayName = "Sidebar";

/**
 * Header now uses a fixed height tied to --dashboard-header-h so it aligns
 * perfectly with the desktop page header in DashboardLayout.
 */
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 border-b border-[var(--border)] px-4",
      "h-[var(--dashboard-header-h)] box-border",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-y-auto p-4", className)} {...props} />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-t border-[var(--border)] p-4", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

interface SidebarNavProps {
  items: Array<{
    name: string;
    href: string;
    icon?: React.ReactNode;
    badge?: string | number;
    isActive?: boolean;
    disabled?: boolean;
  }>;
  className?: string;
}

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ items, className, ...props }, ref) => {
    const pathname = usePathname();
    const { tenantId } = useTenant();

    const buildTenantHref = (href: string): string => {
      if (!href || href.startsWith("http")) return href;
      // Keep auth and API routes unprefixed
      if (href.startsWith("/login") || href.startsWith("/signup") || href.startsWith("/api")) {
        return href;
      }
      // Default tenant uses base paths
      if (!tenantId || tenantId === "default") return href;
      // Avoid double prefix
      if (href.startsWith(`/${tenantId}/`) || href === `/${tenantId}`) return href;
      return `/${tenantId}${href}`;
    };

    return (
      <nav ref={ref} className={cn("space-y-1", className)} {...props}>
        {items.map((item) => {
          const tenantHref = buildTenantHref(item.href);
          const isActive = item.isActive ?? pathname === tenantHref || pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : tenantHref}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                isActive && [
                  "bg-[var(--theme-primary)] text-[var(--theme-primary-foreground)] shadow-sm",
                  "hover:bg-[var(--theme-primary)] hover:brightness-90",
                ],
                item.disabled && "pointer-events-none opacity-50"
              )}
            >
              {item.icon && (
                <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
              )}
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" size="sm">
                  {item.badge}
                </Badge>
              )}
              {!isActive && (
                <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </Link>
          );
        })}
      </nav>
    );
  }
);
SidebarNav.displayName = "SidebarNav";

interface SidebarUserProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onSignOut?: () => void;
  className?: string;
}

const SidebarUser = React.forwardRef<HTMLDivElement, SidebarUserProps>(
  ({ user, onSignOut, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3 rounded-lg p-3 hover:bg-[var(--accent)]", className)}
        {...props}
      >
        <Avatar src={user.avatar} fallback={user.name} size="default" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-[var(--foreground)] truncate">{user.name}</p>
          <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
          {user.role && (
            <Badge variant="outline" size="sm" className="mt-1">
              {user.role}
            </Badge>
          )}
        </div>
        {onSignOut && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onSignOut}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </Button>
        )}
      </div>
    );
  }
);
SidebarUser.displayName = "SidebarUser";

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarNav, SidebarUser };
