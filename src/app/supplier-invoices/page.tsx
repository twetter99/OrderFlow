"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react";
import type { SupplierInvoice, Supplier, PurchaseOrder } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supplierInvoices, suppliers, purchaseOrders } from "@/lib/data"; // Using mock data for now
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InvoiceForm } from '@/components/supplier-invoices/invoice-form';

export default function SupplierInvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(supplierInvoices);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);

  const enrichedInvoices = useMemo(() => {
    return invoices.map(invoice => {
        const supplier = suppliers.find(s => s.id === invoice.supplierId);
        return {
            ...invoice,
            supplierName: supplier?.name || 'Desconocido',
        }
    }).filter(invoice => 
        invoice.supplierName.toLowerCase().includes(filter.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(filter.toLowerCase())
    );
  }, [invoices, filter]);
  
  const handleAddClick = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };
  
  const handleSave = (values: any) => {
    // This is where you would save to Firestore
    toast({
        title: selectedInvoice ? "Factura actualizada" : "Factura creada",
        description: `La factura ${values.invoiceNumber} se ha guardado correctamente.`,
    });
    setIsModalOpen(false);
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const getStatusBadgeVariant = (status: SupplierInvoice['status']) => {
    switch (status) {
      case 'Pagada': return 'default';
      case 'Pendiente de pago': return 'secondary';
      case 'Validada': return 'outline';
      case 'Pendiente de validar': return 'outline';
      case 'Disputada': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline uppercase">Facturas de Proveedor</h1>
          <p className="text-muted-foreground">
            Gestiona y valida las facturas recibidas de tus proveedores.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Factura
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Listado de Facturas</CardTitle>
          <CardDescription>
            Busca y gestiona todas las facturas de proveedores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
                placeholder="Filtrar por proveedor o nº de factura..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Nº Factura</TableHead>
                <TableHead>F. Factura</TableHead>
                <TableHead>F. Vencimiento</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">IVA</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center">Cargando...</TableCell></TableRow>
              ) : enrichedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.supplierName}</TableCell>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{new Date(invoice.emissionDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.baseAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.vatAmount)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(invoice.status)}
                      className={cn(invoice.status === 'Pendiente de pago' && 'animate-pulse')}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Ver / Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && enrichedInvoices.length === 0 && (
                <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No se encontraron facturas.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
           <DialogHeader>
            <DialogTitle>{selectedInvoice ? "Editar Factura" : "Registrar Nueva Factura"}</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={selectedInvoice}
            suppliers={suppliers}
            purchaseOrders={purchaseOrders}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
