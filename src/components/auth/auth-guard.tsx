
"use client";
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { hasPermissionForRoute, getFirstAccessibleRoute } from '@/lib/permissions';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // No hacer nada mientras se carga
    }

    // Si no hay usuario y no estamos en la página de login, redirigir a login
    if (!user && pathname !== '/login') {
      router.push('/login');
      return;
    }

    // Si hay usuario y está en la página de login, redirigir a la primera página accesible
    if (user && pathname === '/login') {
        const firstRoute = getFirstAccessibleRoute(user.permissions || []);
        router.push(firstRoute);
    }
    
  }, [user, loading, router, pathname]);

  // Si está cargando, mostrar loader
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay usuario y no estamos en login, el useEffect ya habrá redirigido,
  // pero mostramos un loader para evitar un parpadeo de contenido no autorizado.
  if (!user && pathname !== '/login') {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Si hay usuario pero no tiene permiso para la ruta actual (y no es una ruta pública)
  if (user && pathname !== '/login' && !hasPermissionForRoute(user.permissions || [], pathname)) {
    router.push('/unauthorized'); // Redirige si no tiene permiso
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }


  // Si hay usuario y tiene permiso (o es la página de login), renderizar children
  return <>{children}</>;
};
