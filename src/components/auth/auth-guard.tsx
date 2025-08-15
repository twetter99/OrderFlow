
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

    if (!user && pathname !== '/login') {
      console.log('AuthGuard: No user, redirecting to /login');
      hasRedirected.current = true;
      router.push('/login');
      return;
    }

    if (user) {
      if (pathname === '/login' || pathname === '/') {
        const targetRoute = getFirstAccessibleRoute(user.permissions || []);
        console.log(`AuthGuard: User logged in, redirecting from login page to ${targetRoute}`);
        hasRedirected.current = true;
        router.push(targetRoute);
        return;
      }

      if (!hasPermissionForRoute(user.permissions || [], pathname)) {
        console.log(`AuthGuard: No permission for ${pathname}, redirecting to /unauthorized`);
        hasRedirected.current = true;
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, pathname, router]);

  // Reset redirect flag on route change
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

  // Render children only if user is authenticated and has permission, or if it's the login page
  if ((user && hasPermissionForRoute(user.permissions || [], pathname)) || pathname === '/login') {
    return <>{children}</>;
  }

  // Otherwise, return a loader or null while redirects happen
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};
