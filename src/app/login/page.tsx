
'use client';

import { useRouter, redirect } from 'next/navigation';
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import React, { useEffect } from 'react';

export default function LoginPage() {
  const { loading } = useAuth();
  const router = useRouter();

  // En modo desarrollo, no deberíamos llegar aquí, pero si lo hacemos,
  // redirigimos inmediatamente para evitar mostrar la pantalla de login.
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      router.push('/dashboard');
    }
  }, [router]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div data-page="login" className="flex min-h-screen items-center justify-center p-4 bg-black">
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
