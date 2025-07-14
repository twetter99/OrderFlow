
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useMemo } from "react";

const formSchema = z.object({
  type: z.enum(['simple', 'composite', 'service']),
  sku: z.string().min(1, "El SKU es obligatorio."),
  name: z.string().min(1, "El nombre es obligatorio."),
  // Campos opcionales según el tipo
  quantity: z.coerce.number().optional(),
  minThreshold: z.coerce.number().optional(),
  unitCost: z.coerce.number().positive("El costo unitario debe ser positivo."),
  supplier: z.string().optional(),
  components: z.array(z.object({
    itemId: z.string().min(1, "Selecciona un componente."),
    quantity: z.coerce.number().min(1, "La cantidad debe ser >= 1."),
  })).optional(),
});


type InventoryFormValues = z.infer<typeof formSchema>;

interface InventoryFormProps {
  item?: InventoryItem | null;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  onSave: (values: any) => void;
  onCancel: () => void;
  onAddNewSupplier: () => void;
}

export function InventoryForm({ item, suppliers, inventoryItems, onSave, onCancel, onAddNewSupplier }: InventoryFormProps) {
  
  const defaultValues = item
    ? { ...item }
    : {
        type: 'simple' as const,
        sku: "",
        name: "",
        quantity: 0,
        minThreshold: 10,
        unitCost: 0,
        supplier: "",
        components: [],
      };

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components"
  });

  const itemType = useWatch({ control: form.control, name: "type" });
  const watchedComponents = useWatch({ control: form.control, name: "components" });

  const simpleInventoryItems = useMemo(() => {
    return inventoryItems.filter(i => i.type === 'simple');
  }, [inventoryItems]);

  const kitCost = useMemo(() => {
    if (itemType !== 'composite' || !watchedComponents) return 0;
    return watchedComponents.reduce((acc, comp) => {
        const componentItem = inventoryItems.find(i => i.id === comp.itemId);
        return acc + (componentItem ? componentItem.unitCost * comp.quantity : 0);
    }, 0);
  }, [itemType, watchedComponents, inventoryItems]);
  
  // Actualizar el costo del kit automáticamente
  if (itemType === 'composite') {
      form.setValue('unitCost', kitCost);
  }


  function onSubmit(values: InventoryFormValues) {
    const finalValues = { ...values };
    if (values.type === 'service') {
        finalValues.quantity = 0;
        finalValues.minThreshold = 0;
        finalValues.supplier = 'N/A';
    }
    if (values.type === 'composite') {
        finalValues.quantity = 0; // Se calcula en tiempo real
        finalValues.supplier = 'Ensamblado Interno';
    }
    onSave(finalValues);
  }

  // No se puede cambiar el tipo de un artículo existente
  const isEditing = !!item;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Artículo</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                  disabled={isEditing}
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="simple" />
                    </FormControl>
                    <FormLabel className="font-normal">Artículo Simple</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="composite" />
                    </FormControl>
                    <FormLabel className="font-normal">Artículo Compuesto (Kit)</FormLabel>
                  </FormItem>
                   <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="service" />
                    </FormControl>
                    <FormLabel className="font-normal">Servicio</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Artículo/Servicio</FormLabel>
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
        
        {itemType === 'simple' && (
            <>
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
                        <FormLabel>Costo Unitario (€)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="350,00" {...field} />
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
                            value={field.value || ''}
                            onChange={field.onChange}
                            onAddNew={onAddNewSupplier}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            </>
        )}
        
        {itemType === 'service' && (
             <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Costo/Tarifa por Hora (€)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="75,00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}

        {itemType === 'composite' && (
            <Card>
                <CardHeader>
                    <CardTitle>Componentes del Kit</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-3/5">Componente</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead/>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`components.${index}.itemId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecciona un componente"/>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {simpleInventoryItems.map(i => (
                                                                <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`components.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Input type="number" {...field} />
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                     <TableCell>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ itemId: "", quantity: 1 })}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Añadir Componente
                    </Button>
                    <div className="text-right font-bold mt-4">
                        Costo Total del Kit: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(kitCost)}
                    </div>
                </CardContent>
            </Card>
        )}


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

