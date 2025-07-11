"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FolderKanban, LayoutDashboard, Package, Settings, ShoppingCart, Truck, Users, Warehouse } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/purchasing", label: "Purchasing", icon: ShoppingCart },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
];

const bottomNavItems = [
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
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
      <TooltipProvider>
        {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </TooltipTrigger>
          </Tooltip>
        )})}
        </TooltipProvider>
      </nav>
      <div className="mt-auto p-4 space-y-2 border-t">
      <TooltipProvider>
        {bottomNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
                <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-muted text-primary"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </Link>
                    </TooltipTrigger>
                </Tooltip>
        )})}
      </TooltipProvider>
      </div>
    </aside>
  );
}
