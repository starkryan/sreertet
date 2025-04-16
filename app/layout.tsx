import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Navbar1 } from '@/components/blocks/shadcnblocks-com-navbar1';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OTPMaya Premium",
  description: "OTPMaya Premium is a premium service that allows you to get a virtual phone number and receive SMS codes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Toaster
       position="top-center"
       richColors
       duration={3000}
       />
    <html lang="en">
     
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar1 />
        <div className="pt-16 sm:pt-20">
          {children}
        </div>
      </body>
    </html>
    </ClerkProvider>
  );
}
