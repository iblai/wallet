"use client"

import { ChevronDown, Eye, EyeOff, Plus } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { listPathways, type Pathway } from "@/lib/iblai/catalog-api"
import { resolveAppTenant } from "@/lib/iblai/tenant"

import { CreatePathwayModal } from "./create-pathway-modal"

export function PathwaysTable() {
  const [pathways, setPathways] = useState<Pathway[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async (signal?: AbortSignal) => {
    const tenant = resolveAppTenant()
    if (!tenant) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const rows = await listPathways({ platformKey: tenant, signal })
      setPathways(rows)
    } catch (err) {
      const e = err as Error
      if (e.name !== "AbortError") setError(String(e.message ?? err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctl = new AbortController()
    load(ctl.signal)
    return () => ctl.abort()
  }, [load])

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-[rgb(208,224,255)]">
        <p className="text-sm font-medium text-[#555d6b]">
          {loading ? "Loading…" : `${pathways.length} pathway${pathways.length === 1 ? "" : "s"}`}
        </p>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#2b97cf] hover:bg-[#2487b8] text-white h-9 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Pathway
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[rgb(208,224,255)] text-xs font-medium uppercase tracking-wider text-[#767676]">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">Visibility</div>
        <div className="col-span-3 flex items-center gap-1">
          Slug
          <ChevronDown className="w-3 h-3 text-[#767676]" />
        </div>
        <div className="col-span-2">Items</div>
      </div>

      {error && (
        <div className="px-6 py-8 text-sm text-red-600">Failed to load pathways: {error}</div>
      )}
      {!loading && !error && pathways.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-[#767676]">No pathways yet.</div>
      )}
      {loading && !error && (
        <div className="px-6 py-8 text-sm text-[#767676]">Loading pathways…</div>
      )}

      <div>
        {pathways.map((pw, index) => (
          <div key={pw.pathway_id ?? pw.id}>
            <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#faf9f9] transition-colors">
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 border-[#2b97cf]/20 shadow-sm bg-gradient-to-br from-[#2b97cf]/10 to-[#455aa1]/10 flex items-center justify-center text-[#2b97cf] font-semibold">
                  {(pw.name ?? "?").trim().charAt(0).toUpperCase()}
                </div>
                <span className="text-[#555d6b] font-medium truncate">{pw.name}</span>
              </div>
              <div className="col-span-2 flex items-center">
                <span
                  className={
                    pw.visible
                      ? "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#2b97cf]/10 text-[#2b97cf] border border-[#2b97cf]/20"
                      : "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                  }
                >
                  {pw.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {pw.visible ? "Visible" : "Hidden"}
                </span>
              </div>
              <div className="col-span-3 flex items-center text-sm text-[#555d6b] truncate">
                {pw.slug || "—"}
              </div>
              <div className="col-span-2 flex items-center">
                <span className="inline-flex items-center justify-center min-w-[2rem] h-6 rounded-md bg-[#455aa1]/10 text-[#455aa1] text-sm font-medium border border-[#455aa1]/20 px-2">
                  {Array.isArray(pw.path) ? pw.path.length : 0}
                </span>
              </div>
            </div>
            {index < pathways.length - 1 && <div className="border-b border-[rgb(208,224,255)]" />}
          </div>
        ))}
      </div>

      <CreatePathwayModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false)
          load()
        }}
      />
    </div>
  )
}
