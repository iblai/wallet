"use client"

import { useState } from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"

const credentialsData = {
  "1": {
    id: "2a840cc6-b074-4a62-a1dd-d03332f0c231",
    name: "Building High Performance Teams",
    issuer: "Lincoln Technologies",
    description:
      "Earners of this badge have a fundamental understanding of team dynamics and high-performance methodologies. Earners are able to demonstrate effective leadership, collaboration strategies, and performance optimization techniques. These candidates can utilize these foundation tools to build and manage high-performing teams in various organizational contexts. This credential meets the JACET standard for 3 continuing education units (CEUs).",
    image: "/team-collaboration-charts-graphs-business-analytic.jpg",
    attributes: {
      visibility: "Visible",
      earnBadge: "Preview",
    },
    badges: [
      { label: "Learning", icon: "🎓" },
      { label: "Foundational", icon: "🏗️" },
      { label: "Months", icon: "📅" },
      { label: "Paid", icon: "💰" },
    ],
    skills: ["Knowledge", "Devotion to Mary", "Faith"],
    criteria: "Complete all required coursework and demonstrate proficiency in team building methodologies.",
  },
  "2": {
    id: "3b951dd7-c185-5b73-b2ee-e04443g1d342",
    name: "Leadership is a language",
    issuer: "Lincoln Technologies",
    description:
      "Earners of this badge understand that leadership is fundamentally about communication and language. They can demonstrate effective communication strategies, inspire through words, and create meaningful connections with team members. This credential focuses on the linguistic aspects of leadership and how language shapes organizational culture and performance.",
    image: "/leadership-communication-speech-bubble-microphone.jpg",
    attributes: {
      visibility: "Visible",
      earnBadge: "Preview",
    },
    badges: [
      { label: "Learning", icon: "🎓" },
      { label: "Advanced", icon: "🚀" },
      { label: "Weeks", icon: "📅" },
      { label: "Paid", icon: "💰" },
    ],
    skills: ["Communication", "Leadership", "Influence"],
    criteria: "Complete communication assessments and demonstrate advanced leadership communication techniques.",
  },
  "3": {
    id: "4c062ee8-d296-6c84-c3ff-f15554h2e453",
    name: "AI in Academia - Driving Innovation and Efficiency in...",
    issuer: "Lincoln Technologies",
    description:
      "Earners of this badge have comprehensive knowledge of artificial intelligence applications in academic settings. They understand how AI can drive innovation, improve efficiency, and transform educational processes. This credential covers AI ethics, implementation strategies, and practical applications in academic environments.",
    image: "/artificial-intelligence-brain-circuit-academic-gra.jpg",
    attributes: {
      visibility: "Visible",
      earnBadge: "Preview",
    },
    badges: [
      { label: "Learning", icon: "🎓" },
      { label: "Advanced", icon: "🚀" },
      { label: "Months", icon: "📅" },
      { label: "Premium", icon: "💎" },
    ],
    skills: ["Artificial Intelligence", "Innovation", "Academic Research"],
    criteria: "Complete AI coursework and demonstrate practical implementation of AI solutions in academic contexts.",
  },
}

export default function CredentialDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("Details")
  const tabs = ["Details", "Occupation Insights", "Settings", "History"]

  const credentialData = credentialsData[params.id as keyof typeof credentialsData]

  if (!credentialData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#faf9f9] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#555d6b] mb-4">Credential Not Found</h1>
            <p className="text-[#767676]">The requested credential could not be found.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#faf9f9]">
        {/* Breadcrumb */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-center gap-2 text-sm text-[#2b97cf]">
            <Link href="/" className="text-[#2b97cf] hover:text-[#2b97cf]/80 transition-colors">
              Credential
            </Link>
            <ChevronRight className="w-4 h-4 text-[#767676]" />
            <span className="text-[#767676]">Templates</span>
          </div>
        </div>

        {/* Header */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-[#555d6b]">{credentialData.name}</h1>
            <div className="flex items-center gap-3">
              <Link href={`/credentials/${params.id}/issue`}>
                <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white">Issue</Button>
              </Link>
              <Button variant="outline" size="icon" className="border-[#2b97cf] text-[#2b97cf] bg-transparent">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#efefef]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#2b97cf] text-[#2b97cf]"
                    : "border-transparent text-[#767676] hover:text-[#555d6b]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Template ID */}
          <div className="mb-6">
            <span className="text-sm text-[#767676]">Template ID: {credentialData.id}</span>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Credential Image */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <img
                  src={credentialData.image || "/placeholder.svg"}
                  alt={credentialData.name}
                  className="w-full max-w-sm mx-auto rounded-lg"
                />
              </div>

              {/* Attributes */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 px-4 bg-[#efefef] rounded-lg">
                    <span className="font-medium text-[#555d6b]">Attributes:</span>
                    <span className="text-[#767676]">{credentialData.attributes.visibility}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-[#efefef] rounded-lg">
                    <span className="font-medium text-[#555d6b]">Earn this Badge:</span>
                    <span className="text-[#767676]">{credentialData.attributes.earnBadge}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                  <span className="text-sm text-[#767676]">Issued by: {credentialData.issuer}</span>
                </div>
                <p className="text-[#555d6b] leading-relaxed mb-4">{credentialData.description}</p>
                <a href="#" className="text-[#2b97cf] hover:underline">
                  Learn more
                </a>
              </div>

              {/* Badges */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  {credentialData.badges.map((badge, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-[#efefef] text-[#555d6b] hover:bg-[#d9d9d9] flex items-center gap-2"
                    >
                      <span>{badge.icon}</span>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#555d6b] mb-4">Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {credentialData.skills.map((skill, index) => (
                    <Badge key={index} className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Criteria */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#555d6b] mb-4">Criteria</h3>
                <p className="text-[#555d6b] leading-relaxed">{credentialData.criteria}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
