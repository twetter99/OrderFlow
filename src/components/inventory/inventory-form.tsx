
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
import { Input } from "@/components/ui/input";
import type { InventoryItem, Supplier } from "@/lib/types";
import { SupplierCombobox } from "./supplier-combobox";

const formSchema = z.object({
  sku: z.string().min(1, "El SKU es obligatorio."),
  name: z.string().min(1, "El nombre es obligatorio."),
  quantity: z.coerce.number().nonnegative("La cantidad no puede ser negativa."),
  minThreshold: z.coerce.number().nonnegative("El umbral mínimo no puede ser negativo."),
  unitCost: z.coerce.number().positive("El costo unitario debe ser positivo."),
  supplier: z.string().min(1, "El proveedor es obligatorio."),
});

type InventoryFormValues = z.infer<typeof formSchema>;

interface InventoryFormProps {
  item?: InventoryItem | null;
  suppliers: Supplier[];
  onSave: (values: InventoryFormValues) => void;
  onCancel: () => void;
  onAddNewSupplier: () => void;
}

export function InventoryForm({ item, suppliers, onSave, onCancel, onAddNewSupplier }: InventoryFormProps) {
  const defaultValues = item
    ? { ...item }
    : {
        sku: "",
        name: "",
        quantity: 0,
        minThreshold: 10,
        unitCost: 0,
        supplier: "",
      };

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: InventoryFormValues) {
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Artículo</FormLabel>
                <FormControl>
                  <Input placeholder="p. ej., Unidad de Procesamiento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="p. ej., CPU-45" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad en Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Umbral Mínimo</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="unitCost"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Costo Unitario</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="350.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                <FormLabel>Proveedor</FormLabel>
                <FormControl>
                    <SupplierCombobox
                      suppliers={suppliers}
                      value={field.value}
                      onChange={field.onChange}
                      onAddNew={onAddNewSupplier}
                    />
                </FormControl>
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
