"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";
import { AxiosError } from "axios";
import { ApiError } from "@/types/api/common";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data is fresh for 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on 401, 403, 404
              const axiosError = error as AxiosError<ApiError>;
              if ([401, 403, 404].includes(axiosError.response?.status ?? 0)) {
                return false;
              }
              // Retry maximum 1 time for other errors
              return failureCount < 1;
            },
          },
          mutations: {
            retry: false, // Don't retry mutations by default
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
