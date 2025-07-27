
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inventory, locations as initialLocations, inventoryLocations as initialInventoryLocations } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Location, InventoryLocation, InventoryItem } from "@/lib/types";
import { TransferForm } from "@/components/inventory-locations/transfer-form";

export default function TransfersPage() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>(initialInventoryLocations);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleSaveTransfer = (values: { itemId: string; fromLocationId: string; toLocationId: string; quantity: number }) => {
    setInventoryLocations(prev => {
        let updatedLocations = [...prev];
        
        const fromIndex = updatedLocations.findIndex(l => l.itemId === values.itemId && l.locationId === values.fromLocationId);
        if (fromIndex > -1) {
            updatedLocations[fromIndex].quantity -= values.quantity;
        }

        const toIndex = updatedLocations.findIndex(l => l.itemId === values.itemId && l.locationId === values.toLocationId);
        if (toIndex > -1) {
            updatedLocations[toIndex].quantity += values.quantity;
        } else {
            updatedLocations.push({
                id: `INVLOC-${Date.now()}`,
                itemId: values.itemId,
                locationId: values.toLocationId,
                quantity: values.quantity,
            });
        }
        
        return updatedLocations.filter(l => l.quantity > 0);
    });

    toast({ title: "Transferencia Exitosa", description: `Se movieron ${values.quantity} unidades del artículo seleccionado.` });
    setIsTransferModalOpen(false);
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Transferencias de Stock</h1>
          <p className="text-muted-foreground">
            Mueve artículos entre tus almacenes.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Nueva Transferencia</CardTitle>
            <CardDescription>Para iniciar una transferencia de stock entre almacenes, haz clic en el botón de abajo.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => setIsTransferModalOpen(true)}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Crear Transferencia
            </Button>
        </CardContent>
      </Card>

      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Transferir Stock entre Almacenes</DialogTitle>
                <DialogDescription>
                    Selecciona el artículo y las ubicaciones de origen y destino.
                </DialogDescription>
            </DialogHeader>
            <TransferForm
                inventoryItems={inventory.filter(i => i.type === 'simple')}
                locations={locations}
                inventoryLocations={inventoryLocations}
                onSave={handleSaveTransfer}
                onCancel={() => setIsTransferModalOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
