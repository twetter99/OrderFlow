
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Operador } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  cif: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Debe ser un correo electrónico válido.").optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type OperadorFormValues = z.infer<typeof formSchema>;

interface OperadorFormProps {
  operador?: Operador | null;
  onSave: (values: OperadorFormValues) => void;
  onCancel: () => void;
}

export function OperadorForm({ operador, onSave, onCancel }: OperadorFormProps) {
  const defaultValues: Partial<Operador> = operador
    ? { ...operador, notes: operador.notes || '' }
    : {
        name: "",
        cif: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
      };

  const form = useForm<OperadorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: OperadorFormValues) {
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
              <FormLabel>Nombre del Operador (Flota)</FormLabel>
              <FormControl>
                  <Input placeholder="Razón social del operador" {...field} />
              </FormControl>
              <FormMessage />
              </FormItem>
          )}
        />
        <FormField
        control={form.control}
        name="cif"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Código/CIF (Opcional)</FormLabel>
            <FormControl>
                <Input placeholder="Identificador fiscal" {...field} />
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
                <FormLabel>Teléfono (Opcional)</FormLabel>
                <FormControl>
                    <Input placeholder="Número de contacto principal" {...field} />
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
                <FormLabel>Email (Opcional)</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="Correo electrónico de contacto" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Dirección (Opcional)</FormLabel>
            <FormControl>
                <Input placeholder="Domicilio social o sede principal" {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Notas (Opcional)</FormLabel>
            <FormControl>
                <Textarea placeholder="Comentarios adicionales sobre el operador..." {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Operador</Button>
        </div>
      </form>
    </Form>
  );
}
