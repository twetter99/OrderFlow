import { LoginForm } from "@/components/auth/login-form";
import { Bot } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4">
                <Bot className="h-8 w-8" />
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
