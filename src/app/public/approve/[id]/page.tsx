

'use server';

import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { PurchaseOrder, StatusHistoryEntry, Project } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { ApproveButton } from './_components/approve-button';
import { RejectButton } from './_components/reject-button';
import { convertTimestampsToISO } from '@/lib/utils';

// Función del lado del servidor para obtener los detalles de la orden
async function getOrderDetails(id: string): Promise<{ order: PurchaseOrder | null }> {
  try {
    const orderRef = doc(db, 'purchaseOrders', id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      console.log(`No se encontró la orden con ID: ${id}`);
      return { order: null };
    }

    const order = convertTimestampsToISO({ 
      id: orderSnap.id, 
      ...orderSnap.data() 
    }) as PurchaseOrder;

    return { order };
  } catch (error) {
    console.error(`Error al obtener la orden ${id}:`, error);
    return { order: null };
  }
}

export default async function ApprovePurchaseOrderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { order } = await getOrderDetails(id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold">Orden no encontrada</h1>
        <p className="text-muted-foreground mt-2">
          La orden de compra que intentas ver no existe o ha sido eliminada.
        </p>
      </div>
    );
  }
  
  const isActionable = order.status === 'Pendiente de Aprobación';
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Solicitud de Aprobación</CardTitle>
          <CardDescription>
            Por favor, revisa los detalles de la orden de compra y aprueba o rechaza la solicitud.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.status !== 'Pendiente de Aprobación' && (
            <div className={`p-4 rounded-md flex items-center gap-3 ${order.status === 'Aprobada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {order.status === 'Aprobada' ? <CheckCircle className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
              <p className="font-medium">
                Esta orden ya fue {order.status === 'Aprobada' ? 'aprobada' : 'rechazada'} el {new Date(order.statusHistory?.find(h => h.status === order.status)?.date || Date.now()).toLocaleDateString()}.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500">Número de Orden</p>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Proveedor</p>
              <p className="font-medium">{order.supplier}</p>
            </div>
             <div className="space-y-1">
              <p className="text-gray-500">Fecha de Orden</p>
              <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Proyecto</p>
              <p className="font-medium">{order.projectName || 'Proyecto no especificado'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Artículos</h3>
            <div className="border rounded-lg">
              <ul className="divide-y">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center p-3">
                    <div>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end p-3 bg-gray-50 border-t">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold">{formatCurrency(order.total)}</p>
                </div>
              </div>
            </div>
          </div>

          {isActionable && (
            <div className="flex justify-end gap-4 pt-4">
                <RejectButton orderId={order.id} />
                <ApproveButton orderId={order.id} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
