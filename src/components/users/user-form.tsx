
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

const userRoleDefinitions = [
  { name: 'Solicitante', description: 'Puede crear y enviar pedidos para aprobación.' },
  { name: 'Supervisor', description: 'Puede revisar y aprobar o rechazar pedidos asignados.' },
  { name: 'Validador', description: 'Puede dar la autorización final a pedidos ya aprobados.' },
  { name: 'Almacén', description: 'Gestiona la recepción y el despacho de mercancías.' },
  { name: 'Administrador', description: 'Tiene acceso completo a todas las funcionalidades.' },
] as const;

const userRoles = userRoleDefinitions.map(c => c.name) as [string, ...string[]];

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  role: z.enum(userRoles).refine((val): val is UserRole => (userRoles as readonly string[]).includes(val), {
    message: "Rol no válido",
  }),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  user?: User | null;
  onSave: (values: UserFormValues) => void;
  onCancel: () => void;
}


export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  
  const defaultValues = user
    ? { 
        ...user,
        role: user.role as UserRole,
      }
    : {
        name: "",
        email: "",
        phone: "",
        role: "Solicitante" as const,
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
                <FormLabel>Correo Electrónico</FormLabel>
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
            <FormLabel>Teléfono</FormLabel>
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
            <FormLabel>Rol de Aprobación</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent onPointerLeave={() => setHoveredCategory(null)}>
                    {userRoleDefinitions.map(category => (
                    <SelectItem 
                        key={category.name} 
                        value={category.name}
                        onPointerEnter={() => setHoveredCategory(category.name)}
                    >
                        <div>{category.name}</div>
                        {hoveredCategory === category.name && (
                        <div className="whitespace-normal text-base font-normal text-foreground/80 mt-1">
                            {category.description}
                        </div>
                        )}
                    </SelectItem>
                    ))}
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
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
