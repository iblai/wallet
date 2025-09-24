"use client"
import { CreditCard, BarChart3, Code, User, GraduationCap, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigation } from "@/hooks/use-navigation"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import Image from "next/image"

const navigationItems = [
  { id: "credentials", label: "Credentials", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "developers", label: "Developers", icon: Code },
  { id: "account", label: "Account", icon: User },
  { id: "academy", label: "Academy", icon: GraduationCap },
  { id: "support", label: "Support", icon: HelpCircle },
]

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { activeNavItem, setActiveNavItem } = useNavigation()

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-white border-r border-[rgb(208,224,255)] flex flex-col relative transition-all duration-300 h-screen fixed left-0 top-0 z-20",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-4 top-[20px] w-8 h-8 bg-white border border-[rgb(208,224,255)] rounded-lg flex items-center justify-center hover:bg-[#faf9f9] transition-colors shadow-sm z-[60]"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#767676]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#767676]" />
            )}
          </button>
        )}

        <div
          className={cn(
            isCollapsed ? "py-[20px]" : "py-[16px]",
            "border-b border-[rgb(208,224,255)] flex items-center px-4",
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <Image
                src="/images/new-logo.webp"
                alt="credentialsAI Logo"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#1ea7e1] to-[#4c6ef5] bg-clip-text text-transparent">
                credentialsAI
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <Image
                src="/images/new-logo.webp"
                alt="credentialsAI Logo"
                width={24}
                height={24}
                className="flex-shrink-0"
              />
            </div>
          )}
        </div>

        <div className="p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === activeNavItem

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full gap-2 text-gray-700 hover:bg-[#faf9f9]",
                        isCollapsed ? "justify-center px-2" : "justify-start",
                        isActive && "bg-[#2b97cf]/10 text-[#2b97cf] font-medium",
                      )}
                      onClick={() => setActiveNavItem(item.id)}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              )
            })}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}
