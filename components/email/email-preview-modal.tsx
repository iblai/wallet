"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface EmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  subject: string
  header: string
  body: string
}

export function EmailPreviewModal({ isOpen, onClose, subject, header, body }: EmailPreviewModalProps) {
  const [viewMode, setViewMode] = useState<"html" | "plaintext">("html")

  const handleViewBadge = () => {
    window.open("/badge-preview", "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[32px] font-serif font-normal text-[#2d2d2d]">Email Preview</DialogTitle>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant={viewMode === "html" ? "default" : "outline"}
              onClick={() => setViewMode("html")}
              className={`h-11 px-6 text-[15px] rounded-full ${
                viewMode === "html"
                  ? "bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white"
                  : "border-[#d1d5db] hover:bg-[#f9fafb] text-[#6b7280]"
              }`}
            >
              HTML
            </Button>
            <Button
              variant={viewMode === "plaintext" ? "default" : "outline"}
              onClick={() => setViewMode("plaintext")}
              className={`h-11 px-6 text-[15px] rounded-full ${
                viewMode === "plaintext"
                  ? "bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white"
                  : "border-[#d1d5db] hover:bg-[#f9fafb] text-[#6b7280]"
              }`}
            >
              Plaintext
            </Button>
          </div>

          {/* Subject Line */}
          <div className="mb-6">
            <p className="text-[16px] font-semibold text-[#2d2d2d]">Subject: {subject}</p>
          </div>

          {/* Email Preview Content */}
          <div className="bg-white border border-[#e5e5e5] rounded-lg p-8">
            {viewMode === "html" ? (
              <div className="space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                  <img src="/images/logo.png" alt="Organization Logo" className="h-16 object-contain" />
                </div>

                {/* Header */}
                <div className="text-center">
                  <h2 className="text-[32px] font-bold text-[#2d2d2d] leading-tight">
                    {header.replace("%{badge_name}", "Fundamentals of Ruby on Rails I")}
                  </h2>
                </div>

                {/* Body */}
                <div className="text-center">
                  <p className="text-[18px] text-[#6b7280]">{body.replace("%{earner_name}", "Jane Marie Doe")}</p>
                </div>

                {/* Badge Image */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 rounded-full bg-[#1e3a8a] flex items-center justify-center border-4 border-[#1e3a8a]">
                    <div className="text-center">
                      <img src="/images/logo.png" alt="Badge" className="h-16 mx-auto mb-2 opacity-90" />
                      <div className="bg-[#2b97cf] text-white text-[14px] font-semibold px-4 py-2 rounded">
                        RUBY ON RAILS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge Details */}
                <div className="text-center space-y-2">
                  <p className="text-[16px] text-[#6b7280] font-medium">Fundamentals of Ruby on Rails I</p>
                  <p className="text-[14px] text-[#8a8a8a]">Issuer: Lincoln Technologies</p>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleViewBadge}
                    className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white h-12 px-8 text-[15px]"
                  >
                    View Badge
                  </Button>
                </div>
              </div>
            ) : (
              <div className="font-mono text-[14px] text-[#2d2d2d] whitespace-pre-wrap">
                {`${header.replace("%{badge_name}", "Fundamentals of Ruby on Rails I")}

${body.replace("%{earner_name}", "Jane Marie Doe")}

Fundamentals of Ruby on Rails I
Issuer: Lincoln Technologies

View your badge at: [Badge URL]`}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
