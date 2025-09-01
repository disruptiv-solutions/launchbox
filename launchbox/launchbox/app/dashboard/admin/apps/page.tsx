// app/dashboard/admin/apps/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { getApps /*, createApp, updateApp, deleteApp */ } from "@/lib/admin";
import { App } from "@/types";
import { useTenant } from "@/contexts/tenant-context";

const AdminAppsPage: React.FC = () => {
  const { tenantId } = useTenant();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) void loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const loadApps = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const appsData = await getApps(tenantId);
      setApps(appsData);
    } catch (error) {
      console.error("Error loading apps:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Apps Management</h1>
            <p className="text-[var(--muted-foreground)] mt-2">
              Manage native applications and their access levels
            </p>
          </div>
          {/* Use an allowed variant and theme via CSS vars */}
          <Button
            variant="default"
            className="bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-primary)]/90"
          >
            Add App
          </Button>
        </div>

        {/* Apps List */}
        <Card className="bg-[var(--surface-0)] border border-[var(--border)]">
          <CardHeader className="border-b border-[var(--border)]">
            <CardTitle className="text-[var(--foreground)]">Native Applications</CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Manage apps available to users ({apps.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)] mx-auto" />
                <p className="mt-2 text-[var(--muted-foreground)]">Loading apps...</p>
              </div>
            ) : apps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[var(--muted-foreground)]">
                  No apps found. Create your first app!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg bg-[var(--surface-0)]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] rounded-lg flex items-center justify-center text-white font-bold">
                        {app.title.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-[var(--foreground)] font-medium">{app.title}</h3>
                        <p className="text-[var(--muted-foreground)] text-sm">{app.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              app.accessLevel === "free"
                                ? "bg-[var(--theme-tertiary)]/20 text-[var(--theme-tertiary)] border border-[var(--theme-tertiary)]/30"
                                : app.accessLevel === "premium"
                                ? "bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30"
                                : "bg-[var(--theme-secondary)]/20 text-[var(--theme-secondary)] border border-[var(--theme-secondary)]/30"
                            }`}
                          >
                            {app.accessLevel}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            Used {app.analytics?.totalUses ?? 0} times
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-1)]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[var(--theme-quinary)] text-[var(--theme-quinary)] hover:bg-[var(--theme-quinary)]/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default AdminAppsPage;
