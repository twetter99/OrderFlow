
import type {Metadata} from 'next';
import { Exo_2 } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
})

export const metadata: Metadata = {
  title: 'OrderFlow',
  description: 'Automatiza tu proceso de adquisiciones e inventario.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${exo2.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
