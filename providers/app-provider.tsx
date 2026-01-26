"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "react-hot-toast";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
      />
    </QueryProvider>
  );
}
