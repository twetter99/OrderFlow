
'use server';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, admin } from '@/lib/firebase-admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, FileText, Package, Euro, Calendar, Landmark, Info, User, Building, FolderKanban } from 'lucide-react';
import type { PurchaseOrder, Project } from '@/lib/types';
import { cn, convertPurchaseOrderTimestamps } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

async function getOrderDetails(id: string) {
    try {
        const orderRef = db.collection('purchaseOrders').doc(id);
        const orderSnap = await orderRef.get();
        
        if (!orderSnap.exists) {
            return { order: null, project: null, error: "No se encontró la orden de compra." };
        }

        const orderData = orderSnap.data() as PurchaseOrder;
        let project: Project | null = null;
        
        if (orderData.project) {
            const projectRef = db.collection('projects').doc(orderData.project);
            const projectSnap = await projectRef.get();
            if (projectSnap.exists) {
                project = { id: projectSnap.id, ...projectSnap.data() } as Project;
            }
        }
        
        const order = convertPurchaseOrderTimestamps({ id: orderSnap.id, ...orderData });

        return { order, project, error: null };

    } catch (e) {
        console.error("Error fetching order details:", e);
        return { order: null, project: null, error: "Error al cargar los detalles del pedido." };
    }
}

async function approveOrder(id: string) {
    try {
        const orderRef = db.collection('purchaseOrders').doc(id);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) return { success: false, message: "La orden no existe."};
        if (orderSnap.data()?.status !== 'Pendiente de Aprobación') return { success: false, message: "Esta orden ya ha sido procesada."}
        
        const newHistoryEntry = {
            status: 'Aprobada',
            date: admin.firestore.Timestamp.now(),
            comment: 'Aprobado a través de enlace por email.'
        };

        await orderRef.update({
            status: 'Aprobada',
            statusHistory: admin.firestore.FieldValue.arrayUnion(newHistoryEntry)
        });

        return { success: true };
    } catch (e) {
        console.error("Error approving order:", e);
        return { success: false, message: "Ocurrió un error al intentar aprobar la orden." };
    }
}

export default async function ApprovePurchaseOrderPage({ params, searchParams }: { params: { id: string }, searchParams: { action?: string }}) {
    
    if (searchParams.action === 'approve') {
        const result = await approveOrder(params.id);
        if (!result.success) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold">Error al Aprobar</h1>
                    <p className="text-muted-foreground">{result.message}</p>
                </div>
            )
        }
    }

    const { order, project, error } = await getOrderDetails(params.id);

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Error al Cargar la Orden</h1>
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }
    
    const isProcessed = order.status !== 'Pendiente de Aprobación';
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mb-4">
                        <FileText className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">Revisión de Orden de Compra</CardTitle>
                    <CardDescription>Por favor, revisa los detalles de la orden de compra antes de aprobar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm p-4 border rounded-lg bg-white">
                        <div className="space-y-1">
                            <p className="text-gray-500 flex items-center gap-1"><Info className="h-4 w-4"/>Estado</p>
                            <p className={cn(
                                "font-bold text-lg",
                                isProcessed ? (order.status === 'Aprobada' ? 'text-green-600' : 'text-red-600') : 'text-orange-500'
                            )}>
                                {order.status}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-500">ID de Orden</p>
                            <p className="font-medium font-mono">{order.orderNumber}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-500">Fecha de Orden</p>
                            <p className="font-medium">{new Date(order.date as string).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-gray-500">Importe Total</p>
                            <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4 p-4 border rounded-lg bg-white">
                             <h3 className="font-semibold flex items-center gap-2"><User className="h-5 w-5 text-gray-400"/>Proveedor</h3>
                             <p className="text-lg font-medium">{order.supplier}</p>
                        </div>
                         <div className="space-y-4 p-4 border rounded-lg bg-white">
                            <h3 className="font-semibold flex items-center gap-2"><FolderKanban className="h-5 w-5 text-gray-400"/>Datos del Proyecto</h3>
                            <div className="space-y-1">
                                <p className="text-gray-500">Proyecto</p>
                                <p className="font-medium">{project?.name || 'Proyecto no especificado'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Package className="h-5 w-5 text-gray-400"/>Artículos Solicitados</h3>
                        <div className="border rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3 font-medium">Descripción</th>
                                        <th className="text-center p-3 font-medium">Cant.</th>
                                        <th className="text-right p-3 font-medium">Precio Unit.</th>
                                        <th className="text-right p-3 font-medium">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-3">{item.itemName}</td>
                                            <td className="text-center p-3">{item.quantity}</td>
                                            <td className="text-right p-3">{formatCurrency(item.price)}</td>
                                            <td className="text-right p-3 font-medium">{formatCurrency(item.quantity * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4 pt-6">
                    {isProcessed ? (
                         <div className={cn(
                            "flex items-center gap-2 p-3 rounded-md w-full justify-center",
                            order.status === 'Aprobada' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                         )}>
                            {order.status === 'Aprobada' ? <CheckCircle className="h-5 w-5"/> : <AlertCircle className="h-5 w-5"/>}
                           <p className="font-semibold">Esta orden de compra ya ha sido procesada.</p>
                        </div>
                    ) : (
                        <form action="?action=approve" method="POST" className="w-full">
                            <Button size="lg" className="w-full text-lg">
                                <CheckCircle className="mr-2"/>
                                Aprobar Orden de Compra
                            </Button>
                        </form>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

    