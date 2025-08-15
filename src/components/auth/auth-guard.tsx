
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Si estamos en modo desarrollo, no necesitamos hacer nada. El AuthProvider ya nos da un usuario.
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return <>{children}</>;
  }

  useEffect(() => {
    // Esta lógica solo se ejecuta en "producción" (cuando DEV_MODE no es true)
    if (loading) return;

    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  // Muestra un loader mientras el contexto de autenticación está en proceso.
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si hay un usuario, o si estamos en la página de login, muestra el contenido.
  if (user || pathname === '/login') {
    return <>{children}</>;
  }

  // Fallback por si algo más falla, muestra un loader.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
