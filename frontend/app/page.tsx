import { DashboardLayout } from "@/components/dashboard-layout"
import { SecurityOverview } from "@/components/security-overview"
import { MainContent } from "@/components/main-content"
import { ServiceTable } from "@/components/service-table"
import { AIChatbot } from "@/components/ai-chatbot"
import { EmailProvider } from "@/lib/email-context"

export default function Home() {
  return (
    <EmailProvider>
      <DashboardLayout>
        <div className="container mx-auto max-w-7xl p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">보안 대시보드</h1>
            <p className="text-slate-500">내 메일함에서 발견된 가입 서비스의 보안 상태를 확인하세요.</p>
          </div>

          {/* [수정] MainContent가 목록/상세를 알아서 보여줌 */}
          <div className="flex gap-6 relative">
            <div className="flex-1 min-w-0">
               <MainContent />
            </div>
            
            {/* 우측 챗봇 패널 (고정) */}
            <div className="hidden w-80 shrink-0 lg:block">
              <AIChatbot />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </EmailProvider>
  )
}