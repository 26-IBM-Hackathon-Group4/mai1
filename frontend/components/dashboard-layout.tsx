"use client"

import type React from "react"

import { useState } from "react"
import { Shield, BarChart3, AlertTriangle, Settings, Menu, X, ShieldCheck, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { icon: Shield, label: "보안 개요", href: "#overview", active: true },
  { icon: BarChart3, label: "서비스 분석", href: "#analysis" },
  { icon: AlertTriangle, label: "위험 평가", href: "#risk" },
  { icon: Settings, label: "설정", href: "#settings" },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Light mode with white bg and slate borders */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">PrivacyGuard</span>
            <span className="text-xs text-slate-500">AI 보안 어시스턴트</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Google Account Display */}
        <div className="mx-4 mt-4 rounded-lg bg-slate-50 p-3 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-900">연결된 계정</span>
              <span className="text-xs text-slate-500">user@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                item.active ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
              김
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">김보안</span>
              <span className="text-xs text-slate-500">보안 관리자</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-slate-900">보안 대시보드</h1>
            <p className="text-xs text-slate-500">이메일 연결 서비스의 보안 상태를 확인하세요</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700">실시간 모니터링</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
      </div>
    </div>
  )
}
