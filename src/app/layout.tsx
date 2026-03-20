import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThreeBackground from "@/components/ThreeBackground";
import CustomCursor from "@/components/CustomCursor";
import DecorativeOrbs from "@/components/DecorativeOrbs";

export const metadata: Metadata = {
  title: "TEACH EDISON | Quiz",
  description: "Advanced AI Dynamic Quiz Generation Portfolio",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
        <ThreeBackground />
        <CustomCursor />
        
        <DecorativeOrbs />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 max-w-5xl">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
