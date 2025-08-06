"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { hasPermissionForRoute, getFirstAccessibleRoute } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // No hacer nada mientras se carga el estado de autenticación
    }

    if (!user) {
      // Si no hay usuario y no estamos ya en la página de login, redirigir a login
      if (pathname !== '/login') {
        router.push('/login');
      }
    } else {
      // Si hay usuario, comprobar permisos
      if (pathname === '/login' || pathname === '/') {
        // Si el usuario está logueado e intenta ir a login o a la raíz, redirigir a su primera página accesible
        const firstRoute = getFirstAccessibleRoute(user.permissions || []);
        router.push(firstRoute);
      } else if (!hasPermissionForRoute(user.permissions || [], pathname)) {
        // Si no tiene permisos para la ruta actual, redirigir a no autorizado
        router.push('/unauthorized');
      }
    }
  }, [user, loading, pathname, router]);

  // Mientras carga, muestra un loader para evitar parpadeos y contenido no autorizado
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si no está cargando y no hay usuario, y no estamos en login, no renderizar nada para evitar mostrar contenido protegido
  if (!user && pathname !== '/login') {
    return null;
  }

  // Si el usuario está logueado y tiene permiso (o estamos en una ruta pública como login), renderizar el contenido
  return <>{children}</>;
};
