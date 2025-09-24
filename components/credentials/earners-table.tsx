"use client"
import Image from "next/image"
import { ChevronDown } from "lucide-react"

const earnersData = [
  {
    id: 1,
    name: "Building High Performance Teams",
    image: "/team-collaboration-charts-graphs-business-analytic.jpg",
    user: "John Doe",
    dateRewarded: "20 Sep 2024",
    issued: 36,
  },
  {
    id: 2,
    name: "Leadership is a language",
    image: "/leadership-communication-speech-bubble-microphone.jpg",
    user: "Ashlynn Brown",
    dateRewarded: "16 Sep 2024",
    issued: 17,
  },
  {
    id: 3,
    name: "AI in Academia - Driving Innovation and Efficiency in...",
    image: "/artificial-intelligence-brain-circuit-academic-gra.jpg",
    user: "Mikel Amigot",
    dateRewarded: "16 Sep 2024",
    issued: 17,
  },
]

export function EarnersTable() {
  return (
    <div className="bg-white">
      <div className="px-8 py-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(208,224,255)]">
                <th className="text-left py-4 px-2 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-gray-700">User</th>
                <th className="text-left py-4 px-2 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1">
                    Date Rewarded
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-4 px-2 text-sm font-medium text-gray-700">Issued</th>
              </tr>
            </thead>
            <tbody>
              {earnersData.map((earner, index) => (
                <tr
                  key={earner.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    index < earnersData.length - 1 ? "border-b border-[rgb(208,224,255)]" : ""
                  }`}
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#2b97cf]/20 bg-gradient-to-br from-[#2b97cf]/10 to-[#2b97cf]/5">
                        <Image
                          src={earner.image || "/placeholder.svg"}
                          alt={earner.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{earner.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-gray-700">{earner.user}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm text-gray-700">{earner.dateRewarded}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-sm font-medium text-gray-900">{earner.issued}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
