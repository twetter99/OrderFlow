
"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
  password: z.string().min(1, "La contraseña no puede estar vacía."),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const { signInWithEmail, sendPasswordReset, loading } = useAuth();
  const [emailForReset, setEmailForReset] = React.useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    signInWithEmail(values.email, values.password);
  };
  
  const handleForgotPassword = () => {
    const email = form.getValues("email");
    if (!email) {
        form.setError("email", { type: "manual", message: "Introduce tu email para restablecer la contraseña." });
        return;
    }
    sendPasswordReset(email);
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Verificando..." : "Acceder"}
            </Button>
            <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-normal text-muted-foreground"
                onClick={handleForgotPassword}
            >
              ¿Has olvidado tu contraseña?
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
