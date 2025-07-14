
"use client";

import React from "react";
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

export default function InventoryLocationsPage() {
  const enrichedInventoryLocations = initialInventoryLocations.map(invLoc => {
    const item = inventory.find(i => i.id === invLoc.itemId);
    const location = initialLocations.find(l => l.id === invLoc.locationId);
    return {
      ...invLoc,
      itemName: item?.name || "Desconocido",
      itemSku: item?.sku || "N/A",
      locationName: location?.name || "Desconocido",
    };
  }).sort((a, b) => a.locationName.localeCompare(b.locationName) || a.itemName.localeCompare(b.itemName));


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Ubicaciones de Inventario</h1>
          <p className="text-muted-foreground">
            Consulta el stock disponible en cada almacén.
          </p>
        </div>
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
               {enrichedInventoryLocations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay stock registrado en ninguna ubicación.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
