"use client"

import type React from "react"
import { useState } from "react"

import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="min-h-screen bg-[#fefefe]">
      <div className="flex relative">
        {/* Sidebar spans full height and overlaps header */}
        <div className="relative z-10">
          <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
        </div>

        {/* Main content area with header and content */}
        <div className="flex-1 flex flex-col">
          <div className={`sticky top-0 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
            <Navbar />
          </div>

          <main className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>{children}</main>
        </div>
      </div>
    </div>
  )
}
