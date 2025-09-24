"use client"

const mockRecommendations = [
  {
    id: "1",
    recommendation: "10% off your next certification course",
    templates: 4,
    type: "Other",
    updated: "5 Feb 2025",
  },
  {
    id: "2",
    recommendation: "Consider our additional certifications",
    templates: 3,
    type: "Information",
    updated: "2 Oct 2024",
  },
  {
    id: "3",
    recommendation: "Fundamentals of Ruby on Rails",
    templates: 2,
    type: "Credential",
    updated: "3 Jun 2024",
  },
]

export function RecommendationsTable() {
  return (
    <div className="bg-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-[#efefef] text-sm font-medium text-[#767676]">
        <div className="col-span-4">Recommendation</div>
        <div className="col-span-2">Templates</div>
        <div className="col-span-3">Type</div>
        <div className="col-span-3">Updated</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[rgb(208,224,255)]">
        {mockRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="grid grid-cols-12 gap-4 px-8 py-6 hover:bg-[#faf9f9] transition-colors cursor-pointer"
          >
            <div className="col-span-4 flex items-center">
              <span className="text-sm text-gray-900 font-medium">{recommendation.recommendation}</span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-700">{recommendation.templates}</span>
            </div>
            <div className="col-span-3 flex items-center">
              <span className="text-sm text-gray-700">{recommendation.type}</span>
            </div>
            <div className="col-span-3 flex items-center">
              <span className="text-sm text-gray-700">{recommendation.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
