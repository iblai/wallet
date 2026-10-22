import type { Metadata, Viewport } from "next";
import "./globals.css";
import { IblaiProviders } from "@/providers/iblai-providers";
import { TooltipProvider } from "@/components/ui/tooltip";

// The middleware's nonce-based CSP requires per-request rendering: a statically
// prerendered page ships nonce-less <script> tags that enforce mode blocks
// (strict-dynamic disables 'self'/https: fallbacks), white-screening the
// deployed app. Remove this only if the CSP middleware goes too.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Credential Wallet",
  description: "Your credentials, skills and résumé — verified, portable, and yours. Built on the ibl.ai platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <IblaiProviders>
          <TooltipProvider>{children}</TooltipProvider>
        </IblaiProviders>
      </body>
    </html>
  );
}
