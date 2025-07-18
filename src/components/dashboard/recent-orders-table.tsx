
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PurchaseOrder } from "@/lib/types";
import { cn } from "@/lib/utils"

export function RecentOrdersTable({ purchaseOrders }: { purchaseOrders: PurchaseOrder[] }) {
  // Sort by date descending to get the most recent orders
  const recentOrders = [...purchaseOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Órdenes de Compra Recientes</CardTitle>
        <CardDescription>
          Una lista de las últimas 5 órdenes de compra.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID de Orden</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.slice(0, 5).map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      order.status === "Aprobado" && "bg-green-100 text-green-800 border-green-200",
                      order.status === "Pendiente" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                      order.status === "Enviado" && "bg-blue-100 text-blue-800 border-blue-200",
                      order.status === "Recibido" && "bg-primary/10 text-primary border-primary/20",
                      order.status === "Rechazado" && "bg-red-100 text-red-800 border-red-200"
                    )}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
