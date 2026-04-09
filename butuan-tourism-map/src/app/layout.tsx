import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Butuan Tourism Map",
  description: "Discover the rich history and cultural heritage of Butuan City",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50`} suppressHydrationWarning>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
