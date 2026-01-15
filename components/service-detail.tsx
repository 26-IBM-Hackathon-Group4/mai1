"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ExternalLink,
  Settings,
  Trash2,
  Shield,
  Lock,
  Key,
  HardDrive,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { useEmailContext, type Grade } from "@/lib/email-context"

const gradeStyles: Record<Grade, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-emerald-100", text: "text-emerald-700", label: "A 등급" },
  B: { bg: "bg-yellow-100", text: "text-yellow-700", label: "B 등급" },
  C: { bg: "bg-orange-100", text: "text-orange-700", label: "C 등급" },
  D: { bg: "bg-orange-200", text: "text-orange-800", label: "D 등급" },
  F: { bg: "bg-red-100", text: "text-red-700", label: "F 등급" },
}

export function ServiceDetail() {
  const { selectedService, setSelectedService } = useEmailContext()

  if (!selectedService) return null

  const gradeStyle = gradeStyles[selectedService.grade]
  const { securityFeatures, securityScore } = selectedService

  // Calculate individual security scores based on features
  const featureScores = {
    encryption: securityFeatures.encryption ? 95 : 20,
    twoFactor: securityFeatures.twoFactor ? 90 : 15,
    dataBackup: securityFeatures.dataBackup ? 88 : 25,
    privacyPolicy: securityFeatures.privacyPolicy ? 92 : 30,
  }

  // Check for missing privacy items
  const missingFeatures = []
  if (!securityFeatures.twoFactor) missingFeatures.push("2단계 인증")
  if (!securityFeatures.encryption) missingFeatures.push("암호화")
  if (!securityFeatures.dataBackup) missingFeatures.push("데이터 백업")
  if (!securityFeatures.privacyPolicy) missingFeatures.push("개인정보 처리방침")

  return (
    <div className="flex flex-col gap-4">
      {/* Back Button */}
      <button
        onClick={() => setSelectedService(null)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        뒤로 가기
      </button>

      {/* Service Header Card */}
      <Card className="bg-white border-slate-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Service Icon */}
              <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{selectedService.company}</h1>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${gradeStyle.bg} ${gradeStyle.text}`}>
                    {gradeStyle.label}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">{selectedService.category}</p>
              </div>
            </div>

            {/* Security Score */}
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">보안 점수</p>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-4xl font-bold ${securityScore >= 70 ? "text-emerald-600" : securityScore >= 40 ? "text-orange-500" : "text-red-500"}`}
                >
                  {securityScore}
                </span>
                <span className="text-slate-400 text-sm">/ 100</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              onClick={() => window.open(`https://${selectedService.domain}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              웹사이트 방문
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Settings className="h-4 w-4" />
              설정 관리
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 ml-auto bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              계정 삭제
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Features & Account Info */}
      <div className="grid grid-cols-2 gap-4">
        {/* Security Features */}
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">보안 기능</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SecurityFeatureItem
                icon={<Key className="h-4 w-4" />}
                label="2단계 인증"
                enabled={securityFeatures.twoFactor}
              />
              <SecurityFeatureItem
                icon={<Lock className="h-4 w-4" />}
                label="암호화"
                enabled={securityFeatures.encryption}
              />
              <SecurityFeatureItem
                icon={<HardDrive className="h-4 w-4" />}
                label="데이터 백업"
                enabled={securityFeatures.dataBackup}
              />
              <SecurityFeatureItem
                icon={<FileText className="h-4 w-4" />}
                label="개인정보 처리방침"
                enabled={securityFeatures.privacyPolicy}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="bg-white border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">계정 정보</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">등록 이메일</p>
                <p className="text-sm text-slate-900">{selectedService.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">가입 방법</p>
                <p className="text-sm text-slate-900">Google 계정 연동</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">웹사이트</p>
                <a
                  href={`https://${selectedService.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  방문하기
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Banner - only show if missing features */}
      {missingFeatures.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">누락된 개인정보 보호 항목</h3>
              <p className="text-sm text-amber-700 mt-1">
                이 서비스의 개인정보 처리방침에 다음 항목이 누락되어 있어 보안 점수가 낮아졌습니다:{" "}
                {missingFeatures.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Score Details */}
      <Card className="bg-white border-slate-100 shadow-sm">
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">보안 점수 상세</h2>

          <div className="space-y-3">
            <ScoreDetailItem label="암호화" score={featureScores.encryption} />
            <ScoreDetailItem label="2단계 인증" score={featureScores.twoFactor} />
            <ScoreDetailItem label="데이터 백업" score={featureScores.dataBackup} />
            <ScoreDetailItem label="개인정보 처리방침" score={featureScores.privacyPolicy} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SecurityFeatureItem({
  icon,
  label,
  enabled,
}: {
  icon: React.ReactNode
  label: string
  enabled: boolean
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {enabled ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      )}
    </div>
  )
}

function ScoreDetailItem({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span
          className={`text-sm font-medium ${score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-600"}`}
        >
          {score}점
        </span>
      </div>
    </div>
  )
}
