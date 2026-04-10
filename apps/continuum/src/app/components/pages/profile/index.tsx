"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@rccyx/design/ui";

import { logger } from "@rccyx/logger";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Loading,
  Separator,
} from "@rccyx/design/ui";

import { useAuth } from "~/app/hooks/auth";
import { rpc } from "@rccyx/api/rpc-client";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { SessionsList } from "./components/SessionsList";
import { UserInfo } from "./components/UserInfo";

import {
  TwoFactorEnableCard,
  TwoFactorRevealSecretCard,
  TwoFactorVerifyTotpCard,
  TwoFactorBackupCodesCard,
  TwoFactorDisableCard,
} from "./components/TwoFactorBlock";

export function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const utils = rpc.useUtils();

  // Perform redirect as a side effect, not during render
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, router, user]);

  // While waiting for auth state or redirecting, show nothing/spinner
  if (!isLoading && !user) {
    return null;
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      await utils.user.me.invalidate();
      toast.success("Logged out");
    } catch (error) {
      logger.error("Logout failed", { error });
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account</h1>
          <p className="text-muted-foreground text-sm">
            Profile, security, sessions, and two factor settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge appearance="outline" className="text-sm font-semibold">
            {user.role}
          </Badge>
          <Badge appearance="soft" className="text-sm font-semibold">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Badge>
          <Button
            appearance="outline"
            tone="danger"
            role="secondary"
            onClick={handleLogout}
            className="ml-2"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px,1fr]">
        {/* Sidebar like Supabase */}
        <Card className="h-max sticky top-4">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>Quick info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserInfo user={user} />
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="space-y-6">
          {/* Security */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ChangePasswordForm />
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Sessions</CardTitle>
              <CardDescription>Manage signed in devices</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <SessionsList currentSessionId={user.session.id} />
            </CardContent>
          </Card>

          {/* Two Factor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Two Factor Authentication</CardTitle>
              <CardDescription>
                Enable TOTP, verify codes, manage backup codes, or disable
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-6">
              {/* Enable first */}
              <TwoFactorEnableCard />

              {/* Management */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TwoFactorRevealSecretCard />
                <TwoFactorVerifyTotpCard />
                <div className="md:col-span-2">
                  <TwoFactorBackupCodesCard />
                </div>
                <TwoFactorDisableCard />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
