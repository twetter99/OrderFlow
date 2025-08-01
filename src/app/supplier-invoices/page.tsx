

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
import type { SupplierInvoice, Supplier, PurchaseOrder, Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, convertTimestampsToISO } from "@/lib/utils";
import { InvoiceForm } from '@/components/supplier-invoices/invoice-form';

export default function SupplierInvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);

  useEffect(() => {
    const unsubInvoices = onSnapshot(collection(db, "supplierInvoices"), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => convertTimestampsToISO({ id: doc.id, ...doc.data() }) as SupplierInvoice));
      if(loading) setLoading(false);
    });
    const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snapshot) => {
      setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    });
    const unsubPOs = onSnapshot(collection(db, "purchaseOrders"), (snapshot) => {
      setPurchaseOrders(snapshot.docs.map(doc => convertTimestampsToISO({ id: doc.id, ...doc.data() }) as PurchaseOrder));
    });
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });

    return () => {
      unsubInvoices();
      unsubSuppliers();
      unsubPOs();
      unsubProjects();
    };
  }, [loading]);

  const enrichedInvoices = useMemo(() => {
    if (loading) return [];
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
  }, [invoices, filter, suppliers, loading]);
  
  const handleAddClick = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (invoice: SupplierInvoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  }

  const handleSave = async (values: any) => {
    const { bases, ...rest } = values;
    
    // Calculate totals based on the array of bases
    const vatAmount = bases.reduce((acc: number, item: { baseAmount: number; vatRate: number; }) => acc + (item.baseAmount * (item.vatRate || 0)), 0);
    const totalAmount = bases.reduce((acc: number, item: { baseAmount: number; vatRate: number; }) => acc + item.baseAmount + (item.baseAmount * (item.vatRate || 0)), 0);

    const poTotal = (values.purchaseOrderIds || []).reduce((acc: number, poId: string) => {
        const order = purchaseOrders.find(po => po.id === poId);
        return acc + (order?.total || 0);
    }, 0);

    const difference = totalAmount - poTotal;

    const finalValues = {
        ...rest,
        bases,
        vatAmount,
        totalAmount,
        totalAmountDifference: difference,
        // La justificación ya viene en 'values' si es necesaria
    };

    try {
      if (selectedInvoice) {
        const docRef = doc(db, "supplierInvoices", selectedInvoice.id);
        await updateDoc(docRef, finalValues);
        toast({
          title: "Factura actualizada",
          description: `La factura ${values.invoiceNumber} se ha guardado correctamente.`,
        });
      } else {
        await addDoc(collection(db, "supplierInvoices"), finalValues);
        toast({
            title: "Factura creada",
            description: `La factura ${values.invoiceNumber} se ha guardado correctamente.`,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
       console.error("Error saving invoice:", error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "No se pudo guardar la factura.",
       });
    }
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
                  <TableCell>{new Date(invoice.emissionDate as string).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate as string).toLocaleDateString()}</TableCell>
                   <TableCell className="text-right">{formatCurrency(invoice.bases.reduce((acc, b) => acc + b.baseAmount, 0))}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditClick(invoice)}>
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
        <DialogContent className="sm:max-w-6xl">
           <DialogHeader>
            <DialogTitle>{selectedInvoice ? "Editar Factura" : "Registrar Nueva Factura"}</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={selectedInvoice}
            suppliers={suppliers}
            purchaseOrders={purchaseOrders || []}
            projects={projects || []}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
