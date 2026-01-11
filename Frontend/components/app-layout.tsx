"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, logout, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  UserIcon,
  Users,
  X,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MenuItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/app/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "AI Tutor",
    href: "/app/tutor",
    icon: <Lightbulb className="h-5 w-5" />,
    roles: ["student", "teacher"],
  },
  {
    title: "Answer Evaluator",
    href: "/app/answer-evaluator",
    icon: <ClipboardCheck className="h-5 w-5" />,
    roles: ["student", "teacher"],
  },
  {
    title: "Hint Generator",
    href: "/app/hint-generator",
    icon: <Lightbulb className="h-5 w-5" />,
    roles: ["student", "teacher"],
  },
  {
    title: "Paper Generator",
    href: "/app/paper-generator",
    icon: <FileText className="h-5 w-5" />,
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "Paper History",
    href: "/app/paper-generator/history",
    icon: <BookOpen className="h-5 w-5" />,
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "User Management",
    href: "/app/admin/users",
    icon: <Users className="h-5 w-5" />,
    roles: ["admin"],
  },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
    } else {
      setUser(currentUser)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getPageTitle = () => {
    const currentPath = pathname
    const item = menuItems.find((item) => item.href === currentPath)
    return item?.title || "StudyWise"
  }

  const filteredMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role))

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            SW
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                SW
              </div>
              <div>
                <h1 className="font-bold text-lg">StudyWise</h1>
                <p className="text-xs text-muted-foreground">A/L Physics</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Signed in as</div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-card border-r border-border">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    SW
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">StudyWise</h1>
                    <p className="text-xs text-muted-foreground">A/L Physics</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredMenuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn("w-full justify-start gap-3", isActive && "bg-blue-100 text-blue-700")}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Button>
                    </Link>
                  )
                })}
              </nav>

              {/* User info */}
              <div className="p-4 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">Signed in as</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
