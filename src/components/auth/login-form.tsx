"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardDescription } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();

  function handleClick() {
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardContent className="pt-6">
          <CardDescription className="text-center">
            Para este prototipo, puedes acceder directamente sin necesidad de credenciales.
          </CardDescription>
      </CardContent>
      <CardFooter>
        <Button onClick={handleClick} className="w-full">
          Acceder al Panel de Control
        </Button>
      </CardFooter>
    </Card>
  );
}
