
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Bot, 
    FolderKanban, 
    LayoutDashboard, 
    Settings, 
    ShoppingCart, 
    Truck, 
    Users, 
    Warehouse, 
    Building2, 
    BarChart3, 
    Wrench, 
    ClipboardList, 
    ListChecks, 
    Plane, 
    Activity, 
    FileText, 
    ChevronDown,
    Package,
    UserCog,
    Network,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import React from "react";


const navGroups = [
  {
    title: "OPERACIONES",
    items: [
      { 
        label: "Proyectos", 
        icon: FolderKanban,
        subItems: [
            { href: "/projects", label: "Gestión de Proyectos", icon: FolderKanban },
            { href: "/installation-templates", label: "Plantillas de Instalación", icon: Wrench },
            { href: "/replan", label: "Informes de Replanteo", icon: ClipboardList },
        ]
      },
      { 
        label: "Planificación", 
        icon: ListChecks,
        subItems: [
            { href: "/resource-planning", label: "Planificación de Recursos", icon: ListChecks },
            { href: "/travel-planning", label: "Planificación Desplazamientos", icon: Plane },
        ]
      },
    ],
  },
  {
    title: "GESTIÓN DE MATERIALES",
    items: [
      { 
        label: "Logística",
        icon: Package,
        subItems: [
          { href: "/inventory", label: "Inventario", icon: Warehouse },
          { href: "/locations", label: "Almacenes", icon: Building2 },
        ]
      },
      {
        label: "Adquisiciones",
        icon: ShoppingCart,
        subItems: [
          { href: "/purchasing", label: "Compras", icon: ShoppingCart },
          { href: "/suppliers", label: "Proveedores", icon: Truck },
        ]
      }
    ]
  },
  {
    title: "ANÁLISIS Y CONTROL",
    items: [
      {
        label: "Inteligencia",
        icon: Bot,
        subItems: [
          { href: "/project-tracking", label: "Seguimiento y Control", icon: Activity },
          { href: "/reports", label: "Reportes", icon: BarChart3 },
          { href: "/documentation", label: "Documentación", icon: FileText },
          { href: "/ai-assistant", label: "Asistente IA", icon: Bot },
        ]
      }
    ]
  },
  {
    title: "ADMINISTRACIÓN",
    items: [
      {
        label: "Sistema",
        icon: Settings,
        subItems: [
          { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard },
          { href: "/clients", label: "Clientes", icon: Building2 },
          { href: "/users", label: "Usuarios y Roles", icon: Users },
          { href: "/operadores", label: "Operadores", icon: UserCog },
          { href: "/approval-flows", label: "Flujos de Aprobación", icon: Network },
          { href: "/settings", label: "Configuración App", icon: Settings },
        ]
      }
    ]
  }
];


export function SidebarNav() {
  const pathname = usePathname();

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
          <div key={group.title} className="space-y-1">
            {group.title && (
                 <h2 className="px-4 py-2 font-semibold text-primary tracking-wider uppercase">{group.title}</h2>
            )}
            {group.items.map((item) => {
              const uniqueKey = `${item.label}`;
              const isActive = isSubItemActive(item.subItems);
              
              return (
                <Collapsible key={uniqueKey} defaultOpen={isActive} className="space-y-1">
                  <CollapsibleTrigger className="w-full">
                     <div
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary font-semibold",
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
                     <div className="pl-8 pt-1 border-l border-dashed ml-5 my-1 space-y-1">
                      {item.subItems.map(subItem => {
                         const isSubActive = pathname === subItem.href || (subItem.href === '/users' && ['/approval-flows'].includes(pathname));
                         const subUniqueKey = `${subItem.label}-${subItem.href}`;

                         return (
                              <Link
                                  key={subUniqueKey}
                                  href={subItem.href}
                                  className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm",
                                  isSubActive && "text-primary bg-muted/50"
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
            })}
             {index < navGroups.length -1 && <Separator className="my-2" />}
          </div>
        ))}
      </nav>
    </aside>
  );
}
