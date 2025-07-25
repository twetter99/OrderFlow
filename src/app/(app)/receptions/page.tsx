

"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QrCode, Anchor } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryItem, PurchaseOrder, InventoryLocation, Location, PurchaseOrderItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ReceptionChecklist } from "@/components/receptions/reception-checklist";
import { collection, onSnapshot, doc, writeBatch, Timestamp, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createPurchaseOrder } from "../purchasing/actions";

export default function ReceptionsPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    const unsubPO = onSnapshot(collection(db, 'purchaseOrders'), (snapshot) => {
        setPurchaseOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder)));
        setLoading(false);
    });
     const unsubLocations = onSnapshot(collection(db, 'locations'), (snapshot) => {
        setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location)));
    });
    return () => {
        unsubPO();
        unsubLocations();
    }
  }, []);

  const ordersToReceive = useMemo(() => {
    return purchaseOrders.filter(o => 
      o.status === 'Enviada al Proveedor' && o.items.some(item => item.type === 'Material')
    );
  }, [purchaseOrders]);

  const handleVerifyClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsChecklistOpen(true);
  };
  
  const handleUpdateOrderStatus = async (
    orderId: string, 
    receivingLocationId: string, 
    receivedItems: { itemId: string; quantity: number }[],
    receptionNotes: string,
    isPartial: boolean
  ) => {
    const originalOrder = purchaseOrders.find(po => po.id === orderId);
    if (!originalOrder) {
        toast({ variant: "destructive", title: "Error", description: "No se encontró la orden de compra original."});
        return;
    }

    const batch = writeBatch(db);
    const poRef = doc(db, "purchaseOrders", orderId);
    let newStatus: PurchaseOrder['status'] = isPartial ? 'Recibida Parcialmente' : 'Recibida';

    // 1. Update Inventory in the selected location
    const inventoryUpdates = receivedItems.map(async (itemToReceive) => {
        if(itemToReceive.quantity === 0) return;
        const q = collection(db, "inventoryLocations");
        const querySnapshot = await getDocs(q); 
        const docToUpdate = querySnapshot.docs.find(d => d.data().itemId === itemToReceive.itemId && d.data().locationId === receivingLocationId);

        if (docToUpdate) {
            const newQuantity = docToUpdate.data().quantity + itemToReceive.quantity;
            batch.update(docToUpdate.ref, { quantity: newQuantity });
        } else {
            const newDocRef = doc(collection(db, "inventoryLocations"));
            batch.set(newDocRef, { 
                itemId: itemToReceive.itemId,
                locationId: receivingLocationId,
                quantity: itemToReceive.quantity 
            });
        }
    });
    
    await Promise.all(inventoryUpdates);

    let backorderId: string | undefined = undefined;

    // 2. If partial, create a backorder
    if (isPartial) {
        const pendingItems: PurchaseOrderItem[] = [];
        originalOrder.items.forEach(originalItem => {
            const received = receivedItems.find(r => r.itemId === originalItem.itemId);
            const receivedQty = received ? received.quantity : 0;
            if (receivedQty < originalItem.quantity) {
                pendingItems.push({
                    ...originalItem,
                    quantity: originalItem.quantity - receivedQty,
                });
            }
        });
        
        if (pendingItems.length > 0) {
            const backorderData: Partial<PurchaseOrder> = {
                ...originalOrder,
                date: new Date(),
                estimatedDeliveryDate: new Date(),
                items: pendingItems,
                status: 'Pendiente de Aprobación',
                originalOrderId: originalOrder.id,
                total: pendingItems.reduce((acc, item) => acc + (item.quantity * item.price), 0),
                statusHistory: [{ status: 'Pendiente de Aprobación', date: Timestamp.now(), comment: `Backorder de la orden ${originalOrder.orderNumber}` }]
            };
            delete backorderData.id;
            delete backorderData.orderNumber;
            delete backorderData.backorderIds;

            const newBackorder = await createPurchaseOrder(backorderData);
            backorderId = newBackorder.id;
        }
    }

    // 3. Update original Purchase Order
    const historyComment = isPartial 
      ? `Recepción parcial. Backorder ${backorderId} creado. Notas: ${receptionNotes}`
      : `Recepción completa. Notas: ${receptionNotes}`;

    const newHistoryEntry = { status: newStatus, date: Timestamp.now(), comment: historyComment };
    const updateData: Partial<PurchaseOrder> = {
      status: newStatus,
      receptionNotes,
      statusHistory: arrayUnion(newHistoryEntry) as any,
    };
    if (backorderId) {
        updateData.backorderIds = arrayUnion(backorderId) as any;
    }
    batch.update(poRef, updateData);

    try {
        await batch.commit();
        toast({
            title: "Recepción Procesada",
            description: `La orden ${originalOrder?.orderNumber} ha sido actualizada y el stock ajustado.`
        });
        setIsChecklistOpen(false);
    } catch (error) {
        console.error("Error receiving order: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo procesar la recepción."
        })
    }
  }

  if (loading) {
    return <div>Cargando recepciones...</div>
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
         <CardHeader>
            <CardTitle>Pedidos Pendientes de Recepción</CardTitle>
            <CardDescription>
                Lista de órdenes de compra que han sido enviadas por el proveedor y están listas para ser verificadas y almacenadas.
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha de Entrega Estimada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersToReceive.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.estimatedDeliveryDate instanceof Timestamp ? order.estimatedDeliveryDate.toDate().toLocaleDateString() : new Date(order.estimatedDeliveryDate).toLocaleDateString()}</TableCell>
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
                        <Anchor className="mr-2 h-4 w-4" />
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
                Verificar Recepción: {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
                Selecciona un almacén y verifica la mercancía recibida contra la orden de compra.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <ReceptionChecklist 
                order={selectedOrder}
                locations={locations}
                onConfirmReception={handleUpdateOrderStatus}
                onCancel={() => setIsChecklistOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
