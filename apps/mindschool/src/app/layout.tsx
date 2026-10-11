import type { Metadata } from "next";
import "@workspace/ui/globals.css";
import { Outfit } from "next/font/google";
import { Providers } from "@/providers";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "MindSchool · Administração",
  description: "Painel de administração da plataforma MindSchool",
  icons: { icon: "/mindschool/mindware.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: outfit.style.fontFamily }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
