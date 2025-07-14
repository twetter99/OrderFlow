
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import type { DeliveryNote, Project, InventoryItem } from "@/lib/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const formSchema = z.object({
  projectId: z.string().min(1, "Debes seleccionar un proyecto."),
  items: z.array(z.object({
    itemId: z.string().min(1, "Debes seleccionar un artículo."),
    quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
  })).min(1, "Debes añadir al menos un artículo."),
});

type DespatchFormValues = z.infer<typeof formSchema>;

interface DespatchFormProps {
  note?: DeliveryNote | null;
  projects: Project[];
  inventoryItems: InventoryItem[];
  onSave: (values: DespatchFormValues) => void;
  onCancel: () => void;
}

export function DespatchForm({ note, projects, inventoryItems, onSave, onCancel }: DespatchFormProps) {
  const isReadOnly = !!note;

  const form = useForm<DespatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: note ? { projectId: note.projectId, items: note.items } : { projectId: "", items: [{ itemId: "", quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = form.watch('items');

  function onSubmit(values: DespatchFormValues) {
    // Check for stock availability
    for (const item of values.items) {
      const stockItem = inventoryItems.find(i => i.id === item.itemId);
      if (!stockItem || stockItem.quantity < item.quantity) {
        form.setError(`items.${values.items.indexOf(item)}.quantity`, {
          type: "manual",
          message: `Stock insuficiente. Disponible: ${stockItem?.quantity || 0}`,
        });
        return; // Stop submission
      }
    }
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proyecto de Destino</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proyecto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Artículos a Despachar</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60%]">Artículo</TableHead>
                            <TableHead>Cantidad</TableHead>
                            {!isReadOnly && <TableHead className="text-right">Acción</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => {
                            const selectedItem = inventoryItems.find(i => i.id === watchedItems[index]?.itemId);
                            const stockAvailable = selectedItem ? selectedItem.quantity : 0;
                            return (
                            <TableRow key={field.id}>
                                <TableCell>
                                    <FormField
                                    control={form.control}
                                    name={`items.${index}.itemId`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un artículo" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                {inventoryItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name} (Stock: {i.quantity})</SelectItem>)}
                                                </SelectContent>
                                            </Select>
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
                                            <Input type="number" {...field} disabled={isReadOnly} />
                                            <FormMessage />
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
                        )})}
                    </TableBody>
                </Table>
                 {!isReadOnly && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => append({ itemId: "", quantity: 1 })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Artículo
                    </Button>
                )}
                 <FormField
                    control={form.control}
                    name="items"
                    render={() => <FormItem><FormMessage /></FormItem>}
                  />
            </CardContent>
        </Card>
        
        {!isReadOnly && (
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Generar Albarán</Button>
          </div>
        )}
      </form>
    </Form>
  );
}

