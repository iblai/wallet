"use client"

import { MainLayout } from "@/components/layout/main-layout"

export default function AcademyPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fefefe] p-8">
        <h1 className="text-[40px] font-serif font-normal text-[#2d2d2d] mb-8">Academy</h1>
        <p className="text-[15px] text-[#6b7280]">Learning resources and courses will be displayed here.</p>
      </div>
    </MainLayout>
  )
}
