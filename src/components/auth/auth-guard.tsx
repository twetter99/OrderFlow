
"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { hasPermissionForRoute, getFirstAccessibleRoute } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait for loading to complete
    }

    if (!user && pathname !== '/login') {
      router.push('/login');
    } else if (user) {
      if (pathname === '/login' || pathname === '/') {
        const firstRoute = getFirstAccessibleRoute(user.permissions || []);
        router.push(firstRoute);
      } else if (!hasPermissionForRoute(user.permissions || [], pathname)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Only render children if user exists and has permission for the current route
  // Or if we are on the login page (and user is null)
  if ((user && hasPermissionForRoute(user.permissions || [], pathname)) || pathname === '/login') {
    return <>{children}</>;
  }

  // Otherwise, return null to prevent rendering protected content during redirects
  return null;
};
