
'use server';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import { Button } from '@/components/ui/button';
import type { PurchaseOrder, StatusHistoryEntry, Project } from '@/lib/types';
import { cn, convertPurchaseOrderTimestamps } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, Building, Calendar, Package, FileText, User, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { ApproveButton } from './_components/approve-button';
import { RejectButton } from './_components/reject-button';

async function getOrderDetails(id: string): Promise<{ order: PurchaseOrder | null, project: Project | null }> {
  try {
    const orderRef = doc(db, 'purchaseOrders', id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { order: null, project: null };
    }

    const order = convertPurchaseOrderTimestamps({ id: orderSnap.id, ...orderSnap.data() }) as PurchaseOrder;
    
    // No necesitamos una consulta adicional si el nombre ya está en la orden
    const project: Project | null = order.projectName ? {
        id: order.project,
        name: order.projectName,
        // Rellenar otros campos si fueran necesarios, pero para mostrar el nombre es suficiente
    } as any : null;

    return { order, project };

  } catch (error) {
    console.error("Error fetching order details:", error);
    return { order: null, project: null };
  }
}

function StatusBadge({ status }: { status: PurchaseOrder['status'] }) {
    const statusInfo = {
        'Pendiente de Aprobación': { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
        'Aprobada': { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
        'Rechazado': { icon: XCircle, color: 'bg-red-100 text-red-800' },
        'Enviada al Proveedor': { icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
        'Recibida Parcialmente': { icon: CheckCircle, color: 'bg-purple-100 text-purple-800' },
        'Recibida': { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    };

    const InfoComponent = statusInfo[status]?.icon || Clock;
    const colorClass = statusInfo[status]?.color || 'bg-gray-100 text-gray-800';

    return (
        <div className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold", colorClass)}>
            <InfoComponent className="h-5 w-5" />
            <span>{status}</span>
        </div>
    );
}

export default async function PublicApprovalPage({ params }: { params: { id: string } }) {
  const { order, project } = await getOrderDetails(params.id);

  if (!order) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
            <XCircle className="h-16 w-16 text-red-500 mb-4"/>
            <h1 className="text-3xl font-bold text-gray-800">Orden de Compra No Encontrada</h1>
            <p className="text-gray-600 mt-2">El enlace puede haber expirado o la orden ha sido eliminada.</p>
        </div>
    );
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const isActionable = order.status === 'Pendiente de Aprobación';
  let message = {
    title: `Esta orden ya ha sido ${order.status.toLowerCase()}.`,
    description: "No se requiere ninguna acción adicional. Puedes cerrar esta ventana.",
    type: "info" as "info" | "success" | "error"
  };

  if (order.status === 'Aprobada') {
    message.type = 'success';
  } else if (order.status === 'Rechazado') {
    message.type = 'error';
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <Image src="/images/logo.png" alt="WINFIN Logo" width={150} height={35} />
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Solicitud de Aprobación</h1>
                    <p className="mt-1 text-gray-500">Revisa los detalles de la orden de compra antes de tomar una acción.</p>
                </div>
                <StatusBadge status={order.status} />
            </div>
          </div>

          {!isActionable && (
             <div className={cn(
                "mx-6 md:mx-8 mb-6 p-4 rounded-lg flex items-center gap-3",
                message.type === 'info' && "bg-blue-50 text-blue-800",
                message.type === 'success' && "bg-green-50 text-green-800",
                message.type === 'error' && "bg-red-50 text-red-800",
             )}>
                <AlertTriangle className="h-6 w-6"/>
                <div>
                    <p className="font-semibold">{message.title}</p>
                    <p className="text-sm">{message.description}</p>
                </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6 text-sm">
            <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5"><Building className="h-4 w-4"/> Proveedor</p>
                <p className="font-medium text-gray-900 text-base">{order.supplier}</p>
            </div>
            <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5"><FileText className="h-4 w-4"/> Orden de Compra</p>
                <p className="font-medium font-mono text-gray-900 text-base">{order.orderNumber}</p>
            </div>
             <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5"><Calendar className="h-4 w-4"/> Fecha de Emisión</p>
                <p className="font-medium text-gray-900 text-base">{new Date(order.date as string).toLocaleDateString('es-ES')}</p>
            </div>
            <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5"><User className="h-4 w-4"/> Proyecto</p>
                <p className="font-medium text-gray-900 text-base">{order.projectName || 'Proyecto no especificado'}</p>
            </div>
          </div>
          
          <div className="px-6 md:px-8 py-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="h-5 w-5"/> Conceptos</h3>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map((item, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{formatCurrency(item.price)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">{formatCurrency(item.quantity * item.price)}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-end mt-6">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.total)}</span>
                    </div>
                     <div className="flex justify-between text-gray-600">
                        <span>IVA (21%)</span>
                        <span>{formatCurrency(order.total * 0.21)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                        <span>Total</span>
                        <span>{formatCurrency(order.total * 1.21)}</span>
                    </div>
                </div>
            </div>
          </div>

          {isActionable && (
            <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3">
               <ApproveButton orderId={order.id} />
               <RejectButton orderId={order.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
