import type { Metadata } from "next";
import "@workspace/ui/globals.css";

import { ThemeProvider, SidebarProvider, CustomToaster } from "@workspace/ui";

import { ReactQueryProvider } from "@/lib";
import { Inter, Outfit, } from "next/font/google";

import { AuthProvider } from "@/contexts";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Mindgest",
  description: "Sistema de Gestão Mindgest",
  icons: {
    icon: "/mindgest/mindgest.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable}  ${outfit.variable}`}
    >
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-family)" }}
      >
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          themes={["light", "dark", "system"]}
          storageKey="mindware-theme"
        >
          <ReactQueryProvider>
            <AuthProvider>
              <NuqsAdapter>
                <SidebarProvider>{children}</SidebarProvider>
                <CustomToaster />
              </NuqsAdapter>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
