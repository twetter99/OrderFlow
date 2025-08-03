
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is finished and there's no user.
    // This prevents redirects while the auth state is still being determined.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show a loader while the auth state is being checked.
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is finished and there is a user, render the children.
  return <>{children}</>;
};
