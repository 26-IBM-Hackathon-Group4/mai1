"use client"

import type { Grade } from "@/lib/email-context"

interface SecurityGaugeProps {
  score: number
  grade: Grade
}

const gradeColors = {
  A: { stroke: "#16a34a", text: "text-green-600", bg: "bg-green-600" },
  B: { stroke: "#22c55e", text: "text-green-500", bg: "bg-green-500" },
  C: { stroke: "#f59e0b", text: "text-amber-500", bg: "bg-amber-500" },
  D: { stroke: "#f97316", text: "text-orange-500", bg: "bg-orange-500" },
  F: { stroke: "#dc2626", text: "text-red-600", bg: "bg-red-600" },
}

const gradeDescriptions = {
  A: "매우 안전",
  B: "안전",
  C: "보통",
  D: "주의 필요",
  F: "위험",
}

export function SecurityGauge({ score, grade }: SecurityGaugeProps) {
  const colors = gradeColors[grade]
  const circumference = 2 * Math.PI * 80
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
        {/* Center text */}
        <text x="100" y="85" textAnchor="middle" fill={colors.stroke} className="text-5xl font-bold">
          {grade}
        </text>
        <text x="100" y="115" textAnchor="middle" fill="#64748b" className="text-lg">
          {score}점
        </text>
      </svg>
      <div className="mt-2 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${colors.bg}`} />
        <span className="text-sm font-medium text-slate-700">{gradeDescriptions[grade]}</span>
      </div>
    </div>
  )
}
