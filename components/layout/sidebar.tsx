"use client"
import { useEffect, useRef, useState } from "react"
import { CreditCard, BarChart3, Code, User, GraduationCap, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import config from "@/lib/iblai/config"
import { resolveAppTenant } from "@/lib/iblai/tenant"

const navigationItems = [
  { id: "credentials", label: "Credentials", icon: CreditCard, href: "/" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
  { id: "developers", label: "Developers", icon: Code, href: "/developers" },
  { id: "account", label: "Account", icon: User, href: "/account" },
  { id: "academy", label: "Academy", icon: GraduationCap, href: "/academy" },
  { id: "support", label: "Support", icon: HelpCircle, href: "https://ibl.ai/docs", external: true as const },
] as const

type NavItem = (typeof navigationItems)[number]
const isExternal = (item: NavItem): boolean => "external" in item && item.external === true

function getOrgLogoUrl(tenantKey: string): string {
  // Org logo lives at `${DM}/api/core/orgs/{platformKey}/logo`. GET serves
  // the image bytes; uploads POST a multipart body to the same URL.
  if (!tenantKey) return ""
  return `${config.dmUrl().replace(/\/+$/, "")}/api/core/orgs/${encodeURIComponent(tenantKey)}/logo`
}

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()

  const activeNavItem = navigationItems.find((item) => item.href === pathname)?.id ?? null

  // Close the mobile drawer whenever the user navigates.
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onMobileClose?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Tenant logo: hit the AXD logo endpoint directly. It either returns the
  // org's uploaded PNG/JPG bytes, or 404 when no logo is set — `onError`
  // on the <img> swaps in the bundled ibl.ai logo in that case.
  const [tenantKey, setTenantKey] = useState("")
  useEffect(() => {
    setTenantKey(resolveAppTenant())
  }, [])

  // Cache buster: the image URL is stable, only its bytes change after an
  // upload. Bump the buster on sidebar tab change (pathname change) so a
  // freshly uploaded logo lands on next navigation. No focus / visibility
  // listeners — those were too aggressive and triggered re-downloads on
  // every alt-tab.
  const [cacheBust, setCacheBust] = useState<number>(() => Date.now())
  const prevPathname = useRef(pathname)
  useEffect(() => {
    if (prevPathname.current !== pathname) setCacheBust(Date.now())
    prevPathname.current = pathname
  }, [pathname])

  const orgLogoUrl = getOrgLogoUrl(tenantKey)
  const [orgLogoFailed, setOrgLogoFailed] = useState(false)
  // Reset the error flag whenever the cache buster changes so the new
  // URL gets one fresh attempt.
  useEffect(() => {
    setOrgLogoFailed(false)
  }, [cacheBust])
  const showOrgLogo = !!orgLogoUrl && !orgLogoFailed

  // Logo renders whenever the sidebar is expanded (every route — including
  // /account, since the Account page no longer carries its own logo).
  const showLogo = !isCollapsed

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-white border-r border-[rgb(208,224,255)] flex flex-col fixed left-0 top-0 h-screen z-50",
          "w-64 transition-transform duration-300 md:transition-all",
          // Mobile slide-in/out behavior. md+ ignores the transform.
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          // Desktop collapse: switch to a 64px rail on md+ when collapsed.
          isCollapsed && "md:w-16",
        )}
      >
        {/* Collapse toggle — desktop only; mobile uses the navbar hamburger. */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex absolute -right-4 top-[20px] w-8 h-8 bg-white border border-[rgb(208,224,255)] rounded-lg items-center justify-center hover:bg-[#faf9f9] transition-colors shadow-sm z-[60]"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#767676]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#767676]" />
            )}
          </button>
        )}

        <div
          className={cn(
            isCollapsed ? "py-[20px]" : "py-[16px]",
            "border-b border-[rgb(208,224,255)] flex items-center px-4",
          )}
        >
          {showLogo && (
            showOrgLogo ? (
              // Org logo from the DM logo endpoint. Unknown aspect ratio,
              // unknown size; use a plain <img>. onError falls back to the
              // bundled ibl.ai logo when the org hasn't uploaded one (404).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`org-logo-${cacheBust}`}
                src={`${orgLogoUrl}?t=${cacheBust}`}
                alt="Organization logo"
                className="h-14 max-w-[200px] w-auto object-contain"
                onError={() => setOrgLogoFailed(true)}
              />
            ) : (
              <Image
                src="/images/iblai-logo.png"
                alt="ibl.ai"
                width={168}
                height={71}
                priority
                className="h-14 w-auto"
              />
            )
          )}
        </div>

        <div className="p-4">{/* nav */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === activeNavItem

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id} delayDuration={300}>
                    <TooltipTrigger asChild>
                      {isExternal(item) ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full gap-2 text-gray-700 hover:bg-[#faf9f9] justify-center px-2",
                              isActive && "bg-[#2b97cf]/10 text-[#2b97cf] font-medium",
                            )}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                          </Button>
                        </a>
                      ) : (
                        <Link href={item.href} className="block">
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full gap-2 text-gray-700 hover:bg-[#faf9f9] justify-center px-2",
                              isActive && "bg-[#2b97cf]/10 text-[#2b97cf] font-medium",
                            )}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                          </Button>
                        </Link>
                      )}
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-gray-900 text-white border-gray-700 z-[100]"
                      sideOffset={8}
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              if (isExternal(item)) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full gap-2 text-gray-700 hover:bg-[#faf9f9] justify-start",
                        isActive && "bg-[#2b97cf]/10 text-[#2b97cf] font-medium",
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </Button>
                  </a>
                )
              }

              return (
                <Link key={item.id} href={item.href} className="block">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full gap-2 text-gray-700 hover:bg-[#faf9f9] justify-start",
                      isActive && "bg-[#2b97cf]/10 text-[#2b97cf] font-medium",
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}
