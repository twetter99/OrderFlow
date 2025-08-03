
'use client';

import { LoginForm } from "@/components/auth/login-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

function DomainHelper() {
  const [hostname, setHostname] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  if (!hostname) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(hostname);
    toast({
      title: "Dominio copiado",
      description: "El dominio se ha copiado al portapapeles.",
    });
  };

  return (
    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
        <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-1 flex-shrink-0"/>
            <div>
                <h4 className="font-bold">Acción Requerida para Login</h4>
                <p className="text-sm mt-1">
                    Para que el acceso con Google funcione, debes autorizar este dominio en tu proyecto de Firebase:
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <input 
                        type="text"
                        readOnly
                        value={hostname}
                        className="flex-grow p-2 text-xs bg-white rounded-md border border-yellow-300"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopy} className="h-8 w-8 text-yellow-800 border-yellow-300 hover:bg-yellow-100">
                        <Copy className="h-4 w-4"/>
                    </Button>
                </div>
                 <a 
                    href="https://console.firebase.google.com/project/_/authentication/settings" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium mt-2 inline-block text-yellow-900 hover:underline"
                >
                    Ir a la Consola de Firebase →
                </a>
            </div>
        </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="mb-4">
                <Image src="/images/logo.png" alt="OrderFlow Logo" width={240} height={240} />
            </div>
          <h1 className="text-3xl font-bold font-headline text-center">
            Bienvenido a OrderFlow
          </h1>
          <p className="text-muted-foreground text-center">
            Inicia sesión para gestionar tu inventario y adquisiciones.
          </p>
        </div>
        <LoginForm />
        <DomainHelper />
      </div>
    </div>
  );
}
