"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import {
  listCredentials,
  type Credential,
} from "@/lib/iblai/credentials-api"
import { resolveAppTenant } from "@/lib/iblai/tenant"

function readUsername(): string {
  if (typeof window === "undefined") return ""
  try {
    const raw = localStorage.getItem("userData")
    if (!raw) return ""
    const d = JSON.parse(raw) as Record<string, string>
    return d.user_nicename ?? d.username ?? ""
  } catch {
    return ""
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function issuerName(cred: Credential): string {
  const d = cred.issuerDetails
  if (!d) return "—"
  return d.name ?? d.entityId ?? d.entity_id ?? "—"
}

export function CredentialsTable() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctl = new AbortController()
    const tenant = resolveAppTenant()
    const username = readUsername()
    if (!tenant || !username) {
      setLoading(false)
      return
    }
    listCredentials({ platformKey: tenant, username, pageSize: 100, signal: ctl.signal })
      .then((res) => {
        setCredentials(res.data)
        setCount(res.count)
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(String(err.message ?? err))
      })
      .finally(() => setLoading(false))
    return () => ctl.abort()
  }, [])

  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[rgb(208,224,255)] text-sm font-medium text-[#555d6b]">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-[#2b97cf] transition-colors">
          Created
          <ChevronDown className="w-4 h-4 text-[#767676]" />
        </div>
        <div className="col-span-2">Issuer</div>
      </div>

      {loading && (
        <div className="px-6 py-8 text-sm text-[#767676]">Loading credentials…</div>
      )}
      {error && !loading && (
        <div className="px-6 py-8 text-sm text-red-600">Failed to load credentials: {error}</div>
      )}
      {!loading && !error && credentials.length === 0 && (
        <div className="px-6 py-8 text-sm text-[#767676]">No credentials yet.</div>
      )}

      {/* Table Rows */}
      <div>
        {credentials.map((cred, index) => (
          <div key={cred.entityId}>
            <Link href={`/credentials/${encodeURIComponent(cred.entityId)}`}>
              <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#faf9f9] transition-colors cursor-pointer group">
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 border-[#2b97cf]/20 shadow-sm bg-gradient-to-br from-[#2b97cf]/5 to-[#455aa1]/5">
                    {cred.iconImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cred.iconImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-[#555d6b] font-medium group-hover:text-[#2b97cf] transition-colors truncate">
                    {cred.name_override ?? cred.name}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#2b97cf]/10 text-[#2b97cf] border border-[#2b97cf]/20">
                    {cred.credentialType ?? "Credential"}
                  </span>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="text-[#555d6b]">{formatDate(cred.createdAt)}</span>
                </div>
                <div className="col-span-2 flex items-center text-sm text-[#555d6b] truncate">
                  {issuerName(cred)}
                </div>
              </div>
            </Link>
            {index < credentials.length - 1 && <div className="border-b border-[rgb(208,224,255)]" />}
          </div>
        ))}
      </div>
      {!loading && !error && count > credentials.length && (
        <p className="px-6 py-2 text-xs text-[#767676]">
          Showing {credentials.length} of {count} credentials.
        </p>
      )}
    </div>
  )
}
