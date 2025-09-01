"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/auth-context";
import { useTheme } from "../../contexts/theme-context";
import { useIsMobile } from "../../hooks/use-media-query";
import ProtectedRoute from "../../app/components/auth/ProtectedRoute";

import {
Sidebar,
SidebarHeader,
SidebarContent,
SidebarFooter,
SidebarNav,
SidebarUser,
} from "../../app/components/ui/sidebar";

import { Button } from "../../app/components/ui/button";
import { Badge } from "../../app/components/ui/badge";

import {
BarChart3,
Rocket,
GraduationCap,
Users,
User,
CreditCard,
Settings,
Menu,
Bell,
Sun,
Moon,
Monitor,
ArrowLeft,
Globe,
BookOpen,
Palette,
FileText,
Wrench,
} from "lucide-react";

interface DashboardLayoutProps {
children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
const [sidebarOpen, setSidebarOpen] = useState(false);
const { user, signOut } = useAuth();
const { theme, setThemeMode } = useTheme();
const pathname = usePathname();
const isMobile = useIsMobile();

// State to track if we are in an admin-related page
const [isAdminView, setIsAdminView] = useState(
pathname.startsWith("/dashboard/admin")
);

// Effect to update the view state when the path changes
useEffect(() => {
setIsAdminView(pathname.startsWith("/dashboard/admin"));
}, [pathname]);

// Page configuration
const pageConfig = {
enableApps: true,
enableLessons: true,
};

// Main navigation items for the dashboard
const mainNavigationItems = [
{
name: "Overview",
href: "/dashboard",
icon: <BarChart3 className="h-5 w-5" />,
},
...(pageConfig.enableApps
? [
{
name: "Apps",
href: "/dashboard/apps",
icon: <Rocket className="h-5 w-5" />,
badge: user?.role === "premium" ? "Pro" : undefined,
},
]
: []),
...(pageConfig.enableLessons
? [
{
name: "Lessons",
href: "/dashboard/lessons",
icon: <GraduationCap className="h-5 w-5" />,
},
]
: []),
{
name: "Community",
href: "/dashboard/community",
icon: <Users className="h-5 w-5" />,
},
{
name: "Profile",
href: "/dashboard/profile",
icon: <User className="h-5 w-5" />,
},
...(user
? [
{
name: "Billing",
href: "/dashboard/billing",
icon: <CreditCard className="h-5 w-5" />,
},
]
: []),
// Admin link moved to footer button
];

// Navigation items specific to the admin section
const adminNavigationItems = [
{ name: "Platforms", href: "/dashboard/admin/platforms", icon: <Globe className="h-5 w-5" /> },
{ name: "Apps", href: "/dashboard/admin/apps", icon: <Rocket className="h-5 w-5" /> },
{ name: "Lessons", href: "/dashboard/admin/lessons", icon: <BookOpen className="h-5 w-5" /> },
{ name: "Users", href: "/dashboard/admin/users", icon: <Users className="h-5 w-5" /> },
{ name: "Customize", href: "/dashboard/admin/customize", icon: <Palette className="h-5 w-5" /> },
{ name: "Pages", href: "/dashboard/admin/pages", icon: <FileText className="h-5 w-5" /> },
{ name: "Maintenance", href: "/dashboard/admin/maintenance", icon: <Wrench className="h-5 w-5" /> },
];

// Conditionally select the navigation items to display
const navigationItems = isAdminView ? adminNavigationItems : mainNavigationItems;

// Determine the title for the header
const currentNavTitle =
navigationItems.find((item) => item.href === pathname)?.name ||
mainNavigationItems.find((item) => item.href === pathname)?.name ||
"Dashboard";

const handleSignOut = async () => {
try {
await signOut();
setSidebarOpen(false);
} catch (error) {
console.error("Error signing out:", error);
}
};

const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
const closeSidebar = () => setSidebarOpen(false);

const toggleTheme = () => {
const newMode = theme.mode === "dark" ? "light" : "dark";
setThemeMode(newMode);
};

const getThemeIcon = () => {
switch (theme.mode) {
case "light":
return <Sun className="h-5 w-5" />;
case "dark":
return <Moon className="h-5 w-5" />;
case "system":
return <Monitor className="h-5 w-5" />;
default:
return <Monitor className="h-5 w-5" />;
}
};

// --- START: ADMIN TOGGLE BUTTON COMPONENT ---
const AdminToggleButton = () => (
<>
{(user?.role === "admin" || user?.role === "superadmin") && (
<div className="px-4 pb-4">
{!isAdminView ? (
<Link href="/dashboard/admin" passHref>
<Button variant="outline" className="w-full justify-start text-left">
<Settings className="mr-2 h-4 w-4" />
Admin Panel
</Button>
</Link>
) : (
<Link href="/dashboard" passHref>
<Button variant="outline" className="w-full justify-start text-left">
<ArrowLeft className="mr-2 h-4 w-4" />
Exit Admin Panel
</Button>
</Link>
)}
</div>
)}
</>
);
// --- END: ADMIN TOGGLE BUTTON COMPONENT ---

return (
<ProtectedRoute>
{/* Set shared header height once with a CSS custom property */}
<div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] [--dashboard-header-h:64px]">
{/* Mobile header */}
{isMobile && (
<motion.header
className="sticky top-0 z-50 bg-[var(--surface-0)]/80 border-b border-[var(--border)] backdrop-blur-xl"
initial={{ y: -100 }}
animate={{ y: 0 }}
transition={{ duration: 0.3 }}
>
<div className="flex items-center justify-between p-4">
<div className="flex items-center gap-3">
{theme.branding?.logoUrl && (
<img src={theme.branding.logoUrl} alt="Logo" className="h-8 w-auto" />
)}
<h1 className="text-xl font-bold text-[var(--theme-primary)]">
{theme.branding?.title || "Ian McDonald AI"}
</h1>
</div>
<div className="flex items-center gap-2">
<Button
variant="ghost"
size="icon"
onClick={toggleTheme}
title={`Current: ${theme.mode} mode. Click to switch.`}
>
{getThemeIcon()}
</Button>
<Button variant="ghost" size="icon" className="relative">
<Bell className="h-5 w-5" />
<Badge
variant="destructive"
className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
>
3
</Badge>
</Button>
<Button variant="ghost" size="icon" onClick={toggleSidebar}>
<Menu className="h-5 w-5" />
</Button>
</div>
</div>
</motion.header>
)}

<div className="flex h-screen overflow-hidden">
{/* Desktop Sidebar */}
{!isMobile && (
<motion.div
initial={{ x: -320 }}
animate={{ x: 0 }}
transition={{ duration: 0.3, ease: "easeOut" }}
className="hidden md:flex md:flex-shrink-0"
>
<Sidebar variant="glass" className="bg-[var(--surface-0)]/80 backdrop-blur-xl border-r border-[var(--border)]">
<SidebarHeader>
<div className="flex items-center justify-between w-full">
<div className="flex items-center gap-3">
{theme.branding?.logoUrl && (
<img src={theme.branding.logoUrl} alt="Logo" className="h-6 w-auto" />
)}
<div>
<h1 className="text-base font-bold text-[var(--theme-primary)]">
{theme.branding?.title || "Ian McDonald AI"}
</h1>
<p className="text-xs text-[var(--muted-foreground)]">AI Learning Platform</p>
</div>
</div>
<Button
variant="ghost"
size="icon"
onClick={toggleTheme}
title={`Current: ${theme.mode} mode. Click to switch.`}
className="h-8 w-8"
>
{getThemeIcon()}
</Button>
</div>
</SidebarHeader>

<SidebarContent>
<SidebarNav items={navigationItems} />
</SidebarContent>

{user && (
<SidebarFooter>
<AdminToggleButton />
<SidebarUser
user={{
name: user.displayName,
email: user.email,
avatar: user.profile.avatar,
role: user.role,
}}
onSignOut={handleSignOut}
className="group"
/>
</SidebarFooter>
)}
</Sidebar>
</motion.div>
)}

{/* Mobile Sidebar */}
{isMobile && (
<div className="fixed inset-0 z-40 md:hidden">
{sidebarOpen && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="fixed inset-0 bg-black/50 backdrop-blur-sm"
onClick={closeSidebar}
/>
)}

<Sidebar
variant="glass"
isOpen={sidebarOpen}
onClose={closeSidebar}
className="absolute left-0 top-0 h-full z-50 bg-[var(--surface-0)]/95 backdrop-blur-xl"
>
<SidebarHeader>
{theme.branding?.logoUrl && (
<img src={theme.branding.logoUrl} alt="Logo" className="h-8 w-auto" />
)}
<div>
<h1 className="text-lg font-bold text-[var(--theme-primary)]">
{theme.branding?.title || "Ian McDonald AI"}
</h1>
<p className="text-xs text-[var(--muted-foreground)]">AI Learning Platform</p>
</div>
</SidebarHeader>

<SidebarContent>
<SidebarNav items={navigationItems} />
</SidebarContent>

{user && (
<SidebarFooter>
<AdminToggleButton />
<SidebarUser
user={{
name: user.displayName,
email: user.email,
avatar: user.profile.avatar,
role: user.role,
}}
onSignOut={handleSignOut}
/>
</SidebarFooter>
)}
</Sidebar>
</div>
)}

{/* Main content */}
<div className="flex-1 flex flex-col overflow-hidden">
{/* Desktop header with fixed height matching sidebar header */}
{!isMobile && (
<motion.header
className="bg-[var(--surface-0)]/80 border-b border-[var(--border)] backdrop-blur-xl h-[var(--dashboard-header-h)] box-border"
initial={{ y: -50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.3, delay: 0.1 }}
>
<div className="flex items-center justify-between px-6 h-full">
<div className="flex items-center gap-4">
<h1 className="text-2xl font-bold text-[var(--foreground)]">
{currentNavTitle}
</h1>
</div>

<div className="flex items-center gap-3">
<Button variant="ghost" size="icon" className="relative">
<Bell className="h-5 w-5" />
<Badge
variant="destructive"
className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
>
3
</Badge>
</Button>

{user && (
<div className="flex items-center gap-2">
<Badge variant="outline" className="capitalize">
{user.role}
</Badge>
</div>
)}
</div>
</div>
</motion.header>
)}

{/* Main content area */}
<main className="flex-1 overflow-y-auto bg-[var(--background)]">
<motion.div
className="container mx-auto p-6 max-w-7xl"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, delay: 0.2 }}
>
{children}
</motion.div>
</main>
</div>
</div>
</div>
</ProtectedRoute>
  );
};

export default DashboardLayout;
