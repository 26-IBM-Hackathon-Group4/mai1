"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export type Grade = "A" | "B" | "C" | "D" | "F"

export interface DiscoveredService {
  id: string
  company: string
  grade: Grade
  lastAccess: string
  email: string
  riskFactors: string[]
  reason: string
  category: string
  domain: string
  securityScore: number
  securityFeatures: {
    twoFactor: boolean
    encryption: boolean
    dataBackup: boolean
    privacyPolicy: boolean
  }
}

interface EmailContextType {
  discoveredServices: DiscoveredService[]
  isAnalyzing: boolean
  analysisProgress: number
  lastAnalysisMessages: string[]
  analyzeEmails: () => Promise<void>
  addChatMessage: (message: string) => void
  chatMessages: { role: "user" | "assistant"; content: string; id: string }[]
  selectedService: DiscoveredService | null
  setSelectedService: (service: DiscoveredService | null) => void
}

const EmailContext = createContext<EmailContextType | undefined>(undefined)

// Simulated Gmail inbox with welcome/signup emails
const simulatedEmails: { id: string; sender: string; subject: string; date: string; company: string }[] = [
  {
    id: "1",
    sender: "Coupang",
    subject: "쿠팡에 가입을 환영합니다!",
    date: "2024.01.09",
    company: "쿠팡",
  },
  {
    id: "2",
    sender: "Naver",
    subject: "네이버 계정 생성이 완료되었습니다",
    date: "2024.01.08",
    company: "네이버",
  },
  {
    id: "3",
    sender: "Kakao",
    subject: "카카오 Welcome! 가입을 축하합니다",
    date: "2024.01.07",
    company: "카카오",
  },
  {
    id: "4",
    sender: "Facebook",
    subject: "Welcome to Facebook! 계정 생성",
    date: "2023.12.15",
    company: "페이스북",
  },
  {
    id: "5",
    sender: "Toss",
    subject: "토스 가입을 환영합니다",
    date: "2024.01.05",
    company: "토스",
  },
  {
    id: "6",
    sender: "LegacyMall",
    subject: "레거시쇼핑몰 회원가입 완료",
    date: "2023.06.01",
    company: "레거시쇼핑몰",
  },
  {
    id: "7",
    sender: "BreachedSite",
    subject: "환영합니다! 해킹피해사이트 가입",
    date: "2023.03.15",
    company: "해킹피해사이트",
  },
]

const securityDatabase: {
  grade: Grade
  reason: string
  riskFactors: string[]
  category: string
  securityScore: number
  securityFeatures: {
    twoFactor: boolean
    encryption: boolean
    dataBackup: boolean
    privacyPolicy: boolean
  }
} = {
  쿠팡: {
    grade: "F",
    reason: "최근 대규모 개인정보 유출 사고 발생",
    riskFactors: ["개인정보 유출 이력", "보안 시스템 취약점 발견"],
    category: "쇼핑",
    securityScore: 23,
    securityFeatures: { twoFactor: false, encryption: false, dataBackup: false, privacyPolicy: false },
  },
  네이버: {
    grade: "A",
    reason: "강력한 보안 인프라 및 2단계 인증 지원",
    riskFactors: [],
    category: "포털",
    securityScore: 95,
    securityFeatures: { twoFactor: true, encryption: true, dataBackup: true, privacyPolicy: true },
  },
  카카오: {
    grade: "A",
    reason: "국내 최고 수준의 보안 시스템 운영",
    riskFactors: [],
    category: "커뮤니케이션",
    securityScore: 92,
    securityFeatures: { twoFactor: true, encryption: true, dataBackup: true, privacyPolicy: true },
  },
  페이스북: {
    grade: "C",
    reason: "과거 개인정보 취급 논란 및 비밀번호 장기 미변경",
    riskFactors: ["비밀번호 변경 권장", "2단계 인증 미설정"],
    category: "소셜 미디어",
    securityScore: 58,
    securityFeatures: { twoFactor: false, encryption: true, dataBackup: false, privacyPolicy: true },
  },
  토스: {
    grade: "A",
    reason: "금융 보안 최고 등급, 실시간 이상거래 탐지",
    riskFactors: [],
    category: "금융",
    securityScore: 98,
    securityFeatures: { twoFactor: true, encryption: true, dataBackup: true, privacyPolicy: true },
  },
  레거시쇼핑몰: {
    grade: "F",
    reason: "서비스 폐업 후 개인정보 관리 부재",
    riskFactors: ["개인정보 유출 이력", "폐업 서비스"],
    category: "쇼핑",
    securityScore: 12,
    securityFeatures: { twoFactor: false, encryption: false, dataBackup: false, privacyPolicy: false },
  },
  해킹피해사이트: {
    grade: "F",
    reason: "대규모 해킹 사고로 인한 개인정보 유출 확인",
    riskFactors: ["대규모 해킹 사고", "개인정보 유출 확인"],
    category: "기타",
    securityScore: 5,
    securityFeatures: { twoFactor: false, encryption: false, dataBackup: false, privacyPolicy: false },
  },
}

export function EmailProvider({ children }: { children: React.ReactNode }) {
  const [discoveredServices, setDiscoveredServices] = useState<DiscoveredService[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [lastAnalysisMessages, setLastAnalysisMessages] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState<DiscoveredService | null>(null)
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string; id: string }[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요! PrivacyGuard AI입니다. '분석' 버튼을 클릭하여 Gmail 받은편지함을 스캔하고 가입된 서비스를 확인하세요.",
    },
  ])

  const addChatMessage = useCallback((content: string) => {
    setChatMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content }])
  }, [])

  const analyzeEmails = useCallback(async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setDiscoveredServices([])
    setLastAnalysisMessages([])

    const keywords = ["환영", "Welcome", "가입", "계정 생성"]

    for (let i = 0; i < simulatedEmails.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const email = simulatedEmails[i]
      const matchesKeyword = keywords.some(
        (keyword) => email.subject.includes(keyword) || email.sender.toLowerCase().includes(keyword.toLowerCase()),
      )

      if (matchesKeyword) {
        const securityInfo = securityDatabase[email.company] || {
          grade: "B" as Grade,
          reason: "보안 정보 수집 중",
          riskFactors: [],
          category: "기타",
          securityScore: 70,
          securityFeatures: { twoFactor: false, encryption: true, dataBackup: false, privacyPolicy: true },
        }

        const newService: DiscoveredService = {
          id: email.id,
          company: email.company,
          grade: securityInfo.grade,
          lastAccess: email.date,
          email: "user@gmail.com",
          riskFactors: securityInfo.riskFactors,
          reason: securityInfo.reason,
          category: securityInfo.category,
          domain: `${email.sender.toLowerCase()}.com`,
          securityScore: securityInfo.securityScore,
          securityFeatures: securityInfo.securityFeatures,
        }

        setDiscoveredServices((prev) => [...prev, newService])

        if (securityInfo.grade === "F") {
          const message = `구글 메일을 분석한 결과, ${email.company}에 가입하신 것을 확인했습니다. 해당 기업의 보안 등급은 F입니다. 사유: ${securityInfo.reason}. 탈퇴를 권고합니다.`
          setLastAnalysisMessages((prev) => [...prev, message])
          addChatMessage(message)
        }
      }

      setAnalysisProgress(((i + 1) / simulatedEmails.length) * 100)
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    const finalServices = simulatedEmails
      .filter((email) =>
        keywords.some(
          (keyword) => email.subject.includes(keyword) || email.sender.toLowerCase().includes(keyword.toLowerCase()),
        ),
      )
      .map((e) => e.company)

    const dangerousCount = finalServices.filter((company) => securityDatabase[company]?.grade === "F").length

    const summaryMessage = `분석 완료! 총 ${finalServices.length}개의 가입 서비스를 발견했습니다. ${dangerousCount}개의 위험(F등급) 서비스가 있어 즉각적인 조치가 필요합니다.`
    addChatMessage(summaryMessage)

    setIsAnalyzing(false)
  }, [addChatMessage])

  return (
    <EmailContext.Provider
      value={{
        discoveredServices,
        isAnalyzing,
        analysisProgress,
        lastAnalysisMessages,
        analyzeEmails,
        addChatMessage,
        chatMessages,
        selectedService,
        setSelectedService,
      }}
    >
      {children}
    </EmailContext.Provider>
  )
}

export function useEmailContext() {
  const context = useContext(EmailContext)
  if (context === undefined) {
    throw new Error("useEmailContext must be used within an EmailProvider")
  }
  return context
}
