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

  // Forzamos el acceso directo sin autenticación
  return <>{children}</>;

  /*
  useEffect(() => {
    // This effect handles the redirection side-effect, but the rendering
    // logic below provides the immediate UI feedback and protection.
    if (!loading && !user) {
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

  if (!user) {
    // While the useEffect is redirecting, we must prevent any content
    // from rendering. Returning the loader is a safe way to do this.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // If we have a user, now we check for permissions.
  if (!hasPermissionForRoute(user.permissions || [], pathname)) {
    router.push('/unauthorized'); // Redirect to a dedicated "access denied" page
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Only if all checks pass, render the children.
  return <>{children}</>;
  */
};
