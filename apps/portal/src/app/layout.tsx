import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mindware Portal",
  description: "Central access to Mindware Ecosystem",
  icons: {
    icon: [
      {
        url: "/brand/mindware.png",
        type: "image/png",
      },
    ],
    shortcut: "/brand/mindware.png",
    apple: "/brand/mindware.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="dark">
      <body className="antialiased min-h-screen bg-[#0A0512] text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
