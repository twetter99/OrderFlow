"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import {
  Bell,
  CircleUser,
  Loader2, // Icono de carga
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NotificationsPanel } from "./notifications-panel"
import { SidebarTrigger } from "../ui/sidebar"
import { BackButton } from "./back-button"

export function Header() {
  const { logOut } = useAuth();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Estado para la carga

  // Manejador asíncrono para el cierre de sesión
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      // No es necesario setIsLoggingOut(false) porque serás redirigido
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Si hay un error, reactiva el botón
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
              <SidebarTrigger />
          </div>
          <BackButton />
        </div>

        <div className="w-full flex-1">
          {/* El buscador se puede añadir aquí si es necesario */}
        </div>
        
        <NotificationsPanel />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Alternar menú de usuario</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => {/* Placeholder */}}>Configuración</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {/* Placeholder */}}>Soporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault();
              setShowLogoutAlert(true);
            }}>
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cierre de Sesión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres cerrar tu sesión actual?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                "Cerrar Sesión"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}