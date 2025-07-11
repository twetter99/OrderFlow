"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardDescription } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // In a real app, you'd handle authentication here.
    console.log("Login submitted");
    router.push("/dashboard");
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardContent className="pt-6">
            <CardDescription className="text-center">
              Para este prototipo, puedes acceder directamente sin necesidad de credenciales.
            </CardDescription>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Acceder al Panel de Control
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
