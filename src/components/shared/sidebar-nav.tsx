
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FolderKanban, LayoutDashboard, Settings, ShoppingCart, Truck, Users, Warehouse, Building2, MapPin, Archive, Send, BarChart3, ArrowRightLeft, Wrench, ClipboardList } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

const navGroups = [
  {
    items: [
      { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard },
    ],
  },
  {
    title: "Proyectos",
    items: [
      { href: "/projects", label: "Gestión de Proyectos", icon: FolderKanban },
      { href: "/installation-templates", label: "Plantillas de Instalación", icon: Wrench },
      { href: "/replan", label: "Informes de Replanteo", icon: ClipboardList },
    ]
  },
  {
    title: "Logística",
    items: [
      { href: "/inventory", label: "Inventario", icon: Warehouse },
      { href: "/locations", label: "Almacenes", icon: Building2 },
    ],
  },
  {
    title: "Adquisiciones",
    items: [
      { href: "/purchasing", label: "Compras", icon: ShoppingCart },
      { href: "/suppliers", label: "Proveedores", icon: Truck },
    ]
  },
  {
    title: "Inteligencia",
    items: [
      { href: "/reports", label: "Reportes", icon: BarChart3 },
      { href: "/ai-assistant", label: "Asistente IA", icon: Bot },
    ],
  }
];


const bottomNavItems = [
  { href: "/clients", label: "Clientes", icon: Building2 },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/settings", label: "Configuración App", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/inventory") {
      return pathname === href;
    }
     if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

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
      <div className="mt-auto p-2 space-y-1 border-t">
        {bottomNavItems.map((item) => {
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
      </div>
    </aside>
  );
}
