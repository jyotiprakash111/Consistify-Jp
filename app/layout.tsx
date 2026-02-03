import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminShell } from "@/components/admin-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consistify Admin",
  description: "Admin panel for Consistify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="consistify-admin-theme" strategy="beforeInteractive">
          {`(function(){try{var storageKey='consistify-admin-theme';var root=document.documentElement;var stored=localStorage.getItem(storageKey);var theme=stored==='dark'||stored==='light'?stored:(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');if(theme==='dark'){root.classList.add('dark');root.style.colorScheme='dark';}else{root.classList.remove('dark');root.style.colorScheme='light';}localStorage.setItem(storageKey,theme);}catch(e){}})();`}
        </Script>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}

