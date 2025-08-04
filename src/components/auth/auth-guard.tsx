"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si la carga ha terminado y no hay usuario.
    // Esto evita redirecciones mientras el estado de autenticación aún se está determinando.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Muestra un cargador mientras el estado de autenticación se está verificando.
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si la carga ha terminado y hay un usuario, renderiza los hijos.
  return <>{children}</>;
};
