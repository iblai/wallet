import { MainLayout } from "@/components/layout/main-layout"
import { CredentialsHeader } from "@/components/credentials/credentials-header"
import { CredentialsToolbar } from "@/components/credentials/credentials-toolbar"
import { CredentialsTable } from "@/components/credentials/credentials-table"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fefefe]">
        <CredentialsHeader />
        <CredentialsToolbar />

        <div className="border-t border-[#efefef]">
          <CredentialsTable />
        </div>
      </div>
    </MainLayout>
  )
}
