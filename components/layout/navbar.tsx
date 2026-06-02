"use client"

import { Menu } from "lucide-react"
import { IblaiProfileDropdown } from "@/components/iblai/profile-dropdown"
import { NotificationBell } from "@/components/iblai/notification-bell"
import { CreditBalanceWidget } from "@/components/iblai/credit-balance"

interface NavbarProps {
  onMobileMenuToggle?: () => void
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  return (
    <header className="bg-white border-b border-[rgb(208,224,255)] px-4 sm:px-6 py-[14px] w-full transition-all duration-300 sticky top-0 z-40">
      <div className="flex items-center justify-between md:justify-end">
        {/* Hamburger — mobile only; opens the sidebar drawer. */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-[#faf9f9] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-[#767676]" />
        </button>

        <div className="flex items-center gap-3 sm:gap-6">
          <CreditBalanceWidget />
          <NotificationBell />
          <IblaiProfileDropdown />
        </div>
      </div>
    </header>
  )
}
