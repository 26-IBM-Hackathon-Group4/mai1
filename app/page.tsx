import { DashboardLayout } from "@/components/dashboard-layout"
import { AIChatbot } from "@/components/ai-chatbot"
import { EmailProvider } from "@/lib/email-context"
import { MainContent } from "@/components/main-content"

export default function DashboardPage() {
  return (
    <EmailProvider>
      <DashboardLayout>
        <div className="flex flex-1 gap-4 p-5">
          <MainContent />
          <AIChatbot />
        </div>
      </DashboardLayout>
    </EmailProvider>
  )
}
