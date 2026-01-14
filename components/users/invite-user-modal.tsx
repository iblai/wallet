"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const handleInvite = () => {
    // Handle invite logic here
    console.log("[v0] Inviting user:", { email, role, firstName, lastName })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#e5e5e5]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[24px] font-semibold text-[#2d2d2d]">Invite User</DialogTitle>
            <button
              onClick={onClose}
              className="text-[#6b7280] hover:text-[#2d2d2d] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-[15px] text-[#6b7280] mb-6">
            Send an invitation to add a new user to your organization. They will receive an email with instructions to
            join.
          </p>

          <div className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-[14px] text-[#6b7280]">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="h-11 text-[15px]"
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first-name" className="text-[14px] text-[#6b7280]">
                First Name
              </Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="h-11 text-[15px]"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last-name" className="text-[14px] text-[#6b7280]">
                Last Name
              </Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="h-11 text-[15px]"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[14px] text-[#6b7280]">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 text-[15px] w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[13px] text-[#6b7280]">
                Admins have full access. Members can create and manage badges. Viewers have read-only access.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5e5e5] flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 px-6 text-[15px] border-[#d1d5db] hover:bg-[#f9fafb] bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!email || !role}
            className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white h-11 px-6 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
