"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

import { listAssertions, type Assertion } from "@/lib/iblai/credentials-api"
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

function formatDate(iso: string | undefined | null): string {
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

function recipientLabel(a: Assertion): string {
  return a.recipient?.name || a.recipient?.username || "—"
}

function credentialName(a: Assertion): string {
  return a.credentialDetails?.name_override ?? a.credentialDetails?.name ?? "Untitled credential"
}

function credentialIcon(a: Assertion): string | null {
  return a.credentialDetails?.iconImage ?? null
}

export function EarnersTable() {
  const [assertions, setAssertions] = useState<Assertion[]>([])
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
    listAssertions({
      platformKey: tenant,
      username,
      pageSize: 100,
      signal: ctl.signal,
    })
      .then((res) => {
        setAssertions(res.data)
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
      <div className="px-8 py-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(208,224,255)]">
                <th className="text-left py-4 px-2 text-sm font-medium text-gray-700">Credential</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-gray-700">Recipient</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1">
                    Issued
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="py-8 text-sm text-[#767676]">
                    Loading earners…
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={4} className="py-8 text-sm text-red-600">
                    Failed to load earners: {error}
                  </td>
                </tr>
              )}
              {!loading && !error && assertions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-sm text-[#767676]">
                    No credentials issued yet.
                  </td>
                </tr>
              )}
              {assertions.map((a, index) => {
                const icon = credentialIcon(a)
                return (
                  <tr
                    key={a.entityId}
                    className={`hover:bg-gray-50 ${
                      index < assertions.length - 1 ? "border-b border-[rgb(208,224,255)]" : ""
                    }`}
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#2b97cf]/20 bg-gradient-to-br from-[#2b97cf]/10 to-[#2b97cf]/5 flex-shrink-0">
                          {icon && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={icon} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {credentialName(a)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-sm text-gray-700">{recipientLabel(a)}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-sm text-gray-700">{formatDate(a.issuedOn)}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span
                        className={
                          a.revoked
                            ? "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                            : "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#2b97cf]/10 text-[#2b97cf] border border-[#2b97cf]/20"
                        }
                      >
                        {a.revoked ? "Revoked" : "Active"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!loading && !error && count > assertions.length && (
            <p className="mt-3 text-xs text-[#767676]">
              Showing {assertions.length} of {count} assertions.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
