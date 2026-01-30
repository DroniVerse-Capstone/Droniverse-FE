"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "./i18n-provider";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
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
