"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet/provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Stands in for the SDK's UserProfileDropdown in demo mode (no platform to fetch the avatar from). */
export function DemoUserMenu() {
  const { state } = useWallet();
  const initials = state.profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex size-9 items-center justify-center rounded-full bg-[#0ea5e9] text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="text-sm font-medium text-gray-900">{state.profile.name}</div>
            <div className="text-muted-foreground text-xs font-normal">{state.profile.email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>Profile</DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/p/demo-wallet/${state.profile.username}`} />}>
          Public wallet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile#connect" />}>
          Connect ibl.ai organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
