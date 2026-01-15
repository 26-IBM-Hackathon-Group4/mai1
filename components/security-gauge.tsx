"use client"

import type { Grade } from "@/lib/email-context"

interface SecurityGaugeProps {
  score: number
  grade: Grade
}

const gradeColors = {
  A: { stroke: "#10b981", text: "text-emerald-500" },
  B: { stroke: "#22c55e", text: "text-green-500" },
  C: { stroke: "#f59e0b", text: "text-amber-500" },
  D: { stroke: "#f97316", text: "text-orange-500" },
  F: { stroke: "#ef4444", text: "text-red-500" },
}

export function SecurityGauge({ score, grade }: SecurityGaugeProps) {
  const colors = gradeColors[grade]
  const circumference = 2 * Math.PI * 58
  const progress = (score / 100) * circumference
  const offset = circumference - progress

  return (
    <div className="relative flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle cx="80" cy="80" r="58" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
        {/* Center score text */}
        <text
          x="80"
          y="75"
          textAnchor="middle"
          fill={colors.stroke}
          className="text-4xl font-bold"
          fontSize="36"
          fontWeight="700"
        >
          {score}
        </text>
        <text x="80" y="98" textAnchor="middle" fill="#94a3b8" fontSize="14">
          점
        </text>
      </svg>
      <span className={`text-sm font-medium ${colors.text} -mt-1`}>{grade} 등급</span>
    </div>
  )
}
