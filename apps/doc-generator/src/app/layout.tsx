import type { Metadata } from "next";
import "@workspace/ui/globals.css";
import { Outfit } from "next/font/google";
import { Providers } from "@/providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Doc Generator - Mindware",
  description: "Gerador de Documentos e Relatórios em Tempo Real Mindware",
  icons: {
    icon: "/brand/mindware.png",
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
