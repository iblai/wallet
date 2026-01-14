"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { EmailPreviewModal } from "@/components/email/email-preview-modal"
import { CreateCertificateModal } from "@/components/certificates/create-certificate-modal"
import { InviteUserModal } from "@/components/users/invite-user-modal"

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "users", label: "Users" },
  { id: "printable-certificates", label: "Printable Certificates" },
  { id: "subscription", label: "Subscription" },
  { id: "email-options", label: "Email Options" }, // Removed isNew flag
]

const emailTemplates = [
  {
    type: "Badge Issued",
    language: "English",
    created: "Aug 20, 2024",
    modified: "Nov 7, 2024",
  },
  {
    type: "Badge Reminder",
    language: "English",
    created: "Nov 7, 2024",
    modified: "Nov 7, 2024",
  },
]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [orgName, setOrgName] = useState("Lincoln Technologies")
  const [orgType, setOrgType] = useState("training-providers")
  const [industry, setIndustry] = useState("technology")
  const [description, setDescription] = useState(
    "Lincoln Technologies is an organization that offers training. We are located in south central Pennsylvania.",
  )

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [emailType, setEmailType] = useState("")
  const [emailLanguage, setEmailLanguage] = useState("")
  const [subjectLine, setSubjectLine] = useState("Congratulations on your badge!")
  const [headerText, setHeaderText] = useState("We are excited to issue you %{badge_name}!")
  const [bodyText, setBodyText] = useState("Congratulations %{earner_name}!")
  const [footerText, setFooterText] = useState("")
  const [previewTemplateId, setPreviewTemplateId] = useState("")

  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [printingEnabled, setPrintingEnabled] = useState("enable")

  const [showInviteUserModal, setShowInviteUserModal] = useState(false)

  const handleSaveEmail = () => {
    // Save email logic here
    setShowEmailForm(false)
  }

  const handleCancelEmail = () => {
    setShowEmailForm(false)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fefefe] p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <h1 className="text-[40px] font-serif font-normal text-[#2d2d2d] mb-8">Account</h1>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-8 mb-8 border-b border-[#e5e5e5]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-[15px] font-normal relative flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-[#2b97cf] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2b97cf]"
                    : "text-[#8a8a8a] hover:text-[#2b97cf]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <div>
              {/* Basics Section */}
              <h2 className="text-[24px] font-semibold text-[#2d2d2d] mb-6">Basics</h2>

              {/* Logo Upload Section */}
              <div className="flex items-start gap-8 mb-8">
                <div className="w-[200px] h-[200px] bg-white border-2 border-[#e5e5e5] rounded-lg flex items-center justify-center">
                  <img
                    src="/images/logo.png"
                    alt="Organization Logo"
                    className="max-w-full max-h-full object-contain p-4"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-semibold text-[#2d2d2d] mb-2">
                    Add your logo <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-[14px] text-[#6b7280] mb-4">
                    Upload a square image in PNG format with dimensions between 600x600 and 2048x2048 pixels.
                  </p>
                  <Button variant="link" className="text-[#2b97cf] hover:text-[#2b97cf]/80 p-0 h-auto text-[15px]">
                    Edit
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6 max-w-[800px]">
                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="text-[14px] text-[#6b7280]">
                    Organization name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-11 text-[15px]"
                  />
                </div>

                {/* Organization Type */}
                <div className="space-y-2">
                  <Label htmlFor="org-type" className="text-[14px] text-[#6b7280]">
                    Organization type
                  </Label>
                  <Select value={orgType} onValueChange={setOrgType}>
                    <SelectTrigger className="h-11 text-[15px] w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training-providers">Training Providers</SelectItem>
                      <SelectItem value="educational-institution">Educational Institution</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="non-profit">Non-Profit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-[14px] text-[#6b7280]">
                    Industry <span className="text-red-500">*</span>
                  </Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="h-11 text-[15px] w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[14px] text-[#6b7280]">
                    Description <span className="text-red-500">*</span> ({description.length} / 600 characters)
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={600}
                    rows={6}
                    className="text-[15px] resize-none"
                  />
                </div>

                {/* Country/Territory */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-[14px] text-[#6b7280]">
                    Country/Territory <span className="text-red-500">*</span>
                  </Label>
                  <Select defaultValue="us">
                    <SelectTrigger className="h-11 text-[15px] w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              {/* Header Section */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <h2 className="text-[24px] font-semibold text-[#2d2d2d] mb-4">Users</h2>
                  <p className="text-[15px] text-[#6b7280] leading-relaxed">
                    Manage users in your organization. Add new users, assign roles, and control access permissions.
                  </p>
                </div>
                <Button
                  onClick={() => setShowInviteUserModal(true)}
                  className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white h-11 px-6 text-[15px]"
                >
                  Invite User
                </Button>
              </div>

              {/* Users Table */}
              <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 bg-[#f9fafb] border-b border-[#e5e5e5] px-6 py-4">
                  <div className="text-[14px] font-medium text-[#6b7280]">Name</div>
                  <div className="text-[14px] font-medium text-[#6b7280]">Email</div>
                  <div className="text-[14px] font-medium text-[#6b7280]">Role</div>
                  <div className="text-[14px] font-medium text-[#6b7280]">Status</div>
                  <div className="text-[14px] font-medium text-[#6b7280]">Actions</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-[#e5e5e5]">
                  {/* User 1 - Admin */}
                  <div className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-[15px] text-[#2d2d2d]">John Smith</div>
                    <div className="text-[15px] text-[#6b7280]">john.smith@lincolntech.com</div>
                    <div className="text-[15px] text-[#2d2d2d]">Admin</div>
                    <div className="text-[15px] text-[#10b981]">Active</div>
                    <div className="flex items-center gap-4">
                      <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                        Edit
                      </Link>
                      <span className="text-[#d1d5db]">|</span>
                      <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                        Remove
                      </Link>
                    </div>
                  </div>

                  {/* User 2 - Member */}
                  <div className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-[15px] text-[#2d2d2d]">Sarah Johnson</div>
                    <div className="text-[15px] text-[#6b7280]">sarah.johnson@lincolntech.com</div>
                    <div className="text-[15px] text-[#2d2d2d]">Member</div>
                    <div className="text-[15px] text-[#10b981]">Active</div>
                    <div className="flex items-center gap-4">
                      <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                        Edit
                      </Link>
                      <span className="text-[#d1d5db]">|</span>
                      <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                        Remove
                      </Link>
                    </div>
                  </div>

                  {/* User 3 - Member */}
                  <div className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-[15px] text-[#2d2d2d]">Michael Chen</div>
                    <div className="text-[15px] text-[#6b7280]">michael.chen@lincolntech.com</div>
                    <div className="text-[15px] text-[#2d2d2d]">Member</div>
                    <div className="text-[15px] text-[#10b981]">Active</div>
                    <div className="flex items-center gap-4">
                      <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                        Edit
                      </Link>
                      <span className="text-[#d1d5db]">|</span>
                      <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                        Remove
                      </Link>
                    </div>
                  </div>

                  {/* User 4 - Pending */}
                  <div className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-[15px] text-[#2d2d2d]">Emily Davis</div>
                    <div className="text-[15px] text-[#6b7280]">emily.davis@lincolntech.com</div>
                    <div className="text-[15px] text-[#2d2d2d]">Member</div>
                    <div className="text-[15px] text-[#f59e0b]">Pending</div>
                    <div className="flex items-center gap-4">
                      <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                        Resend Invite
                      </Link>
                      <span className="text-[#d1d5db]">|</span>
                      <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                        Cancel
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "printable-certificates" && (
            <div>
              {/* Printing section */}
              <div className="mb-12">
                <h2 className="text-[24px] font-semibold text-[#2d2d2d] mb-4">Printing</h2>
                <p className="text-[15px] text-[#6b7280] mb-6">
                  Enable printing to allow earners to download and print a PDF version of their badge.
                </p>
                <RadioGroup value={printingEnabled} onValueChange={setPrintingEnabled} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="enable" id="enable" className="border-[#2b97cf] text-[#2b97cf]" />
                    <Label htmlFor="enable" className="text-[15px] text-[#2d2d2d] font-normal cursor-pointer">
                      Enable
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="disable" id="disable" className="border-[#2b97cf] text-[#2b97cf]" />
                    <Label htmlFor="disable" className="text-[15px] text-[#2d2d2d] font-normal cursor-pointer">
                      Disable
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Designs section */}
              <div>
                <h2 className="text-[24px] font-semibold text-[#2d2d2d] mb-4">Designs</h2>
                <p className="text-[15px] text-[#6b7280] mb-6">These designs can be attached to your template.</p>

                {/* Designs Table */}
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden mb-6">
                  {/* Table Header */}
                  <div className="bg-[#f9fafb] border-b border-[#e5e5e5] px-6 py-4">
                    <div className="text-[14px] font-medium text-[#6b7280]">Name</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-[#e5e5e5]">
                    {/* Starter Design */}
                    <div className="flex items-center justify-between px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="text-[15px] text-[#2d2d2d]">Starter</div>
                      <div className="flex items-center gap-4">
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Edit
                        </Link>
                      </div>
                    </div>

                    {/* LT Basic Design */}
                    <div className="flex items-center justify-between px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="text-[15px] text-[#2d2d2d]">LT Basic</div>
                      <div className="flex items-center gap-4">
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Preview
                        </Link>
                        <span className="text-[#d1d5db]">|</span>
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Edit
                        </Link>
                        <span className="text-[#d1d5db]">|</span>
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Duplicate
                        </Link>
                        <span className="text-[#d1d5db]">|</span>
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Remove
                        </Link>
                      </div>
                    </div>

                    {/* Lincoln Technologies Design (Legacy) */}
                    <div className="flex items-center justify-between px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="text-[15px] text-[#2d2d2d]">Lincoln Technologies Design (Legacy)</div>
                      <div className="flex items-center gap-4">
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Download
                        </Link>
                      </div>
                    </div>

                    {/* Custom Design (Legacy) */}
                    <div className="flex items-center justify-between px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="text-[15px] text-[#2d2d2d]">Custom Design (Legacy)</div>
                      <div className="flex items-center gap-4">
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Download
                        </Link>
                        <span className="text-[#d1d5db]">|</span>
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Remove
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add a design button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowCertificateModal(true)}
                    className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white h-11 px-6 text-[15px]"
                  >
                    Add a design
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div>
              {/* Current Plan Section */}
              <div className="mb-12">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-[24px] font-semibold text-[#2d2d2d] mb-2">Current Plan</h2>
                    <p className="text-[15px] text-[#6b7280]">Manage your subscription and billing information</p>
                  </div>
                  <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white h-11 px-6 text-[15px]">
                    Upgrade Plan
                  </Button>
                </div>

                <div className="border border-[#e5e5e5] rounded-lg p-6 bg-white">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-[20px] font-semibold text-[#2d2d2d] mb-2">Professional Plan</h3>
                      <p className="text-[15px] text-[#6b7280]">$99/month • Billed monthly</p>
                    </div>
                    <div className="px-4 py-2 bg-[#10b981]/10 text-[#10b981] rounded-md text-[14px] font-medium">
                      Active
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-[14px] font-medium text-[#6b7280] mb-2">Plan Features</h4>
                      <ul className="space-y-2">
                        <li className="text-[15px] text-[#2d2d2d] flex items-center gap-2">
                          <span className="text-[#10b981]">✓</span> Unlimited badge templates
                        </li>
                        <li className="text-[15px] text-[#2d2d2d] flex items-center gap-2">
                          <span className="text-[#10b981]">✓</span> Up to 1,000 badges issued per month
                        </li>
                        <li className="text-[15px] text-[#2d2d2d] flex items-center gap-2">
                          <span className="text-[#10b981]">✓</span> Custom branding
                        </li>
                        <li className="text-[15px] text-[#2d2d2d] flex items-center gap-2">
                          <span className="text-[#10b981]">✓</span> Email customization
                        </li>
                        <li className="text-[15px] text-[#2d2d2d] flex items-center gap-2">
                          <span className="text-[#10b981]">✓</span> Priority support
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[14px] font-medium text-[#6b7280] mb-2">Current Usage</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-[15px] mb-1">
                            <span className="text-[#2d2d2d]">Badges Issued</span>
                            <span className="text-[#6b7280]">247 / 1,000</span>
                          </div>
                          <div className="w-full bg-[#e5e5e5] rounded-full h-2">
                            <div className="bg-[#2b97cf] h-2 rounded-full" style={{ width: "24.7%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[15px] mb-1">
                            <span className="text-[#2d2d2d]">Active Users</span>
                            <span className="text-[#6b7280]">4 / 10</span>
                          </div>
                          <div className="w-full bg-[#e5e5e5] rounded-full h-2">
                            <div className="bg-[#2b97cf] h-2 rounded-full" style={{ width: "40%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[15px] mb-1">
                            <span className="text-[#2d2d2d]">Templates</span>
                            <span className="text-[#6b7280]">12 / Unlimited</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#e5e5e5]">
                    <p className="text-[14px] text-[#6b7280]">
                      Next billing date: <span className="text-[#2d2d2d] font-medium">December 15, 2024</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="mb-12">
                <h2 className="text-[24px] font-semibold text-[#2d2d2d] mb-6">Payment Method</h2>
                <div className="border border-[#e5e5e5] rounded-lg p-6 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-[#1a1f71] rounded flex items-center justify-center text-white text-[10px] font-bold">
                        VISA
                      </div>
                      <div>
                        <p className="text-[15px] text-[#2d2d2d] font-medium">•••• •••• •••• 4242</p>
                        <p className="text-[14px] text-[#6b7280]">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-10 px-4 text-[15px] border-[#d1d5db] hover:bg-[#f9fafb] bg-transparent"
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              {/* Billing History Section */}
              <div>
                <h2 className="text-[24px] font-semibold text-[#2d2d2d] mb-6">Billing History</h2>
                <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 gap-4 bg-[#f9fafb] border-b border-[#e5e5e5] px-6 py-4">
                    <div className="text-[14px] font-medium text-[#6b7280]">Date</div>
                    <div className="text-[14px] font-medium text-[#6b7280]">Description</div>
                    <div className="text-[14px] font-medium text-[#6b7280]">Amount</div>
                    <div className="text-[14px] font-medium text-[#6b7280]">Invoice</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-[#e5e5e5]">
                    <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="text-[15px] text-[#2d2d2d]">Nov 15, 2024</div>
                      <div className="text-[15px] text-[#6b7280]">Professional Plan - Monthly</div>
                      <div className="text-[15px] text-[#2d2d2d]">$99.00</div>
                      <div>
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Download
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="text-[15px] text-[#2d2d2d]">Oct 15, 2024</div>
                      <div className="text-[15px] text-[#6b7280]">Professional Plan - Monthly</div>
                      <div className="text-[15px] text-[#2d2d2d]">$99.00</div>
                      <div>
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Download
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="text-[15px] text-[#2d2d2d]">Sep 15, 2024</div>
                      <div className="text-[15px] text-[#6b7280]">Professional Plan - Monthly</div>
                      <div className="text-[15px] text-[#2d2d2d]">$99.00</div>
                      <div>
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Download
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-[#f9fafb] transition-colors">
                      <div className="text-[15px] text-[#2d2d2d]">Aug 15, 2024</div>
                      <div className="text-[15px] text-[#6b7280]">Professional Plan - Monthly</div>
                      <div className="text-[15px] text-[#2d2d2d]">$99.00</div>
                      <div>
                        <Link href="#" className="text-[15px] text-[#2b97cf] hover:underline">
                          Download
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "email-options" && (
            <div>
              {!showEmailForm ? (
                <>
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1">
                      <h2 className="text-[24px] font-semibold text-[#2d2d2d] mb-4">Email Options</h2>
                      <p className="text-[15px] text-[#6b7280] leading-relaxed">
                        Customize the text in the emails your earners receive using our Email Options. Any saved details
                        will be made immediately available to your earners. To learn more visit this{" "}
                        <Link href="/support" className="text-[#2b97cf] hover:underline">
                          support page
                        </Link>
                        .
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowEmailForm(true)}
                      className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white h-11 px-6 text-[15px]"
                    >
                      Create email
                    </Button>
                  </div>

                  {/* Email Templates Table */}
                  <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-4 bg-[#f9fafb] border-b border-[#e5e5e5] px-6 py-4">
                      <div className="text-[14px] font-medium text-[#6b7280]">Email Type</div>
                      <div className="text-[14px] font-medium text-[#6b7280]">Email Language</div>
                      <div className="text-[14px] font-medium text-[#6b7280]">Created</div>
                      <div className="text-[14px] font-medium text-[#6b7280]">Modified</div>
                    </div>

                    {/* Table Rows */}
                    {emailTemplates.map((template, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-[#e5e5e5] last:border-b-0 hover:bg-[#f9fafb] transition-colors"
                      >
                        <div className="text-[15px] text-[#2d2d2d]">{template.type}</div>
                        <div className="text-[15px] text-[#6b7280]">{template.language}</div>
                        <div className="text-[15px] text-[#6b7280]">{template.created}</div>
                        <div className="text-[15px] text-[#6b7280]">{template.modified}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-[32px] font-serif font-normal text-[#2d2d2d] mb-8">Create Custom Email</h2>

                    {/* Email Details Section */}
                    <div className="mb-8">
                      <h3 className="text-[20px] font-semibold text-[#2d2d2d] mb-6">Email Details</h3>
                      <div className="space-y-6 max-w-[1100px]">
                        <div className="space-y-2">
                          <Label htmlFor="email-type" className="text-[14px] text-[#6b7280]">
                            Email Type
                          </Label>
                          <Select value={emailType} onValueChange={setEmailType}>
                            <SelectTrigger className="h-11 text-[15px] w-full">
                              <SelectValue placeholder="Select email type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="badge-issued">Badge Issued</SelectItem>
                              <SelectItem value="badge-reminder">Badge Reminder</SelectItem>
                              <SelectItem value="badge-revoked">Badge Revoked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email-language" className="text-[14px] text-[#6b7280]">
                            Email Language
                          </Label>
                          <Select value={emailLanguage} onValueChange={setEmailLanguage}>
                            <SelectTrigger className="h-11 text-[15px] w-full">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="spanish">Spanish</SelectItem>
                              <SelectItem value="french">French</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Email Message Section */}
                    <div className="mb-8">
                      <h3 className="text-[20px] font-semibold text-[#2d2d2d] mb-6">Email Message</h3>
                      <div className="space-y-6 max-w-[1100px]">
                        <div className="space-y-2">
                          <Label htmlFor="subject-line" className="text-[14px] text-[#6b7280]">
                            Subject Line
                          </Label>
                          <Input
                            id="subject-line"
                            value={subjectLine}
                            onChange={(e) => setSubjectLine(e.target.value)}
                            className="h-11 text-[15px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="header" className="text-[14px] text-[#6b7280]">
                            Header
                          </Label>
                          <Input
                            id="header"
                            value={headerText}
                            onChange={(e) => setHeaderText(e.target.value)}
                            className="h-11 text-[15px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="body" className="text-[14px] text-[#6b7280]">
                            Body
                          </Label>
                          <Input
                            id="body"
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            className="h-11 text-[15px]"
                          />
                        </div>

                        <p className="text-[14px] text-[#6b7280]">
                          Use our{" "}
                          <Link href="#" className="text-[#2b97cf] hover:underline">
                            formatting guide
                          </Link>{" "}
                          to style your text or add dynamic content.
                        </p>
                      </div>
                    </div>

                    {/* Custom Footer Text Section */}
                    <div className="mb-8">
                      <h3 className="text-[20px] font-semibold text-[#2d2d2d] mb-6">Custom Footer Text</h3>
                      <div className="space-y-6 max-w-[1100px]">
                        <div className="space-y-2">
                          <Label htmlFor="footer-text" className="text-[14px] text-[#6b7280]">
                            Footer Text
                          </Label>
                          <Input
                            id="footer-text"
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            className="h-11 text-[15px]"
                            placeholder="Optional"
                          />
                        </div>
                        <p className="text-[14px] text-[#6b7280]">
                          You can use %{"{link}"} to include Credly Link in custom footer
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between max-w-[1100px] pt-6 border-t border-[#e5e5e5]">
                      <Button
                        variant="link"
                        onClick={handleCancelEmail}
                        className="text-[#2b97cf] hover:text-[#2b97cf]/80 p-0 h-auto text-[15px]"
                      >
                        Cancel
                      </Button>
                      <div className="flex items-center gap-4">
                        <Input
                          placeholder="Preview Badge Template ID (Optional)"
                          value={previewTemplateId}
                          onChange={(e) => setPreviewTemplateId(e.target.value)}
                          className="h-11 text-[15px] w-[280px]"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setShowPreview(true)}
                          className="h-11 px-6 text-[15px] border-[#d1d5db] hover:bg-[#f9fafb]"
                        >
                          Preview
                        </Button>
                        <Button
                          onClick={handleSaveEmail}
                          className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white h-11 px-8 text-[15px]"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        subject={subjectLine}
        header={headerText}
        body={bodyText}
      />

      {/* Certificate Modal */}
      <CreateCertificateModal isOpen={showCertificateModal} onClose={() => setShowCertificateModal(false)} />

      {/* Invite User Modal */}
      <InviteUserModal isOpen={showInviteUserModal} onClose={() => setShowInviteUserModal(false)} />
    </MainLayout>
  )
}
