"use client"

import { MainLayout } from "@/components/layout/main-layout"

export default function AcademyPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fefefe] p-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">Academy</h1>
        <p className="text-gray-600">Learning resources and courses will be displayed here.</p>
      </div>
    </MainLayout>
  )
}
