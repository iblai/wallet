"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload } from "lucide-react"
import Link from "next/link"

interface CreateCertificateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCertificateModal({ isOpen, onClose }: CreateCertificateModalProps) {
  const [name, setName] = useState("")
  const [size, setSize] = useState("letter")
  const [orientation, setOrientation] = useState("landscape")

  const handleConfirm = () => {
    // Handle certificate creation logic here
    console.log("[v0] Creating certificate:", { name, size, orientation })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-8">
        <DialogHeader>
          <DialogTitle className="text-[28px] font-serif font-normal text-[#2d2d2d]">
            Create custom certificate
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          {/* Description */}
          <p className="text-[15px] text-[#6b7280] leading-relaxed">
            Set your certificate preferences below. Your new certificate may take a few seconds to load. Once ready, the
            certificate editor will open in a new tab.
          </p>

          {/* Name Field */}
          <div className="space-y-3">
            <Label htmlFor="cert-name" className="text-[18px] font-semibold text-[#2d2d2d]">
              Name
            </Label>
            <Input
              id="cert-name"
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-[15px]"
            />
          </div>

          {/* Size Field */}
          <div className="space-y-3">
            <Label className="text-[18px] font-semibold text-[#2d2d2d]">Size</Label>
            <RadioGroup value={size} onValueChange={setSize} className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="letter" id="letter" className="border-[#2b97cf] text-[#2b97cf]" />
                <Label htmlFor="letter" className="text-[15px] text-[#2d2d2d] font-normal cursor-pointer">
                  Letter
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="a4" id="a4" className="border-[#2b97cf] text-[#2b97cf]" />
                <Label htmlFor="a4" className="text-[15px] text-[#2d2d2d] font-normal cursor-pointer">
                  A4
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Orientation Field */}
          <div className="space-y-3">
            <Label className="text-[18px] font-semibold text-[#2d2d2d]">Orientation</Label>
            <RadioGroup value={orientation} onValueChange={setOrientation} className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="landscape" id="landscape" className="border-[#2b97cf] text-[#2b97cf]" />
                <Label htmlFor="landscape" className="text-[15px] text-[#2d2d2d] font-normal cursor-pointer">
                  Landscape
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="portrait" id="portrait" className="border-[#2b97cf] text-[#2b97cf]" />
                <Label htmlFor="portrait" className="text-[15px] text-[#2d2d2d] font-normal cursor-pointer">
                  Portrait
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Background Field */}
          <div className="space-y-3">
            <Label className="text-[18px] font-semibold text-[#2d2d2d]">Background</Label>
            <Link href="#" className="flex items-center gap-2 text-[15px] text-[#2b97cf] hover:underline w-fit">
              <Upload className="w-4 h-4" />
              Upload Background
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="link"
              onClick={onClose}
              className="text-[#2b97cf] hover:text-[#2b97cf]/80 p-0 h-auto text-[15px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white h-11 px-8 text-[15px]"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
