
"use client";

import React, { useState } from "react";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { purchaseOrders as initialPurchaseOrders, users } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PurchasingForm } from "@/components/purchasing/purchasing-form";
import type { PurchaseOrder } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Simulamos un usuario logueado. Cambia el ID para probar diferentes roles.
const LOGGED_IN_USER_ID = 'USER-001'; // 'USER-001' es Admin, 'USER-002' es Almacén, 'USER-003' es Empleado

export default function PurchasingPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const currentUser = users.find(u => u.id === LOGGED_IN_USER_ID);
  const canApprove = currentUser?.role === 'Administrador';

  const handleAddClick = () => {
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (values: any) => {
    if (selectedOrder) {
      setPurchaseOrders(
        purchaseOrders.map((p) =>
          p.id === selectedOrder.id ? { ...p, ...values, id: p.id, date: new Date().toISOString() } : p
        )
      );
      toast({ title: "Pedido actualizado", description: "El pedido de compra se ha actualizado correctamente." });
    } else {
      setPurchaseOrders([
        ...purchaseOrders,
        { ...values, id: `PO-2024-07-${String(purchaseOrders.length + 1).padStart(3, '0')}`, date: new Date().toISOString() },
      ]);
      toast({ title: "Pedido creado", description: "El nuevo pedido de compra se ha creado correctamente." });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      setPurchaseOrders(purchaseOrders.filter((p) => p.id !== selectedOrder.id));
      toast({ variant: "destructive", title: "Pedido eliminado", description: "El pedido de compra se ha eliminado correctamente." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedOrder(null);
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Compras</h1>
          <p className="text-muted-foreground">
            Crea y rastrea todas tus órdenes de compra.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Solicitud de Compra
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Orden</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((order) => (
                <TableRow key={order.id} className={cn(order.status === "Pendiente" && "bg-yellow-50 dark:bg-yellow-900/20")}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.project}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        order.status === "Aprobado" && "bg-green-100 text-green-800 border-green-200",
                        order.status === "Pendiente" && "bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse",
                        order.status === "Enviado" && "bg-blue-100 text-blue-800 border-blue-200",
                        order.status === "Recibido" && "bg-primary/10 text-primary border-primary/20",
                        order.status === "Rechazado" && "bg-red-100 text-red-800 border-red-200"
                      )}
                    >
                      {order.status === 'Pendiente' ? 'Pendiente Aprobación' : order.status}
                    </Badge>
                  </TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(order)}>
                            {canApprove ? "Revisar y Aprobar" : "Ver Detalles"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(order)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? (canApprove ? "Revisar Pedido de Compra" : "Detalles del Pedido") : "Crear Nuevo Pedido de Compra"}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder
                ? "Edita la información del pedido de compra."
                : "Rellena los detalles para crear un nuevo pedido."}
            </DialogDescription>
          </DialogHeader>
          <PurchasingForm
            order={selectedOrder}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            canApprove={canApprove}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el pedido de compra.
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

    
