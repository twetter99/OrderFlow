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
import type { PurchaseOrder } from "@/lib/types";

const formSchema = z.object({
  project: z.string().min(1, "El ID del proyecto es obligatorio."),
  supplier: z.string().min(1, "El proveedor es obligatorio."),
  status: z.enum(["Pendiente", "Aprobado", "Enviado", "Recibido", "Parcial", "Rechazado"]),
  total: z.coerce.number().positive("El total debe ser un número positivo."),
});

type PurchasingFormValues = z.infer<typeof formSchema>;

interface PurchasingFormProps {
  order?: PurchaseOrder | null;
  onSave: (values: PurchasingFormValues) => void;
  onCancel: () => void;
}

export function PurchasingForm({ order, onSave, onCancel }: PurchasingFormProps) {
  const defaultValues = order
    ? { ...order }
    : {
        project: "",
        supplier: "",
        status: "Pendiente",
        total: 0,
      };

  const form = useForm<PurchasingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: PurchasingFormValues) {
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="project"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID del Proyecto</FormLabel>
              <FormControl>
                <Input placeholder="p. ej., PROJ-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor</FormLabel>
              <FormControl>
                <Input placeholder="p. ej., TechParts Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total del Pedido</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1200.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Aprobado">Aprobado</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="Recibido">Recibido</SelectItem>
                    <SelectItem value="Parcial">Parcial</SelectItem>
                    <SelectItem value="Rechazado">Rechazado</SelectItem>
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
