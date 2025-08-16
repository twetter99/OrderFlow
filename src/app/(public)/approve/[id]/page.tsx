
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin'; // Usar Admin SDK para acceso desde servidor
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseOrder } from '@/lib/types';
import { CheckCircle, ShieldAlert, XCircle, Clock } from 'lucide-react';
import { ApprovalActions } from './approval-actions';
import Image from 'next/image';
import { convertTimestampsToISO } from '@/lib/utils';
import { OrderStatusHistory } from '@/components/purchasing/order-status-history';

// Esta función se ejecuta en el servidor y puede usar el Admin SDK
async function getOrderDetails(id: string): Promise<{ order: PurchaseOrder | null }> {
    try {
        const orderRef = doc(db, 'purchaseOrders', id);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            console.error(`No se encontró la orden de compra con ID: ${id}`);
            return { order: null };
        }
        
        // El documento existe, se convierte y se devuelve.
        // `projectName` ya está en los datos de la orden gracias a la acción de creación.
        const order = convertTimestampsToISO({ id: orderSnap.id, ...orderSnap.data() }) as PurchaseOrder;
        
        return { order };

    } catch (error) {
        console.error(`Error al obtener la orden de compra ${id}:`, error);
        return { order: null };
    }
}


export default async function ApprovePurchaseOrderPage({ params }: { params: { id: string } }) {
    const { order } = await getOrderDetails(params.id);

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
                <XCircle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-3xl font-bold text-destructive">Orden de Compra No Encontrada</h1>
                <p className="mt-2 text-gray-600">El enlace de aprobación puede ser inválido o la orden ha sido eliminada.</p>
                <p className="mt-1 text-sm text-gray-500">Por favor, contacta con el departamento de compras.</p>
            </div>
        );
    }
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    const getStatusInfo = (status: PurchaseOrder['status']) => {
        switch (status) {
            case 'Aprobada': return { icon: <CheckCircle className="text-green-500" />, text: 'Esta orden ya ha sido APROBADA.', color: 'text-green-600' };
            case 'Rechazado': return { icon: <XCircle className="text-red-500" />, text: 'Esta orden fue RECHAZADA.', color: 'text-red-600' };
            default: return { icon: <Clock className="text-yellow-500" />, text: 'Esta orden está PENDIENTE.', color: 'text-yellow-600' };
        }
    };
    
    const statusInfo = getStatusInfo(order.status);
    const isActionable = order.status === 'Pendiente de Aprobación';


  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <main className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-8">
             <Image src="/images/logo.png" alt="WINFIN Logo" width={180} height={40} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Solicitud de Aprobación de Compra</h1>
          <p className="text-gray-600 mt-2">Revisa los detalles de la orden de compra antes de tomar una acción.</p>
        </div>

        {/* ALERTA DE ESTADO */}
        {!isActionable && (
             <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        {statusInfo.icon}
                    </div>
                    <div className="ml-3">
                    <p className={`text-sm font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
                    <p className="text-sm text-yellow-700 mt-1">
                        {order.status === 'Rechazado' 
                        ? `Motivo: ${order.rejectionReason || 'No especificado.'}`
                        : 'No se requiere ninguna acción adicional en esta página.'}
                    </p>
                    </div>
                </div>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Orden de Compra: {order.orderNumber}</CardTitle>
                        <CardDescription>Emitida el {new Date(order.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-6">
                            <div className="space-y-1">
                                <p className="text-gray-500">Proveedor</p>
                                <p className="font-medium text-gray-900 text-base">{order.supplier}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-500">Proyecto</p>
                                <p className="font-medium text-gray-900 text-base">{order.projectName || 'Proyecto no especificado'}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <ul className="space-y-3">
                                {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-medium text-gray-800">{item.itemName}</p>
                                        <p className="text-gray-500">{item.quantity} {item.unit} x {formatCurrency(item.price)}</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">{formatCurrency(item.quantity * item.price)}</p>
                                </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border-t mt-4 pt-4 flex justify-end">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Pedido</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-6">
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ShieldAlert className="h-5 w-5 text-primary"/>
                            Panel de Aprobación
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ApprovalActions orderId={order.id} isActionable={isActionable} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Trazabilidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <OrderStatusHistory history={order.statusHistory || []} />
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
