import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "韓文學習平台 — 從零開始學韓文",
  description: "專為繁體中文使用者設計的零基礎韓文學習平台，從韓文字母（한글）開始，循序漸進學習韓文。",
  keywords: ["韓文學習", "韓文字母", "한글", "韓文入門", "繁體中文"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <TooltipProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-gray-100 bg-white py-6 text-center text-sm text-gray-400">
            韓文學習平台 — 從零開始，輕鬆學韓文 🇰🇷
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
