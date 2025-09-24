"use client"

import { Bell, ChevronDown, LogOut, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Navbar() {
  const [notifications] = useState([
    { id: 1, message: "New credential template available", time: "2 hours ago", read: false },
    { id: 2, message: "Analytics report ready for review", time: "Yesterday", read: false },
    { id: 3, message: "Developer API key updated", time: "3 days ago", read: true },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="bg-white border-b border-[rgb(208,224,255)] px-6 py-[14px] w-full transition-all duration-300 sticky top-0 z-40">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 hover:bg-[#faf9f9] rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-[#767676]" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-3">
                <p className="text-sm font-bold text-gray-700">Notifications</p>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-pointer px-4 py-3 focus:bg-gray-50">
                    <div className="flex items-start gap-3 w-full">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          notification.read ? "bg-gray-300" : "bg-[#2b97cf]",
                        )}
                      />
                      <div className="flex-1">
                        <p
                          className={cn("text-sm", notification.read ? "text-[#767676]" : "text-gray-700 font-medium")}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#767676] mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/images/profile.png" />
                  <AvatarFallback className="bg-[#d9d9d9] text-gray-700">U</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-[#767676]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem className="cursor-pointer py-4">
                <User className="mr-3 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-4">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
