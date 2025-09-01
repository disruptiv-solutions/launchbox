// app/admin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
Users,
Rocket,
Globe,
BookOpen,
MessageSquare,
TrendingUp,
Activity,
Clock
} from 'lucide-react';
import { getAdminDashboardStats } from '../../../lib/admin';
import { useTenant } from '../../../contexts/tenant-context';

const AdminDashboard = () => {
const { tenantId } = useTenant();
const [adminStats, setAdminStats] = useState({
users: { total: 0, premium: 0, admin: 0, free: 0 },
community: { totalPosts: 0, totalComments: 0 },
platforms: 0,
apps: 0,
lessons: 0
});
const [loading, setLoading] = useState(true);

// Sidebar provides admin navigation; no shortcuts here

useEffect(() => {
loadAdminStats();
// Re-load when tenant changes
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [tenantId]);

const loadAdminStats = async () => {
try {
// Scope stats to tenant unless a superadmin page passes a different scope later
const stats = await getAdminDashboardStats(tenantId);
setAdminStats(stats);
} catch (error) {
console.error('Error loading admin stats:', error);
} finally {
setLoading(false);
}
};

const statCards = [
{
title: 'Total Users',
value: adminStats.users.total,
icon: Users,
color: 'primary',
change: '+12%',
changeType: 'positive'
},
{
title: 'Applications',
value: adminStats.apps,
icon: Rocket,
color: 'secondary',
change: '+3',
changeType: 'positive'
},
{
title: 'Platforms',
value: adminStats.platforms,
icon: Globe,
color: 'tertiary',
change: 'New',
changeType: 'neutral'
},
{
title: 'Community Posts',
value: adminStats.community.totalPosts,
icon: MessageSquare,
color: 'quaternary',
change: '+24%',
changeType: 'positive'
}
];

const userBreakdown = [
{ label: 'Free Users', count: adminStats.users.free, color: 'bg-[var(--surface-1)]' },
{ label: 'Premium Users', count: adminStats.users.premium, color: 'bg-[var(--theme-tertiary)]' },
{ label: 'Admin Users', count: adminStats.users.admin, color: 'bg-[var(--theme-secondary)]' }
];

if (loading) {
return (
<div className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{Array.from({ length: 4 }).map((_, i) => (
<Card key={i} variant="elevated">
<CardContent className="p-6">
<div className="animate-pulse">
<div className="h-4 bg-[var(--surface-2)] rounded w-1/2 mb-2"></div>
<div className="h-8 bg-[var(--surface-2)] rounded w-1/3 mb-2"></div>
<div className="h-3 bg-[var(--surface-2)] rounded w-1/4"></div>
</div>
</CardContent>
</Card>
))}
</div>
</div>
);
}

return (
<div className="space-y-8">
{/* Quick Stats Overview */}
<div>
<h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
Dashboard Overview
</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{statCards.map((stat, index) => {
const IconComponent = stat.icon;
return (
<Card key={index} variant="elevated" hover="lift" className="relative overflow-hidden">
<div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[var(--theme-${stat.color})]/20`} />
<CardContent className="p-6 relative">
<div className="flex items-center justify-between">
<div>
<p className="text-sm font-medium text-[var(--muted-foreground)]">
{stat.title}
</p>
<p className="text-2xl font-bold text-[var(--foreground)]">
{stat.value}
</p>
<div className="flex items-center gap-1 mt-1">
<span className={`text-xs px-2 py-1 rounded-full ${
stat.changeType === 'positive'
? 'bg-[var(--theme-tertiary)]/20 text-[var(--theme-tertiary)]'
: 'bg-[var(--surface-1)] text-[var(--muted-foreground)]'
}`}>
{stat.change}
</span>
<span className="text-xs text-[var(--muted-foreground)]">vs last month</span>
</div>
</div>
<IconComponent className={`h-8 w-8 text-[var(--theme-${stat.color})]`} />
</div>
</CardContent>
</Card>
);
})}
</div>
</div>

{/* Detailed Analytics */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
{/* User Breakdown */}
<Card variant="glass" hover="glow">
<CardHeader>
<CardTitle className="flex items-center gap-2">
<Users className="h-5 w-5 text-[var(--theme-primary)]" />
User Distribution
</CardTitle>
<CardDescription>Breakdown of users by access level</CardDescription>
</CardHeader>
<CardContent>
<div className="space-y-4">
{userBreakdown.map((item, index) => (
<div key={index} className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-1)]">
<div className="flex items-center gap-3">
<div className={`w-4 h-4 rounded-full ${item.color}`}></div>
<span className="font-medium text-[var(--foreground)]">
{item.label}
</span>
</div>
<div className="text-right">
<span className="text-2xl font-bold text-[var(--foreground)]">
{item.count}
</span>
<p className="text-xs text-[var(--muted-foreground)]">
{((item.count / adminStats.users.total) * 100).toFixed(1)}%
</p>
</div>
</div>
))}
</div>
</CardContent>
</Card>

{/* Community Activity */}
<Card variant="glass" hover="glow">
<CardHeader>
<CardTitle className="flex items-center gap-2">
<Activity className="h-5 w-5 text-[var(--theme-primary)]" />
Community Activity
</CardTitle>
<CardDescription>Recent community engagement metrics</CardDescription>
</CardHeader>
<CardContent>
<div className="space-y-4">
<div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-1)]">
<div className="flex items-center gap-3">
<MessageSquare className="h-5 w-5 text-[var(--theme-secondary)]" />
<span className="font-medium text-[var(--foreground)]">Total Posts</span>
</div>
<span className="text-2xl font-bold text-[var(--foreground)]">
{adminStats.community.totalPosts}
</span>
</div>

<div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-1)]">
<div className="flex items-center gap-3">
<MessageSquare className="h-5 w-5 text-[var(--theme-tertiary)]" />
<span className="font-medium text-[var(--foreground)]">Total Comments</span>
</div>
<span className="text-2xl font-bold text-[var(--foreground)]">
{adminStats.community.totalComments}
</span>
</div>

<div className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-1)]">
<div className="flex items-center gap-3">
<TrendingUp className="h-5 w-5 text-[var(--theme-quaternary)]" />
<span className="font-medium text-[var(--foreground)]">Engagement Rate</span>
</div>
<span className="text-2xl font-bold text-[var(--foreground)]">
{adminStats.community.totalPosts > 0
? ((adminStats.community.totalComments / adminStats.community.totalPosts).toFixed(1))
: '0'
}
</span>
</div>
</div>
</CardContent>
</Card>
</div>
</div>
);
};

export default AdminDashboard;
