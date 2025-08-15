
"use client";

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // En modo desarrollo, no hacemos nada y simplemente mostramos el contenido.
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return <>{children}</>;
  }

  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
