import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // --- Mensajes de depuración (opcional) ---
  console.log('\n=========================');
  console.log('--- Middleware Interceptó una Petición ---');

  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  console.log(`Ruta solicitada (pathname): ${pathname}`);
  console.log(`¿Cookie de sesión encontrada?: ${sessionCookie ? 'Sí' : 'No'}`);
  // --- Fin de la depuración ---

  if (!sessionCookie && pathname !== '/login') {
    console.log('DECISIÓN: Redirigiendo a /login porque no hay cookie.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (sessionCookie && pathname === '/login') {
    console.log('DECISIÓN: Redirigiendo a /dashboard porque YA hay cookie.');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('DECISIÓN: Petición permitida.');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};