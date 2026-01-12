import { DashboardLayout } from "@/components/dashboard-layout"
import { SecurityOverview } from "@/components/security-overview"
import { ServiceTable } from "@/components/service-table"
import { AIChatbot } from "@/components/ai-chatbot"
import { EmailProvider } from "@/lib/email-context"

export default function DashboardPage() {
  return (
    <EmailProvider>
      <DashboardLayout>
        <div className="flex flex-1 gap-6 p-6">
          <div className="flex flex-1 flex-col gap-6">
            <SecurityOverview />
            <ServiceTable />
          </div>
          <AIChatbot />
        </div>
      </DashboardLayout>
    </EmailProvider>
  )
}
