"use client"

import { ChevronDown } from "lucide-react"

const mockPathways = [
  {
    id: "1",
    name: "Building High Performance Teams",
    state: "Published",
    updated: "20 Sep 2024",
    issued: 36,
    image: "/team-collaboration-charts-graphs-business-analytic.jpg",
  },
  {
    id: "2",
    name: "Leadership is a language",
    state: "Published",
    updated: "16 Sep 2024",
    issued: 17,
    image: "/leadership-communication-speech-bubble-microphone.jpg",
  },
  {
    id: "3",
    name: "AI in Academia - Driving Innovation and Efficiency in...",
    state: "Published",
    updated: "16 Sep 2024",
    issued: 17,
    image: "/artificial-intelligence-brain-circuit-academic-gra.jpg",
  },
]

export function PathwaysTable() {
  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[rgb(208,224,255)] text-sm font-medium text-[#555d6b]">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">State</div>
        <div className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-[#2b97cf] transition-colors">
          Updated
          <ChevronDown className="w-4 h-4 text-[#767676]" />
        </div>
        <div className="col-span-2">Issued</div>
      </div>

      {/* Table Rows */}
      <div>
        {mockPathways.map((pathway, index) => (
          <div key={pathway.id}>
            <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#faf9f9] transition-colors cursor-pointer group">
              {/* Name Column */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 border-[#2b97cf]/20 shadow-sm bg-gradient-to-br from-[#2b97cf]/5 to-[#455aa1]/5">
                  <img
                    src={pathway.image || "/placeholder.svg"}
                    alt={pathway.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[#555d6b] font-medium group-hover:text-[#2b97cf] transition-colors">
                  {pathway.name}
                </span>
              </div>

              {/* State Column */}
              <div className="col-span-2 flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#2b97cf]/10 text-[#2b97cf] border border-[#2b97cf]/20">
                  {pathway.state}
                </span>
              </div>

              {/* Updated Column */}
              <div className="col-span-3 flex items-center">
                <span className="text-[#555d6b]">{pathway.updated}</span>
              </div>

              {/* Issued Column */}
              <div className="col-span-2 flex items-center">
                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-[#455aa1]/10 text-[#455aa1] text-sm font-medium border border-[#455aa1]/20">
                  {pathway.issued}
                </span>
              </div>
            </div>
            {index < mockPathways.length - 1 && <div className="border-b border-[rgb(208,224,255)]" />}
          </div>
        ))}
      </div>
    </div>
  )
}
