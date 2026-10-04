import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import type { ReactNode } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ConfirmProvider } from "@/components/shared/confirm-provider";
import { QueryProvider } from "@/components/shared/query-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const hindSiliguri = localFont({
  src: [
    {
      path: "../assets/fonts/HindSiliguri-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/HindSiliguri-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/HindSiliguri-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Paws Academy",
    template: "%s | Paws Academy",
  },
  description:
    "Next-generation smart question bank, AI tutor, and model test platform for students.",
  icons: {
    icon: [
      { url: "/icons/paws-logo-dark.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icons/paws-logo-dark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={`${hindSiliguri.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans select-none">
        <Script
          src="https://cdn.jsdelivr.net/npm/disable-devtool"
          strategy="afterInteractive"
          {...{ "disable-devtool-auto": "" }}
        />
        <Script id="prevent-copy-script" strategy="afterInteractive">
          {`
            document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, false);
            document.addEventListener('copy', function(e) { e.preventDefault(); }, false);
            document.addEventListener('cut', function(e) { e.preventDefault(); }, false);
            document.addEventListener('dragstart', function(e) { e.preventDefault(); }, false);
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
              }
            }, false);
          `}
        </Script>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <ConfirmProvider>{children}</ConfirmProvider>
              <Toaster
                className="font-sans"
                toastOptions={{
                  className: "font-sans",
                }}
              />
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
        <GoogleAnalytics gaId="G-MPR0GX8E8T" />
      </body>
    </html>
  );
}
