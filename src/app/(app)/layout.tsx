import React from 'react';
import { SidebarNav } from '@/components/shared/sidebar-nav';
import { Header } from '@/components/shared/header';
import { Toaster } from '@/components/ui/toaster';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      <SidebarNav />
      <div className="flex flex-col flex-1 bg-muted/30">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
