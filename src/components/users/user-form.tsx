

"use client";

import React, { useState } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { User, UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

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

const rateSchema = z.object({
  rateWorkHour: z.coerce.number().min(0, "La tarifa debe ser positiva"),
  rateTravelHour: z.coerce.number().min(0, "La tarifa debe ser positiva"),
  rateOvertimeWeekdayDay: z.coerce.number().min(0, "La tarifa debe ser positiva"),
  rateOvertimeWeekdayNight: z.coerce.number().min(0, "La tarifa debe ser positiva"),
  rateOvertimeWeekendDay: z.coerce.number().min(0, "La tarifa debe ser positiva"),
  rateOvertimeWeekendNight: z.coerce.number().min(0, "La tarifa debe ser positiva"),
  rateNotes: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  role: z.enum(userRoles as [string, ...string[]]).refine((val): val is UserRole => userRoles.includes(val), {
    message: "Rol no válido",
  }),
  rates: rateSchema,
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
        role: user.role as UserRole, // Aseguramos el tipo
        rates: user.rates || {
          rateWorkHour: 0,
          rateTravelHour: 0,
          rateOvertimeWeekdayDay: 0,
          rateOvertimeWeekdayNight: 0,
          rateOvertimeWeekendDay: 0,
          rateOvertimeWeekendNight: 0,
          rateNotes: "",
        }
      }
    : {
        name: "",
        email: "",
        phone: "",
        role: "Técnico Instalador" as const,
        rates: {
          rateWorkHour: 0,
          rateTravelHour: 0,
          rateOvertimeWeekdayDay: 0,
          rateOvertimeWeekdayNight: 0,
          rateOvertimeWeekendDay: 0,
          rateOvertimeWeekendNight: 0,
          rateNotes: "",
        }
      };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const watchedRole = useWatch({ control: form.control, name: 'role' });
  const selectedCategoryDescription = technicianCategories.find(c => c.name === watchedRole)?.description;

  function onSubmit(values: UserFormValues) {
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
            <CardHeader><CardTitle>Información Personal</CardTitle></CardHeader>
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
                                    <SelectItem
                                    key={category.name}
                                    value={category.name}
                                    >
                                    {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedCategoryDescription && (
                          <FormDescription>
                            {selectedCategoryDescription}
                          </FormDescription>
                        )}
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Tabla de Tarifas (€/hora)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <FormField name="rates.rateWorkHour" render={({ field }) => (
                        <FormItem><FormLabel>Tarifa Hora de Trabajo</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField name="rates.rateTravelHour" render={({ field }) => (
                        <FormItem><FormLabel>Tarifa Hora de Desplazamiento</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                     <FormField name="rates.rateOvertimeWeekdayDay" render={({ field }) => (
                        <FormItem><FormLabel>Tarifa Extra (Laborable Diurna)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                      <FormField name="rates.rateOvertimeWeekdayNight" render={({ field }) => (
                        <FormItem><FormLabel>Tarifa Extra (Laborable Nocturna)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                      <FormField name="rates.rateOvertimeWeekendDay" render={({ field }) => (
                        <FormItem><FormLabel>Tarifa Extra (Festivo Diurna)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                      <FormField name="rates.rateOvertimeWeekendNight" render={({ field }) => (
                        <FormItem><FormLabel>Tarifa Extra (Festivo Nocturna)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField name="rates.rateNotes" render={({ field }) => (
                    <FormItem><FormLabel>Notas sobre Tarifas</FormLabel><FormControl><Textarea placeholder="Añade cualquier observación sobre las tarifas de este técnico..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </CardContent>
        </Card>


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
