"use client"

import * as React from "react"
import { Cpu, FileSpreadsheet, ChevronDown, ChevronUp, Search, BookOpen, FileText } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInput,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from 'react'
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = {
  main: [
    {
      title: "Introducción",
      href: "/introduccion",
      icon: BookOpen,
    },
    {
      title: "Generar Doc. Técnica",
      href: "/generar-doc-tecnica",
      icon: FileSpreadsheet,
      items: [
        {
          title: "Excel a Markdown",
          href: "/generar-doc-tecnica/excel-a-markdown",
          icon: FileText,
          description: "Transforma archivos Excel en documentos Markdown"
        },
        {
          title: "Generador de Excel",
          href: "/generar-doc-tecnica/generador-excel",
          icon: FileSpreadsheet,
          description: "Crea archivos Excel basados en inputs del usuario",
          requiresAuth: true
        },
      ]
    },
  ],
}

export function DocsSidebar({ className, ...props }: React.ComponentPropsWithoutRef<typeof Sidebar>) {
  const [openItems, setOpenItems] = React.useState<{ [key: string]: boolean }>({
    "Generar Doc. Técnica": true
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname()
  const { state } = useSidebar()

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const { rol } = JSON.parse(user);
      setUserRole(rol);
    }
  }, []);

  const toggleItem = (itemTitle: string) => {
    setOpenItems(prev => ({ ...prev, [itemTitle]: !prev[itemTitle] }));
  };

  return (
    <Sidebar className={cn("bg-background text-foreground", className)} {...props}>
      <SidebarHeader className="border-b text-foreground">
        <Link
          href="/"
          className="flex items-center space-x-2 px-4 py-2.5"
        >
          <div className="flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M29.9998 11.8965V4.4935C29.9998 4.16527 29.9355 3.84028 29.8108 3.53716C29.686 3.23403 29.5031 2.95875 29.2727 2.72709C29.0422 2.49543 28.7688 2.31196 28.4679 2.18719C28.167 2.06242 27.8447 1.99881 27.5194 2.00002L20.217 2.02766C19.5653 2.03577 18.9432 2.30333 18.4861 2.77207C18.029 3.24082 17.7739 3.8728 17.7764 4.53043C17.7789 5.18805 18.0387 5.81805 18.4993 6.28329C18.9599 6.74852 19.584 7.0113 20.2358 7.01442L22.5589 7.00571C22.8842 7.00445 23.2065 7.06801 23.5074 7.19274C23.8083 7.31748 24.0818 7.50093 24.3122 7.73257C24.5427 7.96422 24.7255 8.23951 24.8503 8.54263C24.975 8.84575 25.0393 9.17076 25.0393 9.49898V11.9161C25.0393 12.4092 25.1843 12.8912 25.4559 13.3012C25.7274 13.7112 26.1133 14.0308 26.5648 14.2195C27.0163 14.4081 27.5132 14.4575 27.9925 14.3613C28.4718 14.2651 28.912 14.0276 29.2576 13.6789L29.2762 13.6602C29.5056 13.4287 29.6876 13.1539 29.8117 12.8514C29.9359 12.5489 29.9998 12.2248 29.9998 11.8974" fill="currentColor"/>
              <path d="M27.0427 27.488V20.0841C27.0427 19.7559 26.9785 19.4309 26.8537 19.1277C26.729 18.8246 26.5461 18.5493 26.3157 18.3177C26.0852 18.086 25.8117 17.9025 25.5108 17.7778C25.2099 17.6531 24.8876 17.5896 24.5623 17.5908L17.2601 17.6183C16.6084 17.6263 15.9863 17.8939 15.5292 18.3626C15.072 18.8313 14.8169 19.4632 14.8194 20.1208C14.8218 20.7784 15.0815 21.4084 15.5421 21.8737C16.0026 22.339 16.6267 22.6018 17.2784 22.605L19.6018 22.5963C19.927 22.5951 20.2494 22.6587 20.5502 22.7834C20.8511 22.9081 21.1246 23.0916 21.355 23.3233C21.5855 23.5549 21.7683 23.8302 21.8931 24.1333C22.0179 24.4364 22.0821 24.7614 22.0821 25.0896V27.5069C22.0822 28 22.2272 28.4821 22.4987 28.892C22.7703 29.302 23.1562 29.6216 23.6077 29.8103C24.0592 29.999 24.556 30.0483 25.0353 29.9521C25.5147 29.8559 25.9549 29.6185 26.3005 29.2698L26.3191 29.2511C26.7823 28.7835 27.0426 28.1492 27.0427 27.488Z" fill="currentColor"/>
              <path d="M14.2236 14.5527V7.14881C14.2236 6.82058 14.1593 6.49558 14.0346 6.19246C13.9098 5.88933 13.727 5.61406 13.4965 5.38241C13.2661 5.15076 12.9925 4.9673 12.6917 4.84257C12.3908 4.71784 12.0685 4.65428 11.7432 4.65554L4.44074 4.68296C3.78908 4.69104 3.16697 4.95855 2.70984 5.42725C2.25271 5.89596 1.9976 6.5279 2.00002 7.18551C2.00243 7.84311 2.26221 8.47313 2.72277 8.9384C3.18333 9.40367 3.80739 9.66652 4.45909 9.66972L6.78223 9.66102C7.10752 9.65973 7.42983 9.72327 7.73072 9.84799C8.03162 9.97271 8.30514 10.1562 8.53559 10.3878C8.76605 10.6195 8.94892 10.8948 9.07367 11.1979C9.19843 11.501 9.26264 11.826 9.26261 12.1543V14.5714C9.26268 15.0645 9.40764 15.5465 9.67918 15.9565C9.95073 16.3665 10.3367 16.6861 10.7882 16.8748C11.2397 17.0634 11.7365 17.1128 12.2158 17.0166C12.6951 16.9204 13.1354 16.6829 13.481 16.3343L13.4997 16.3157C13.9631 15.8482 14.2235 15.2139 14.2236 14.5527Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "text-base font-semibold text-foreground",
              state === "collapsed" ? "sr-only" : "block"
            )}>
              Flocktools
            </span>
            <span className={cn(
              "text-xs text-muted-foreground",
              state === "collapsed" ? "sr-only" : "block"
            )}>
              v1.0.0
            </span>
          </div>
        </Link>
        <form className="px-2 py-2">
          <SidebarGroup className="py-0">
            <SidebarGroupContent className="relative">
              <Label htmlFor="search" className="sr-only">
                Buscar
              </Label>
              <SidebarInput
                id="search"
                placeholder="Buscar en la documentación..."
                className="bg-muted border-input text-foreground placeholder-muted-foreground pl-8"
              />
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none text-muted-foreground" />
            </SidebarGroupContent>
          </SidebarGroup>
        </form>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarMenu className="space-y-1 pr-[25px]">
          {navigation.main.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.items ? (
                <Collapsible open={openItems[item.title]} onOpenChange={() => toggleItem(item.title)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full justify-between hover:bg-accent hover:text-accent-foreground",
                        openItems[item.title] ? "bg-accent text-accent-foreground" : ""
                      )}
                    >
                      <span className="flex items-center">
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.title}
                      </span>
                      {openItems[item.title] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="transition-all duration-200 ease-in-out">
                    <SidebarMenu className="mt-1 space-y-1 pr-[25px] pl-[25px]">
                      {item.items.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === subItem.href}
                            className={cn(
                              "hover:bg-accent hover:text-accent-foreground w-full pl-2",
                              subItem.requiresAuth && userRole === 'invitado' && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {subItem.requiresAuth && userRole === 'invitado' ? (
                              <span className="flex items-center py-1">
                                <subItem.icon className="mr-2 h-4 w-4" />
                                <span>{subItem.title}</span>
                              </span>
                            ) : (
                              <Link href={subItem.href} className="flex items-center py-1">
                                <subItem.icon className="mr-2 h-4 w-4" />
                                <span>{subItem.title}</span>
                              </Link>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className={cn("hover:bg-accent hover:text-accent-foreground w-full px-2")}
                >
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

