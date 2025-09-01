// app/dashboard/admin/pages/page.tsx
"use client";

import React from "react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

const PagesPage: React.FC = () => {
  const pages = [
    { path: "/", name: "Landing Page", type: "Static" as const },
    { path: "/dashboard", name: "Dashboard Overview", type: "Protected" as const },
    { path: "/dashboard/apps", name: "Apps Listing", type: "Protected" as const },
    { path: "/dashboard/lessons", name: "Lessons", type: "Protected" as const },
    { path: "/dashboard/community", name: "Community", type: "Protected" as const },
    { path: "/dashboard/profile", name: "User Profile", type: "Protected" as const },
    { path: "/dashboard/billing", name: "Billing", type: "Protected" as const },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Page Management
            </h1>
            <p className="text-[var(--muted-foreground)] mt-2">
              Manage site pages and content structure
            </p>
          </div>

          {/* Use an allowed variant and theme it via CSS vars */}
          <Button
            variant="default"
            className="bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary)]/90"
          >
            Add Page
          </Button>
        </div>

        {/* Static Pages */}
        <Card className="bg-[var(--surface-0)] border border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)]">Static Pages</CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Manage landing pages, content pages, and site structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[var(--surface-1)] border border-[var(--border)]">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                Coming Soon
              </h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Page management functionality will be available in a future update.
              </p>
              <div className="space-y-2 text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
                <p>• Create and edit landing pages</p>
                <p>• Manage content templates</p>
                <p>• Configure page layouts</p>
                <p>• SEO optimization tools</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Pages Overview */}
        <Card className="bg-[var(--surface-0)] border border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)]">Current Site Structure</CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Overview of existing pages and routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pages.map((page) => {
                const isProtected = page.type === "Protected";
                const badgeClasses = isProtected
                  ? "bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]"
                  : "bg-[var(--theme-tertiary)]/20 text-[var(--theme-tertiary)]";

                return (
                  <div
                    key={page.path}
                    className="flex items-center justify-between p-3 rounded border border-[var(--border)] bg-[var(--surface-0)] hover:border-[var(--theme-primary)]/40 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-[var(--foreground)]">{page.name}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">{page.path}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${badgeClasses}`}>
                      {page.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default PagesPage;
