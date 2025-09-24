"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { CredentialsHeader } from "@/components/credentials/credentials-header"
import { CredentialsToolbar } from "@/components/credentials/credentials-toolbar"
import { CredentialsTable } from "@/components/credentials/credentials-table"
import { EarnersTable } from "@/components/credentials/earners-table"
import { PathwaysTable } from "@/components/credentials/pathways-table"
import { CollectionsTable } from "@/components/credentials/collections-table"
import { RecommendationsTable } from "@/components/credentials/recommendations-table"
import { IssueTab } from "@/components/credentials/issue-tab"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { useNavigation } from "@/hooks/use-navigation"

export default function HomePage() {
  const { activeTab, activeNavItem } = useNavigation()

  const renderTabContent = () => {
    switch (activeTab) {
      case "templates":
        return <CredentialsTable />
      case "earners":
        return <EarnersTable />
      case "pathways":
        return <PathwaysTable />
      case "collections":
        return <CollectionsTable />
      case "recommendations":
        return <RecommendationsTable />
      case "issue":
        return <IssueTab />
      default:
        return <CredentialsTable />
    }
  }

  const renderContent = () => {
    switch (activeNavItem) {
      case "analytics":
        return <AnalyticsDashboard />
      case "credentials":
      default:
        return (
          <div className="min-h-screen bg-[#fefefe]">
            <CredentialsHeader />
            <CredentialsToolbar />
            <div className="border-t border-[#efefef]">{renderTabContent()}</div>
          </div>
        )
    }
  }

  return <MainLayout>{renderContent()}</MainLayout>
}
