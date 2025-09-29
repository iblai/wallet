"use client"

import { MainLayout } from "@/components/layout/main-layout"

export default function AccountPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fefefe] p-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">Account</h1>
        <p className="text-gray-600">Account settings and preferences will be displayed here.</p>
      </div>
    </MainLayout>
  )
}
