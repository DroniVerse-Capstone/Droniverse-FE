"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "./i18n-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMe } from "@/hooks/auth/useAuth";
import { getAccessToken } from "@/lib/auth/cookies";

function AuthBootstrap() {
  const hasAccessToken = Boolean(getAccessToken());

  useMe({ enabled: hasAccessToken });

  return null;
}

export function AppProvider({
  children,
  initialLocale
}: {
  children: ReactNode;
  initialLocale: string;
}) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      <QueryProvider>
        <AuthBootstrap />
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
        />
      </QueryProvider>
    </I18nProvider>
  );
}
