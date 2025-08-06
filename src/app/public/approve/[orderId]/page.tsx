'use server';

import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PurchaseOrder, StatusHistoryEntry, Project } from '@/lib/types';
import { ApprovalActions } from './approval-actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn, convertPurchaseOrderTimestamps } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

async function getOrderDetails(id: string): Promise<{ order: PurchaseOrder | null, project: Project | null }> {
  try {
    const orderRef = doc(db, 'purchaseOrders', id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { order: null, project: null };
    }
    
    const order = convertPurchaseOrderTimestamps({ id: orderSnap.id, ...orderSnap.data() });
    
    let project: Project | null = null;
    if (order.project) {
        const projectRef = doc(db, "projects", order.project);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            project = { id: projectSnap.id, ...projectSnap.data() } as Project;
        }
    }
    
    // Si la orden no tiene el nombre del proyecto desnormalizado, lo añadimos
    if (!order.projectName && project) {
      order.projectName = project.name;
    }

    return { order, project };

  } catch (error) {
    console.error("Error fetching order details:", error);
    return { order: null, project: null };
  }
}

async function updateOrderStatus(id: string, status: 'Aprobada' | 'Rechazado', rejectionReason?: string) {
    'use server';
    try {
      const orderRef = doc(db, "purchaseOrders", id);
      const newStatus: PurchaseOrder['status'] = status;
      const comment = status === 'Rechazado' 
        ? `Pedido rechazado. Motivo: ${rejectionReason || 'No especificado'}` 
        : 'Pedido aprobado';

      const newHistoryEntry: Omit<StatusHistoryEntry, 'date'> = {
        status: newStatus,
        comment: comment,
      };

      await updateDoc(orderRef, {
        status: newStatus,
        rejectionReason: status === 'Rechazado' ? rejectionReason : "",
        statusHistory: arrayUnion({ ...newHistoryEntry, date: new Date() }),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: (error as Error).message };
    }
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

const OrderStatusPill = ({ status }: { status: PurchaseOrder['status'] }) => {
    const statusInfo = {
        'Aprobada': { icon: <CheckCircle className="h-5 w-5"/>, text: 'Esta orden ya ha sido aprobada.', color: 'bg-green-100 text-green-800' },
        'Rechazado': { icon: <AlertCircle className="h-5 w-5"/>, text: 'Esta orden fue rechazada.', color: 'bg-red-100 text-red-800' },
        'Enviada al Proveedor': { icon: <Clock className="h-5 w-5"/>, text: 'Esta orden ya fue procesada y enviada al proveedor.', color: 'bg-blue-100 text-blue-800' },
        'Recibida': { icon: <CheckCircle className="h-5 w-5"/>, text: 'Esta orden ya fue recibida.', color: 'bg-purple-100 text-purple-800' },
        'Recibida Parcialmente': { icon: <Clock className="h-5 w-5"/>, text: 'Esta orden fue recibida parcialmente.', color: 'bg-yellow-100 text-yellow-800' },
    };

    if (status === 'Pendiente de Aprobación') {
        return null;
    }

    const { icon, text, color } = statusInfo[status] || { icon: <AlertCircle className="h-5 w-5"/>, text: `El estado actual es "${status}".`, color: 'bg-gray-100 text-gray-800' };
    
    return (
        <div className={cn("rounded-lg p-4 flex items-center gap-4", color)}>
            {icon}
            <p className="font-semibold">{text}</p>
        </div>
    );
};


export default async function ApprovalPage({ params }: { params: { id: string } }) {
  const { order, project } = await getOrderDetails(params.id);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>La orden de compra no existe o no se pudo cargar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Revisión de Orden de Compra</h1>
          <p className="mt-2 text-lg text-gray-600">Por favor, revisa los detalles y aprueba o rechaza la solicitud.</p>
        </div>
        
        <OrderStatusPill status={order.status} />

        <Card>
          <CardHeader>
            <CardTitle>Orden de Compra: {order.orderNumber}</CardTitle>
            <CardDescription>
              Creada el {new Date(order.date as string).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                    <p className="text-gray-500">Proveedor</p>
                    <p className="font-medium">{order.supplier}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-gray-500">Proyecto</p>
                    <p className="font-medium">{order.projectName || 'Proyecto no especificado'}</p>
                </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Unitario</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.quantity * item.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end pt-4">
                <div className="w-full max-w-xs space-y-2">
                     <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-gray-600">IVA (21%)</span>
                        <span>{formatCurrency(order.total * 0.21)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>{formatCurrency(order.total * 1.21)}</span>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
        
        {order.status === 'Pendiente de Aprobación' && (
          <ApprovalActions orderId={params.id} updateOrderStatus={updateOrderStatus} />
        )}
      </div>
    </main>
  );
}