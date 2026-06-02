"use client"

import type React from "react"
import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  // Desktop collapse state (16px <-> 256px); only takes effect on md+.
  const [isCollapsed, setIsCollapsed] = useState(false)
  // Mobile drawer state — sidebar slides in from the left and overlays
  // the content; below md the sidebar is hidden by default.
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleCollapse = () => setIsCollapsed((v) => !v)
  const openMobile = () => setIsMobileOpen(true)
  const closeMobile = () => setIsMobileOpen(false)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#fefefe]">
        {/* Mobile backdrop — closes the drawer on tap. */}
        {isMobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}

        <div className="flex relative">
          {/* Sidebar — fixed positioning; renders as a slide-in drawer on
           * mobile, fixed rail on md+. */}
          <div className="relative z-50">
            <Sidebar
              isCollapsed={isCollapsed}
              onToggleCollapse={toggleCollapse}
              isMobileOpen={isMobileOpen}
              onMobileClose={closeMobile}
            />
          </div>

          {/* Main content area — only offsets for the sidebar on md+. */}
          <div className="flex-1 flex flex-col min-w-0">
            <div
              className={cn(
                "sticky top-0 transition-all duration-300 z-30",
                isCollapsed ? "md:ml-16" : "md:ml-64",
              )}
            >
              <Navbar onMobileMenuToggle={openMobile} />
            </div>
            <main
              className={cn(
                "flex-1 transition-all duration-300 min-w-0",
                isCollapsed ? "md:ml-16" : "md:ml-64",
              )}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
