"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SecurityGauge } from "@/components/security-gauge"
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useEmailContext, type Grade } from "@/lib/email-context"
import { useMemo } from "react"

export function SecurityOverview() {
  const { discoveredServices, isAnalyzing, analyzeEmails } = useEmailContext()

  const stats = useMemo(() => {
    const safeCount = discoveredServices.filter((s) => s.grade === "A" || s.grade === "B").length
    const warningCount = discoveredServices.filter((s) => s.grade === "C" || s.grade === "D").length
    const dangerCount = discoveredServices.filter((s) => s.grade === "F").length
    const totalCount = discoveredServices.length

    return [
      {
        label: "안전 서비스",
        value: safeCount,
        icon: CheckCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-100",
      },
      {
        label: "주의 필요",
        value: warningCount,
        icon: AlertTriangle,
        color: "text-amber-500",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-100",
      },
      {
        label: "위험 탐지",
        value: dangerCount,
        icon: XCircle,
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-100",
      },
      {
        label: "분석 완료",
        value: totalCount,
        icon: Shield,
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        borderColor: "border-violet-100",
      },
    ]
  }, [discoveredServices])

  const { score, grade } = useMemo(() => {
    if (discoveredServices.length === 0) {
      return { score: 0, grade: "-" as const }
    }

    const gradeScores: Record<Grade, number> = { A: 100, B: 80, C: 60, D: 40, F: 20 }
    const totalScore = discoveredServices.reduce((sum, s) => sum + gradeScores[s.grade], 0)
    const avgScore = Math.round(totalScore / discoveredServices.length)

    let calculatedGrade: Grade = "A"
    if (avgScore >= 90) calculatedGrade = "A"
    else if (avgScore >= 70) calculatedGrade = "B"
    else if (avgScore >= 50) calculatedGrade = "C"
    else if (avgScore >= 30) calculatedGrade = "D"
    else calculatedGrade = "F"

    return { score: avgScore, grade: calculatedGrade }
  }, [discoveredServices])

  return (
    <div className="flex gap-4">
      {/* Security Gauge Card */}
      <Card className="bg-white border-slate-100 shadow-sm flex-shrink-0 w-[280px]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-700">개인 보안 점수</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={analyzeEmails}
              disabled={isAnalyzing}
              className="h-7 w-7 text-slate-400 hover:text-slate-600"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="flex items-center justify-center">
            {discoveredServices.length > 0 ? (
              <SecurityGauge score={score} grade={grade as Grade} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[180px] text-center">
                <div className="w-32 h-32 rounded-full border-[10px] border-slate-100 flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-slate-300">-</span>
                </div>
                <p className="text-xs text-slate-400">{isAnalyzing ? "분석 중..." : "새로고침을 클릭하세요"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {stats.map((stat) => (
          <Card key={stat.label} className={`bg-white border shadow-sm ${stat.borderColor}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
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
