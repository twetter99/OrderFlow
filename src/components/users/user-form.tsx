
"use client";

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

const technicianCategories = [
  { name: 'Técnico Ayudante / Auxiliar', description: 'Apoya en tareas básicas de instalación, cableado y montaje bajo supervisión directa.' },
  { name: 'Técnico Instalador', description: 'Realiza la instalación física y el conexionado de los equipos embarcados en vehículos.' },
  { name: 'Técnico Integrador de Sistemas Embarcados', description: 'Especialista en la integración y configuración conjunta de varios sistemas embarcados.' },
  { name: 'Técnico de Puesta en Marcha y Pruebas', description: 'Encargado de configurar los equipos, ponerlos en funcionamiento y comprobar su correcto funcionamiento tras la instalación.' },
  { name: 'Técnico de Mantenimiento', description: 'Realiza diagnósticos, reparaciones y mantenimientos preventivos y correctivos de los equipos instalados.' },
  { name: 'Jefe de Equipo / Encargado de Instalación', description: 'Coordina al equipo técnico, gestiona los recursos y supervisa la ejecución de las instalaciones.' },
  { name: 'Técnico de SAT (Servicio de Asistencia Técnica)', description: 'Atiende incidencias técnicas, realiza soporte post-instalación y resuelve averías en campo o de forma remota.' },
  { name: 'Técnico de Calidad / Certificación', description: 'Verifica y certifica que las instalaciones cumplen con los estándares y protocolos de calidad establecidos.' },
] as const;

const userRoles = technicianCategories.map(c => c.name);

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  role: z.enum(userRoles as [string, ...string[]]).refine((val): val is UserRole => userRoles.includes(val), {
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
  const defaultValues = user
    ? { ...user }
    : {
        name: "",
        email: "",
        phone: "",
        role: "Técnico Instalador" as const,
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
        <div className="grid grid-cols-2 gap-4">
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
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      {technicianCategories.map(category => (
                         <SelectItem key={category.name} value={category.name} title={category.description}>
                            {category.name}
                         </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
