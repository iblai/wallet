"use client"

import { Code, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const tabs = [
  { id: "template-ids", label: "Template IDs" },
  { id: "authorization-tokens", label: "Authorization Tokens" },
  { id: "webhooks", label: "Webhooks" },
  { id: "api-documentation", label: "API Documentation", hasExternalIcon: true },
  { id: "integrations", label: "Integrations" },
]

const templateData = [
  { id: "c2c80b33-580c", name: "Advanced Ruby on Rails" },
  { id: "a96d5ceade", name: "Analyze Data with Python (es-US)" },
  { id: "53860daf-ef1d-4070", name: "Credly Essentials" },
  { id: "373d-ef82be85498c", name: "Full Stack Coding Bootcamp" },
  { id: "b4f2c8a1-9d3e", name: "Introduction to Machine Learning" },
  { id: "7e5a9c2d-4f1b", name: "Cloud Architecture Fundamentals" },
  { id: "d8b3e6f4-2a7c", name: "Cybersecurity Basics" },
  { id: "9f1c5d8e-3b6a", name: "Data Science with R" },
  { id: "a2e7f9b3-5c8d", name: "DevOps Engineering" },
  { id: "c5d8e2f6-9a3b", name: "Frontend Development Mastery" },
  { id: "e8f3a6c9-2d5b", name: "Backend API Development" },
  { id: "f9a4b7d2-6e8c", name: "Mobile App Development" },
  { id: "b6c9d3e7-1f4a", name: "UI/UX Design Principles" },
  { id: "d3e6f9a2-5b8c", name: "Agile Project Management" },
  { id: "e7f2a5c8-9d3b", name: "Database Design and SQL" },
  { id: "f4a7b9d3-2e6c", name: "Blockchain Fundamentals" },
  { id: "a8c2e5f9-6b3d", name: "Artificial Intelligence Basics" },
  { id: "c9d4e7f2-3a6b", name: "Software Testing and QA" },
  { id: "e2f5a8c3-9d6b", name: "Network Security" },
]

export function DevelopersPage() {
  const [activeTab, setActiveTab] = useState("template-ids")

  return (
    <div className="min-h-screen bg-[#fefefe] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <h1 className="text-[40px] font-serif font-normal text-[#2d2d2d] mb-8">Developers</h1>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-8 mb-8 border-b border-[#e5e5e5]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-[15px] font-normal relative flex items-center gap-1.5 transition-colors ${
                activeTab === tab.id
                  ? "text-[#2b97cf] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2b97cf]"
                  : "text-[#8a8a8a] hover:text-[#2b97cf]"
              }`}
            >
              {tab.label}
              {tab.hasExternalIcon && <ExternalLink className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>

        {/* Organization ID Card */}
        <div className="bg-[#f5f5f5] rounded-lg p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-[#2b97cf]" />
            <span className="text-[15px] text-[#2d2d2d]">
              Organization ID: <span className="font-mono">975e39b7-000b-4378-a08</span>
              <span className="ml-8 font-mono">75e5</span>
            </span>
          </div>
          <Button variant="link" className="text-[#2b97cf] hover:text-[#2b97cf]/80 p-0 h-auto text-[15px] font-normal">
            View Documentation
          </Button>
        </div>

        {/* Results Counter */}
        <div className="text-[14px] text-[#6b7280] mb-6">Showing 1-19 of 19</div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#e5e5e5]">
          {/* Table Header */}
          <div className="grid grid-cols-2 gap-8 px-6 py-4 border-b border-[#e5e5e5] bg-[#fafafa]">
            <div className="text-[14px] font-medium text-[#6b7280]">Template ID</div>
            <div className="text-[14px] font-medium text-[#6b7280]">Template Name</div>
          </div>

          {/* Table Rows */}
          <div>
            {templateData.map((template, index) => (
              <div
                key={template.id}
                className={`grid grid-cols-2 gap-8 px-6 py-4 hover:bg-[#fafafa] transition-colors ${
                  index !== templateData.length - 1 ? "border-b border-[#e5e5e5]" : ""
                }`}
              >
                <div className="text-[14px] text-[#6b7280] font-mono">{template.id}</div>
                <div className="text-[14px] text-[#2d2d2d]">{template.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
