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
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { handleLogout } from "@/lib/iblai/auth-utils"

/** Authenticated user, read from the session `userData` the SDK stores. */
interface SessionUser {
  name: string
  email: string
  avatar?: string
}

function readSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("userData")
    if (!raw) return null
    const d = JSON.parse(raw) as Record<string, string>
    const name = d.user_nicename || d.username || d.user_email || d.email || ""
    const email = d.email || d.user_email || ""
    const avatar = d.profile_image || d.avatar || d.image || undefined
    return { name, email, avatar }
  } catch {
    return null
  }
}

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)

  // `userData` is populated by the SSO callback before the app mounts; read
  // it on the client to avoid an SSR/hydration mismatch.
  useEffect(() => {
    setUser(readSessionUser())
  }, [])

  const initial = (user?.name || "U").charAt(0).toUpperCase()

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
                  {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                  <AvatarFallback className="bg-[#d9d9d9] text-gray-700">{initial}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-[#767676]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {user && (
                <>
                  <div className="px-3 py-3">
                    <p className="truncate text-sm font-semibold text-gray-700">{user.name || "Account"}</p>
                    {user.email && <p className="truncate text-xs text-[#767676]">{user.email}</p>}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="cursor-pointer py-4" onClick={() => router.push("/account")}>
                <User className="mr-3 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-4" onClick={() => handleLogout()}>
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
