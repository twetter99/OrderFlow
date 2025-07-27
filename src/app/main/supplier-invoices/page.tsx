
"use client";

import React, { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supplierInvoices as initialInvoices } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle, Paperclip, Eye } from "lucide-react";
import type { SupplierInvoice } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(initialInvoices);

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => new Date(b.emissionDate).getTime() - new Date(a.emissionDate).getTime());
  }, [invoices]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Facturas de Proveedor</h1>
          <p className="text-muted-foreground">
            Registra y valida las facturas recibidas de tus proveedores.
          </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Factura
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Listado de Facturas</CardTitle>
            <CardDescription>Consulta el estado de todas las facturas de proveedor.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Factura</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.supplierName}</TableCell>
                  <TableCell>{new Date(invoice.emissionDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(invoice.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                        "capitalize",
                        invoice.status === 'Pendiente de validar' && 'bg-yellow-100 text-yellow-800 border-yellow-200',
                        invoice.status === 'Validada' && 'bg-blue-100 text-blue-800 border-blue-200',
                        invoice.status === 'Pendiente de pago' && 'bg-orange-100 text-orange-800 border-orange-200',
                        invoice.status === 'Pagada' && 'bg-green-100 text-green-800 border-green-200'
                    )}>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4"/>
                            Validar / Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Paperclip className="mr-2 h-4 w-4"/>
                            Ver Documentos Adjuntos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
              ))}
              {sortedInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay facturas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
