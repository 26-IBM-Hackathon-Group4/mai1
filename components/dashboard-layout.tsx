"use client"

import type React from "react"

import { useState } from "react"
import { Shield, LayoutDashboard, CircleDot, Mail, Menu, X, Bell, Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { icon: LayoutDashboard, label: "대시보드", href: "#dashboard", active: true },
  { icon: CircleDot, label: "가입 서비스", href: "#services" },
  { icon: Mail, label: "이메일 분석", href: "#email" },
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

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-white border-r border-slate-100 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-5">
          <div className="flex h-8 w-8 items-center justify-center">
            <Shield className="h-7 w-7 text-indigo-600" strokeWidth={1.5} />
          </div>
          <span className="text-base font-semibold text-indigo-600">Mai1 Security</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-slate-400 h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                item.active
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-slate-100 bg-white px-6">
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="서비스 검색..."
              className="pl-9 h-9 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                JD
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium text-slate-900">John Doe</span>
                <span className="text-xs text-slate-500">Free Account</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50/50">{children}</main>
      </div>
    </div>
  )
}
