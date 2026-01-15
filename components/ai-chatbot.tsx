"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEmailContext } from "@/lib/email-context"

const aiResponses: Record<string, string> = {
  쿠팡: "구글 메일 분석 결과, 쿠팡에 가입하신 것을 확인했습니다. 해당 기업의 보안 등급은 F입니다. 최근 대규모 개인정보 유출 사고가 발생했습니다. 즉시 탈퇴를 권고합니다.",
  레거시쇼핑몰:
    "이 기업은 개인정보 유출 이력이 있어 F등급입니다. 서비스가 폐업 상태이므로 즉시 탈퇴를 권고합니다. 개인정보 삭제 요청도 함께 진행하시기 바랍니다.",
  해킹피해사이트:
    "이 사이트는 대규모 해킹 사고로 인해 F등급입니다. 귀하의 이메일과 비밀번호가 유출되었을 가능성이 높습니다. 탈퇴를 권고하며, 동일 비밀번호를 사용하는 다른 서비스의 비밀번호도 변경하시기 바랍니다.",
  페이스북:
    "페이스북은 현재 C등급입니다. 비밀번호를 90일 이상 변경하지 않았으며, 2단계 인증이 설정되어 있지 않습니다. 보안 강화를 위해 비밀번호 변경과 2단계 인증 설정을 추천합니다.",
  네이버: "네이버는 A등급으로 매우 안전한 상태입니다. 2단계 인증이 활성화되어 있고, 최근 보안 점검을 완료했습니다.",
  카카오: "카카오는 A등급으로 국내 최고 수준의 보안 시스템을 운영하고 있습니다. 안심하고 사용하셔도 됩니다.",
  토스: "토스는 A등급입니다. 금융 보안 최고 등급을 유지하며 실시간 이상거래 탐지 시스템이 작동 중입니다.",
  default: "해당 서비스에 대한 구체적인 정보를 분석 중입니다. 다른 서비스에 대해 궁금하신 점이 있으시면 말씀해 주세요.",
}

export function AIChatbot() {
  const { chatMessages, discoveredServices } = useEmailContext()
  const [localMessages, setLocalMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Combine context messages with local user messages
  const allMessages = [...chatMessages, ...localMessages]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [allMessages])

  const getAIResponse = (userMessage: string): string => {
    const loweredMessage = userMessage.toLowerCase()

    for (const [key, response] of Object.entries(aiResponses)) {
      if (key !== "default" && loweredMessage.includes(key.toLowerCase())) {
        return response
      }
    }

    if (loweredMessage.includes("보안") || loweredMessage.includes("점수")) {
      if (discoveredServices.length === 0) {
        return "아직 이메일 분석이 완료되지 않았습니다. '새로고침' 버튼을 클릭하여 가입된 서비스를 확인해 주세요."
      }
      const dangerCount = discoveredServices.filter((s) => s.grade === "F").length
      return `현재 ${discoveredServices.length}개의 서비스가 분석되었습니다. ${dangerCount}개의 위험(F등급) 서비스가 발견되어 즉각적인 조치가 필요합니다.`
    }

    if (loweredMessage.includes("위험") || loweredMessage.includes("f등급")) {
      const dangerServices = discoveredServices.filter((s) => s.grade === "F")
      if (dangerServices.length === 0) {
        return "현재 위험 등급(F)으로 분류된 서비스가 없습니다."
      }
      return `현재 F등급 위험 서비스는 ${dangerServices.length}개입니다: ${dangerServices.map((s) => `${s.company}(${s.reason})`).join(", ")}. 모든 서비스에서 즉시 탈퇴를 권고합니다.`
    }

    if (loweredMessage.includes("분석") || loweredMessage.includes("스캔")) {
      return "Gmail 받은편지함을 분석하여 '환영', 'Welcome', '가입', '계정 생성' 키워드가 포함된 이메일을 검색합니다. 발견된 서비스는 자동으로 보안 등급이 평가됩니다."
    }

    return aiResponses["default"]
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
    }

    setLocalMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: getAIResponse(userMessage.content),
      }
      setLocalMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="hidden w-72 flex-col bg-white border-slate-100 shadow-sm xl:flex">
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">PrivacyGuard AI</h3>
              <p className="text-xs text-indigo-500">AI 보안 어시스턴트에게 질문하세요</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-3">
            {allMessages.map((message) => (
              <div key={message.id} className={cn("flex gap-2.5", message.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    message.role === "assistant" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600",
                  )}
                >
                  {message.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={cn(
                    "max-w-[180px] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    message.role === "assistant" ? "bg-slate-100 text-slate-700" : "bg-indigo-600 text-white",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-slate-100 p-3">
          <div className="flex gap-2">
            <Input
              placeholder="메시지 입력..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-9 text-sm border-slate-200 focus-visible:ring-indigo-500"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
