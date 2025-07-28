
'use client';

import React from 'react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import type { PurchaseOrder, StatusHistoryEntry } from '@/lib/types';
import { convertPurchaseOrderTimestamps } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Loader2, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

type ApprovalStatus = 'loading' | 'success' | 'rejected' | 'already_processed' | 'error' | 'not_found';

async function getOrder(id: string): Promise<PurchaseOrder | null> {
    const docRef = doc(db, 'purchaseOrders', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    return convertPurchaseOrderTimestamps({ id: docSnap.id, ...docSnap.data() });
}

async function approveOrder(id: string): Promise<{ success: boolean, message: string }> {
    const orderRef = doc(db, "purchaseOrders", id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists() || orderSnap.data().status !== 'Pendiente de Aprobación') {
        return { success: false, message: 'La orden no existe o ya ha sido procesada.' };
    }

    try {
        const newHistoryEntry: StatusHistoryEntry = {
            status: 'Aprobada',
            date: new Date(),
            comment: 'Aprobado mediante enlace público.'
        };
        await updateDoc(orderRef, {
            status: 'Aprobada',
            statusHistory: arrayUnion(newHistoryEntry)
        });
        return { success: true, message: 'Orden de compra aprobada con éxito.' };
    } catch (error) {
        console.error("Error approving order:", error);
        return { success: false, message: 'No se pudo actualizar la orden.' };
    }
}


export default function ApproveOrderPage({ params }: { params: { orderId: string } }) {
    const [order, setOrder] = useState<PurchaseOrder | null>(null);
    const [status, setStatus] = useState<ApprovalStatus>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            const fetchedOrder = await getOrder(params.orderId);
            if (!fetchedOrder) {
                setStatus('not_found');
                return;
            }
            setOrder(fetchedOrder);
            if (fetchedOrder.status !== 'Pendiente de Aprobación') {
                setStatus('already_processed');
            }
        };
        fetchOrder();
    }, [params.orderId]);

    const handleApprove = async () => {
        if (!order) return;
        setStatus('loading');
        const result = await approveOrder(order.id);
        if (result.success) {
            setStatus('success');
            setMessage(result.message);
        } else {
            setStatus('error');
            setMessage(result.message);
        }
    };
    
    if (status === 'loading' && !order) {
        return (
             <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Cargando información de la orden...</p>
            </div>
        )
    }

    if (status === 'not_found' || !order) {
       return notFound();
    }
    
    const isActionable = order.status === 'Pendiente de Aprobación';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 font-sans">
             <div className="w-full max-w-4xl">
                <div className="flex justify-center mb-6">
                    <Image src="/images/logo.png" alt="OrderFlow Logo" width={200} height={50} />
                </div>
                {status === 'loading' && (
                     <Card className="w-full text-center">
                        <CardHeader><CardTitle>Procesando Aprobación...</CardTitle></CardHeader>
                        <CardContent>
                            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary"/>
                        </CardContent>
                    </Card>
                )}
                {status === 'success' && (
                    <Card className="w-full text-center">
                         <CardHeader>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <CardTitle className="mt-4 text-2xl text-green-700">¡Orden Aprobada!</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-muted-foreground">{message}</p></CardContent>
                         <CardFooter className="justify-center">
                           <Button asChild><Link href="/dashboard">Volver a la aplicación</Link></Button>
                        </CardFooter>
                    </Card>
                )}
                 {status === 'already_processed' && (
                     <Card className="w-full text-center">
                        <CardHeader>
                             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <ShieldCheck className="h-10 w-10 text-blue-600" />
                            </div>
                            <CardTitle className="mt-4 text-2xl text-blue-700">Orden Ya Procesada</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-muted-foreground">Esta orden de compra ya fue <strong>{order.status.toLowerCase()}</strong> y no requiere más acciones.</p></CardContent>
                          <CardFooter className="justify-center">
                           <Button asChild><Link href="/dashboard">Volver a la aplicación</Link></Button>
                        </CardFooter>
                    </Card>
                 )}
                 {status === 'error' && (
                     <Card className="w-full text-center">
                        <CardHeader>
                             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <CardTitle className="mt-4 text-2xl text-red-700">Error en la Aprobación</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-muted-foreground">{message}</p></CardContent>
                          <CardFooter className="justify-center">
                           <Button asChild><Link href="/dashboard">Volver a la aplicación</Link></Button>
                        </CardFooter>
                    </Card>
                 )}

                {isActionable && (
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Revisión de Orden de Compra</CardTitle>
                            <CardDescription>Estás a punto de aprobar el siguiente pedido:</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold text-muted-foreground">Número de Orden</h3>
                                    <p className="font-bold text-lg">{order.orderNumber}</p>
                                </div>
                                 <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold text-muted-foreground">Proveedor</h3>
                                    <p className="font-bold text-lg">{order.supplier}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-semibold text-muted-foreground">Importe Total</h3>
                                    <p className="font-bold text-lg text-primary">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}</p>
                                </div>
                            </div>
                             <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Esta acción es irreversible y autoriza la compra de los materiales listados.
                            </p>
                        </CardContent>
                        <CardFooter className="flex-col gap-3">
                            <Button size="lg" className="w-full" onClick={handleApprove}>
                                <CheckCircle className="mr-2 h-5 w-5"/>
                                Sí, Aprobar Orden de Compra
                            </Button>
                            <Button variant="link" className="text-red-600" asChild>
                                <Link href={`/public/approve/rejected?orderId=${order.id}`}>No, Rechazar esta orden</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}