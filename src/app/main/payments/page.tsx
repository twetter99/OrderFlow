
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
import { payments as initialPayments } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, CalendarClock, CircleDollarSign } from "lucide-react";
import type { Payment } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInDays, isPast, isToday } from "date-fns";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [payments]);

  const getDueDateStatus = (payment: Payment) => {
    if (payment.status.startsWith('Pagado')) {
        return { text: 'Finalizado', color: 'bg-green-100 text-green-800 border-green-200' };
    }
    const dueDate = new Date(payment.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) {
        return { text: 'Vencido', color: 'bg-destructive/20 text-destructive border-destructive/30' };
    }
    const daysUntilDue = differenceInDays(dueDate, new Date());
    if (daysUntilDue <= 7) {
        return { text: `Vence en ${daysUntilDue + 1} días`, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
    return { text: 'Pendiente', color: 'bg-muted/50' };
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Gestión de Vencimientos y Pagos</h1>
        <p className="text-muted-foreground">
          Controla los vencimientos de las facturas de proveedor y registra los pagos.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Vencimientos Pendientes</CardTitle>
            <CardDescription>Lista de todos los pagos pendientes a proveedores, ordenados por fecha de vencimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura/Ref.</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha de Vencimiento</TableHead>
                <TableHead>Estado del Pago</TableHead>
                <TableHead>Importe a Pagar</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.map((payment) => {
                const dueDateStatus = getDueDateStatus(payment);
                return (
                <TableRow key={payment.id} className={cn(dueDateStatus.text === 'Vencido' && "bg-destructive/5")}>
                  <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                  <TableCell>{payment.supplierName}</TableCell>
                  <TableCell>
                     <div className="flex flex-col">
                        <span>{new Date(payment.dueDate).toLocaleDateString()}</span>
                        <Badge variant="outline" className={cn("capitalize w-fit", dueDateStatus.color)}>
                            {dueDateStatus.text}
                        </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                        "capitalize",
                        payment.status === 'Pendiente' && 'bg-yellow-100 text-yellow-800 border-yellow-200',
                        payment.status === 'Pagado parcialmente' && 'bg-blue-100 text-blue-800 border-blue-200',
                        payment.status === 'Pagado total' && 'bg-green-100 text-green-800 border-green-200'
                    )}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(payment.amountDue)}
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
                            <CircleDollarSign className="mr-2 h-4 w-4"/>
                            Registrar Pago
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CalendarClock className="mr-2 h-4 w-4"/>
                            Ver Historial de Pagos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
              )})}
              {sortedPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay vencimientos pendientes.
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
