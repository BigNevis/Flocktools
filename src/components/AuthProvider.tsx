'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from '@/config/authConfig'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DocsSidebar } from "@/components/docs-sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const msalInstance = new PublicClientApplication(msalConfig)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const msalAccount = localStorage.getItem('msalAccount')

      if (token && user) {
        setIsAuthenticated(true)
      } else if (user && JSON.parse(user).rol === 'invitado') {
        setIsAuthenticated(true)
      } else if (msalAccount) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }

      setIsLoading(false)
    }

    checkAuth()

    const callbackId = msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) {
        setIsAuthenticated(true)
        router.push('/dashboard')
      }
      if (event.eventType === EventType.LOGOUT_SUCCESS) {
        setIsAuthenticated(false)
        router.push('/')
      }
    })

    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId)
      }
    }
  }, [router])

  const handleLogout = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('msalAccount')
    setIsAuthenticated(false)
    if (msalInstance.getAllAccounts().length > 0) {
      await msalInstance.logoutPopup()
    }
    router.push('/')
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <MsalProvider instance={msalInstance}>
      {isAuthenticated ? (
        <SidebarProvider>
          <DocsSidebar />
          <SidebarInset className={cn("min-h-screen", "bg-background")}>
            <header className={cn("flex h-14 items-center gap-4 border-b px-4", "bg-background")}>
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex-1">
                <nav className={cn("flex items-center space-x-4 lg:space-x-6", "text-sm")}>
                  <a
                    href="/dashboard"
                    className={cn("font-medium transition-colors hover:text-primary", "text-muted-foreground")}
                  >
                    Dashboard
                  </a>
                </nav>
              </div>
              <Button onClick={handleLogout} variant="ghost">
                Cerrar sesión
              </Button>
            </header>
            <main className={cn("flex-1 space-y-4 p-4 md:p-8 pt-8", "bg-background")}>
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        children
      )}
    </MsalProvider>
  )
}

