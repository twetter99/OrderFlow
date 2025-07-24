

"use client";

import Link from "next/link";
import Image from "next/image";
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
    HardHat,
    Network,
    Archive,
    FileDigit,
    Banknote,
    QrCode,
    ShieldCheck,
    Anchor,
} from "lucide-react";
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
          { href: "/receptions", label: "Recepciones", icon: Anchor },
          { href: "/despatches", label: "Despachos", icon: QrCode },
        ]
      },
      {
        label: "Adquisiciones",
        icon: ShoppingCart,
        subItems: [
          { href: "/purchasing", label: "Compras", icon: ShoppingCart },
          { href: "/completed-orders", label: "Órdenes Completadas", icon: Archive },
          { href: "/suppliers", label: "Proveedores", icon: Truck },
          { href: "/supplier-invoices", label: "Facturas Proveedor", icon: FileDigit },
          { href: "/payments", label: "Vencimientos y Pagos", icon: Banknote },
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
        label: "Gestión General",
        icon: Settings,
        subItems: [
          { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard },
          { href: "/clients", label: "Clientes", icon: Building2 },
          { href: "/operadores", label: "Operadores", icon: Truck },
          { href: "/technicians", label: "Técnicos", icon: HardHat },
          { href: "/supervisores", label: "Supervisores", icon: ShieldCheck },
          { href: "/users", label: "Usuarios y Permisos", icon: Users },
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
    <aside className="hidden md:flex flex-col w-64 border-r bg-secondary text-secondary-foreground">
      <div className="flex items-center justify-center h-16 border-b border-white/10 px-4">
        <Image 
          src="/images/logo_blanco.png" 
          alt="OrderFlow Logo" 
          width={180} 
          height={40}
          priority
        />
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navGroups.map((group, index) => (
          <div key={group.title} className="space-y-1">
            {group.title && (
                 <h2 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50">{group.title}</h2>
            )}
            {group.items.map((item) => {
              const uniqueKey = `${item.label}`;
              const isActive = isSubItemActive(item.subItems);
              
              return (
                <Collapsible key={uniqueKey} defaultOpen={isActive} className="space-y-1">
                  <CollapsibleTrigger className="w-full">
                     <div
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-white/80 transition-all hover:bg-white/10 hover:text-white font-medium",
                         isActive && "bg-white/10 text-white"
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
                     <div className="pl-8 pt-1 border-l border-dashed border-white/20 ml-5 my-1 space-y-1">
                      {item.subItems.map(subItem => {
                         const isSubActive = pathname.startsWith(subItem.href);
                         const subUniqueKey = `${subItem.label}-${subItem.href}`;

                         return (
                              <Link
                                  key={subUniqueKey}
                                  href={subItem.href}
                                  className={cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2 text-white/60 transition-all hover:text-white text-sm",
                                  isSubActive && "text-white font-semibold"
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
          </div>
        ))}
      </nav>
    </aside>
  );
}
