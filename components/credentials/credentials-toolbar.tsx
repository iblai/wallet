import { Search, Filter, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CredentialsToolbar() {
  return (
    <div className="bg-white px-8 py-4">
      <div className="flex items-center justify-between mb-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#767676] w-4 h-4" />
            <Input
              placeholder="Search"
              className="pl-10 bg-[#efefef] border-[#d9d9d9] text-gray-700 placeholder:text-[#767676] focus:bg-white focus:border-[#2b97cf] transition-colors"
            />
          </div>
        </div>

        <Button
          variant="outline"
          className="ml-4 text-gray-700 border-[#d9d9d9] hover:border-[#2b97cf] hover:text-[#2b97cf] transition-colors bg-transparent"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Results Count and Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">Showing 1-3 of 3</span>

        <div className="flex items-center gap-3">
          <Link href="/create-template">
            <Button className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="border-[#2b97cf] text-[#2b97cf] hover:bg-[#2b97cf]/10 transition-colors bg-transparent"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
