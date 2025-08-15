
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Si estamos en modo desarrollador, redirigir inmediatamente al dashboard.
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  // En modo desarrollador, renderizar un loader para evitar el parpadeo del formulario de login.
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-black">
        <p className="text-white">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  return (
    <div data-page="login" className="flex min-h-screen items-center justify-center p-4 bg-black">
      {/* Contenedor principal con efecto glassmorphism */}
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-lg backdrop-blur-sm border border-gray-200/20">
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="mb-4">
                <Image src="/images/logo_blanco.png" alt="OrderFlow Logo" width={180} height={40} />
            </div>
          <h1 className="text-3xl font-bold text-center text-white">
            Bienvenido a OrderFlow
          </h1>
          <p className="text-gray-300 text-center mt-2">
            Accede para gestionar proyectos, inventario y operaciones.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
