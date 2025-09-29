"use client"
import { useNavigation } from "@/hooks/use-navigation"

const tabs = [
  { id: "templates", label: "Templates" },
  { id: "earners", label: "Earners" },
  { id: "pathways", label: "Pathways" },
  { id: "collections", label: "Collections" },
  { id: "recommendations", label: "Recommentations" },
  { id: "issue", label: "Issue" },
]

export function CredentialsHeader() {
  const { activeTab, setActiveTab } = useNavigation()

  return (
    <div className="bg-white">
      <div className="px-8 py-6">
        <h1 className="text-3xl font-serif font-normal text-gray-700 mb-8">Credentials</h1>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-[#efefef]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                tab.id === activeTab
                  ? "text-[#2b97cf] border-b-2 border-[#2b97cf]"
                  : "text-gray-700 hover:text-[#2b97cf]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
