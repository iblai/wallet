"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface Collection {
  id: string
  collection: string
  templates: number
  validity: string
  updated: string
}

const initialCollections: Collection[] = [
  {
    id: "1",
    collection: "Intro Courses",
    templates: 4,
    validity: "Private",
    updated: "5 Feb 2025",
  },
  {
    id: "2",
    collection: "Programming",
    templates: 3,
    validity: "Public",
    updated: "2 Oct 2024",
  },
  {
    id: "3",
    collection: "Partners",
    templates: 2,
    validity: "Private",
    updated: "3 Jun 2024",
  },
]

export function CollectionsTable() {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)
  const router = useRouter()

  const handleRowClick = (collection: Collection) => {
    router.push(`/create-collection?edit=${collection.id}`)
  }

  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-[#efefef] text-sm font-medium text-[#767676]">
        <div className="col-span-4">Collection</div>
        <div className="col-span-2">Templates</div>
        <div className="col-span-3 flex items-center gap-1">
          Validity
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="col-span-3">Updated</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[rgb(208,224,255)]">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="grid grid-cols-12 gap-4 px-8 py-6 hover:bg-[#faf9f9] transition-colors cursor-pointer"
            onClick={() => handleRowClick(collection)}
          >
            <div className="col-span-4 flex items-center">
              <span className="text-sm text-gray-900 font-medium">{collection.collection}</span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-700">{collection.templates}</span>
            </div>
            <div className="col-span-3 flex items-center">
              <span className="text-sm text-gray-700">{collection.validity}</span>
            </div>
            <div className="col-span-3 flex items-center">
              <span className="text-sm text-gray-700">{collection.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
