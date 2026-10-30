"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, CustomToaster } from "@workspace/ui";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useIsMobile } from "@/hooks/use-mobile";

export function Providers({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // A sessão vem do localStorage, que só existe no browser: lê-se depois da hidratação.
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <SidebarProvider>
            {children}
            {/* Avisos fora do caminho das acções: em cima ao centro no telemóvel, em baixo à direita no computador. */}
            <CustomToaster position={isMobile ? "top-center" : "bottom-right"} />
          </SidebarProvider>
        </NuqsAdapter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
