
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // En modo desarrollo, siempre permitir el acceso para evitar bloqueos.
  // La autenticación se manejará en segundo plano por el AuthContext.
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return <>{children}</>;
  }

  // Lógica para producción
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }
  
  // Muestra un loader mientras se redirige para evitar parpadeos
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
