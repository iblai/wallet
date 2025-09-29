"use client"

import { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  FileText,
  Mail,
  LinkIcon,
  Type,
  CreditCard,
  UploadIcon,
  MoreHorizontal,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const [evidenceOpen, setEvidenceOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(true)
  const [expirationType, setExpirationType] = useState("default")
  const [sendNotifications, setSendNotifications] = useState("yes")

  // Dialog states for evidence types
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)
  const [textDialogOpen, setTextDialogOpen] = useState(false)
  const [idDialogOpen, setIdDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [customDialogOpen, setCustomDialogOpen] = useState(false)

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
                <div
                  className={`bg-white shadow-sm border border-[rgb(208,224,255)] p-6 hover:bg-gray-50 transition-colors ${
                    earnerInfoOpen ? "rounded-t-lg" : "rounded-lg"
                  }`}
                >
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
                    {earnerInfoOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#767676]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#767676]" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-[rgb(208,224,255)] p-6">
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
                <div
                  className={`bg-white shadow-sm border border-[rgb(208,224,255)] p-6 hover:bg-gray-50 transition-colors ${
                    expirationOpen ? "rounded-t-lg" : "rounded-lg"
                  }`}
                >
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
                    {expirationOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#767676]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#767676]" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-[rgb(208,224,255)] p-6">
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

            <Collapsible open={evidenceOpen} onOpenChange={setEvidenceOpen}>
              <CollapsibleTrigger className="w-full">
                <div
                  className={`bg-white shadow-sm border border-[rgb(208,224,255)] p-6 hover:bg-gray-50 transition-colors ${
                    evidenceOpen ? "rounded-t-lg" : "rounded-lg"
                  }`}
                >
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
                    {evidenceOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#767676]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#767676]" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-[rgb(208,224,255)] p-6">
                  <div className="flex items-center justify-start gap-8 py-4 px-4">
                    <button
                      onClick={() => setUrlDialogOpen(true)}
                      className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <LinkIcon className="w-6 h-6 text-[#2b97cf]" />
                      <span className="text-sm text-[#2b97cf] font-medium">URL</span>
                    </button>
                    <button
                      onClick={() => setTextDialogOpen(true)}
                      className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <Type className="w-6 h-6 text-[#2b97cf]" />
                      <span className="text-sm text-[#2b97cf] font-medium">Text</span>
                    </button>
                    <button
                      onClick={() => setIdDialogOpen(true)}
                      className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <CreditCard className="w-6 h-6 text-[#2b97cf]" />
                      <span className="text-sm text-[#2b97cf] font-medium">ID</span>
                    </button>
                    <button
                      onClick={() => setUploadDialogOpen(true)}
                      className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <UploadIcon className="w-6 h-6 text-[#2b97cf]" />
                      <span className="text-sm text-[#2b97cf] font-medium">Upload</span>
                    </button>
                    <button
                      onClick={() => setCustomDialogOpen(true)}
                      className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      <MoreHorizontal className="w-6 h-6 text-[#2b97cf]" />
                      <span className="text-sm text-[#2b97cf] font-medium">Custom</span>
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <CollapsibleTrigger className="w-full">
                <div
                  className={`bg-white shadow-sm border border-[rgb(208,224,255)] p-6 hover:bg-gray-50 transition-colors ${
                    notificationsOpen ? "rounded-t-lg" : "rounded-lg"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-[#555d6b]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-[#555d6b]">Notifications</h3>
                        <p className="text-sm text-[#767676]">Send messages to your earners about this credential.</p>
                      </div>
                    </div>
                    {notificationsOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#767676]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#767676]" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-[rgb(208,224,255)] p-6">
                  <RadioGroup value={sendNotifications} onValueChange={setSendNotifications} className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="notify-yes" className="border-[#2b97cf] text-[#2b97cf]" />
                      <Label htmlFor="notify-yes" className="text-sm font-medium text-[#555d6b] cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="no" id="notify-no" className="border-[#2b97cf] text-[#2b97cf]" />
                      <Label htmlFor="notify-no" className="text-sm font-medium text-[#555d6b] cursor-pointer">
                        No
                      </Label>
                    </div>
                  </RadioGroup>

                  {sendNotifications === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="emailLanguage" className="text-sm font-medium text-[#555d6b]">
                        Email language *
                      </Label>
                      <Select defaultValue="english">
                        <SelectTrigger className="border-[#d9d9d9] focus:border-[#2b97cf] focus:ring-[#2b97cf]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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

      {/* URL Dialog */}
      <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add URL Evidence</DialogTitle>
            <DialogDescription>Provide a URL that serves as evidence for earning this badge.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url-title">Title *</Label>
              <Input id="url-title" placeholder="Enter evidence title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url-link">URL *</Label>
              <Input id="url-link" type="url" placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url-description">Description</Label>
              <textarea
                id="url-description"
                placeholder="Enter description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-[#d9d9d9] rounded-md focus:border-[#2b97cf] focus:ring-[#2b97cf] focus:outline-none resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUrlDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90" onClick={() => setUrlDialogOpen(false)}>
              Add Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Text Dialog */}
      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Text Evidence</DialogTitle>
            <DialogDescription>Provide text-based evidence for earning this badge.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text-title">Title *</Label>
              <Input id="text-title" placeholder="Enter evidence title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-content">Content *</Label>
              <textarea
                id="text-content"
                placeholder="Enter text evidence"
                rows={5}
                className="w-full px-3 py-2 border border-[#d9d9d9] rounded-md focus:border-[#2b97cf] focus:ring-[#2b97cf] focus:outline-none resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTextDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90" onClick={() => setTextDialogOpen(false)}>
              Add Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ID Dialog */}
      <Dialog open={idDialogOpen} onOpenChange={setIdDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add ID Evidence</DialogTitle>
            <DialogDescription>Provide an identification number or code as evidence.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="id-title">Title *</Label>
              <Input id="id-title" placeholder="Enter evidence title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id-number">ID Number *</Label>
              <Input id="id-number" placeholder="Enter ID or reference number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id-description">Description</Label>
              <textarea
                id="id-description"
                placeholder="Enter description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-[#d9d9d9] rounded-md focus:border-[#2b97cf] focus:ring-[#2b97cf] focus:outline-none resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIdDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90" onClick={() => setIdDialogOpen(false)}>
              Add Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
            <DialogDescription>Upload a file as evidence for earning this badge.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">Title *</Label>
              <Input id="upload-title" placeholder="Enter evidence title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-file">File *</Label>
              <Input id="upload-file" type="file" className="cursor-pointer" />
              <p className="text-xs text-[#767676]">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-description">Description</Label>
              <textarea
                id="upload-description"
                placeholder="Enter description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-[#d9d9d9] rounded-md focus:border-[#2b97cf] focus:ring-[#2b97cf] focus:outline-none resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90" onClick={() => setUploadDialogOpen(false)}>
              Upload Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Dialog */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Custom Evidence</DialogTitle>
            <DialogDescription>Create a custom evidence entry with your own fields.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-title">Title *</Label>
              <Input id="custom-title" placeholder="Enter evidence title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-type">Evidence Type *</Label>
              <Select defaultValue="other">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="transcript">Transcript</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-content">Content *</Label>
              <textarea
                id="custom-content"
                placeholder="Enter custom evidence details"
                rows={4}
                className="w-full px-3 py-2 border border-[#d9d9d9] rounded-md focus:border-[#2b97cf] focus:ring-[#2b97cf] focus:outline-none resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90" onClick={() => setCustomDialogOpen(false)}>
              Add Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
