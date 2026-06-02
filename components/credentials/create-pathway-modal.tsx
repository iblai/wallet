"use client"

import { Plus, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createPathway, type PathwayPathItem } from "@/lib/iblai/catalog-api"
import { resolveAppTenant } from "@/lib/iblai/tenant"

interface SessionData {
  userId: number | null
  username: string
}

function readSession(): SessionData {
  if (typeof window === "undefined") return { userId: null, username: "" }
  try {
    const raw = localStorage.getItem("userData")
    if (!raw) return { userId: null, username: "" }
    const d = JSON.parse(raw) as Record<string, string | number>
    const userIdRaw = d.user_id ?? d.id ?? null
    const userId =
      typeof userIdRaw === "number"
        ? userIdRaw
        : typeof userIdRaw === "string"
          ? Number.parseInt(userIdRaw, 10) || null
          : null
    return {
      userId,
      username: String(d.user_nicename ?? d.username ?? ""),
    }
  } catch {
    return { userId: null, username: "" }
  }
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreatePathwayModal({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [visible, setVisible] = useState(true)
  const [courseIds, setCourseIds] = useState<string[]>([""])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setName("")
      setSlug("")
      setVisible(true)
      setCourseIds([""])
      setSubmitting(false)
      setError(null)
    }
  }, [open])

  const updateCourse = (idx: number, value: string) => {
    setCourseIds((prev) => prev.map((c, i) => (i === idx ? value : c)))
  }
  const addCourse = () => setCourseIds((prev) => [...prev, ""])
  const removeCourse = (idx: number) =>
    setCourseIds((prev) => prev.filter((_, i) => i !== idx))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { userId, username } = readSession()
    const platformKey = resolveAppTenant()
    if (!userId) {
      setError("Couldn't determine your user id from session.")
      return
    }
    if (!name.trim()) {
      setError("Pathway name is required.")
      return
    }
    const path: PathwayPathItem[] = courseIds
      .map((c) => c.trim())
      .filter(Boolean)
      .map((course_id) => ({ item_type: "course" as const, course_id }))
    if (path.length === 0) {
      setError("Add at least one course to the pathway.")
      return
    }

    setSubmitting(true)
    try {
      await createPathway({
        user_id: userId,
        username: username || undefined,
        platform_key: platformKey || undefined,
        name: name.trim(),
        slug: slug.trim() || undefined,
        visible,
        path,
      })
      onCreated?.()
    } catch (err) {
      setError(String((err as Error).message ?? err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>New Pathway</DialogTitle>
          <DialogDescription>
            Group courses into a learning pathway. Items are added in the order shown.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pathway-name">Name *</Label>
            <Input
              id="pathway-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Data Science Foundations"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pathway-slug">Slug</Label>
            <Input
              id="pathway-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated if empty"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="pathway-visible"
              checked={visible}
              onCheckedChange={(v) => setVisible(v === true)}
            />
            <Label htmlFor="pathway-visible" className="font-normal cursor-pointer">
              Visible to learners
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Courses *</Label>
              <button
                type="button"
                onClick={addCourse}
                className="text-xs font-medium text-[#2b97cf] hover:underline"
              >
                + Add course
              </button>
            </div>
            <div className="space-y-2">
              {courseIds.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={c}
                    onChange={(e) => updateCourse(i, e.target.value)}
                    placeholder="course-v1:Acme+CS101+2024"
                    className="font-mono text-sm"
                  />
                  {courseIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCourse(i)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove course"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#767676]">
              Enter an edX course id (e.g. <code>course-v1:org+number+run</code>). The pathway
              is created in the listed order.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2b97cf] hover:bg-[#2487b8] text-white gap-2"
              disabled={submitting}
            >
              {submitting ? "Saving…" : (
                <>
                  <Plus className="w-4 h-4" />
                  Save Pathway
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
