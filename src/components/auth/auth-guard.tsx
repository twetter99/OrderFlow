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
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 1. Muestra el loader mientras se verifica la autenticación.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Si la carga ha terminado y NO hay usuario, el useEffect ya está
  //    redirigiendo. Mantenemos el loader para evitar mostrar nada.
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // 3. Si hay usuario, pero NO tiene permisos para la ruta actual.
  if (!hasPermissionForRoute(user.permissions || [], pathname)) {
    router.push('/unauthorized'); // Redirige a la página de acceso denegado.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // 4. Si la carga ha terminado, hay un usuario y tiene permisos,
  //    renderizar el contenido de la página.
  return <>{children}</>;
};
