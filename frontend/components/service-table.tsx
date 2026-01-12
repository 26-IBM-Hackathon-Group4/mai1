"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, AlertCircle, RefreshCw, Mail, Inbox } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEmailContext, type Grade } from "@/lib/email-context"
import { Progress } from "@/components/ui/progress"

const gradeStyles: Record<Grade, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  B: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  C: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  D: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  F: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
}

export function ServiceTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const { discoveredServices, isAnalyzing, analysisProgress, analyzeEmails } = useEmailContext()

  const filteredServices = discoveredServices.filter((service) =>
    service.company.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getActionButton = (grade: Grade) => {
    if (grade === "F") {
      return (
        <Button size="sm" className="gap-1.5 bg-red-600 hover:bg-red-700 text-white">
          <AlertCircle className="h-4 w-4" />
          탈퇴 권고
        </Button>
      )
    }
    if (grade === "C" || grade === "D") {
      return (
        <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white">
          <RefreshCw className="h-4 w-4" />
          비밀번호 변경 추천
        </Button>
      )
    }
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-100 bg-transparent"
      >
        <ExternalLink className="h-4 w-4" />
        상세 보기
      </Button>
    )
  }

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-medium text-slate-900">연결된 서비스 목록</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Gmail 받은편지함에서 발견된 가입 서비스</p>
        </div>
        <Button
          size="sm"
          onClick={analyzeEmails}
          disabled={isAnalyzing}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Gmail 분석
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span className="text-sm font-medium text-indigo-700">이메일 스캔 중...</span>
              <span className="text-xs text-indigo-500 ml-auto">{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            <p className="text-xs text-indigo-600 mt-2">환영, Welcome, 가입, 계정 생성 키워드를 검색하고 있습니다...</p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="회사명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Empty State */}
        {discoveredServices.length === 0 && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
            <Inbox className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-600 font-medium mb-1">아직 분석된 서비스가 없습니다</p>
            <p className="text-sm text-slate-400 mb-4">위의 Gmail 분석 버튼을 클릭하여 시작하세요</p>
            <Button onClick={analyzeEmails} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Mail className="h-4 w-4" />
              Gmail 분석 시작
            </Button>
          </div>
        )}

        {/* Table */}
        {discoveredServices.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-slate-600">회사명</TableHead>
                  <TableHead className="text-slate-600">AI 보안 등급</TableHead>
                  <TableHead className="text-slate-600">등급 사유</TableHead>
                  <TableHead className="text-slate-600">마지막 접속</TableHead>
                  <TableHead className="text-slate-600">권장 조치</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{service.company}</span>
                        <span className="text-xs text-slate-500">{service.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${gradeStyles[service.grade].bg} ${gradeStyles[service.grade].text} border ${gradeStyles[service.grade].border} font-bold`}
                      >
                        {service.grade}등급
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{service.reason}</span>
                    </TableCell>
                    <TableCell className="text-slate-500">{service.lastAccess}</TableCell>
                    <TableCell>{getActionButton(service.grade)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredServices.length === 0 && discoveredServices.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-500">검색 결과가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
