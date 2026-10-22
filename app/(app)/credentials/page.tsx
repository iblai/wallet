"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Award, Import, Search } from "lucide-react";
import { useWallet } from "@/lib/wallet/provider";
import { credentialStatus, daysUntilExpiry, type WalletCredential } from "@/lib/wallet/types";
import { CredentialCard } from "@/components/wallet/credential-card";
import { Page } from "@/components/wallet/section";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { LoadingScreen } from "@/components/loading-screen";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Filter = "all" | "verified" | "pending" | "expiring" | "expired" | "public" | "self";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "By name" },
  { value: "issuer", label: "By issuer" },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "verified", label: "Verified" },
  { id: "pending", label: "Awaiting acceptance" },
  { id: "expiring", label: "Expiring" },
  { id: "expired", label: "Expired / revoked" },
  { id: "public", label: "Public" },
  { id: "self", label: "Self-reported" },
];

function matches(c: WalletCredential, f: Filter): boolean {
  const status = credentialStatus(c);
  const days = daysUntilExpiry(c);
  switch (f) {
    case "verified":
      return ["platform", "hosted", "signed"].includes(c.verification.level) && status === "active";
    case "pending":
      return status === "pending";
    case "expiring":
      return status === "active" && days !== null && days <= 90;
    case "expired":
      return status === "expired" || status === "revoked";
    case "public":
      return c.visibility === "public" && status === "active";
    case "self":
      return c.verification.level === "self";
    default:
      return true;
  }
}

export default function CredentialsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CredentialsList />
    </Suspense>
  );
}

function CredentialsList() {
  const { state } = useWallet();
  const params = useSearchParams();
  const initial = (params.get("filter") as Filter) || "all";
  const [filter, setFilter] = useState<Filter>(FILTERS.some((f) => f.id === initial) ? initial : "all");
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name" | "issuer">("newest");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = state.credentials.filter(
      (c) =>
        matches(c, filter) &&
        (collection === "all" || c.collections.includes(collection)) &&
        (!needle || [c.name, c.issuer.name, ...c.skills].some((s) => s.toLowerCase().includes(needle))),
    );
    const key = (c: WalletCredential) => c.issuedOn ?? c.addedAt;
    return rows.sort((a, b) =>
      sort === "newest" ? key(b).localeCompare(key(a)) : sort === "oldest" ? key(a).localeCompare(key(b)) : sort === "name" ? a.name.localeCompare(b.name) : a.issuer.name.localeCompare(b.issuer.name),
    );
  }, [state.credentials, filter, q, collection, sort]);

  if (state.isLoading) return <LoadingScreen />;

  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, state.credentials.filter((c) => matches(c, f.id)).length])) as Record<Filter, number>;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        icon={<Award />}
        title="Credentials"
        count={state.credentials.length}
        description="Everything you hold, from every issuer, in one verifiable place."
        actions={
          <Link href="/credentials/import" className="ibl-button-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium">
            <Import className="size-4" /> Add credential
          </Link>
        }
        toolbar={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, issuer, skill" className="h-8 w-64 pl-8" aria-label="Search credentials" />
            </div>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium",
                    filter === f.id ? "border-[#0058cc] bg-[#eef6fc] text-[#0058cc]" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {f.label} <span className="text-muted-foreground">{counts[f.id]}</span>
                </button>
              ))}
            </div>
            {state.collections.length ? (
              <Select value={collection} onValueChange={(v) => setCollection(String(v ?? "all"))} items={[{ value: "all", label: "All collections" }, ...state.collections.map((c) => ({ value: c.id, label: c.name }))]}>
                <SelectTrigger size="sm" aria-label="Collection">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All collections</SelectItem>
                  {state.collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Select value={sort} onValueChange={(v) => setSort((v as typeof sort) ?? "newest")} items={SORTS}>
              <SelectTrigger size="sm" aria-label="Sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name">By name</SelectItem>
                <SelectItem value="issuer">By issuer</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
      <Page>
        {list.length ? (
          <div className="grid gap-3 [&>*]:min-w-0 md:grid-cols-2 2xl:grid-cols-3">
            {list.map((c) => (
              <CredentialCard key={c.id} credential={c} href={`/credentials/${encodeURIComponent(c.id)}`} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Award strokeWidth={1.75} />}
            title={state.credentials.length ? "Nothing matches" : "No credentials yet"}
            description={state.credentials.length ? "Try another filter or search." : "Import a badge, connect ibl.ai, or add a record you hold."}
            action={
              <Link href="/credentials/import" className="ibl-button-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium">
                <Import className="size-4" /> Add credential
              </Link>
            }
          />
        )}
      </Page>
    </div>
  );
}
