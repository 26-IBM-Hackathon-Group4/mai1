"use client"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEmailContext } from "@/lib/email-context"
import { cn } from "@/lib/utils"

export function ServiceTable() {
  const { discoveredServices, selectService } = useEmailContext() // [수정] selectService 가져오기

  return (
    <Card className="flex-1 bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-medium text-slate-900">
          가입 서비스 목록 ({discoveredServices.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>서비스명</TableHead>
              <TableHead>도메인</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>보안 등급</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discoveredServices.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500">가입된 서비스가 없습니다.</TableCell></TableRow>
            ) : (
              discoveredServices.map((service) => (
                <TableRow 
                  key={service.user_service_id}
                  // [추가] 클릭 시 상세 페이지로 이동 (커서 포인터 추가)
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => selectService(service)}
                >
                  <TableCell className="font-medium text-indigo-600 hover:underline">
                    {service.service_name}
                  </TableCell>
                  <TableCell className="text-slate-500">{service.domain || "-"}</TableCell>
                  <TableCell className="text-slate-500">
                    {service.subscription_date ? new Date(service.subscription_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("hover:bg-opacity-80 border-transparent",
                        service.risk_level === "A" && "bg-green-100 text-green-700 hover:bg-green-200",
                        service.risk_level === "B" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                        (service.risk_level === "C" || !service.risk_level) && "bg-red-100 text-red-700 hover:bg-red-200"
                      )} variant="outline">
                      {service.risk_level || "Unknown"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}