
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
import { purchaseOrders as initialPurchaseOrders, inventory as initialInventory } from "@/lib/data";
import { cn } from "@/lib/utils";
import { QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryItem, PurchaseOrder } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ReceptionChecklist } from "@/components/receptions/reception-checklist";

export default function ReceptionsPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const ordersToReceive = purchaseOrders.filter(o => o.status === 'Enviado');

  const handleVerifyClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsChecklistOpen(true);
  };
  
  const handleUpdateOrderStatus = (orderId: string, status: PurchaseOrder['status']) => {
    const orderToUpdate = purchaseOrders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
    // Update Inventory
    let updatedInventory = [...inventory];
    if (status === 'Recibido') {
      orderToUpdate.items.forEach(itemToReceive => {
          updatedInventory = updatedInventory.map(stockItem => {
              if (stockItem.id === itemToReceive.itemId) {
                  return { ...stockItem, quantity: stockItem.quantity + itemToReceive.quantity };
              }
              return stockItem;
          });
      });
      setInventory(updatedInventory);
    }
    
    setPurchaseOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: status} : o));
    
    toast({
        title: "Orden Actualizada",
        description: `La orden ${orderId} ha sido marcada como ${status}. El inventario ha sido actualizado.`
    });
    setIsChecklistOpen(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Recepciones de Mercancía</h1>
          <p className="text-muted-foreground">
            Verifica y recibe los pedidos de compra entrantes.
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha de Envío</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersToReceive.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("capitalize bg-blue-100 text-blue-800 border-blue-200")}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleVerifyClick(order)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Verificar Recepción
                      </Button>
                    </TableCell>
                </TableRow>
              ))}
               {ordersToReceive.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay pedidos pendientes de recibir.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
                Verificar Recepción: {selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
                Simula el escaneo de artículos para verificar la mercancía recibida contra la orden de compra.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <ReceptionChecklist 
                order={selectedOrder}
                onUpdateStatus={handleUpdateOrderStatus}
                onCancel={() => setIsChecklistOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
