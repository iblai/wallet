"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ImageOption {
  id: string
  url: string
  name: string
}

interface ImageSelectorProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

// Mock image options - in real app this would come from API
const mockImageOptions: ImageOption[] = [
  { id: "1", url: "/ruby-rails-logo.jpg", name: "Ruby on Rails" },
  { id: "2", url: "/javascript-logo.png", name: "JavaScript" },
  { id: "3", url: "/hackathon-badge.jpg", name: "Hackathon Badge" },
  { id: "4", url: "/python-data-logo.jpg", name: "Python Data" },
  { id: "5", url: "/partner-badge.jpg", name: "Partner Badge" },
  { id: "6", url: "/collection-badge.jpg", name: "Collection Badge" },
  { id: "7", url: "/certificate-template.png", name: "Certificate" },
  { id: "8", url: "/achievement-badge.png", name: "Achievement" },
  { id: "9", url: "/course-completion.jpg", name: "Course Badge" },
  { id: "10", url: "/skill-verification.jpg", name: "Skill Badge" },
  { id: "11", url: "/training-program.png", name: "Training" },
  { id: "12", url: "/professional-certification.jpg", name: "Professional" },
]

export function ImageSelector({ value, onChange, placeholder = "Select an image" }: ImageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredImages = mockImageOptions.filter((image) =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedImage = mockImageOptions.find((img) => img.url === value)

  const handleImageSelect = (imageUrl: string) => {
    onChange(imageUrl)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange("")
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-start border-[#d9d9d9] hover:bg-[#f8f9fa] text-left bg-transparent"
            >
              {selectedImage ? (
                <div className="flex items-center gap-2">
                  <img
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                  <span className="text-[#374151]">{selectedImage.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#767676]">
                  <Search className="w-4 h-4" />
                  <span>{placeholder}</span>
                </div>
              )}
            </Button>
          </DialogTrigger>

          {value && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
              className="border-[#d9d9d9] hover:bg-[#f8f9fa] bg-transparent"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select Collection Image</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#767676]" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-[#d9d9d9] focus:border-[#2b97cf]"
                />
              </div>

              {/* Upload Option */}
              <div className="border-2 border-dashed border-[#d9d9d9] rounded-lg p-6 text-center hover:border-[#2b97cf] transition-colors">
                <Upload className="w-8 h-8 text-[#767676] mx-auto mb-2" />
                <p className="text-sm text-[#767676] mb-2">Upload your own image</p>
                <Button variant="outline" size="sm" className="border-[#d9d9d9] text-[#767676] bg-transparent">
                  Choose File
                </Button>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer rounded-lg border-2 transition-all hover:border-[#2b97cf] ${
                      value === image.url ? "border-[#2b97cf] bg-[#2b97cf]/5" : "border-[#efefef]"
                    }`}
                    onClick={() => handleImageSelect(image.url)}
                  >
                    <div className="aspect-square p-2">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-black/75 text-white text-xs p-2 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                      {image.name}
                    </div>
                    {value === image.url && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#2b97cf] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredImages.length === 0 && (
                <div className="text-center py-8 text-[#767676]">
                  <p>No images found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview */}
      {selectedImage && (
        <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg border border-[#efefef]">
          <img
            src={selectedImage.url || "/placeholder.svg"}
            alt={selectedImage.name}
            className="w-12 h-12 rounded object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#374151]">{selectedImage.name}</p>
            <p className="text-xs text-[#767676]">Selected as collection thumbnail</p>
          </div>
        </div>
      )}
    </div>
  )
}
