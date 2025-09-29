"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, GraduationCap, Layers, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"

const credentialsData = {
  "1": {
    id: "2a840cc6-b074-4a62-a1dd-d03332f0c231",
    name: "Building High Performance Teams",
    issuer: "Lincoln Technologies",
    description:
      "Earners of this badge have demonstrated expertise in building and leading high-performance teams. They understand team dynamics, collaboration strategies, and how to foster an environment of excellence. This credential covers team building methodologies, performance optimization, and leadership techniques that drive exceptional results.",
    image: "/team-collaboration-charts-graphs-business-analytic.jpg",
    attributes: {
      visibility: "Visible",
    },
    badges: [
      { label: "Learning", icon: GraduationCap },
      { label: "Foundational", icon: Layers },
      { label: "Months", icon: Clock },
      { label: "Paid", icon: DollarSign },
    ],
    skills: ["Team Building", "Leadership", "Collaboration", "Performance Management"],
    criteria:
      "Complete all required coursework and demonstrate proficiency in team leadership and performance optimization.",
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
    },
    badges: [
      { label: "Learning", icon: GraduationCap },
      { label: "Advanced", icon: Layers },
      { label: "Weeks", icon: Clock },
      { label: "Paid", icon: DollarSign },
    ],
    skills: ["Communication", "Leadership", "Influence", "Public Speaking"],
    criteria: "Complete communication assessments and demonstrate advanced leadership communication techniques.",
  },
  "3": {
    id: "4c062ee8-d296-6c84-c3ff-f15554h2e453",
    name: "AI in Academia - Driving Innovation and Efficiency",
    issuer: "Lincoln Technologies",
    description:
      "Earners of this badge have comprehensive knowledge of artificial intelligence applications in academic settings. They understand how AI can drive innovation, improve efficiency, and transform educational processes. This credential covers AI ethics, implementation strategies, and practical applications in academic environments.",
    image: "/artificial-intelligence-brain-circuit-academic-gra.jpg",
    attributes: {
      visibility: "Visible",
    },
    badges: [
      { label: "Learning", icon: GraduationCap },
      { label: "Advanced", icon: Layers },
      { label: "Months", icon: Clock },
      { label: "Premium", icon: DollarSign },
    ],
    skills: ["Artificial Intelligence", "Innovation", "Academic Research", "Technology Integration"],
    criteria: "Complete AI coursework and demonstrate practical implementation of AI solutions in academic contexts.",
  },
}

export default function CredentialDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("Details")
  const tabs = ["Details", "Occupation Insights", "Settings", "History"]
  const router = useRouter()

  const credentialData = credentialsData[params.id as keyof typeof credentialsData]

  if (!credentialData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Credential Not Found</h1>
            <p className="text-gray-600">The requested credential could not be found.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const handleIssueClick = () => {
    router.push(`/credentials/${params.id}/issue`)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-8">{credentialData.name}</h1>

          {/* Tabs Navigation */}
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-base font-medium transition-colors relative ${
                  activeTab === tab ? "text-[#2b97cf]" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2b97cf]" />}
              </button>
            ))}
          </div>

          {/* Template ID and Action Buttons */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-base font-semibold text-gray-900">Template ID: {credentialData.id}</p>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleIssueClick}
                className="bg-[#2b97cf] hover:bg-[#2487b8] text-white px-8 h-11 text-base font-medium"
              >
                Issue
              </Button>
              <Button variant="outline" size="icon" className="border-2 border-gray-300 h-11 w-11 bg-transparent">
                <MoreHorizontal className="w-5 h-5 text-gray-700" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Badge and Attributes */}
            <div className="lg:col-span-1 space-y-6">
              {/* Badge Image */}
              <div className="flex justify-center">
                <div className="w-full max-w-[320px] aspect-square">
                  <img
                    src={credentialData.image || "/placeholder.svg?height=320&width=320"}
                    alt={credentialData.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Attributes Section */}
              <div className="bg-gray-100 rounded-lg p-6">
                <p className="text-base text-gray-900">
                  <span className="font-bold">Attributes:</span> {credentialData.attributes.visibility}
                </p>
              </div>

              {/* Earn this Badge Section */}
              <div className="bg-gray-100 rounded-lg p-6">
                <p className="text-base text-gray-900">
                  <span className="font-bold">Earn this Badge:</span>{" "}
                  <a href="#" className="text-[#2b97cf] hover:underline">
                    Preview
                  </a>
                </p>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Issued By and Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Issued by: {credentialData.issuer}</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-4">{credentialData.description}</p>
                <a href="#" className="text-[#2b97cf] hover:underline text-base font-medium">
                  Learn more
                </a>
              </div>

              {/* Badge Tags */}
              <div className="flex flex-wrap gap-3">
                {credentialData.badges.map((badge, index) => {
                  const Icon = badge.icon
                  return (
                    <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{badge.label}</span>
                    </div>
                  )
                })}
              </div>

              {/* Skills Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {credentialData.skills.map((skill, index) => (
                    <div key={index} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-base font-medium">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Criteria Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Criteria</h3>
                <p className="text-base text-gray-700 leading-relaxed">{credentialData.criteria}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
