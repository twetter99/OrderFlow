
"use client";

import React from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/types";
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const modules = [
    { id: 'dashboard', label: 'Panel de Control' },
    { id: 'projects', label: 'Gestión de Proyectos' },
    { id: 'installation-templates', label: 'Plantillas de Instalación' },
    { id: 'replan', label: 'Informes de Replanteo' },
    { id: 'resource-planning', label: 'Planificación de Recursos' },
    { id: 'travel-planning', label: 'Planificación Desplazamientos' },
    { id: 'inventory', label: 'Inventario' },
    { id: 'locations', label: 'Almacenes' },
    { id: 'purchasing', label: 'Compras' },
    { id: 'suppliers', label: 'Proveedores' },
    { id: 'project-tracking', label: 'Seguimiento y Control' },
    { id: 'reports', label: 'Reportes' },
    { id: 'documentation', label: 'Documentación' },
    { id: 'ai-assistant', label: 'Asistente IA' },
    { id: 'clients', label: 'Clientes' },
    { id: 'operadores', label: 'Operadores' },
    { id: 'technicians', label: 'Técnicos' },
    { id: 'supervisores', label: 'Supervisores' },
    { id: 'users', label: 'Usuarios y Permisos' },
    { id: 'approval-flows', label: 'Flujos de Aprobación' },
    { id: 'settings', label: 'Configuración App' },
] as const;

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  permissions: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debes seleccionar al menos un permiso.",
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
        permissions: user.permissions || [],
      }
    : {
        name: "",
        email: "",
        phone: "",
        permissions: [],
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
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Información del Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Permisos de Acceso a Módulos</CardTitle>
                <CardDescription>
                    Selecciona todos los módulos a los que este usuario tendrá acceso en el futuro.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                        <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {modules.map((item) => (
                            <FormField
                                key={item.id}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item.id
                                                )
                                            )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {item.label}
                                    </FormLabel>
                                    </FormItem>
                                )
                                }}
                            />
                            ))}
                        </div>
                        <FormMessage className="pt-4"/>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

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
