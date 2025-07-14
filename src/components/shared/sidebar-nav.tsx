
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FolderKanban, LayoutDashboard, Settings, ShoppingCart, Truck, Users, Warehouse, Building2, MapPin, Archive, Send } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Panel de Control", icon: LayoutDashboard },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/inventory", label: "Inventario", icon: Warehouse },
  { href: "/inventory-locations", label: "Ubicaciones Stock", icon: MapPin },
  { href: "/purchasing", label: "Compras", icon: ShoppingCart },
  { href: "/receptions", label: "Recepciones", icon: Archive },
  { href: "/despatches", label: "Despachos", icon: Send },
  { href: "/suppliers", label: "Proveedores", icon: Truck },
  { href: "/clients", label: "Clientes", icon: Building2 },
  { href: "/ai-assistant", label: "Asistente IA", icon: Bot },
];

const bottomNavItems = [
  { href: "/locations", label: "Gestionar Almacenes", icon: Warehouse },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card">
      <div className="flex items-center gap-2 h-16 border-b px-6">
        <Bot className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold font-headline">OrderFlow</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
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
      </nav>
      <div className="mt-auto p-4 space-y-2 border-t">
        {bottomNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
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
