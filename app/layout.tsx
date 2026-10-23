import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { IblaiProviders } from "@/providers/iblai-providers";
import { TooltipProvider } from "@/components/ui/tooltip";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });

// The proxy's nonce-based CSP requires per-request rendering: a statically
// prerendered page ships nonce-less <script> tags that enforce mode blocks
// (strict-dynamic disables 'self'/https: fallbacks), white-screening the
// deployed app. Remove this only if the CSP proxy goes too.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Credential Wallet", template: "%s · Credential Wallet" },
  description:
    "Your credentials, skills and résumé — verified, portable, and yours. Built on the ibl.ai platform.",
  applicationName: "Credential Wallet",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <IblaiProviders>
          <TooltipProvider>{children}</TooltipProvider>
        </IblaiProviders>
      </body>
    </html>
  );
}
