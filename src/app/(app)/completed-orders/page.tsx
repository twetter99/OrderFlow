
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { MoreHorizontal, Printer, Eye, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PurchaseOrder } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deletePurchaseOrder, deleteMultiplePurchaseOrders } from "../purchasing/actions";
import { Checkbox } from "@/components/ui/checkbox";

const convertTimestamps = (order: any): PurchaseOrder => {
    return {
      ...order,
      id: order.id,
      date: order.date instanceof Timestamp ? order.date.toDate().toISOString() : order.date,
      estimatedDeliveryDate: order.estimatedDeliveryDate instanceof Timestamp ? order.estimatedDeliveryDate.toDate().toISOString() : order.estimatedDeliveryDate,
    };
};

export default function CompletedOrdersPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubPO = onSnapshot(collection(db, "purchaseOrders"), (snapshot) => {
        const ordersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return convertTimestamps({ ...data, id: doc.id });
        });
        setPurchaseOrders(ordersData);
        setLoading(false);
    });

    return () => {
        unsubPO();
    };
  }, []);
  
  const completedOrders = useMemo(() => {
    return purchaseOrders.filter(order => order.status === 'Almacenada');
  }, [purchaseOrders]);

  const handleDeleteTrigger = (order: PurchaseOrder) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };
  
  const handleBulkDeleteClick = () => {
    setOrderToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const handlePrintClick = (orderId: string) => {
    window.open(`/purchasing/${orderId}/print`, '_blank');
  };
  
  const confirmDelete = async () => {
    let result;
    if (orderToDelete) {
        result = await deletePurchaseOrder(orderToDelete.id);
    } else if (selectedRowIds.length > 0) {
        result = await deleteMultiplePurchaseOrders(selectedRowIds);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setOrderToDelete(null);
    setSelectedRowIds([]);
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(completedOrders.map(p => p.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowSelect = (rowId: string) => {
    setSelectedRowIds(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId) 
        : [...prev, rowId]
    );
  };
  
  if (loading) {
    return <div>Cargando órdenes completadas...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Órdenes Completadas</h1>
          <p className="text-muted-foreground">
            Historial de todas las órdenes de compra que han sido recibidas y almacenadas.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Historial de Pedidos</CardTitle>
                    <CardDescription>Consulta todas las órdenes de compra finalizadas.</CardDescription>
                </div>
                {selectedRowIds.length > 0 && (
                    <Button variant="destructive" onClick={handleBulkDeleteClick}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar ({selectedRowIds.length})
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead padding="checkbox" className="w-[50px]">
                  <Checkbox
                    checked={selectedRowIds.length === completedOrders.length && completedOrders.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>ID de Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Fecha de Almacenamiento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedOrders.map((order) => {
                return (
                <TableRow key={order.id} data-state={selectedRowIds.includes(order.id) ? "selected" : ""}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(order.id)}
                      onCheckedChange={() => handleRowSelect(order.id)}
                      aria-label={`Seleccionar orden ${order.orderNumber}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.orderNumber || order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                   <TableCell>{order.project}</TableCell>
                  <TableCell>{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}
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
                          <DropdownMenuItem onClick={() => handlePrintClick(order.id)}>
                            <Printer className="mr-2 h-4 w-4"/>
                            Imprimir Orden
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTrigger(order)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
              )})}
              {completedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay órdenes de compra completadas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
               {orderToDelete ? ` el pedido "${orderToDelete.orderNumber}".` : (selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} pedidos seleccionados.` : " el pedido seleccionado.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
