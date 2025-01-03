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
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"

const navigation = {
  main: [
    {
      title: "Introducción",
      href: "/introduccion",
      icon: BookOpen,
      isActive: true
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
          description: "Crea archivos Excel basados en inputs del usuario"
        },
      ]
    },
  ],
}

export function DocsSidebar({ className, ...props }: React.ComponentPropsWithoutRef<typeof Sidebar>) {
  const [openItems, setOpenItems] = React.useState<{ [key: string]: boolean }>({});

  const toggleItem = (itemTitle: string) => {
    setOpenItems(prev => ({ ...prev, [itemTitle]: !prev[itemTitle] }));
  };

  return (
    <Sidebar className={cn("bg-[#1c1c1c] text-white", className)} {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">Fedpatools</span>
            <span className="text-xs text-white/60">v1.0.0</span>
          </div>
        </div>
        <form className="px-2 py-2">
          <SidebarGroup className="py-0">
            <SidebarGroupContent className="relative">
              <Label htmlFor="search" className="sr-only">
                Buscar
              </Label>
              <SidebarInput
                id="search"
                placeholder="Buscar en la documentación..."
                className="bg-white/5 border-white/10 text-white placeholder-white/50 pl-8"
              />
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none text-white/50" />
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
                        "w-full justify-between hover:bg-white/5",
                        openItems[item.title] ? "bg-white/5" : ""
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
                            className="hover:bg-white/5 w-full pl-2"
                          >
                            <a href={subItem.href} className="flex items-center py-1">
                              <subItem.icon className="mr-2 h-4 w-4" />
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  className={cn("hover:bg-white/5 w-full px-2")}
                >
                  <a href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.title}
                  </a>
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

