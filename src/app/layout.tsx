import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DocsSidebar } from "@/components/docs-sidebar"
import { Separator } from "@/components/ui/separator"
import "./globals.css"

export const metadata = {
  title: 'Fedpatools',
  description: 'Herramienta centralizada para las necesidades de Flock IT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body>
        <SidebarProvider>
          <DocsSidebar />
          <SidebarInset className="min-h-screen">
            <header className="flex h-14 items-center gap-4 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex-1">
                <nav className="flex items-center space-x-4 lg:space-x-6">
                  <a
                    href="/"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Inicio
                  </a>
                </nav>
              </div>
            </header>
            <main className="flex-1 space-y-4 p-4 md:p-8 pt-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}

