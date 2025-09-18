import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  return (
    <header className="bg-white border-b border-[#efefef] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2b97cf] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">ibl</span>
          </div>
          <span className="text-[#2b97cf] font-semibold text-lg">.ai</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#767676] w-4 h-4" />
            <Input
              placeholder="Discover credentials, skills or organizations"
              className="pl-10 bg-[#faf9f9] border-[#d9d9d9] text-gray-700 placeholder:text-[#767676]"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-[#767676] hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="bg-[#d9d9d9] text-gray-700">U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
