"use client"

import type React from "react"
import RealtimeProvider from "@/components/realtime/realtime-provider"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  Home,
  TrendingUp,
  Microscope,
  FlaskConical,
  Map,
  Bell,
  Settings,
  LogOut,
  Activity,
  Database,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "@/lib/auth-actions"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Disease Forecasting", href: "/dashboard/forecasting", icon: TrendingUp },
  { name: "Drug Discovery", href: "/dashboard/discovery", icon: FlaskConical },
  { name: "Research Projects", href: "/dashboard/projects", icon: Microscope },
  { name: "Climate Data", href: "/dashboard/climate", icon: Database },
  { name: "Global Map", href: "/dashboard/map", icon: Map },
  { name: "Real-time Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Analytics", href: "/dashboard/analytics", icon: Activity },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const NavItems = () => (
    <nav className="flex flex-col space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 bg-gray-900 border-gray-700">
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 py-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Microscope className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-white">GenPharamos</h1>
                    <p className="text-xs text-gray-400">VectorNet</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 px-4">
                <NavItems />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-gray-900 overflow-y-auto">
            <div className="flex items-center px-4 py-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Microscope className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-white">GenPharamos</h1>
                  <p className="text-xs text-gray-400">VectorNet</p>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4 pb-4">
              <NavItems />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top navigation */}
          <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                <h2 className="ml-2 text-xl font-semibold text-gray-900 lg:ml-0">
                  Climate-Driven AI Drug Discovery Platform
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">User Account</p>
                        <p className="text-xs leading-none text-muted-foreground">researcher@example.com</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </RealtimeProvider>
  )
}
