"use client";
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { hasPermissionForRoute } from '@/lib/permissions';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si la carga ha terminado y no hay usuario, redirige a la página de login.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Mientras se verifica el estado de autenticación, mostrar un loader.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay usuario, el useEffect se encargará de redirigir.
  // Mientras tanto, mostramos un loader para evitar mostrar contenido no autorizado.
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si hay usuario, pero no tiene permiso para la ruta actual.
  if (!hasPermissionForRoute(user.permissions || [], pathname)) {
    router.push('/unauthorized'); // Redirige si no tiene permiso.
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si la carga ha terminado, hay un usuario y tiene permisos, renderizar el contenido.
  return <>{children}</>;
};
