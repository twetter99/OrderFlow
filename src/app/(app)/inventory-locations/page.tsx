
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
import { inventory, locations, inventoryLocations } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";

export default function InventoryLocationsPage() {
  const enrichedInventoryLocations = inventoryLocations.map(invLoc => {
    const item = inventory.find(i => i.id === invLoc.itemId);
    const location = locations.find(l => l.id === invLoc.locationId);
    return {
      ...invLoc,
      itemName: item?.name || "Desconocido",
      itemSku: item?.sku || "N/A",
      locationName: location?.name || "Desconocido",
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Ubicaciones de Inventario</h1>
          <p className="text-muted-foreground">
            Consulta el stock de cada artículo por almacén.
          </p>
        </div>
        <Button>
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
    </div>
  );
}
