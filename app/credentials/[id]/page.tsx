"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, GraduationCap, Layers, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"
import { getCredential, type Credential } from "@/lib/iblai/credentials-api"
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

function expiresLabel(expires: Credential["expires"]): string | null {
  if (!expires || !expires.amount) return null
  const unit = expires.duration?.toLowerCase().replace(/s$/, "") || "unit"
  return `${expires.amount} ${unit}${expires.amount === 1 ? "" : "s"}`
}

export default function CredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("Details")
  const [credential, setCredential] = useState<Credential | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tabs = ["Details", "Occupation Insights", "Settings", "History"]

  useEffect(() => {
    const ctl = new AbortController()
    const tenant = resolveAppTenant()
    const username = readUsername()
    if (!tenant || !username) {
      setLoading(false)
      return
    }
    getCredential({ platformKey: tenant, username, entityId: id, signal: ctl.signal })
      .then((cred) => setCredential(cred))
      .catch((err) => {
        if (err.name !== "AbortError") setError(String(err.message ?? err))
      })
      .finally(() => setLoading(false))
    return () => ctl.abort()
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-[#767676]">Loading credential…</p>
        </div>
      </MainLayout>
    )
  }

  if (error || !credential) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              {error ? "Couldn't load credential" : "Credential Not Found"}
            </h1>
            <p className="text-gray-600 text-sm">
              {error ?? "The requested credential could not be found."}
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const title = credential.name_override ?? credential.name
  const issuer = credential.issuerDetails?.name ?? "—"
  const description = credential.description ?? ""
  const criteria = credential.criteriaNarrative ?? credential.criteriaUrl ?? ""
  const skills = credential.tags ?? []
  const courses = credential.courses ?? []
  const programs = credential.programs ?? []
  const image = credential.iconImage ?? credential.thumbnailImage ?? credential.backgroundImage

  const badges = [
    { label: credential.credentialType ?? "Credential", icon: GraduationCap },
    courses.length > 0
      ? { label: `${courses.length} course${courses.length === 1 ? "" : "s"}`, icon: Layers }
      : null,
    expiresLabel(credential.expires)
      ? { label: `Expires: ${expiresLabel(credential.expires)}`, icon: Clock }
      : null,
    programs.length > 0
      ? { label: `${programs.length} program${programs.length === 1 ? "" : "s"}`, icon: DollarSign }
      : null,
  ].filter((b): b is { label: string; icon: typeof GraduationCap } => b !== null)

  const handleIssueClick = () => {
    router.push(`/credentials/${encodeURIComponent(credential.entityId)}/issue`)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-8">{title}</h1>

          <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-base font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab ? "text-[#2b97cf]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2b97cf]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <p className="text-base font-semibold text-gray-900 break-all">
              Template ID: {credential.entityId}
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleIssueClick}
                className="bg-[#2b97cf] hover:bg-[#2487b8] text-white px-8 h-11 text-base font-medium"
              >
                Issue
              </Button>
              <Button variant="outline" size="icon" className="border-2 border-gray-300 h-11 w-11 bg-transparent">
                <MoreHorizontal className="w-5 h-5 text-gray-700" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="flex justify-center">
                <div className="w-full max-w-[320px] aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-[#2b97cf]/10 to-[#455aa1]/10 flex items-center justify-center">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="h-20 w-20 text-[#2b97cf]" />
                  )}
                </div>
              </div>

              {credential.expires && expiresLabel(credential.expires) && (
                <div className="bg-gray-100 rounded-lg p-6">
                  <p className="text-base text-gray-900">
                    <span className="font-bold">Expires in:</span>{" "}
                    {expiresLabel(credential.expires)}
                  </p>
                </div>
              )}

              {credential.criteriaUrl && (
                <div className="bg-gray-100 rounded-lg p-6">
                  <p className="text-base text-gray-900">
                    <span className="font-bold">Earn this Badge:</span>{" "}
                    <a
                      href={credential.criteriaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2b97cf] hover:underline"
                    >
                      Preview
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Issued by: {issuer}</h2>
                {description && (
                  <p className="text-base text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                    {description}
                  </p>
                )}
              </div>

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge, index) => {
                    const Icon = badge.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full"
                      >
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{badge.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {skills.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-base font-medium"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {courses.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Courses</h3>
                  <ul className="space-y-2">
                    {courses.map((c) => (
                      <li key={c.course_id} className="text-base text-gray-700">
                        {c.name} <span className="text-gray-400">({c.course_id})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {programs.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Programs</h3>
                  <ul className="space-y-2">
                    {programs.map((p) => (
                      <li key={p.program_id} className="text-base text-gray-700">
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {criteria && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Criteria</h3>
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {criteria}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
