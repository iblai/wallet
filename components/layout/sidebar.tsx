"use client"

import { CreditCard, BarChart3, Code, User, GraduationCap, HelpCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigation } from "@/hooks/use-navigation"

const navigationItems = [
  { id: "credentials", label: "Credentials", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "developers", label: "Developers", icon: Code },
  { id: "account", label: "Account", icon: User },
  { id: "academy", label: "Academy", icon: GraduationCap },
  { id: "support", label: "Support", icon: HelpCircle },
]

export function Sidebar() {
  const { activeNavItem, setActiveNavItem } = useNavigation()

  return (
    <aside className="w-64 bg-white border-r border-[#efefef] h-screen">
      <div className="p-6">
        {/* University Profile Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-[#2b97cf] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <div>
              <h3 className="text-gray-700 font-medium">Kaplan University</h3>
            </div>
          </div>
          <button className="text-[#2b97cf] text-sm hover:underline flex items-center gap-1">
            See Profile
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === activeNavItem

            return (
              <button
                key={item.id}
                onClick={() => setActiveNavItem(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  isActive
                    ? "bg-[#2b97cf]/10 text-[#2b97cf] border-l-2 border-[#2b97cf]"
                    : "text-gray-700 hover:bg-[#faf9f9]",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
