
"use client";

import type {Metadata} from 'next';
import { usePathname } from 'next/navigation';
import { Exo_2 } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarNav } from '@/components/shared/sidebar-nav';
import { Header } from '@/components/shared/header';
import { SidebarProvider } from '@/components/ui/sidebar';

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
  weight: ['400', '600'],
});

// Metadata can't be exported from a client component. 
// We can define it here, but it won't be applied directly.
// For full metadata support, this logic would need to be split.
// export const metadata: Metadata = {
//   title: 'OrderFlow',
//   description: 'Automatiza tu proceso de adquisiciones e inventario.',
// };

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
        {isLoginPage ? (
          <main className="w-full">{children}</main>
        ) : (
          <SidebarProvider>
            <SidebarNav />
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </SidebarProvider>
        )}
        <Toaster />
      </body>
    </html>
  );
}
