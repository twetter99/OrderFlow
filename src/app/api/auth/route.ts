import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Esta función se ejecuta cuando el login hace un POST
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Token no proporcionado' }), { status: 400 });
    }

    // Usamos la función cookies() importada de 'next/headers'
    cookies().set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    });

    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Error al procesar la solicitud' }), { status: 500 });
  }
}

// Esta función se ejecuta para cerrar sesión (logout)
export async function DELETE() {
    try {
        cookies().delete('session');
        return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Error al cerrar sesión' }), { status: 500 });
    }
}

