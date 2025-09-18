import { ChevronDown } from "lucide-react"

interface CredentialItem {
  id: string
  name: string
  icon: string
  state: string
  updated: string
  issued: number
}

const credentialsData: CredentialItem[] = [
  {
    id: "1",
    name: "Building High Performance Teams",
    icon: "/placeholder.svg?height=40&width=40",
    state: "Published",
    updated: "20 Sep 2024",
    issued: 36,
  },
  {
    id: "2",
    name: "Leadership is a language",
    icon: "/placeholder.svg?height=40&width=40",
    state: "Published",
    updated: "16 Sep 2024",
    issued: 17,
  },
  {
    id: "3",
    name: "AI in Academia - Driving Innovation and Efficiency in...",
    icon: "/placeholder.svg?height=40&width=40",
    state: "Published",
    updated: "16 Sep 2024",
    issued: 17,
  },
]

export function CredentialsTable() {
  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#efefef] text-sm font-medium text-gray-700">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">State</div>
        <div className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-[#2b97cf] transition-colors">
          Updated
          <ChevronDown className="w-4 h-4 text-[#767676]" />
        </div>
        <div className="col-span-2">Issued</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[#efefef]">
        {credentialsData.map((credential) => (
          <div
            key={credential.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#faf9f9] transition-colors cursor-pointer group"
          >
            {/* Name Column */}
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#efefef] shadow-sm">
                <img
                  src={credential.icon || "/placeholder.svg"}
                  alt={credential.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-[#2b97cf] transition-colors">
                {credential.name}
              </span>
            </div>

            {/* State Column */}
            <div className="col-span-2 flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                {credential.state}
              </span>
            </div>

            {/* Updated Column */}
            <div className="col-span-3 flex items-center">
              <span className="text-gray-700">{credential.updated}</span>
            </div>

            {/* Issued Column */}
            <div className="col-span-2 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-[#faf9f9] text-gray-700 text-sm font-medium">
                {credential.issued}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
