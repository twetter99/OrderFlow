
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { inventory } from "@/lib/data";
import { Badge } from "../ui/badge";

export function InventoryAnalysisReport() {

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    const inventoryWithValue = inventory
        .filter(item => item.type === 'simple') // Solo analizamos items simples por ahora
        .map(item => ({
            ...item,
            totalValue: item.quantity * item.unitCost,
            isLowStock: item.quantity < item.minThreshold,
        }))
        .sort((a, b) => b.totalValue - a.totalValue);

    return (
      <Card>
        <CardHeader>
            <CardTitle>Análisis de Valor de Inventario</CardTitle>
            <CardDescription>Artículos en stock ordenados por su valor total y estado de stock.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artículo (SKU)</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Costo Unitario</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryWithValue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name} ({item.sku})</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell className="text-center">
                    {item.isLowStock && (
                        <Badge variant="destructive">Stock Bajo</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}
