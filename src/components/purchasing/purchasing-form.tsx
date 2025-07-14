
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
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
import type { PurchaseOrder, Supplier, InventoryItem } from "@/lib/types";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../ui/table";
import { SupplierCombobox } from "../inventory/supplier-combobox";
import { ItemPriceInsight } from "./item-price-insight";

const formSchema = z.object({
  project: z.string().optional(),
  supplier: z.string().min(1, "El proveedor es obligatorio."),
  status: z.enum(["Pendiente", "Aprobado", "Enviado", "Recibido", "Rechazado"]),
  rejectionReason: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().optional(), // Puede ser opcional si el nombre es la clave
    itemName: z.string().min(1, "El nombre es obligatorio."),
    quantity: z.coerce.number().min(1, "La cantidad debe ser >= 1."),
    price: z.coerce.number().min(0.01, "El precio es obligatorio."),
  })).min(1, "Debes añadir al menos un artículo."),
  total: z.coerce.number() // Se calculará automáticamente
});

type PurchasingFormValues = z.infer<typeof formSchema>;

interface PurchasingFormProps {
  order?: PurchaseOrder | null;
  onSave: (values: PurchasingFormValues) => void;
  onCancel: () => void;
  canApprove?: boolean;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
}

export function PurchasingForm({ order, onSave, onCancel, canApprove = false, suppliers, inventoryItems }: PurchasingFormProps) {
  const isReadOnly = order && !canApprove;
  
  const defaultValues = order
    ? { ...order, total: order.total || 0 }
    : {
        project: "",
        supplier: "",
        status: "Pendiente" as const,
        rejectionReason: "",
        items: [{ itemName: "", quantity: 1, price: 0 }],
        total: 0,
      };

  const form = useForm<PurchasingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const status = useWatch({ control: form.control, name: "status" });
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedSupplier = useWatch({ control: form.control, name: "supplier" });

  const total = watchedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  form.setValue('total', total);

  function onSubmit(values: PurchasingFormValues) {
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
                      onAddNew={() => { /* Implementar si es necesario */ }}
                      disabled={isReadOnly}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
           />
           <FormField
            control={form.control}
            name="project"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Proyecto (Opcional)</FormLabel>
                <FormControl>
                    <Input placeholder="p. ej., PROJ-001" {...field} disabled={isReadOnly} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
           />
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Artículos del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[45%]">Nombre del Artículo</TableHead>
                            <TableHead className="w-[15%]">Cantidad</TableHead>
                            <TableHead className="w-[25%]">Precio Unitario (€)</TableHead>
                            {!isReadOnly && <TableHead className="w-[10%] text-right"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                     <FormField
                                        control={form.control}
                                        name={`items.${index}.itemName`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="p. ej., Módulo GPS v2" {...field} disabled={isReadOnly} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                      <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" {...field} disabled={isReadOnly}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                <TableCell>
                                     <FormField
                                        control={form.control}
                                        name={`items.${index}.price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} disabled={isReadOnly}/>
                                                </FormControl>
                                                <FormMessage />
                                                {!isReadOnly && (
                                                    <ItemPriceInsight
                                                        itemName={watchedItems[index]?.itemName}
                                                        itemPrice={watchedItems[index]?.price}
                                                        supplierName={watchedSupplier}
                                                    />
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </TableCell>
                                {!isReadOnly && (
                                <TableCell className="text-right">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
                 {!isReadOnly && (
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => append({ itemName: "", quantity: 1, price: 0 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Fila
                </Button>
                )}
                 <FormField
                    control={form.control}
                    name="items"
                    render={() => <FormItem><FormMessage className="pt-2" /></FormItem>}
                  />
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!canApprove}>
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
                            <SelectItem value="Rechazado">Rechazado</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 {status === 'Rechazado' && canApprove && (
                    <FormField
                        control={form.control}
                        name="rejectionReason"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Motivo del Rechazo</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe por qué se rechaza este pedido..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>
            <div className="flex flex-col items-end justify-end space-y-2">
                 <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total del Pedido</p>
                    <p className="text-2xl font-bold">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)}
                    </p>
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {isReadOnly ? "Cerrar" : "Cancelar"}
          </Button>
          {!isReadOnly && (
            <Button type="submit">Guardar Pedido</Button>
          )}
        </div>
      </form>
    </Form>
  );
}
