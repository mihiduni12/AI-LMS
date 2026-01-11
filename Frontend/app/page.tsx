"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/app/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
          SW
        </div>
        <p className="text-muted-foreground">Loading StudyWise...</p>
      </div>
    </div>
  )
}
