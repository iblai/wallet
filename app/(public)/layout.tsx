import Link from "next/link";
import Image from "next/image";

/**
 * Outward-facing pages: the public wallet (/p/<username>) and verify
 * (/verify/<id>). No navbar, no session — an employer opens these cold.
 * Both are listed in PUBLIC_ROUTES (providers/iblai-providers.tsx).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--sidebar-bg,#fafbfc)]">
      <header className="border-b border-[var(--border-color,#e5e7eb)] bg-white">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/iblai-logo.png"
              alt="ibl.ai"
              width={96}
              height={32}
              className="h-6 w-auto"
            />
            <span className="text-sm font-semibold text-gray-700">Credential Wallet</span>
          </Link>
          <span className="text-muted-foreground text-xs">Verified, portable credentials</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="text-muted-foreground border-t border-[var(--border-color,#e5e7eb)] bg-white py-4 text-center text-xs">
        Credentials on this page link to their issuers' records. Built on the ibl.ai platform.
      </footer>
    </div>
  );
}
