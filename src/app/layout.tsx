import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import LogoutButton from "@/components/auth/LogoutButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kids Todo App",
  description: "A fun and colorful task management app for children aged 6-13",
  keywords: "kids, todo, tasks, children, family, organization",
  icons: {
    icon: [
      { url: `${process.env.NODE_ENV === 'production' ? '' : ''}/favicon.ico` },
      { url: `${process.env.NODE_ENV === 'production' ? '' : ''}/favicon-16x16.png`, sizes: '16x16', type: 'image/png' },
      { url: `${process.env.NODE_ENV === 'production' ? '' : ''}/favicon-32x32.png`, sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: `${process.env.NODE_ENV === 'production' ? '' : ''}/apple-touch-icon.png` },
    ],
  },
  authors: [{ name: "Kids Todo App" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
      >
        <AuthProvider>
          <LogoutButton />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
