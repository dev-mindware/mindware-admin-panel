import type { Metadata } from "next";
import "@workspace/ui/globals.css";
import { Inter, Outfit } from "next/font/google";
import { SidebarProvider } from "@workspace/ui";
import { ThemeProvider } from "next-themes"; // This might need to be shared too

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", preload: false });
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-outfit",
  preload: false,
});

export const metadata: Metadata = {
  title: "Affiliate Management - Mindware",
  description: "Sistema de Gestão de Afiliados Mindware",
  icons: {
    icon: "/mindware.png",
  },
};

import { Providers } from "@/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-outfit), var(--font-inter), sans-serif" }}
      >
          <Providers>
            {children}
          </Providers>
      </body>
    </html>
  );
}
