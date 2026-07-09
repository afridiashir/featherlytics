import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Google_Sans, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const googleSans = Google_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Featherlytics",
  description: "Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${googleSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <NextTopLoader
            color="#2a78d6"
            height={3}
            shadow="0 0 8px #2a78d6,0 0 4px #2a78d6"
            showSpinner={false}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
