"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SecurityGauge } from "@/components/security-gauge"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react"
import { useEmailContext } from "@/lib/email-context"

export function SecurityOverview() {
  const { discoveredServices, isAnalyzing, analyzeEmails, refreshList } = useEmailContext()

  // 통계 계산
  const stats = useMemo(() => {
    const safe = discoveredServices.filter((s) => s.risk_level === "A").length
    const warning = discoveredServices.filter((s) => s.risk_level === "B").length
    const danger = discoveredServices.filter((s) => s.risk_level === "C" || !s.risk_level).length
    return [
      { label: "안전 서비스", value: safe, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
      { label: "주의 필요", value: warning, icon: AlertTriangle, color: "text-amber-600", bgColor: "bg-amber-100" },
      { label: "위험 탐지", value: danger, icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
      { label: "분석 완료", value: discoveredServices.length, icon: Shield, color: "text-indigo-600", bgColor: "bg-indigo-100" },
    ]
  }, [discoveredServices])

  // 점수 계산
  const { score, grade } = useMemo(() => {
    if (discoveredServices.length === 0) return { score: 0, grade: "-" }
    const points: Record<string, number> = { A: 100, B: 70, C: 40 }
    const total = discoveredServices.reduce((sum, s) => sum + (points[s.risk_level || "C"] || 40), 0)
    const avg = Math.round(total / discoveredServices.length)
    let g = "C";
    if (avg >= 80) g = "A"; else if (avg >= 60) g = "B";
    return { score: avg, grade: g }
  }, [discoveredServices])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <Card className="md:col-span-2 lg:col-span-2 bg-white border-slate-200">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium text-slate-900">개인 보안 점수</CardTitle>
          
          {/* [수정] 조건 제거: 이제 데이터 유무와 상관없이 항상 보입니다 */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refreshList()} 
            className="h-8 w-8 text-slate-400 hover:text-indigo-600"
            title="목록 새로고침"
          >
              <RefreshCw className="h-4 w-4" />
          </Button>

        </CardHeader>
        <CardContent className="flex items-center justify-center py-4">
          {discoveredServices.length > 0 ? (
            <SecurityGauge score={score} label={grade} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-4">
              <Shield className="h-12 w-12 text-slate-300" />
              <div className="space-y-2">
                <p className="text-sm text-slate-500">{isAnalyzing ? "분석 중..." : "Gmail 분석을 시작하세요"}</p>
                {/* [수정] 분석 시작 버튼 (시연용 분류 로직 실행) */}
                {!isAnalyzing && (
                    <Button onClick={() => analyzeEmails()} className="bg-indigo-600 hover:bg-indigo-700 text-white">Gmail 분석 시작</Button>
                )}
                {isAnalyzing && (
                    <Button disabled variant="outline"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 분석 중</Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-3 lg:grid-cols-2">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white border-slate-200">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}