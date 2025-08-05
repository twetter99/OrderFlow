
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
    Pin,
    PinOff,
    LogOut,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { hasPermissionForRoute } from "@/lib/permissions";

const navGroups = [
  {
    title: "OPERACIONES",
    items: [
      { 
        label: "Gestor de Proyectos", 
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
    title: "GESTIÓN DE STOCK",
    items: [
      { 
        label: "Control de Stock", 
        icon: Package,
        subItems: [
          { href: "/inventory", label: "Inventario", icon: Warehouse },
          { href: "/locations", label: "Almacenes", icon: Building2 },
          { href: "/receptions", label: "Recepción de Stock", icon: Anchor },
          { href: "/despatches", label: "Salidas de Material", icon: QrCode },
        ]
      },
      {
        label: "Gestión de Proveedores",
        icon: ShoppingCart,
        subItems: [
          { href: "/purchasing", label: "Órdenes de Compra", icon: ShoppingCart },
          { href: "/completed-orders", label: "Órdenes Finalizadas", icon: Archive },
          { href: "/suppliers", label: "Directorio de Proveedores", icon: Truck },
          { href: "/supplier-invoices", label: "Gestión de Facturas", icon: FileDigit },
          { href: "/payments", label: "Gestión de Pagos", icon: Banknote },
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
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/clients", label: "Directorio de Clientes", icon: Building2 },
          { href: "/operadores", label: "Operadores", icon: Truck },
          { href: "/technicians", label: "Técnicos", icon: HardHat },
          { href: "/supervisores", label: "Supervisores", icon: ShieldCheck },
          { href: "/users", label: "Gestión de Accesos", icon: Users },
          { href: "/approval-flows", label: "Flujos de Aprobación", icon: Network },
          { href: "/settings", label: "Configuración General", icon: Settings },
        ]
      }
    ]
  }
];

export const SidebarNav = () => {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { user, logOut } = useAuth();
  const [isHovered, setIsHovered] = React.useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isPinned = hasMounted ? open : false;
  const isExpanded = hasMounted ? isPinned || isHovered : false;

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  const handlePinToggle = () => {
    setOpen(!open);
  }

  const isSubItemActive = (subItems: any[]) => {
    if (!hasMounted) return false;
    return subItems.some(sub => pathname.startsWith(sub.href));
  }

  const filteredNavGroups = React.useMemo(() => {
    if (!user) return [];
    
    return navGroups.map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        subItems: item.subItems.filter(subItem => hasPermissionForRoute(user.permissions || [], subItem.href))
      })).filter(item => item.subItems.length > 0)
    })).filter(group => group.items.length > 0);

  }, [user]);

  return (
    <TooltipProvider>
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative flex flex-col border-r bg-secondary text-secondary-foreground transition-all duration-300",
          "w-[280px] shrink-0", // Always full width
          !isExpanded && "translate-x-[-216px]", // When collapsed, move left by (280 - 64) px
          isExpanded ? "ease-expand shadow-xl" : "ease-collapse",
          hasMounted && "transition-transform"
        )}
      >
        {hasMounted ? (
            <>
        <div className={cn(
          "flex items-center h-16 border-b border-white/10 px-4 shrink-0",
        )}>
           <Link href="/dashboard" className="flex-1">
              <div className="w-[150px] h-10">
                <Image 
                  src="/images/logo_blanco.png" 
                  alt="OrderFlow Logo" 
                  width={150} 
                  height={40}
                  priority
                  className="object-contain w-full h-full"
                />
              </div>
          </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handlePinToggle} className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                  {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{isPinned ? 'Desanclar barra lateral' : 'Anclar barra lateral'}</p>
              </TooltipContent>
            </Tooltip>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {filteredNavGroups.map((group, groupIndex) => (
            <div key={group.title} className={cn("space-y-1 transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0")} style={{ transitionDelay: isExpanded ? `${groupIndex * 50 + 100}ms` : '0ms'}}>
              {group.title && (
                  <h2 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50">{group.title}</h2>
              )}
              {group.items.map((item) => {
                const uniqueKey = `${item.label}`;
                const isActive = isSubItemActive(item.subItems);
                
                return (
                  <Collapsible key={uniqueKey} className="space-y-1" defaultOpen={isActive}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CollapsibleTrigger className="w-full text-left" disabled={!isExpanded}>
                            <div
                            className={cn(
                                "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white font-medium",
                                "group",
                                isActive && "bg-white/10 text-white"
                            )}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200 group-hover:animate-pulse-once-subtle", isExpanded ? "scale-100" : "scale-90")} />
                                <span className={cn('truncate transition-opacity duration-200', !isExpanded ? 'opacity-0' : 'opacity-100 delay-150')}>{item.label}</span>
                              </div>
                              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-all duration-200 [&[data-state=open]]:-rotate-180", !isExpanded && "opacity-0")}/>
                            </div>
                          </CollapsibleTrigger>
                        </TooltipTrigger>
                        {!isExpanded && <TooltipContent side="right" className="animate-fade-in"><p>{item.label}</p></TooltipContent>}
                      </Tooltip>
                    
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
        {/* User Block Footer */}
        <div className="mt-auto p-2 border-t border-white/10 shrink-0">
          <div className={cn("flex items-center gap-3 rounded-md transition-all p-2")}>
              <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.name || ''} />
                  <AvatarFallback>{user ? user.name?.charAt(0).toUpperCase() : 'S'}</AvatarFallback>
              </Avatar>
              <div className={cn("flex-1 overflow-hidden transition-opacity duration-200", !isExpanded && "opacity-0")}>
                  <p className="text-sm font-semibold truncate">{user?.name || 'Simulación'}</p>
                  <p className="text-xs text-white/60 truncate">{user?.email || 'sin usuario definido'}</p>
              </div>
               <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-white/70 hover:bg-white/10 hover:text-white" onClick={logOut} disabled={!user}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                {isExpanded && (
                    <TooltipContent side="right" align="center">
                        <p>Cerrar sesión</p>
                    </TooltipContent>
                )}
               </Tooltip>
          </div>
        </div>
            </>
        ) : (
           <div className="h-full w-16" /> // Placeholder to match width and prevent layout shift
        )}
      </aside>
    </TooltipProvider>
  );
}
