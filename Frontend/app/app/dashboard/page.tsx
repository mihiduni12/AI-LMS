"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, type User } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ClipboardCheck, FileText, Users, Lightbulb, TrendingUp, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  if (!user) return null

  const studentCards = [
    {
      title: "AI Learning Assistant",
      description: "Get help with Physics concepts in English or Sinhala",
      icon: <Lightbulb className="h-8 w-8 text-blue-600" />,
      href: "/app/tutor",
      color: "bg-blue-50",
    },
    {
      title: "Answer Evaluator",
      description: "Get your answers evaluated with detailed feedback",
      icon: <ClipboardCheck className="h-8 w-8 text-green-600" />,
      href: "/app/answer-evaluator",
      color: "bg-green-50",
    },
    {
      title: "Hint Generator",
      description: "Get progressive hints without revealing full answers",
      icon: <HelpCircle className="h-8 w-8 text-cyan-600" />,
      href: "/app/hint-generator",
      color: "bg-cyan-50",
    },
    {
      title: "Paper Generator",
      description: "Generate A/L Physics exam papers",
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      href: "/app/paper-generator",
      color: "bg-purple-50",
    },
    {
      title: "Paper History",
      description: "View and manage your generated papers",
      icon: <BookOpen className="h-8 w-8 text-orange-600" />,
      href: "/app/paper-generator/history",
      color: "bg-orange-50",
    },
  ]

  const adminCards = [
    {
      title: "User Management",
      description: "Manage system users and permissions",
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      href: "/app/admin/users",
      color: "bg-indigo-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">
          {user.role === "student" && "Continue your A/L Physics learning journey"}
          {user.role === "teacher" && "Manage your students and create learning materials"}
          {user.role === "admin" && "System overview and management"}
        </p>
      </div>

      {/* Stats Cards */}
      {user.role === "student" && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+4 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Papers Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Features */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{user.role === "admin" ? "Admin Tools" : "Learning Tools"}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {user.role === "student" &&
            studentCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`h-14 w-14 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                      {card.icon}
                    </div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full">
                      Open →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}

          {user.role === "teacher" &&
            studentCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`h-14 w-14 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                      {card.icon}
                    </div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full">
                      Open →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}

          {user.role === "admin" &&
            adminCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`h-14 w-14 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                      {card.icon}
                    </div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full">
                      Open →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      {user.role === "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Asked about Electricity concepts</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Evaluated essay answer - Score: 18/20</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Generated Medium difficulty paper</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
