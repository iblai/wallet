"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cloud, Check, Download } from "lucide-react"

export function IssueTab() {
  const [isValidated, setIsValidated] = useState(false)

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
        <p className="text-sm text-gray-600 mb-2">
          Upload a comma delimited text file (.csv) of up to 5,000 rows to import a list of badge earners to Credly. Be
          sure your CSV file is in the <span className="text-gray-900 font-medium">required format</span> and all
          required fields are completed. Access your organization{" "}
          <button className="text-[#2b97cf] hover:underline font-medium">template IDs</button> for setting up your CSV
          file.
        </p>

        <div className="flex justify-end mb-8">
          <button className="flex items-center gap-2 text-[#2b97cf] hover:underline text-sm font-medium">
            <Download className="w-4 h-4" />
            Download CSV template
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Cloud className="w-8 h-8 text-gray-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Select CSV or drag & drop it here</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wide">CSV</p>
          </div>

          <Button
            variant="outline"
            className="mt-4 border-gray-300 text-gray-700 hover:border-[#2b97cf] hover:text-[#2b97cf] transition-colors bg-transparent"
            onClick={() => setIsValidated(true)}
          >
            Upload CSV
          </Button>
        </div>
      </div>
    </div>
  )
}
