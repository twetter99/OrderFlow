
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
import { Card, CardContent } from "@/components/ui/card";
import { inventory, locations as initialLocations, inventoryLocations as initialInventoryLocations } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Location, InventoryLocation, InventoryItem } from "@/lib/types";
import { TransferForm } from "@/components/inventory-locations/transfer-form";

export default function InventoryLocationsPage() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>(initialInventoryLocations);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const enrichedInventoryLocations = inventoryLocations.map(invLoc => {
    const item = inventory.find(i => i.id === invLoc.itemId);
    const location = locations.find(l => l.id === invLoc.locationId);
    return {
      ...invLoc,
      itemName: item?.name || "Desconocido",
      itemSku: item?.sku || "N/A",
      locationName: location?.name || "Desconocido",
    };
  }).sort((a, b) => a.locationName.localeCompare(b.locationName) || a.itemName.localeCompare(b.itemName));


  const handleSaveTransfer = (values: { itemId: string; fromLocationId: string; toLocationId: string; quantity: number }) => {
    setInventoryLocations(prev => {
        let updatedLocations = [...prev];
        
        // Decrement from origin
        const fromIndex = updatedLocations.findIndex(l => l.itemId === values.itemId && l.locationId === values.fromLocationId);
        if (fromIndex > -1) {
            updatedLocations[fromIndex].quantity -= values.quantity;
        }

        // Increment in destination
        const toIndex = updatedLocations.findIndex(l => l.itemId === values.itemId && l.locationId === values.toLocationId);
        if (toIndex > -1) {
            updatedLocations[toIndex].quantity += values.quantity;
        } else {
            // If the item doesn't exist in the destination, create a new entry
            updatedLocations.push({
                id: `INVLOC-${Date.now()}`,
                itemId: values.itemId,
                locationId: values.toLocationId,
                quantity: values.quantity,
            });
        }
        
        // Filter out locations with zero quantity
        return updatedLocations.filter(l => l.quantity > 0);
    });

    toast({ title: "Transferencia Exitosa", description: `Se movieron ${values.quantity} unidades del artículo seleccionado.` });
    setIsTransferModalOpen(false);
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Ubicaciones de Inventario</h1>
          <p className="text-muted-foreground">
            Consulta y transfiere stock entre almacenes.
          </p>
        </div>
        <Button onClick={() => setIsTransferModalOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transferir Stock
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Almacén / Ubicación</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre del Artículo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedInventoryLocations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.locationName}</TableCell>
                  <TableCell>{loc.itemSku}</TableCell>
                  <TableCell>{loc.itemName}</TableCell>
                  <TableCell className="text-right font-bold">{loc.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Transferir Stock entre Almacenes</DialogTitle>
                <DialogDescription>
                    Selecciona el artículo y las ubicaciones de origen y destino.
                </DialogDescription>
            </DialogHeader>
            <TransferForm
                inventoryItems={inventory.filter(i => i.type === 'simple')} // Solo se pueden transferir artículos simples
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
