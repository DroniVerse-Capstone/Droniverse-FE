"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "./i18n-provider";

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
        {children}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
        />
      </QueryProvider>
    </I18nProvider>
  );
}
