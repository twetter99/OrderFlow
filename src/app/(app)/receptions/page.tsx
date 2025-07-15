
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { purchaseOrders as initialPurchaseOrders, inventory as initialInventory, locations, inventoryLocations as initialInventoryLocations } from "@/lib/data";
import { cn } from "@/lib/utils";
import { QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryItem, PurchaseOrder, InventoryLocation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ReceptionChecklist } from "@/components/receptions/reception-checklist";

export default function ReceptionsPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>(initialInventoryLocations);

  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const ordersToReceive = useMemo(() => {
    return purchaseOrders.filter(o => 
      o.status === 'Enviado' && o.items.some(item => item.type === 'Material')
    );
  }, [purchaseOrders]);

  const handleVerifyClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsChecklistOpen(true);
  };
  
  const handleUpdateOrderStatus = (orderId: string, status: PurchaseOrder['status'], receivingLocationId?: string, receivedItems?: { itemId: string; quantity: number }[]) => {
    const orderToUpdate = purchaseOrders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
    // Update Inventory
    let updatedInventoryLocations = [...inventoryLocations];
    if (status === 'Recibido' && receivingLocationId && receivedItems) {
      
      receivedItems.forEach(itemToReceive => {
          const locationIndex = updatedInventoryLocations.findIndex(
              loc => loc.itemId === itemToReceive.itemId && loc.locationId === receivingLocationId
          );

          if (locationIndex > -1) {
              updatedInventoryLocations[locationIndex].quantity += itemToReceive.quantity;
          } else {
              updatedInventoryLocations.push({
                  id: `INVLOC-${Date.now()}-${itemToReceive.itemId}`,
                  itemId: itemToReceive.itemId,
                  locationId: receivingLocationId,
                  quantity: itemToReceive.quantity
              });
          }
      });
      
      setInventoryLocations(updatedInventoryLocations);
    }
    
    setPurchaseOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: status} : o));
    
    toast({
        title: "Orden Actualizada",
        description: `La orden ${orderId} ha sido marcada como ${status}. El inventario en la ubicación seleccionada ha sido actualizado.`
    });
    setIsChecklistOpen(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Recepciones de Mercancía</h1>
          <p className="text-muted-foreground">
            Verifica y recibe los pedidos de compra entrantes en un almacén específico.
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
                        No hay pedidos de material pendientes de recibir.
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
                Selecciona un almacén y verifica la mercancía recibida contra la orden de compra.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <ReceptionChecklist 
                order={selectedOrder}
                locations={locations}
                onUpdateStatus={handleUpdateOrderStatus}
                onCancel={() => setIsChecklistOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
