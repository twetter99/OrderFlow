
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
      return; // Wait for the auth state to be determined
    }

    if (!user && pathname !== '/login') {
      router.push('/login');
    } else if (user) {
      const isAllowed = hasPermissionForRoute(user.permissions || [], pathname);
      
      if (pathname === '/login' || pathname === '/') {
        const firstRoute = getFirstAccessibleRoute(user.permissions || []);
        router.push(firstRoute);
      } else if (!isAllowed) {
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

  // Determine if the content should be rendered
  const isLoginPage = pathname === '/login';
  const hasAccess = user && hasPermissionForRoute(user.permissions || [], pathname);

  if (isLoginPage || hasAccess) {
    return <>{children}</>;
  }

  // In other cases (like redirecting), render nothing to avoid content flashes
  return null;
};
