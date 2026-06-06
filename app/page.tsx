"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminPanel } from "@/components/admin-panel"
import { BlogHome } from "@/components/blog-home"
import { ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

type View = "home" | "admin-login" | "admin-panel"

export default function Home() {
  const [view, setView] = useState<View>("home")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Check if already logged in
    const isAdmin = sessionStorage.getItem("isAdmin") === "true"
    if (isAdmin && view === "admin-login") {
      setView("admin-panel")
    }
  }, [view])

  const handleAdminClick = () => {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true"
    if (isAdmin) {
      setView("admin-panel")
    } else {
      setView("admin-login")
    }
  }

  const handleLoginSuccess = () => {
    setView("admin-panel")
  }

  const handleLogout = () => {
    setView("home")
    setRefreshTrigger(prev => prev + 1)
  }

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (view === "admin-login") {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setView("home")}
          className="fixed top-4 right-4 z-50 gap-2 bg-card/80 backdrop-blur-sm"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمدونة
        </Button>
        <AdminLogin onLogin={handleLoginSuccess} />
      </>
    )
  }

  if (view === "admin-panel") {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setView("home")}
          className="fixed top-4 left-4 z-50 gap-2 bg-card/80 backdrop-blur-sm"
        >
          <Eye className="w-4 h-4" />
          معاينة المدونة
        </Button>
        <AdminPanel onLogout={handleLogout} onDataChange={handleDataChange} />
      </>
    )
  }

  return (
    <BlogHome 
      onAdminClick={handleAdminClick} 
      refreshTrigger={refreshTrigger}
    />
  )
}
