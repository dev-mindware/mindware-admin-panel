import "@/app/globals.css";

export const metadata = {
  title: "Mindware Portal",
  description: "Central access to Mindware Ecosystem",
  icons: {
    icon: "/mindgest/logo.png",
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
