
import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";

import "./globals.css";

// Modern sans-serif font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Monospace font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Elegant heading font
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

// Website metadata
export const metadata: Metadata = {
  title: "Campus Rental Hub | Discover. Rent. Repeat.",
  description:
    "Discover and rent textbooks, calculators, lab equipment, and student essentials from your campus community.",
};

// Main website layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${lora.variable}
        h-full antialiased
      `}
    >
      <body className="flex min-h-screen flex-col bg-[#FAF9F6] text-[#252525]">
        <ToastProvider>
          {/* Website navigation */}
          <Navbar />

          {/* Main page content */}
          <main className="flex flex-1 flex-col">
            {children}
          </main>

          {/* Website footer */}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
