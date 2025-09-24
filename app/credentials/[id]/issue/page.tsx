"use client"

import { useState } from "react"
import { ChevronRight, User, Clock, FileText, Settings, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MainLayout } from "@/components/layout/main-layout"
import Link from "next/link"

const credentialsData = {
  "1": {
    name: "Building High Performance Teams",
  },
  "2": {
    name: "Leadership is a language",
  },
  "3": {
    name: "AI in Academia - Driving Innovation and Efficiency in...",
  },
}

export default function IssueCredentialPage({ params }: { params: { id: string } }) {
  const [earnerInfoOpen, setEarnerInfoOpen] = useState(true)
  const [expirationOpen, setExpirationOpen] = useState(true)
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [expirationType, setExpirationType] = useState("default")

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
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center gap-2 text-sm text-[#2b97cf]">
            <Link href="/" className="text-[#2b97cf] hover:text-[#2b97cf]/80 transition-colors">
              Badges
            </Link>
            <ChevronRight className="w-4 h-4 text-[#767676]" />
            <Link href="/" className="text-[#2b97cf] hover:text-[#2b97cf]/80 transition-colors">
              Templates
            </Link>
            <ChevronRight className="w-4 h-4 text-[#767676]" />
            <span className="text-[#767676] truncate">Fundamentals of R...</span>
          </div>
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#555d6b]">Issuing {credentialData.name}</h1>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Earner Information */}
            <Collapsible open={earnerInfoOpen} onOpenChange={setEarnerInfoOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#555d6b]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-[#555d6b]">Earner Information</h3>
                        <p className="text-sm text-[#767676]">
                          Enter the information required to issue a badge to an individual.
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-[#767676] transition-transform ${earnerInfoOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-[#555d6b]">
                        First name *
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="First name *"
                        className="border-[#d9d9d9] focus:border-[#2b97cf] focus:ring-[#2b97cf]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName" className="text-sm font-medium text-[#555d6b]">
                        Middle name
                      </Label>
                      <Input
                        id="middleName"
                        placeholder="Middle name"
                        className="border-[#d9d9d9] focus:border-[#2b97cf] focus:ring-[#2b97cf]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-[#555d6b]">
                        Last name *
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Last name *"
                        className="border-[#d9d9d9] focus:border-[#2b97cf] focus:ring-[#2b97cf]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-[#555d6b]">
                        Email address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email address *"
                        className="border-[#d9d9d9] focus:border-[#2b97cf] focus:ring-[#2b97cf]"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="dateIssued" className="text-sm font-medium text-[#555d6b]">
                        Date issued *
                      </Label>
                      <Select defaultValue="2024-11-20">
                        <SelectTrigger className="border-[#d9d9d9] focus:border-[#2b97cf] focus:ring-[#2b97cf]">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#767676]" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-11-20">20 Nov 2024</SelectItem>
                          <SelectItem value="2024-11-21">21 Nov 2024</SelectItem>
                          <SelectItem value="2024-11-22">22 Nov 2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Expiration */}
            <Collapsible open={expirationOpen} onOpenChange={setExpirationOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#555d6b]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-[#555d6b]">Expiration</h3>
                        <p className="text-sm text-[#767676]">
                          Determine if this badge will expire and set an expiration date.
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-[#767676] transition-transform ${expirationOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6 mt-4">
                  <RadioGroup value={expirationType} onValueChange={setExpirationType} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="default" id="default" className="border-[#2b97cf] text-[#2b97cf]" />
                      <Label htmlFor="default" className="text-sm font-medium text-[#555d6b] cursor-pointer">
                        Default (1 Year)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="no-expiration"
                        id="no-expiration"
                        className="border-[#2b97cf] text-[#2b97cf]"
                      />
                      <Label htmlFor="no-expiration" className="text-sm font-medium text-[#555d6b] cursor-pointer">
                        No expiration
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="expires-on" id="expires-on" className="border-[#2b97cf] text-[#2b97cf]" />
                      <Label htmlFor="expires-on" className="text-sm font-medium text-[#555d6b] cursor-pointer">
                        Expires on
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Evidence */}
            <Collapsible open={evidenceOpen} onOpenChange={setEvidenceOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#555d6b]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-[#555d6b]">Evidence</h3>
                        <p className="text-sm text-[#767676]">
                          Provide extra context to what an individual did to earn this badge.
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-[#767676] transition-transform ${evidenceOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6 mt-4">
                  <p className="text-sm text-[#767676] mb-4">
                    Add evidence or documentation that supports this badge issuance.
                  </p>
                  <div className="space-y-4">
                    <Input
                      placeholder="Evidence title"
                      className="border-[#d9d9d9] focus:border-[#2b97cf] focus:ring-[#2b97cf]"
                    />
                    <textarea
                      placeholder="Evidence description"
                      rows={4}
                      className="w-full px-3 py-2 border border-[#d9d9d9] rounded-md focus:border-[#2b97cf] focus:ring-[#2b97cf] focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Advanced Options */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                        <Settings className="w-5 h-5 text-[#555d6b]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-[#555d6b]">Advanced options</h3>
                        <p className="text-sm text-[#767676]">Edit the advanced options for this badge.</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-[#767676] transition-transform ${advancedOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6 mt-4">
                  <p className="text-sm text-[#767676] mb-4">Configure additional settings for this badge issuance.</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-[#555d6b]">Send notification email</Label>
                      <input type="checkbox" defaultChecked className="rounded border-[#d9d9d9]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-[#555d6b]">Make badge public</Label>
                      <input type="checkbox" defaultChecked className="rounded border-[#d9d9d9]" />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Verification Section */}
            <div className="bg-white rounded-lg shadow-sm border border-[rgb(208,224,255)] p-6">
              <h3 className="text-lg font-semibold text-[#555d6b] mb-4">Verification</h3>
              <p className="text-sm text-[#767676] mb-6">
                Review the information above and click "Issue Badge" to complete the process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white flex-1 sm:flex-none">
                  Issue Badge
                </Button>
                <Button
                  variant="outline"
                  className="border-[#d9d9d9] text-[#555d6b] flex-1 sm:flex-none bg-transparent"
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
