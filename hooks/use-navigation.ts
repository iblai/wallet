"use client"

import { create } from "zustand"

interface NavigationState {
  activeNavItem: string
  activeTab: string
  setActiveNavItem: (item: string) => void
  setActiveTab: (tab: string) => void
}

export const useNavigation = create<NavigationState>((set) => ({
  activeNavItem: "credentials",
  activeTab: "templates",
  setActiveNavItem: (item) => set({ activeNavItem: item }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
