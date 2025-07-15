
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
import { PlusCircle, Trash2, Camera, Upload, ImageOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useMemo, useRef } from "react";
import { Textarea } from "../ui/textarea";
import Image from "next/image";

const formSchema = z.object({
  type: z.enum(['simple', 'composite', 'service']),
  sku: z.string().min(1, "El SKU es obligatorio."),
  name: z.string().min(1, "El nombre es obligatorio."),
  unit: z.string().min(1, "La unidad es obligatoria."),
  imageUrl: z.string().url("Debe ser una URL de imagen válida o una Data URL.").optional().or(z.literal('')),
  observations: z.string().optional(),
  // Campos opcionales según el tipo
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
    ? { ...item, minThreshold: item.minThreshold || 0 }
    : {
        type: 'simple' as const,
        sku: "",
        name: "",
        imageUrl: "",
        observations: "",
        minThreshold: 10,
        unitCost: 0,
        unit: 'ud',
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
  const watchedImageUrl = useWatch({ control: form.control, name: "imageUrl" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("imageUrl", reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };


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
  
  if (itemType === 'composite') {
      form.setValue('unitCost', kitCost, { shouldValidate: true });
      form.setValue('unit', 'ud', { shouldValidate: true });
  }

  if (itemType === 'service') {
      form.setValue('unit', 'ud', { shouldValidate: true });
  }

  function onSubmit(values: InventoryFormValues) {
    const finalValues: any = { ...values };
    
    // Elimina el campo quantity si existe, ya que ahora se gestiona por ubicación.
    delete finalValues.quantity;

    if (values.type === 'service') {
        finalValues.minThreshold = 0;
        finalValues.supplier = 'N/A';
        finalValues.unit = 'ud';
    }
    if (values.type === 'composite') {
        finalValues.supplier = 'Ensamblado Interno';
        finalValues.unit = 'ud';
    }
    onSave(finalValues);
  }

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
                  onValueChange={(value) => {
                    if (isEditing) return; // Don't allow changing type when editing
                    field.onChange(value);
                    if (value === 'service' || value === 'composite') {
                      form.setValue('unit', 'ud', { shouldValidate: true });
                    }
                  }}
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

        {itemType !== 'service' && (
           <FormField
            control={form.control}
            name="imageUrl"
            render={() => (
                <FormItem>
                    <FormLabel>Imagen del Artículo</FormLabel>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 flex-shrink-0 border rounded-md flex items-center justify-center bg-muted">
                            {watchedImageUrl ? (
                                <Image src={watchedImageUrl} alt="Vista previa del artículo" width={96} height={96} className="object-cover rounded-md" />
                            ) : (
                                <ImageOff className="h-10 w-10 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-grow space-y-2">
                             <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Cargar
                                </Button>
                                <Button type="button" variant="outline" onClick={() => cameraInputRef.current?.click()}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Tomar Foto
                                </Button>
                            </div>
                            <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
                            <Input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleImageChange} />
                            <p className="text-xs text-muted-foreground">Sube un archivo o usa la cámara del dispositivo.</p>
                        </div>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
            />
        )}
        
        {itemType === 'simple' && (
            <>
            <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="minThreshold"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Umbral Mínimo de Stock Total</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una unidad"/>
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="ud">Unidad (ud)</SelectItem>
                            <SelectItem value="ml">Metro Lineal (ml)</SelectItem>
                        </SelectContent>
                    </Select>
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
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="unitCost"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Costo/Tarifa (€)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="75,00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Unidad de Medida</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una unidad"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="ud">Unidad (ud)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
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

        <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                    <Textarea
                    placeholder="Añade cualquier nota o detalle relevante sobre el artículo aquí..."
                    {...field}
                    />
                </FormControl>
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
