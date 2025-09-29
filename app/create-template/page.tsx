"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Upload, Plus, X, Sparkles } from "lucide-react"
import Link from "next/link"
import { SignatureCanvas } from "@/components/signature-canvas"

interface Signatory {
  id: string
  signature: string | null
  name: string
  designation: string
}

interface Criteria {
  id: string
  type: string
  description: string
  url: string
}

export default function CreateTemplatePage() {
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [earnBadge, setEarnBadge] = useState("yes")
  const [signatureMethod, setSignatureMethod] = useState<"upload" | "draw">("upload")
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)

  const [signatories, setSignatories] = useState<Signatory[]>([{ id: "1", signature: null, name: "", designation: "" }])
  const [currentSignatoryId, setCurrentSignatoryId] = useState<string | null>(null)

  const [criteriaList, setCriteriaList] = useState<Criteria[]>([{ id: "1", type: "", description: "", url: "" }])

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  const handleSignatureSave = (signature: string) => {
    if (currentSignatoryId) {
      setSignatories(signatories.map((sig) => (sig.id === currentSignatoryId ? { ...sig, signature } : sig)))
    }
  }

  const openSignatureModal = (signatoryId: string) => {
    setCurrentSignatoryId(signatoryId)
    setIsSignatureModalOpen(true)
  }

  const addSignatory = () => {
    const newSignatory: Signatory = {
      id: Date.now().toString(),
      signature: null,
      name: "",
      designation: "",
    }
    setSignatories([...signatories, newSignatory])
  }

  const removeSignatory = (id: string) => {
    if (signatories.length > 1) {
      setSignatories(signatories.filter((sig) => sig.id !== id))
    }
  }

  const updateSignatory = (id: string, field: "name" | "designation", value: string) => {
    setSignatories(signatories.map((sig) => (sig.id === id ? { ...sig, [field]: value } : sig)))
  }

  const addCriteria = () => {
    const newCriteria: Criteria = {
      id: Date.now().toString(),
      type: "",
      description: "",
      url: "",
    }
    setCriteriaList([...criteriaList, newCriteria])
  }

  const removeCriteria = (id: string) => {
    if (criteriaList.length > 1) {
      setCriteriaList(criteriaList.filter((crit) => crit.id !== id))
    }
  }

  const updateCriteria = (id: string, field: "type" | "description" | "url", value: string) => {
    setCriteriaList(criteriaList.map((crit) => (crit.id === id ? { ...crit, [field]: value } : crit)))
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fefefe]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#efefef] px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#2b97cf] hover:underline">
              Credentials
            </Link>
            <ChevronRight className="w-4 h-4 text-[#767676]" />
            <span className="text-[#767676]">Templates</span>
          </div>
        </div>

        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-[#374151] mb-8">Create Template</h1>

          <div className="max-w-4xl space-y-8">
            {/* Basics Section */}
            <Card className="border-[#efefef]">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-[#374151] mb-6">Basics</h2>

                <div className="space-y-6">
                  {/* Image Upload Section */}
                  <div className="flex gap-6">
                    {/* Image Upload Area */}
                    <div className="w-48 h-48 border-2 border-dashed border-[#d9d9d9] rounded-lg bg-[#f6f6f6] flex items-center justify-center flex-shrink-0">
                      <div className="w-16 h-16 bg-[#e8e9eb] rounded-lg flex items-center justify-center">
                        <Upload className="w-6 h-6 text-[#767676]" />
                      </div>
                    </div>

                    {/* Image Upload Instructions */}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#374151] mb-2">Add an image</h3>
                      <p className="text-sm text-[#767676] mb-4">
                        Credential templates must use square images in PNG format, with dimensions between 600×600 and
                        2048×2048 pixels.
                      </p>
                      <Button variant="link" className="text-[#2b97cf] p-0 h-auto">
                        Upload image
                      </Button>
                    </div>
                  </div>

                  {/* Form Fields Below Image */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Name</label>
                      <Input
                        placeholder="Write name of the credential"
                        className="border-[#d9d9d9] focus:border-[#2b97cf]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Description</label>
                      <Textarea
                        placeholder="Write description for the credential"
                        className="border-[#d9d9d9] focus:border-[#2b97cf] min-h-[120px] resize-none"
                      />
                      <div className="text-right text-xs text-[#767676] mt-1">0 / 500</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Learn More</label>
                      <Input placeholder="https://" className="border-[#d9d9d9] focus:border-[#2b97cf]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signatories Section */}
            <Card className="border-[#efefef]">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-[#374151] mb-6">Signatories</h2>

                <div className="space-y-8">
                  {signatories.map((signatory, index) => (
                    <div
                      key={signatory.id}
                      className="space-y-6 pb-6 border-b border-[#efefef] last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-[#374151]">Signature {index + 1}</label>
                        {signatories.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSignatory(signatory.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="border border-[#d9d9d9] rounded-lg p-6 bg-[#f6f6f6]">
                        {signatory.signature ? (
                          <div className="border border-[#d9d9d9] rounded-lg p-4 bg-white mb-4">
                            <img
                              src={signatory.signature || "/placeholder.svg"}
                              alt={`Signature ${index + 1}`}
                              className="max-h-24 mx-auto"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-center mb-4">
                              <div className="w-16 h-16 bg-[#e8e9eb] rounded-lg flex items-center justify-center">
                                <Upload className="w-6 h-6 text-[#767676]" />
                              </div>
                            </div>

                            <div className="text-center mb-4">
                              <span className="text-sm text-[#767676]">OR</span>
                            </div>
                          </>
                        )}

                        <div className="flex justify-center gap-4">
                          <Button
                            variant="link"
                            className="text-[#2b97cf] p-0 h-auto"
                            onClick={() => setSignatureMethod("upload")}
                          >
                            Upload image
                          </Button>
                          <Button
                            variant="link"
                            className="text-[#2b97cf] p-0 h-auto"
                            onClick={() => openSignatureModal(signatory.id)}
                          >
                            Draw Signature
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#374151] mb-2">Name</label>
                          <Input
                            placeholder="Write the name"
                            className="border-[#d9d9d9] focus:border-[#2b97cf]"
                            value={signatory.name}
                            onChange={(e) => updateSignatory(signatory.id, "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#374151] mb-2">Designation</label>
                          <Input
                            placeholder="Write the designation"
                            className="border-[#d9d9d9] focus:border-[#2b97cf]"
                            value={signatory.designation}
                            onChange={(e) => updateSignatory(signatory.id, "designation", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="link" className="text-[#2b97cf] p-0 h-auto" onClick={addSignatory}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Signature
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Earn This Badge Section */}
            <Card className="border-[#efefef]">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-[#374151] mb-6">Earn This Badge</h2>
                <p className="text-sm text-[#767676] mb-6">
                  Display a button on this template that directly connects users with the opportunity to earn this
                  badge.
                </p>

                <div className="space-y-6">
                  <RadioGroup value={earnBadge} onValueChange={setEarnBadge}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">No</Label>
                    </div>
                  </RadioGroup>

                  {earnBadge === "yes" && (
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Button Link</label>
                      <Input placeholder="https://" className="border-[#d9d9d9] focus:border-[#2b97cf]" />
                    </div>
                  )}
                </div>

                {/* Attributes Section */}
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-[#767676]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-[#374151]">Attributes</h3>
                  </div>
                  <p className="text-sm text-[#767676] mb-6">
                    Attributes improve your credentials overall discoverability, as well as the likelihood it will be
                    recommended to Credly users. Learn more about attributes{" "}
                    <a href="#" className="text-[#2b97cf] hover:underline">
                      here
                    </a>
                    .
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Type</label>
                      <Select>
                        <SelectTrigger className="border-[#d9d9d9] focus:border-[#2b97cf] h-11">
                          <SelectValue placeholder="Select One" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="application">Application</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="award">Award</SelectItem>
                          <SelectItem value="badge">Badge</SelectItem>
                          <SelectItem value="course">Course</SelectItem>
                          <SelectItem value="credential">Credential</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Level</label>
                      <Select>
                        <SelectTrigger className="border-[#d9d9d9] focus:border-[#2b97cf] h-11">
                          <SelectValue placeholder="Select One" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Time</label>
                      <Select>
                        <SelectTrigger className="border-[#d9d9d9] focus:border-[#2b97cf] h-11">
                          <SelectValue placeholder="Select One" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2-hours">1-2 hours</SelectItem>
                          <SelectItem value="3-5-hours">3-5 hours</SelectItem>
                          <SelectItem value="1-week">1 week</SelectItem>
                          <SelectItem value="1-month">1 month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-2">Cost</label>
                      <Select>
                        <SelectTrigger className="border-[#d9d9d9] focus:border-[#2b97cf] h-11">
                          <SelectValue placeholder="Select One" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox id="display-attributes" defaultChecked />
                    <Label htmlFor="display-attributes" className="text-sm">
                      Display attributes on the public view of this badge
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Criteria Section */}
            <Card className="border-[#efefef]">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-[#374151] mb-6">Criteria</h2>

                <div className="space-y-8">
                  {criteriaList.map((criteria, index) => (
                    <div
                      key={criteria.id}
                      className="space-y-4 pb-6 border-b border-[#efefef] last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-[#374151]">Criteria {index + 1}</label>
                        {criteriaList.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCriteria(criteria.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#374151] mb-2">Criteria type</label>
                        <Select
                          value={criteria.type}
                          onValueChange={(value) => updateCriteria(criteria.id, "type", value)}
                        >
                          <SelectTrigger className="border-[#d9d9d9] focus:border-[#2b97cf] w-full h-11">
                            <SelectValue placeholder="Select One" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="application">Application</SelectItem>
                            <SelectItem value="assessment">Assessment</SelectItem>
                            <SelectItem value="award">Award</SelectItem>
                            <SelectItem value="badge">Badge</SelectItem>
                            <SelectItem value="course">Course</SelectItem>
                            <SelectItem value="credential">Credential</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#374151] mb-2">Description</label>
                        <Textarea
                          placeholder="Write description for criteria"
                          className="border-[#d9d9d9] focus:border-[#2b97cf] min-h-[120px] resize-none w-full"
                          value={criteria.description}
                          onChange={(e) => updateCriteria(criteria.id, "description", e.target.value)}
                        />
                        <div className="text-right text-xs text-[#767676] mt-1">{criteria.description.length}/500</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#374151] mb-2">URL to activity</label>
                        <Input
                          placeholder="https://"
                          className="border-[#d9d9d9] focus:border-[#2b97cf] w-full h-11"
                          value={criteria.url}
                          onChange={(e) => updateCriteria(criteria.id, "url", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <Button variant="link" className="text-[#2b97cf] p-0 h-auto" onClick={addCriteria}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Criteria
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="border-[#efefef]">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-[#374151] mb-6">Skills</h2>

                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Add Skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-[#d9d9d9] focus:border-[#2b97cf]"
                    />
                  </div>

                  <p className="text-sm text-[#767676]">You must add at least 3 skills.</p>

                  <div className="bg-[#f6f6f6] border border-[#efefef] rounded-lg p-4 space-y-3">
                    <h3 className="text-base font-semibold text-[#374151]">Suggested Skills</h3>
                    <p className="text-sm text-[#5f6368] leading-relaxed">
                      AI can generate a list of skills based on your template's description and earning criteria. Using
                      these skills ensures your credential connects to meaningful opportunities for your earners.
                    </p>
                    <Button variant="link" className="text-[#2b97cf] p-0 h-auto flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Suggest skills
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-[#2b97cf] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:bg-white/20 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pb-8">
              <Button
                variant="outline"
                className="px-8 border-[#2b97cf] text-[#2b97cf] hover:bg-[#2b97cf]/10 bg-transparent"
              >
                Save as Draft
              </Button>
              <Button className="px-8 bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white">Publish Template</Button>
            </div>
          </div>
        </div>
      </div>

      <SignatureCanvas
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSignatureSave}
      />
    </MainLayout>
  )
}
