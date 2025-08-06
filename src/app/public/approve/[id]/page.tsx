
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, File, ShoppingCart, Calendar, Loader2, XCircle, ShieldQuestion } from 'lucide-react';
import { updatePurchaseOrderStatus } from '@/app/purchasing/actions';
import type { PurchaseOrder, Project } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type PageStatus = 'loading' | 'loaded' | 'not-found' | 'already-processed' | 'error';

// Helper function to fetch order and project details
async function getOrderDetails(id: string): Promise<{ order: PurchaseOrder | null; project: Project | null }> {
  try {
    const orderRef = doc(db, 'purchaseOrders', id);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return { order: null, project: null };
    }

    const orderData = { id: orderSnap.id, ...orderSnap.data() } as PurchaseOrder;

    let project: Project | null = null;
    if (orderData.project) {
        const projectRef = doc(db, 'projects', orderData.project);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
            project = { id: projectSnap.id, ...projectSnap.data() } as Project;
        }
    }

    return { order: orderData, project };
  } catch (error) {
    console.error("Error fetching order details:", error);
    return { order: null, project: null };
  }
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};

export default function ApprovalPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [status, setStatus] = useState<PageStatus>('loading');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!id) {
            setStatus('not-found');
            return;
        }

        getOrderDetails(id).then(({ order: fetchedOrder, project: fetchedProject }) => {
            if (fetchedOrder) {
                setOrder(fetchedOrder);
                setProject(fetchedProject);
                if (fetchedOrder.status !== 'Pendiente de Aprobación') {
                    setStatus('already-processed');
                } else {
                    setStatus('loaded');
                }
            } else {
                setStatus('not-found');
            }
        }).catch(() => setStatus('error'));
    }, [id]);

    const handleAction = async (newStatus: 'Aprobada' | 'Rechazado') => {
        if (!order) return;
        setActionLoading(true);

        const result = await updatePurchaseOrderStatus(order.id, newStatus);
        
        if (result.success) {
            toast({
                title: `Orden ${newStatus === 'Aprobada' ? 'Aprobada' : 'Rechazada'}`,
                description: `La orden de compra ha sido marcada como ${newStatus.toLowerCase()}.`,
                variant: newStatus === 'Rechazado' ? 'destructive' : 'default',
            });
            // Refetch data to show the updated state
            const { order: updatedOrder } = await getOrderDetails(id);
            if (updatedOrder) {
                setOrder(updatedOrder);
                setStatus('already-processed');
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo actualizar el estado de la orden.',
            });
        }
        setActionLoading(false);
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Cargando detalles de la orden...</p>
            </div>
        );
    }

    if (status === 'not-found') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-4 text-center">
                 <XCircle className="w-16 h-16 mb-4" />
                <h1 className="text-2xl font-bold">Orden no encontrada</h1>
                <p>El enlace de aprobación no es válido o la orden ha sido eliminada.</p>
            </div>
        );
    }
    
    if (status === 'error') {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-700 p-4 text-center">
                 <AlertTriangle className="w-16 h-16 mb-4" />
                <h1 className="text-2xl font-bold">Error del Servidor</h1>
                <p>No se pudieron cargar los datos de la orden. Por favor, inténtalo de nuevo más tarde.</p>
            </div>
        )
    }

    if (status === 'already-processed' && order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-blue-800 p-4 text-center">
                <ShieldQuestion className="w-16 h-16 mb-4" />
                <h1 className="text-2xl font-bold">Esta orden ya ha sido procesada</h1>
                <p className="mb-4">El estado actual de la orden <span className="font-mono bg-blue-100 px-1 rounded">{order.orderNumber}</span> es <Badge>{order.status}</Badge>.</p>
                <Button onClick={() => router.push('/')}>Volver al inicio</Button>
            </div>
        )
    }

    if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
       <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-6">
                 <Image src="/images/logo.png" alt="OrderFlow" width={180} height={40} className="mx-auto mb-4"/>
            </div>
            <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl">Solicitud de Aprobación</CardTitle>
                        <CardDescription>Revisa los detalles de la orden de compra antes de tomar una acción.</CardDescription>
                    </div>
                     <Badge className={cn("text-base", order.status === "Pendiente de Aprobación" && "bg-orange-500")}>
                        {order.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-3 gap-6 py-4 border-t border-b">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><ShoppingCart className="h-4 w-4"/> Proveedor</p>
                        <p className="font-semibold text-lg">{order.supplier}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><File className="h-4 w-4"/> Proyecto</p>
                        <p className="font-semibold text-lg">{project?.name || 'Proyecto no especificado'}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> Fecha de Orden</p>
                        <p className="font-semibold text-lg">{new Date(order.date as unknown as Timestamp).toLocaleDateString('es-ES')}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Artículos</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[60%]">Descripción</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unitario</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.itemName}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(item.quantity * item.price)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                 <div className="flex justify-end mt-6 pr-4">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IVA (21%)</span>
                            <span>{formatCurrency(order.total * 0.21)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>TOTAL</span>
                            <span>{formatCurrency(order.total * 1.21)}</span>
                        </div>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="bg-slate-50/70 p-6 flex justify-end gap-4">
                <Button variant="destructive" size="lg" onClick={() => handleAction('Rechazado')} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4"/>}
                    Rechazar
                </Button>
                 <Button variant="default" size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('Aprobada')} disabled={actionLoading}>
                     {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                    Aprobar Orden
                </Button>
            </CardFooter>
            </Card>
        </div>
    </div>
  );
}
