
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import type { SupplierInvoice, Supplier, PurchaseOrder, Project } from "@/lib/types";
import { CalendarIcon, FileUp, Package, Tag, Building, CalendarDays, Euro } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, { useEffect, useMemo, useState } from "react";
import { Textarea } from "../ui/textarea";
import { SupplierCombobox } from "../inventory/supplier-combobox";
import { ScrollArea } from "../ui/scroll-area";

const vatRates = [
  { label: 'General (21%)', value: 0.21 },
  { label: 'Reducido (10%)', value: 0.10 },
  { label: 'Superreducido (4%)', value: 0.04 },
  { label: 'Exento (0%)', value: 0.0 },
];

const formSchema = z.object({
  supplierId: z.string().min(1, "Debes seleccionar un proveedor."),
  purchaseOrderId: z.string().optional(),
  invoiceNumber: z.string().min(1, "El número de factura es obligatorio."),
  emissionDate: z.date({ required_error: "La fecha de factura es obligatoria." }),
  dueDate: z.date({ required_error: "La fecha de vencimiento es obligatoria." }),
  baseAmount: z.coerce.number().min(0, "El importe debe ser positivo."),
  vatRate: z.coerce.number(),
  status: z.enum(['Pendiente de validar', 'Validada', 'Disputada', 'Pendiente de pago', 'Pagada']),
  notes: z.string().optional(),
  attachment: z.any().optional(), // For file handling
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  invoice?: SupplierInvoice | null;
  suppliers: Supplier[];
  projects: Project[];
  purchaseOrders: PurchaseOrder[];
  onSave: (values: any) => void;
  onCancel: () => void;
}

export function InvoiceForm({ invoice, suppliers, projects, purchaseOrders, onSave, onCancel }: InvoiceFormProps) {

  const [hoveredOrder, setHoveredOrder] = useState<PurchaseOrder | null>(null);

  const defaultValues: Partial<InvoiceFormValues> = invoice
    ? { 
        ...invoice,
        emissionDate: new Date(invoice.emissionDate as string),
        dueDate: new Date(invoice.dueDate as string),
      }
    : {
        supplierId: "",
        invoiceNumber: "",
        emissionDate: new Date(),
        dueDate: new Date(),
        baseAmount: 0,
        vatRate: 0.21,
        status: "Pendiente de validar",
        notes: "",
      };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const selectedSupplierId = useWatch({ control: form.control, name: 'supplierId' });
  const baseAmount = useWatch({ control: form.control, name: 'baseAmount' });
  const vatRate = useWatch({ control: form.control, name: 'vatRate' });

  const vatAmount = useMemo(() => baseAmount * vatRate, [baseAmount, vatRate]);
  const totalAmount = useMemo(() => baseAmount + vatAmount, [baseAmount, vatAmount]);
  
  const filteredPurchaseOrders = useMemo(() => {
    if (!selectedSupplierId) return [];
    const supplierDetails = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplierDetails) return [];
    return purchaseOrders.filter(po => 
      po.supplier === supplierDetails.name && (po.status === 'Recibida' || po.status === 'Recibida Parcialmente')
    );
  }, [selectedSupplierId, purchaseOrders, suppliers]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);


  function onSubmit(values: InvoiceFormValues) {
    const finalValues = {
        ...values,
        vatAmount,
        totalAmount,
    };
    onSave(finalValues);
  }
  
  const supplierName = suppliers.find(s => s.id === selectedSupplierId)?.name || '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Proveedor</FormLabel>
                        <SupplierCombobox 
                            suppliers={suppliers}
                            recentSupplierIds={[]}
                            value={supplierName}
                            onChange={(supplierName, supplierId) => {
                                field.onChange(supplierId);
                            }}
                            onAddNew={() => {}}
                        />
                    <FormMessage />
                    </FormItem>
                )}
            />
            <Popover open={!!hoveredOrder} >
                <PopoverTrigger asChild>
                     <FormField
                        control={form.control}
                        name="purchaseOrderId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Pedido de Compra Asociado (Opcional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedSupplierId}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Asocia un pedido..." /></SelectTrigger>
                                </FormControl>
                                <SelectContent onMouseLeave={() => setHoveredOrder(null)}>
                                {filteredPurchaseOrders.map(po => {
                                    return (
                                        <SelectItem 
                                            key={po.id} 
                                            value={po.id}
                                            onMouseEnter={() => setHoveredOrder(po)}
                                        >
                                            {po.orderNumber}
                                        </SelectItem>
                                    )
                                })}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </PopoverTrigger>
                {hoveredOrder && (
                     <PopoverContent side="right" align="start" className="w-[450px]">
                        <Card className="border-none shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Tag className="h-5 w-5 text-primary"/>
                                    Vista Previa del Pedido
                                </CardTitle>
                                <CardDescription>{hoveredOrder.orderNumber}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground"/>
                                        <strong>Proyecto:</strong>
                                        <span className="truncate">{projects.find(p => p.id === hoveredOrder.project)?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                                        <strong>Fecha:</strong>
                                        <span>{new Date(hoveredOrder.date as string).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Euro className="h-4 w-4 text-muted-foreground"/>
                                        <strong>Total del Pedido:</strong>
                                        <span className="font-bold">{formatCurrency(hoveredOrder.total)}</span>
                                    </div>
                                </div>
                                
                                <p className="text-sm font-medium flex items-center gap-2"><Package className="h-4 w-4"/>Artículos</p>
                                <ScrollArea className="h-[150px] border rounded-md">
                                    <ul className="p-2 text-sm space-y-2">
                                        {hoveredOrder.items.map((item, index) => (
                                            <li key={index} className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                                <div className="flex-grow">
                                                    <p className="font-medium truncate">{item.itemName}</p>
                                                    <p className="text-xs text-muted-foreground">Cant: {item.quantity} | P.U.: {formatCurrency(item.price)}</p>
                                                </div>
                                                <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </PopoverContent>
                )}
            </Popover>
             <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Número de Factura</FormLabel>
                    <FormControl><Input placeholder="Ej: F-2024-1234" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField
                control={form.control}
                name="emissionDate"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Factura</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                        {field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Elige una fecha</span>)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                    </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Vencimiento</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                        {field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Elige una fecha</span>)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                    </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/></PopoverContent></Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="baseAmount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Importe Base (€)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="vatRate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo de IVA</FormLabel>
                     <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                            {vatRates.map(rate => <SelectItem key={rate.label} value={String(rate.value)}>{rate.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="p-2 border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">Importe IVA</p>
                <p className="font-bold text-lg">{formatCurrency(vatAmount)}</p>
            </div>
            <div className="p-2 border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">Importe Total</p>
                <p className="font-bold text-lg">{formatCurrency(totalAmount)}</p>
            </div>
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estado de la Factura</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                           <SelectItem value="Pendiente de validar">Pendiente de validar</SelectItem>
                           <SelectItem value="Validada">Validada</SelectItem>
                           <SelectItem value="Disputada">Disputada</SelectItem>
                           <SelectItem value="Pendiente de pago">Pendiente de pago</SelectItem>
                           <SelectItem value="Pagada">Pagada</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="attachment"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Adjuntar Factura</FormLabel>
                        <FormControl>
                            <Button type="button" variant="outline" className="w-full justify-start text-left font-normal" disabled>
                                <FileUp className="mr-2 h-4 w-4" />
                                <span className="truncate">
                                    Subir PDF o imagen...
                                </span>
                            </Button>
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )}
             />
        </div>
        
         <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Notas Adicionales</FormLabel>
                <FormControl><Textarea placeholder="Observaciones sobre la factura..." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Factura</Button>
        </div>
      </form>
    </Form>
  );
}
