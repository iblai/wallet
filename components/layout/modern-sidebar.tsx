"use client"

import { TooltipTrigger } from "@/components/ui/tooltip"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Sparkles, GraduationCap, ChevronLeft, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import Image from "next/image"

const sidebarItems = [
  {
    id: "tools",
    label: "Instructor",
    icon: Sparkles,
    children: [
      { id: "instructor-tools", label: "Instructor", href: "/" },
      { id: "favorites", label: "Favorites", href: "/favorites" },
      { id: "custom", label: "Custom", href: "/custom" },
      { id: "output-history", label: "Output History", href: "/output-history" },
      { id: "resource-library", label: "Resource Library", href: "/resource-library" },
    ],
  },
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    children: [
      { id: "student-tools", label: "Student", href: "/student/tools" },
      { id: "student-favorites", label: "Favorites", href: "/student/favorites" },
      { id: "student-custom", label: "Custom", href: "/student/custom" },
      { id: "rooms", label: "Rooms", href: "/rooms" },
      { id: "resources", label: "Resources", href: "/resources" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    children: [],
  },
  {
    id: "mentor-ai",
    label: "mentorAI",
    icon: null,
    logoSrc: "/mentorai-logo.png",
    href: "/mentorai",
    children: [],
  },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  useEffect(() => {
    const savedExpandedItems = localStorage.getItem("sidebar-expanded-items")
    if (savedExpandedItems) {
      setExpandedItems(JSON.parse(savedExpandedItems))
    } else {
      // Auto-expand the section that contains the current route
      const currentSection = getCurrentSection(pathname)
      if (currentSection) {
        setExpandedItems([currentSection])
      }
    }
  }, [pathname])

  useEffect(() => {
    localStorage.setItem("sidebar-expanded-items", JSON.stringify(expandedItems))
  }, [expandedItems])

  const getCurrentSection = (currentPath: string) => {
    for (const item of sidebarItems) {
      if (item.href === currentPath) {
        return item.id
      }
      if (item.children.some((child) => child.href === currentPath)) {
        return item.id
      }
    }
    return null
  }

  const toggleExpanded = (itemId: string) => {
    if (isCollapsed) return
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  const isParentSectionActive = (item: any) => {
    if (item.href && isActiveRoute(item.href)) {
      return true
    }
    return item.children.some((child: any) => isActiveRoute(child.href || ""))
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-white border-r border-stroke flex flex-col relative transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className={cn("px-4 pt-4 border-b border-stroke", isCollapsed ? "pb-[16px]" : "pb-[16px]")}>
          <div className="flex items-center gap-2 h-8">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Image src="/toolsai-icon.png" alt="functionsAI" width={24} height={24} />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-lg bg-brand-gradient bg-clip-text text-transparent">functionsAI</span>
            )}
          </div>
        </div>

        {/* Collapse/Expand Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-4 top-[18px] w-8 h-8 bg-white border border-stroke rounded-lg flex items-center justify-center hover:bg-accent-blue transition-colors shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <div key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {item.href ? (
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full gap-2 text-text-primary hover:bg-accent-blue",
                            isCollapsed ? "justify-center px-2" : "justify-start",
                            isActiveRoute(item.href) && "bg-accent-blue text-brand-primary font-medium",
                          )}
                        >
                          {item.logoSrc ? (
                            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                              <Image src={item.logoSrc || "/placeholder.svg"} alt={item.label} width={16} height={16} />
                            </div>
                          ) : (
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                          )}
                          {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full gap-2 text-text-primary hover:bg-accent-blue",
                          isCollapsed ? "justify-center px-2" : "justify-start",
                          isParentSectionActive(item) && "bg-accent-blue text-brand-primary font-medium",
                        )}
                        onClick={() => toggleExpanded(item.id)}
                      >
                        {item.logoSrc ? (
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            <Image src={item.logoSrc || "/placeholder.svg"} alt={item.label} width={16} height={16} />
                          </div>
                        ) : (
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                        )}
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.children.length > 0 &&
                              (expandedItems.includes(item.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              ))}
                          </>
                        )}
                      </Button>
                    )}
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>

                {!isCollapsed && expandedItems.includes(item.id) && item.children.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-stroke mr-2"></div>
                    {item.children.map((child) => (
                      <Link key={child.id} href={child.href || "#"}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm text-text-secondary hover:bg-accent-blue pl-4",
                            isActiveRoute(child.href || "") && "bg-accent-blue text-brand-primary font-medium",
                          )}
                        >
                          {child.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </TooltipProvider>
  )
}
