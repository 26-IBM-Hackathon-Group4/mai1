"use client"

import { useEmailContext } from "@/lib/email-context"
import { SecurityOverview } from "@/components/security-overview"
import { ServiceTable } from "@/components/service-table"
import { ServiceDetail } from "@/components/service-detail"

export function MainContent() {
  const { selectedService } = useEmailContext()

  // 상세 페이지 모드
  if (selectedService) {
    return <ServiceDetail />
  }

  // 기본 대시보드 모드 (목록)
  return (
    <div className="space-y-6">
      <SecurityOverview />
      <ServiceTable />
    </div>
  )
}