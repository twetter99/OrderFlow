"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Interfaces para los datos de esta página
interface OrderItem {
  itemName: string;
  quantity: number;
  price: number;
  unit: string;
}

interface OrderDetails {
  id: string;
  orderNumber?: string;
  supplier?: string;
  date: Timestamp | string;
  status: string;
  total: number;
  items: OrderItem[];
}

// Funciones auxiliares
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

const safeFormatDate = (dateInput: any): string => {
  if (!dateInput) return 'N/D';
  if (typeof dateInput.toDate === 'function') {
    return dateInput.toDate().toLocaleDateString('es-ES');
  }
  const date = new Date(dateInput);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('es-ES');
  }
  return 'Fecha inválida';
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "purchaseOrders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() } as OrderDetails);
        } else {
          console.error("No se encontró la orden de compra.");
        }
      } catch (error) {
        console.error("Error al obtener la orden:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Cargando detalle de la orden...</div>;
  }

  if (!order) {
    return <div className="container mx-auto py-10 text-center">Orden de compra no encontrada.</div>;
  }

  // ✅ El return está DENTRO de la función del componente
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        &larr; Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Detalle de la Orden: {order.orderNumber || order.id}</CardTitle>
          <CardDescription>
            Proveedor: <strong>{order.supplier || 'N/D'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-muted-foreground">Fecha</h3>
              <p>{safeFormatDate(order.date)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">Estado</h3>
              <Badge variant="outline">{order.status}</Badge>
            </div>
            <div>
              <h3 className="font-semibold text-muted-foreground">Total</h3>
              <p className="font-bold">{formatCurrency(order.total)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Artículos del Pedido</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.quantity * item.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} // <-- La llave que cierra el componente está aquí, al final.