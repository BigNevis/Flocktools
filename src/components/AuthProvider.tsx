'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DocsSidebar } from "@/components/docs-sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      setIsAuthenticated(true)
      if (pathname === '/') {
        router.push('/dashboard')
      }
    } else if (user && JSON.parse(user).rol === 'invitado') {
      setIsAuthenticated(true)
      if (pathname === '/') {
        router.push('/dashboard')
      }
    } else {
      setIsAuthenticated(false)
      if (pathname !== '/') {
        router.push('/')
      }
    }
    setIsLoading(false)
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    router.push('/')
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated && pathname === '/') {
    return children
  }

  if (!isAuthenticated) {
    router.push('/')
    return null
  }

  return (
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
  )
}

