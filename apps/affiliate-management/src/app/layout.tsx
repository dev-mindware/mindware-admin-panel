import type { Metadata } from "next";
import "@workspace/ui/globals.css";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
    <html lang="pt" suppressHydrationWarning>
      <body
        className="antialiased"
        style={{ fontFamily: `${outfit.style.fontFamily}` }}
      >
          <Providers>
            {children}
          </Providers>
      </body>
    </html>
  );
}
