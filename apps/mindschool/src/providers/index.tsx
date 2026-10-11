"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CustomToaster, SidebarProvider } from "@workspace/ui";
import { AuthProvider } from "@/contexts/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } }));

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="mindware-theme">
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <AuthProvider>
            <SidebarProvider>
              {children}
              <CustomToaster />
            </SidebarProvider>
          </AuthProvider>
        </NuqsAdapter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
