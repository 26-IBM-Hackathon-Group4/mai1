"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Shield, Mail, Menu, Bell, Search, User, LogOut, ChevronDown, Settings, HelpCircle, Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEmailContext } from "@/lib/email-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { analyzeEmails, isAnalyzing } = useEmailContext() // [수정] analyzeEmails 가져오기

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-2 font-bold text-indigo-600">
            <Shield className="h-6 w-6" />
            <span className="text-lg">Mai1 Security</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            <li>
              <Link href="/" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}>
                <LayoutDashboard className="h-4 w-4" />
                대시보드
              </Link>
            </li>
            <li>
              <Link href="/services" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/services" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}>
                <Shield className="h-4 w-4" />
                가입 서비스
              </Link>
            </li>
            <li>
              {/* [수정] 이메일 분석(시연용) 버튼 */}
              <button
                onClick={() => analyzeEmails()}
                disabled={isAnalyzing}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-slate-600 hover:bg-slate-50 ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {isAnalyzing ? "분석 중..." : "이메일 분석"}
              </button>
            </li>
          </ul>
        </nav>
        {/* 하단 프리미엄 플랜 영역 생략 가능 */}
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                 {/* 모바일 메뉴 생략 */}
                 <div className="p-4">Mai1 Security</div>
              </SheetContent>
            </Sheet>
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input type="search" placeholder="서비스 검색..." className="w-64 rounded-full bg-slate-100 pl-9" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-0 hover:bg-transparent">
                  <Avatar className="h-8 w-8"><AvatarImage src="/placeholder.jpg" /><AvatarFallback>JD</AvatarFallback></Avatar>
                  <div className="hidden text-left text-sm md:block">
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-slate-500">Free Account</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><User className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
                <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50">
            {children}
        </main>
      </div>
    </div>
  )
}