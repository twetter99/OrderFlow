

import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="mb-4">
                <Image src="/images/logo.png" alt="OrderFlow Logo" width={180} height={180} />
            </div>
          <h1 className="text-3xl font-bold font-headline text-center">
            Bienvenido a OrderFlow
          </h1>
          <p className="text-muted-foreground text-center">
            Inicia sesión para gestionar tu inventario y adquisiciones.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
