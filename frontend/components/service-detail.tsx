"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, Calendar, Globe, Mail } from "lucide-react"
import { useEmailContext } from "@/lib/email-context"
import { cn } from "@/lib/utils"

export function ServiceDetail() {
  const { selectedService, selectService } = useEmailContext()

  if (!selectedService) return null

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 뒤로가기 버튼 */}
      <Button 
        variant="ghost" 
        className="gap-2 pl-0 hover:bg-transparent hover:text-indigo-600"
        onClick={() => selectService(null)} // null로 설정하여 목록으로 복귀
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Button>

      {/* 헤더 카드 */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  {selectedService.service_name}
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-sm font-medium border-transparent",
                      selectedService.risk_level === "A" && "bg-green-100 text-green-700",
                      selectedService.risk_level === "B" && "bg-yellow-100 text-yellow-700",
                      (selectedService.risk_level === "C" || !selectedService.risk_level) && "bg-red-100 text-red-700"
                    )}
                  >
                    {selectedService.risk_level || "Unknown"} 등급
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-2 text-slate-500">
                  보안 점검 및 관리 상세 페이지
                </CardDescription>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                 {/* 서비스 로고 Placeholder */}
                 <span className="text-xl font-bold text-slate-400">
                    {selectedService.service_name.substring(0, 1)}
                 </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Globe className="h-3 w-3" /> 도메인
                </span>
                <p className="text-sm font-medium text-slate-900">{selectedService.domain || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> 가입일 (추정)
                </span>
                <p className="text-sm font-medium text-slate-900">
                  {selectedService.subscription_date 
                    ? new Date(selectedService.subscription_date).toLocaleDateString() 
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 보안 요약 카드 (우측) */}
        <Card className="border-slate-200 shadow-sm bg-slate-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" />
              보안 분석 리포트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                현재 <strong>{selectedService.service_name}</strong> 서비스는 
                <span className={cn(
                  "font-bold mx-1",
                  selectedService.risk_level === "A" && "text-green-600",
                  selectedService.risk_level === "B" && "text-yellow-600",
                  (selectedService.risk_level === "C" || !selectedService.risk_level) && "text-red-600"
                )}>
                   {selectedService.risk_level || "Unknown"} 등급
                </span>
                으로 평가됩니다.
              </p>
              <p className="text-xs text-slate-500 mt-4">
                * AI가 약관 및 개인정보 처리방침을 분석하여 산출한 결과입니다.
              </p>
            </div>
            <Button className="w-full mt-6 bg-white border-slate-200 text-slate-900 hover:bg-slate-50 hover:text-indigo-600" variant="outline">
              상세 리포트 보기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 하단 상세 정보 탭/영역 */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-medium">발견된 이메일 근거</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">가입 환영 이메일</p>
              <p className="text-xs text-slate-500">
                Email ID: {selectedService.evidence_email_id || "N/A"}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              메일 원문 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}