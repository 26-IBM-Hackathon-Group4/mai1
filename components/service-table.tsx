"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, Mail, Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEmailContext, type Grade } from "@/lib/email-context"
import { Progress } from "@/components/ui/progress"

const gradeStyles: Record<Grade, string> = {
  A: "bg-emerald-500",
  B: "bg-yellow-400",
  C: "bg-orange-400",
  D: "bg-orange-500",
  F: "bg-red-500",
}

export function ServiceTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const { discoveredServices, isAnalyzing, analysisProgress, analyzeEmails, setSelectedService } = useEmailContext()

  const filteredServices = discoveredServices.filter((service) =>
    service.company.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="bg-white border-slate-100 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">가입 서비스 목록 ({discoveredServices.length})</h2>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span className="text-sm font-medium text-indigo-700">이메일 스캔 중...</span>
              <span className="text-xs text-indigo-500 ml-auto">{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-1.5" />
          </div>
        )}

        {/* Empty State */}
        {discoveredServices.length === 0 && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mb-4 h-12 w-12 text-slate-200" />
            <p className="text-slate-500 text-sm mb-1">아직 분석된 서비스가 없습니다</p>
            <p className="text-xs text-slate-400 mb-4">상단의 새로고침 버튼을 클릭하세요</p>
            <Button onClick={analyzeEmails} variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="h-3.5 w-3.5" />
              분석 시작
            </Button>
          </div>
        )}

        {discoveredServices.length > 0 && (
          <div className="rounded-lg border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="text-xs text-slate-500 font-medium">서비스명</TableHead>
                  <TableHead className="text-xs text-slate-500 font-medium">도메인</TableHead>
                  <TableHead className="text-xs text-slate-500 font-medium">가입일</TableHead>
                  <TableHead className="text-xs text-slate-500 font-medium">보안 등급</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow
                    key={service.id}
                    className="hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => setSelectedService(service)}
                  >
                    <TableCell className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                      {service.company}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{service.domain}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{service.lastAccess}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${gradeStyles[service.grade]}`}
                      >
                        {service.grade}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredServices.length === 0 && discoveredServices.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 h-10 w-10 text-slate-200" />
            <p className="text-slate-400 text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
