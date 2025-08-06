"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { hasPermissionForRoute, getFirstAccessibleRoute } from '@/lib/permissions';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || hasRedirected.current) return;

    if (!user) {
      router.push('/login');
      hasRedirected.current = true;
    } else {
      const isAuthorized = hasPermissionForRoute(user.permissions || [], pathname);
      
      if (pathname === '/' || pathname === '/login') {
         // If user is logged in and on the root or login page, redirect them.
         const firstRoute = getFirstAccessibleRoute(user.permissions || []);
         router.push(firstRoute);
         hasRedirected.current = true;
      } else if (!isAuthorized) {
        // If they are on a forbidden page, send them to unauthorized.
        router.push('/unauthorized');
        hasRedirected.current = true;
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasPermissionForRoute(user.permissions || [], pathname)) {
    // While redirecting, show a loader to prevent flicker
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Only if all checks pass, render the children.
  return <>{children}</>;
};
