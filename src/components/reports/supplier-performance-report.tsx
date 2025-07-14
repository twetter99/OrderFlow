
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
import { suppliers, purchaseOrders } from "@/lib/data";
import { Star } from "lucide-react";

export function SupplierPerformanceReport() {

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    const supplierData = suppliers.map(supplier => {
        const orders = purchaseOrders.filter(po => po.supplier === supplier.name);
        const totalValue = orders.reduce((acc, order) => acc + order.total, 0);
        const orderCount = orders.length;

        return {
            ...supplier,
            orderCount,
            totalValue,
        };
    }).sort((a, b) => b.totalValue - a.totalValue);

    return (
      <Card>
        <CardHeader>
            <CardTitle>Informe de Rendimiento de Proveedores</CardTitle>
            <CardDescription>Análisis de pedidos y valor total por cada proveedor.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-center">Órdenes Realizadas</TableHead>
                <TableHead className="text-right">Valor Total Comprado</TableHead>
                <TableHead className="text-center">Calificación Entrega</TableHead>
                <TableHead className="text-center">Calificación Calidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierData.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-center font-bold">{s.orderCount}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(s.totalValue)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        {s.deliveryRating.toFixed(1)} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                        {s.qualityRating.toFixed(1)} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}
