
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FolderKanban, LayoutDashboard, Settings, ShoppingCart, Truck, Users, Warehouse, Building2, BarChart3, Wrench, ClipboardList, ListChecks, Plane, Activity, FileText, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import React from "react";


const navGroups = [
  {
    title: "OPERACIONES",
    items: [
      { 
        href: "/projects", 
        label: "Gestión de Proyectos", 
        icon: FolderKanban,
        subItems: [
            { href: "/installation-templates", label: "Plantillas de Instalación", icon: Wrench },
            { href: "/resource-planning", label: "Planificación de Recursos", icon: ListChecks },
            { href: "/replan", label: "Informes de Replanteo", icon: ClipboardList },
        ]
      },
       { href: "/work-in-progress", label: "Planificación Desplazamientos", icon: Plane },
    ],
  },
  {
    title: "GESTIÓN DE MATERIALES",
    items: [
      { href: "/inventory", label: "Inventario", icon: Warehouse },
      { href: "/locations", label: "Almacenes", icon: Building2 },
      { href: "/purchasing", label: "Compras", icon: ShoppingCart },
      { href: "/suppliers", label: "Proveedores", icon: Truck },
    ]
  },
  {
    title: "ANÁLISIS Y CONTROL",
    items: [
      { href: "/reports", label: "Reportes", icon: BarChart3 },
      { href: "/ai-assistant", label: "Asistente IA", icon: Bot },
      { href: "/work-in-progress", label: "Seguimiento y Control", icon: Activity },
      { href: "/work-in-progress", label: "Documentación", icon: FileText },
    ],
  },
  {
    title: "ADMINISTRACIÓN",
    items: [
        { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard },
        { href: "/clients", label: "Clientes", icon: Building2 },
        { href: "/users", label: "Usuarios", icon: Users },
        { href: "/settings", label: "Configuración App", icon: Settings },
    ]
  }
];


export function SidebarNav() {
  const pathname = usePathname();

  const isLinkActive = (href: string, isParent = false) => {
    if (href === "/dashboard") return pathname === href;
    if (href === "/inventory") return pathname === href;
    if (href === "/locations") return pathname === href;
    if (isParent) return pathname.startsWith(href);
    return pathname === href;
  };
  
  const isSubItemActive = (subItems: any[]) => {
    return subItems.some(sub => pathname.startsWith(sub.href));
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card">
      <div className="flex items-center gap-2 h-16 border-b px-6">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold font-headline">OrderFlow</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navGroups.map((group, index) => (
          <div key={index} className="space-y-1">
            {group.title && (
                 <h2 className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase pt-2 pb-1">{group.title}</h2>
            )}
            {group.items.map((item) => {
              if (item.subItems) {
                const isActive = isLinkActive(item.href, true) || isSubItemActive(item.subItems);
                 return (
                  <Collapsible key={item.label} defaultOpen={isActive}>
                    <CollapsibleTrigger className="w-full">
                       <div
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                           isActive && "bg-muted text-primary"
                        )}
                      >
                         <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                         </div>
                         <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 [&[data-state=open]]:-rotate-180"/>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                       <div className="pl-8 pt-1 border-l border-dashed ml-5 my-1">
                        {item.subItems.map(subItem => {
                           const isSubActive = isLinkActive(subItem.href);
                           return (
                                <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm",
                                    isSubActive && "text-primary"
                                    )}
                                >
                                <subItem.icon className="h-4 w-4" />
                                <span>{subItem.label}</span>
                                </Link>
                           )
                        })}
                       </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              const isActive = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
            )})}
             {index < navGroups.length -1 && <Separator className="my-2" />}
          </div>
        ))}
      </nav>
    </aside>
  );
}
