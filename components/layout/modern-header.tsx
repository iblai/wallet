"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, LogOut, User, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export function Header() {
  const [isInstructor, setIsInstructor] = useState(true)
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New message from MentorAI", time: "2 hours ago", read: false },
    { id: 2, message: 'Your task "Review Essay" is complete.', time: "Yesterday", read: false },
    { id: 3, message: 'New resource "AI Ethics Guide" added.', time: "3 days ago", read: true },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="bg-white border-b border-stroke px-6 py-[14px]">
      <div className="flex items-center justify-between">
        <div></div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className={cn("text-sm font-medium", !isInstructor ? "text-brand-primary" : "text-text-secondary")}>
              Learner
            </span>
            <Switch
              checked={isInstructor}
              onCheckedChange={setIsInstructor}
              className="data-[state=checked]:bg-brand-gradient"
            />
            <span className={cn("text-sm font-medium", isInstructor ? "text-brand-primary" : "text-text-secondary")}>
              Instructor
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 hover:bg-accent-blue rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-text-secondary" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-3">
                <p className="text-sm font-bold text-text-primary">Notifications</p>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-pointer px-4 py-3 focus:bg-gray-50">
                    <div className="flex items-start gap-3 w-full">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          notification.read ? "bg-gray-300" : "bg-brand-primary",
                        )}
                      />
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-sm",
                            notification.read ? "text-text-secondary" : "text-text-primary font-medium",
                          )}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="px-4 py-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-brand-primary hover:text-brand-primary font-medium w-full text-center py-1"
                >
                  Mark all as read
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src="/images/design-mode/profile_image%281%29%281%29%281%29%281%29(1).png"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
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
