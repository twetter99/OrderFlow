

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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useMemo, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { MultiSelect } from "../ui/multi-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const formSchema = z.object({
  type: z.enum(['simple', 'composite', 'service']),
  sku: z.string().min(1, "El SKU es obligatorio."),
  name: z.string().min(1, "El nombre es obligatorio."),
  supplierProductCode: z.string().optional(),
  family: z.string().optional(),
  unit: z.string().min(1, "La unidad es obligatoria."),
  observations: z.string().optional(),
  // Campos opcionales según el tipo
  unitCost: z.coerce.number().positive("El costo unitario debe ser positivo.").optional().or(z.literal(0)),
  suppliers: z.array(z.string()).optional(),
  components: z.array(z.object({
    itemId: z.string().min(1, "Selecciona un componente."),
    quantity: z.coerce.number().min(1, "La cantidad debe ser >= 1."),
  })).optional(),
}).refine(data => {
    if (data.type === 'composite') {
        return data.components && data.components.length > 0;
    }
    return true;
}, {
    message: "Un kit debe tener al menos un componente.",
    path: ["components"],
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

const productFamilies = [
    { name: 'Cableado', description: 'Todo tipo de cables eléctricos, datos UTP, coaxiales, etc.' },
    { name: 'Conectores', description: 'Conectores para cables, terminales tipo faston, fichas de empalme, RJ45, etc.' },
    { name: 'Terminales', description: 'Terminales, pines y otros terminales para conexión de cables.' },
    { name: 'Tubos', description: 'Tubo corrugado, abierto, canaletas y otros sistemas de canalización.' },
    { name: 'Bridas', description: 'Bridas y bases de nylon y accesorios de sujeción de cables.' },
    { name: 'Harting', description: 'Conectores industriales y accesorios de la marca Harting.' },
    { name: 'Herrajes', description: 'Soportes, escuadras, anclajes, perfiles y elementos de fijación metálica.' },
    { name: 'Tornillería', description: 'Tornillos, tuercas, arandelas y sistemas de fijación.' },
    { name: 'Borneros Wago', description: 'Bornas, puentes y tapas para placa de conexiones.' },
    { name: 'Equipos', description: 'Dispositivos electrónicos y eléctricos: routers, switches, cámaras, pantallas, fuentes de alimentación, etc.' },
    { name: 'Herramientas', description: 'Herramientas manuales y eléctricas necesarias para la instalación y el mantenimiento: destornilladores, taladros, pelacables, etc.' },
    { name: 'Papercast', description: 'Pantallas y componentes específicos de la marca Papercast.' },
    { name: 'Vision360', description: 'Equipos y componentes del sistema Vision360 para visión artificial y asistencia avanzada en vehículos.' },
    { name: 'Afluencia360', description: 'Equipos y componentes del sistema Afluencia360 para análisis de afluencia y movilidad en transporte público.' },
    { name: 'Varios', description: 'Materiales diversos y consumibles no categorizados en las familias anteriores.' },
];

export function InventoryForm({ item, suppliers, inventoryItems, onSave, onCancel, onAddNewSupplier }: InventoryFormProps) {
  
  const defaultValues = item
    ? { ...item, unitCost: item.unitCost || 0, suppliers: item.suppliers || [] }
    : {
        type: 'simple' as const,
        sku: "",
        name: "",
        supplierProductCode: "",
        family: "",
        observations: "",
        unitCost: 0,
        unit: 'ud',
        suppliers: [],
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
  
  useEffect(() => {
    if (itemType === 'service') {
        form.setValue('unit', 'ud');
    }
     if (itemType === 'composite') {
        form.setValue('unit', 'ud');
    }
  }, [itemType, form]);


  function onSubmit(values: InventoryFormValues) {
    const finalValues: any = { ...values };
    
    if (values.type === 'composite') {
        finalValues.unitCost = kitCost; // Ensure calculated cost is saved
        delete finalValues.suppliers; // Kits don't have external suppliers
        finalValues.unit = 'ud';
    }
    
    if (values.type === 'service') {
        delete finalValues.suppliers;
        finalValues.unit = 'ud';
    }

    if (values.type === 'simple' && !finalValues.suppliers) {
      finalValues.suppliers = [];
    }
    
    // El campo quantity se gestiona por ubicación, no en el item maestro.
    delete finalValues.quantity;

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

        <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>SKU (Código Interno)</FormLabel>
                    <FormControl>
                    <Input placeholder="p. ej., CPU-45" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="supplierProductCode"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Código Producto Proveedor</FormLabel>
                    <FormControl>
                    <Input placeholder="p. ej., TP-INC-8472B" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            </div>
             <div className="grid grid-cols-1">
                 <FormField
                    control={form.control}
                    name="family"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Familia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una familia"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {productFamilies.map(family => (
                                    <SelectItem key={family.name} value={family.name}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{family.name}</span>
                                            <span className="text-xs text-muted-foreground">{family.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             {itemType === 'simple' && (
                <div className="grid grid-cols-1">
                    <FormField
                        control={form.control}
                        name="suppliers"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Proveedores</FormLabel>
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <FormControl>
                                            <MultiSelect
                                                options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                                                selected={field.value || []}
                                                onChange={field.onChange}
                                                placeholder="Selecciona proveedores..."
                                                closeOnSelect={true}
                                                triggerIcon={PlusCircle}
                                            />
                                        </FormControl>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                    <p>Haz clic para seleccionar uno o varios proveedores</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
        
        {itemType === 'simple' && (
            <>
            <div className="grid grid-cols-2 gap-4">
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
            <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Costo Unitario (€)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="350,00" {...field} onFocus={(e) => e.target.select()} />
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
                            <Input type="number" step="0.01" placeholder="75,00" {...field} onFocus={(e) => e.target.select()} />
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
                    {simpleInventoryItems.length > 0 ? (
                    <>
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
                                                                <SelectItem key={i.id} value={i.id}>{i.name} ({i.sku})</SelectItem>
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
                                                    <Input type="number" {...field} onFocus={(e) => e.target.select()} />
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
                     <FormField
                        control={form.control}
                        name="components"
                        render={() => (
                            <FormItem>
                                <FormMessage className="pt-2" />
                            </FormItem>
                        )}
                        />
                    <div className="text-right font-bold mt-4">
                        Costo Total del Kit: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(kitCost)}
                    </div>
                    </>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center p-4">
                            No hay artículos simples definidos. Por favor, añade primero artículos simples para poder crear un kit.
                        </p>
                    )}
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
