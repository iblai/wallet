"use client"
import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageSelector } from "@/components/ui/image-selector"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

// Mock template data - in real app this would come from API
const mockTemplates = [
  {
    id: 1,
    name: "Fundamentals of Ruby on Rails T",
    image: "/ruby-rails-logo.jpg",
    visibility: "Public",
    updated: "11 Nov 2024",
  },
  {
    id: 2,
    name: "Javascript Frameworks Fundamentals",
    image: "/javascript-logo.png",
    visibility: "Public",
    updated: "11 Nov 2024",
  },
  {
    id: 3,
    name: "Javascript Fundamentals",
    image: "/javascript-logo.png",
    visibility: "Public",
    updated: "11 Nov 2024",
  },
  {
    id: 4,
    name: "Mindstone Hackathon",
    image: "/hackathon-badge.jpg",
    visibility: "Public",
    updated: "7 Aug 2024",
  },
  {
    id: 5,
    name: "Python Data Analysis",
    image: "/python-data-logo.jpg",
    visibility: "Public",
    updated: "25 Oct 2024",
  },
  {
    id: 6,
    name: "Trusted Partner - Reseller",
    image: "/partner-badge.jpg",
    visibility: "Public",
    updated: "11 Nov 2024",
  },
]

export default function CreateCollectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  const [collectionName, setCollectionName] = useState("")
  const [collectionImage, setCollectionImage] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState("private")
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([])
  const [showSelected, setShowSelected] = useState(false)
  const [errors, setErrors] = useState<{
    collectionName?: string
  }>({})

  const handleTemplateToggle = (templateId: number) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId],
    )
  }

  const validateForm = () => {
    const newErrors: { collectionName?: string } = {}

    if (!collectionName.trim()) {
      newErrors.collectionName = "Collection name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    // In real app, this would save to API
    console.log("Saving collection:", {
      name: collectionName,
      image: collectionImage,
      description,
      visibility,
      templates: selectedTemplates,
    })
    router.push("/")
  }

  const handleCancel = () => {
    router.push("/")
  }

  const filteredTemplates = showSelected
    ? mockTemplates.filter((template) => selectedTemplates.includes(template.id))
    : mockTemplates

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fefefe] relative z-0">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#efefef] px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-[#2b97cf] hover:underline">
              Credentials
            </Link>
            <ChevronRight className="w-4 h-4 text-[#767676]" />
            <span className="text-[#767676]">Collections</span>
          </div>
        </div>

        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-[#374151] mb-8">
            {editId ? "Edit Collection" : "Create Collection"}
          </h1>

          <div className="max-w-4xl space-y-8">
            {/* Collection Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Collection Name *</label>
                <Input
                  value={collectionName}
                  onChange={(e) => {
                    setCollectionName(e.target.value)
                    if (errors.collectionName) {
                      setErrors((prev) => ({ ...prev, collectionName: undefined }))
                    }
                  }}
                  className={`border-[#d9d9d9] focus:border-[#2b97cf] ${
                    errors.collectionName ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {errors.collectionName && <p className="text-red-500 text-sm mt-1">{errors.collectionName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Collection Image</label>
                <ImageSelector
                  value={collectionImage}
                  onChange={setCollectionImage}
                  placeholder="Select a thumbnail image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Description ({description.length}/500 characters)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-[#d9d9d9] focus:border-[#2b97cf] min-h-[120px] resize-none"
                  maxLength={500}
                />
              </div>
            </div>

            {/* Visibility Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#374151] mb-2">Visibility</h3>
                <p className="text-sm text-[#767676] mb-4">
                  Make your collection public for earners, or private for administrative purposes.
                </p>
              </div>

              <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="public"
                    id="public"
                    className="border-[#d9d9d9] text-[#2b97cf] data-[state=checked]:border-[#2b97cf] data-[state=checked]:bg-[#2b97cf]"
                  />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="private"
                    id="private"
                    className="border-[#d9d9d9] text-[#2b97cf] data-[state=checked]:border-[#2b97cf] data-[state=checked]:bg-[#2b97cf]"
                  />
                  <Label htmlFor="private">Private</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Templates Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#374151] mb-2">Templates</h3>
                <p className="text-sm text-[#767676] mb-4">
                  Select the templates you would like to appear in this collection.
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#767676]">
                <span>{selectedTemplates.length} selected</span>
                <span>|</span>
                <button onClick={() => setShowSelected(!showSelected)} className="text-[#2b97cf] hover:underline">
                  {showSelected ? "Show all" : "Show selected"}
                </button>
              </div>

              {/* Templates Table */}
              <div className="border border-[#efefef] rounded-lg overflow-hidden">
                <div className="bg-[#f8f9fa] border-b border-[#efefef] px-6 py-3">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-[#374151]">
                    <div className="col-span-1">Select</div>
                    <div className="col-span-5">Template</div>
                    <div className="col-span-3">Visibility</div>
                    <div className="col-span-3">Updated</div>
                  </div>
                </div>

                <div className="divide-y divide-[#efefef]">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="px-6 py-4 hover:bg-[#f8f9fa]">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1">
                          <Checkbox
                            checked={selectedTemplates.includes(template.id)}
                            onCheckedChange={() => handleTemplateToggle(template.id)}
                            className="border-[#d9d9d9] data-[state=checked]:bg-[#2b97cf] data-[state=checked]:border-[#2b97cf] data-[state=checked]:text-white"
                          />
                        </div>
                        <div className="col-span-5 flex items-center gap-3">
                          <img
                            src={template.image || "/placeholder.svg"}
                            alt={template.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="text-sm text-[#374151]">{template.name}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm text-[#767676]">{template.visibility}</span>
                        </div>
                        <div className="col-span-3">
                          <span className="text-sm text-[#767676]">{template.updated}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pb-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-6 border-[#d9d9d9] text-[#767676] hover:bg-[#f8f9fa] bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="px-6 bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white">
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
