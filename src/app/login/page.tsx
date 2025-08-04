
'use client';

import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div data-page="login" className="flex min-h-screen items-center justify-center p-4">
      {/* Contenedor principal con efecto glassmorphism */}
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm border border-gray-200/50">
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="mb-4">
                <Image src="/images/logo.png" alt="OrderFlow Logo" width={180} height={40} />
            </div>
          <h1 className="text-3xl font-bold text-center text-black">
            Bienvenido a OrderFlow
          </h1>
          <p className="text-gray-700 text-center mt-2">
            Inicia sesión para gestionar tu inventario y adquisiciones.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
