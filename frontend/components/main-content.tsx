"use client"

import { SecurityOverview } from "@/components/security-overview"
import { ServiceTable } from "@/components/service-table"
import { ServiceDetail } from "@/components/service-detail"
import { useEmailContext } from "@/lib/email-context"

export function MainContent() {
  const { selectedService } = useEmailContext()

  return (
    <div className="flex flex-1 flex-col gap-4">
      {selectedService ? (
        // Show detail view when a service is selected
        <ServiceDetail />
      ) : (
        // Show overview and table when no service is selected
        <>
          <SecurityOverview />
          <ServiceTable />
        </>
      )}
    </div>
  )
}
