"use client";

import { usePathname } from 'next/navigation';
import { Exo_2 } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarNav } from '@/components/shared/sidebar-nav';
import { Header } from '@/components/shared/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/context/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
  weight: ['400', '600'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${exo2.variable} font-sans antialiased flex bg-background`}>
        <AuthProvider>
          {isLoginPage ? (
            <main className="w-full">{children}</main>
          ) : (
            <AuthGuard>
              <SidebarProvider>
                <SidebarNav />
                <div className="flex flex-col flex-1 h-screen overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
                    {children}
                  </main>
                </div>
              </SidebarProvider>
            </AuthGuard>
          )}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
