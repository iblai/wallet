"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface SignatureCanvasProps {
  isOpen: boolean
  onClose: () => void
  onSave: (signature: string) => void
}

export function SignatureCanvas({ isOpen, onClose, onSave }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = 200 * dpr

    ctx.scale(dpr, dpr)

    canvas.style.width = rect.width + "px"
    canvas.style.height = "200px"

    // Set drawing styles
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr)
  }, [isOpen])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    return {
      x: ((clientX - rect.left) * (canvas.width / rect.width)) / (window.devicePixelRatio || 1),
      y: ((clientY - rect.top) * (canvas.height / rect.height)) / (window.devicePixelRatio || 1),
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getCoordinates(e)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setIsEmpty(false)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getCoordinates(e)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    setIsEmpty(true)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return

    const dataURL = canvas.toDataURL("image/png")
    onSave(dataURL)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Draw Your Signature</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border border-[#d9d9d9] rounded-lg p-4 bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-48 cursor-crosshair border border-gray-200 rounded touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <p className="text-sm text-[#767676] text-center">Use your mouse or finger to draw your signature above</p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={clearCanvas}
            className="border-[#d9d9d9] text-[#767676] hover:bg-gray-50 bg-transparent"
          >
            Clear
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#d9d9d9] text-[#767676] hover:bg-gray-50 bg-transparent"
          >
            Cancel
          </Button>
          <Button onClick={saveSignature} disabled={isEmpty} className="bg-[#2b97cf] hover:bg-[#2b97cf]/90 text-white">
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
