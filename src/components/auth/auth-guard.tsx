
"use client";

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getFirstAccessibleRoute, hasPermissionForRoute } from '@/lib/permissions';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || hasRedirected.current) return;

    // Si no hay usuario y no estamos ya en la página de login, redirigir
    if (!user && pathname !== '/login') {
      hasRedirected.current = true;
      router.push('/login');
      return;
    }

    if (user) {
      // Si el usuario está en la página de login, redirigirlo a su primera ruta accesible
      if (pathname === '/login' || pathname === '/') {
        const targetRoute = getFirstAccessibleRoute(user.permissions || []);
        hasRedirected.current = true;
        router.push(targetRoute);
        return;
      }

      // Comprobar si el usuario tiene permiso para la ruta actual
      if (!hasPermissionForRoute(user.permissions || [], pathname)) {
        hasRedirected.current = true;
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, pathname, router]);

  // Resetear el flag de redirección si cambia la ruta
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si hay un usuario o estamos en una ruta pública (como /login), renderizar el contenido
  if (user || pathname === '/login') {
    return <>{children}</>;
  }

  // Mientras se gestionan las redirecciones, mostrar un loader
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};
