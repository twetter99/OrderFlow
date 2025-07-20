
"use client";

import React from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { User, UserRole } from "@/lib/types";

// Roles genéricos para una futura gestión de permisos de acceso
const systemRoles = ["Administrador", "Miembro del Equipo", "Solo Lectura"] as const;

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  role: z.enum(systemRoles, {
    errorMap: () => ({ message: "Debes seleccionar un nivel de acceso." }),
  }),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  user?: User | null;
  onSave: (values: UserFormValues) => void;
  onCancel: () => void;
}


export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  
  const defaultValues = user
    ? { 
        ...user,
        role: user.role as UserRole,
      }
    : {
        name: "",
        email: "",
        phone: "",
        role: "Miembro del Equipo" as const,
      };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: UserFormValues) {
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Nombre Completo</FormLabel>
            <FormControl>
                <Input placeholder="p. ej., Juan Pérez" {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Correo Electrónico de Acceso</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="p. ej., juan.perez@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Teléfono de Contacto</FormLabel>
            <FormControl>
                <Input placeholder="p. ej., 600 123 456" {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
        <FormItem>
            <FormLabel>Nivel de Acceso Futuro</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un nivel de acceso" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="Administrador">Administrador (Acceso Total)</SelectItem>
                    <SelectItem value="Miembro del Equipo">Miembro del Equipo (Acceso Estándar)</SelectItem>
                    <SelectItem value="Solo Lectura">Solo Lectura (Acceso de Consulta)</SelectItem>
                </SelectContent>
            </Select>
            <FormMessage />
        </FormItem>
        )}
    />


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Usuario</Button>
        </div>
      </form>
    </Form>
  );
}
