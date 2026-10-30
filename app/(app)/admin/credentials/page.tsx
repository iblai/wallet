"use client";

import { useEffect, useState } from "react";
import { Award, BadgeCheck } from "lucide-react";
import { resolveAppTenant, isTenantAdmin } from "@/lib/iblai/tenant";
import { sessionFetch, SessionFetchError } from "@/lib/iblai/session-fetch";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { LoadingScreen } from "@/components/loading-screen";
import { Section, Page } from "@/components/wallet/section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Admin: the organization's credentials — what it can issue (credential
 * definitions) and what it has issued (the role-filtered assignments view:
 * org admins see every user, department admins their department). Both are
 * read with the signed-in admin's session, the same token every other page
 * uses; no API key is stored anywhere.
 *
 * One platform quirk, documented in the credentials API: the assignments
 * view answers 403 ("You don't have permission to view these assignments")
 * when the set it resolves to is EMPTY — for an org admin that means
 * nothing has been issued yet, not a missing permission.
 */
type Issued = {
  entity_id?: string;
  entityId?: string;
  status?: string;
  assigned_at?: string;
  created_at?: string;
  issuedOn?: string;
  expires?: string;
  revoked?: boolean;
  user?: { username?: string; email?: string } | string;
  username?: string;
  email?: string;
  credential?: { name?: string } | string;
  credential_name?: string;
  credentialDetails?: { name?: string };
  recipient?: { identity?: string; username?: string };
  assertion?: { issuedOn?: string; expires?: string; revoked?: boolean };
};
type Definition = {
  entityId?: string;
  entity_id?: string;
  name?: string;
  name_override?: string;
  description?: string;
  credentialType?: string;
  issuerDetails?: { name?: string };
  courses?: unknown[];
  programs?: unknown[];
  expires?: { amount?: number; duration?: string } | null;
};
type Paged<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T[];
};

const issuedName = (r: Issued) =>
  (typeof r.credential === "object" ? r.credential?.name : r.credential) ??
  r.credential_name ??
  r.credentialDetails?.name ??
  "—";
const issuedTo = (r: Issued) =>
  (typeof r.user === "object" ? (r.user?.username ?? r.user?.email) : r.user) ??
  r.username ??
  r.email ??
  r.recipient?.identity ??
  r.recipient?.username ??
  "—";
const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString() : "—");
const unwrap = <T,>(r: { result?: Paged<T> } & Paged<T>): Paged<T> => r.result ?? r;
const rowsOf = <T,>(p: Paged<T> | null) => p?.results ?? p?.data ?? [];

function session() {
  const org = resolveAppTenant();
  let username = "";
  try {
    username = JSON.parse(localStorage.getItem("userData") ?? "{}").user_nicename ?? "";
  } catch {}
  return {
    org,
    username,
    base: `/api/credentials/orgs/${encodeURIComponent(org)}/users/${encodeURIComponent(username)}`,
  };
}

export default function IssuedCredentialsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [issued, setIssued] = useState<Paged<Issued> | null>(null);
  const [definitions, setDefinitions] = useState<Paged<Definition> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  useEffect(() => {
    const { org, username, base } = session();
    if (!org || !username) return;
    setLoading(true);
    setError("");
    setHint("");
    const q = new URLSearchParams({
      page: String(page),
      page_size: "25",
      ...(query && { search: query }),
    });
    const defs = sessionFetch<{ result?: Paged<Definition> } & Paged<Definition>>(
      `${base}/?${q}`,
    ).then(unwrap);
    const assigned = sessionFetch<{ result?: Paged<Issued> } & Paged<Issued>>(
      `${base}/assignments/users/?${q}`,
    ).then(unwrap);
    Promise.allSettled([defs, assigned]).then(([d, a]) => {
      if (d.status === "fulfilled") setDefinitions(d.value);
      else {
        const e = d.reason;
        setError(
          `Could not read the organization's credentials (${e instanceof SessionFetchError ? e.status : "network"}${detailOf(e)}).`,
        );
      }
      if (a.status === "fulfilled") setIssued(a.value);
      else {
        const e = a.reason;
        const status = e instanceof SessionFetchError ? e.status : 0;
        if (status === 403 && isTenantAdmin()) {
          // Empty set, per the API's behavior for admins.
          setIssued({ count: 0, results: [] });
          setHint("Nothing has been issued yet.");
        } else {
          setIssued({ count: 0, results: [] });
          setHint(`The platform refused the issued list (${status || "network"}${detailOf(e)}).`);
        }
      }
      setLoading(false);
    });
  }, [page, query]);

  const issuedRows = rowsOf(issued);
  const defRows = rowsOf(definitions);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        icon={<Award />}
        title="Issuing"
        count={issued?.count ?? null}
        description="What this organization can issue, and what it has issued. Issue and assign in the OS (Credentials) or through the credentials API."
        toolbar={
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQuery(search.trim());
            }}
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search credential, user, email"
              className="h-8 w-72"
              aria-label="Search credentials"
            />
            <Button type="submit" variant="outline" size="sm">
              Search
            </Button>
          </form>
        }
      />
      {loading ? (
        <LoadingScreen />
      ) : (
        <Page wide>
          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <Section
            title={`Issued (${issued?.count ?? issuedRows.length})`}
            description={hint || "Every assignment with a live assertion, organization-wide."}
          >
            {issuedRows.length ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credential</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuedRows.map((r, i) => (
                      <TableRow key={r.entity_id ?? r.entityId ?? i}>
                        <TableCell className="font-medium">{issuedName(r)}</TableCell>
                        <TableCell>{issuedTo(r)}</TableCell>
                        <TableCell>
                          {fmt(
                            r.assertion?.issuedOn ?? r.issuedOn ?? r.assigned_at ?? r.created_at,
                          )}
                        </TableCell>
                        <TableCell>
                          {(r.assertion?.expires ?? r.expires)
                            ? fmt(r.assertion?.expires ?? r.expires)
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          {r.assertion?.revoked || r.revoked ? "Revoked" : (r.status ?? "Issued")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between pt-3 text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!issued?.previous}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground">Page {page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!issued?.next}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<BadgeCheck />}
                title="Nothing issued yet"
                description="Assign one of the credentials below to users or groups in the OS, and it appears here with its recipient."
              />
            )}
          </Section>

          <Section
            className="mt-5"
            title={`Credentials this organization can issue (${definitions?.count ?? defRows.length})`}
            description="The public credential definitions — badges and certificates attached to courses and programs."
          >
            {defRows.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credential</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Attached to</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defRows.map((d, i) => (
                    <TableRow key={d.entityId ?? d.entity_id ?? i}>
                      <TableCell className="font-medium">
                        {d.name_override || d.name || "—"}
                      </TableCell>
                      <TableCell>{d.credentialType ?? "—"}</TableCell>
                      <TableCell>{d.issuerDetails?.name ?? "—"}</TableCell>
                      <TableCell>
                        {[
                          d.courses?.length
                            ? `${d.courses.length} course${d.courses.length === 1 ? "" : "s"}`
                            : "",
                          d.programs?.length
                            ? `${d.programs.length} program${d.programs.length === 1 ? "" : "s"}`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        {d.expires?.amount
                          ? `${d.expires.amount} ${d.expires.duration ?? "days"}`
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={<Award />}
                title="No credentials defined"
                description="Create a credential in the OS (Credentials) — name, issuer, template, the course or program it rewards."
              />
            )}
          </Section>
        </Page>
      )}
    </div>
  );
}

function detailOf(e: unknown): string {
  if (e instanceof SessionFetchError && e.body && typeof e.body === "object") {
    const b = e.body as { detail?: string; error?: string };
    const d = b.detail ?? b.error;
    return d ? `: ${d}` : "";
  }
  return "";
}
