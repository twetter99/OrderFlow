
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useData } from '@/context/data-context';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const data = useData();

  const isLoading = auth.loading || data.loading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};
