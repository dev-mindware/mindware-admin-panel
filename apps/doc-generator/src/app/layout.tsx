import type { Metadata, Viewport } from "next";
import "@workspace/ui/globals.css";
import "@/styles/mobile.css";
import { Outfit } from "next/font/google";
import { Providers } from "@/providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// viewport-fit=cover deixa usar env(safe-area-inset-*); sem maximumScale, para não impedir o zoom (WCAG 1.4.4).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Cor da barra do browser no telemóvel, de acordo com o tema.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  title: "Doc Generator - Mindware",
  description: "Gerador de Documentos e Relatórios em Tempo Real Mindware",
  icons: {
    icon: "/doc-generator/brand/mindware.png",
  },
};

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
