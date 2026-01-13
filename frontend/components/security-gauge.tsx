"use client"

import { cn } from "@/lib/utils"

interface SecurityGaugeProps {
  score: number;
  label?: string; // [수정] label 속성 명시적 추가
}

export function SecurityGauge({ score, label }: SecurityGaugeProps) {
  let colorClass = "text-red-500";
  if (score >= 80) colorClass = "text-green-500";
  else if (score >= 60) colorClass = "text-yellow-500";

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-100">
        <span className={cn("text-3xl font-bold", colorClass)}>{Math.round(score)}</span>
        <span className="absolute text-xs bottom-6 text-muted-foreground">점</span>
      </div>
      {label && <span className="text-sm font-medium">{label} 등급</span>}
    </div>
  )
}