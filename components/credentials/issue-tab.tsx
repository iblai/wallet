"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cloud, Check, Download, Upload, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function IssueTab() {
  const [isValidated, setIsValidated] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].name.endsWith(".csv")) {
      setSelectedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      setIsValidated(true)
      setShowUploadModal(false)
      setSelectedFile(null)
    }
  }

  if (isValidated) {
    return (
      <div className="bg-white px-8 py-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Complete the information below to issue badges.</h2>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 bg-[#2b97cf] rounded-lg flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Validation successful.</h3>
            <p className="text-sm text-gray-600">
              Ready to issue 1 badge from SMbulk_issue_template_20201119 (3).csv. Badge notifications will be sent.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white px-8">Issue</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white px-8 py-6">
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Upload a comma delimited text file (.csv) of up to 5,000 rows to import a list of badge earners to Credly. Be
          sure your CSV file is in the <span className="text-gray-900 font-medium">required format</span> and all
          required fields are completed. Access your organization{" "}
          <button className="text-[#2b97cf] hover:underline font-medium">template IDs</button> for setting up your CSV
          file.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button className="flex items-center gap-2 text-[#2b97cf] hover:underline text-sm font-medium">
            <Download className="w-4 h-4" />
            Download CSV template
          </button>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </Button>
        </div>
      </div>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload CSV File</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? "border-[#2b97cf] bg-[#2b97cf]/5" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Cloud className="w-8 h-8 text-gray-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedFile ? selectedFile.name : "Select CSV or drag & drop it here"}
                  </h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">CSV</p>
                </div>

                {selectedFile ? (
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleUpload} className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white">
                      Upload File
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedFile(null)} className="border-gray-300">
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="csv-upload" />
                    <label htmlFor="csv-upload">
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:border-[#2b97cf] hover:text-[#2b97cf] transition-colors bg-transparent cursor-pointer"
                        asChild
                      >
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
