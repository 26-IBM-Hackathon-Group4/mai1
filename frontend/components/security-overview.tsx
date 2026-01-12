"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SecurityGauge } from "@/components/security-gauge"
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useEmailContext, type Grade } from "@/lib/email-context"
import { useMemo } from "react"

export function SecurityOverview() {
  const { discoveredServices, isAnalyzing } = useEmailContext()

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
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        label: "주의 필요",
        value: warningCount,
        icon: AlertTriangle,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
      },
      {
        label: "위험 탐지",
        value: dangerCount,
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      {
        label: "분석 완료",
        value: totalCount,
        icon: Shield,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {/* Security Gauge */}
      <Card className="md:col-span-2 lg:col-span-2 bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-slate-900">개인 보안 점수</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-4">
          {discoveredServices.length > 0 ? (
            <SecurityGauge score={score} grade={grade as Grade} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <Shield className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">
                {isAnalyzing ? "이메일 분석 중..." : "Gmail 분석을 시작하여 보안 점수를 확인하세요"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
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
