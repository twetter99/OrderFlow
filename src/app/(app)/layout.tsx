import React from 'react';
import { SidebarNav } from '@/components/shared/sidebar-nav';
import { Header } from '@/components/shared/header';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
     <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
