import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The house card for a wallet section: a titled white panel on the gray page. */
export function Section({
  title,
  description,
  actions,
  children,
  className,
  id,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("min-w-0 rounded-lg border border-[var(--border-color,#e5e7eb)] bg-white", className)}>
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="min-w-0 p-5">{children}</div>
    </section>
  );
}

export function StatTile({ label, value, hint, tone = "default", href }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "warn" | "good"; href?: string }) {
  const inner = (
    <div className={cn("rounded-lg border bg-white p-4", tone === "warn" ? "border-amber-200" : tone === "good" ? "border-emerald-200" : "border-[var(--border-color,#e5e7eb)]")}>
      <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold", tone === "warn" ? "text-amber-700" : tone === "good" ? "text-emerald-700" : "text-gray-900")}>{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
  return href ? (
    <a href={href} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]">
      {inner}
    </a>
  ) : (
    inner
  );
}

/** Page body inside the OS shell: full width of the inset, capped like the OS content area. */
export function Page({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn("mx-auto w-full flex-1 px-4 py-5 md:px-6", wide ? "max-w-[1400px]" : "max-w-6xl", className)}>{children}</div>;
}
