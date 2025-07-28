
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound, redirect } from 'next/navigation';
import type { PurchaseOrder, StatusHistoryEntry } from '@/lib/types';
import { convertPurchaseOrderTimestamps } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Info, MessageSquareWarning, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

async function getOrder(id: string): Promise<PurchaseOrder | null> {
    const docRef = doc(db, 'purchaseOrders', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }
    return convertPurchaseOrderTimestamps({ id: docSnap.id, ...docSnap.data() });
}

export default async function ApproveOrderPage({ params }: { params: { orderId: string } }) {
    const order = await getOrder(params.orderId);

    if (!order) {
        notFound();
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    async function approveAction() {
        'use server';
        if (order?.status !== 'Pendiente de Aprobación') {
            return; // Ya no se puede aprobar
        }
        const orderRef = doc(db, "purchaseOrders", params.orderId);
        const newHistoryEntry: StatusHistoryEntry = {
            status: 'Aprobada',
            date: new Date().toISOString(),
            comment: 'Orden aprobada vía email.'
        };
        await updateDoc(orderRef, {
            status: 'Aprobada',
            statusHistory: arrayUnion(newHistoryEntry)
        });
        redirect('/public/approve/approved');
    }

    async function rejectAction() {
        'use server';
        if (order?.status !== 'Pendiente de Aprobación') {
            return; // Ya no se puede rechazar
        }
        const orderRef = doc(db, "purchaseOrders", params.orderId);
        const newHistoryEntry: StatusHistoryEntry = {
            status: 'Rechazado',
            date: new Date().toISOString(),
            comment: 'Orden rechazada vía email.'
        };
        await updateDoc(orderRef, {
            status: 'Rechazado',
            rejectionReason: 'Rechazado desde el enlace del correo electrónico.',
            statusHistory: arrayUnion(newHistoryEntry)
        });
        redirect('/public/approve/rejected');
    }

    const isActionable = order.status === 'Pendiente de Aprobación';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 font-sans">
             <div className="w-full max-w-4xl">
                <div className="flex justify-center mb-6">
                    <Image src="/images/logo.png" alt="OrderFlow Logo" width={200} height={50} />
                </div>
                <Card className="w-full">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-2xl">Revisión de Orden de Compra</CardTitle>
                                <CardDescription>Por favor, revisa los detalles y toma una acción.</CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn(
                                "capitalize mt-2 sm:mt-0 w-fit",
                                order.status === "Aprobada" && "bg-green-100 text-green-800 border-green-200",
                                order.status === "Pendiente de Aprobación" && "bg-orange-100 text-orange-800 border-orange-200",
                                order.status === "Rechazado" && "bg-destructive/20 text-destructive border-destructive/20"
                                )}
                            >
                                {order.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                            <div><span className="font-semibold">Nº Orden:</span> {order.orderNumber}</div>
                            <div><span className="font-semibold">Proveedor:</span> {order.supplier}</div>
                            <div><span className="font-semibold">Fecha:</span> {new Date(order.date as string).toLocaleDateString()}</div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-center">Cant.</TableHead>
                                    <TableHead className="text-right">P. Unitario</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.itemName}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end font-bold text-lg">
                            Total General: {formatCurrency(order.total)}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row sm:justify-end gap-3 bg-muted/50 p-4 rounded-b-lg">
                        {isActionable ? (
                            <>
                                <form action={rejectAction}>
                                    <Button type="submit" variant="destructive" className="w-full sm:w-auto">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Rechazar Orden
                                    </Button>
                                </form>
                                <form action={approveAction}>
                                    <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Aprobar Orden
                                    </Button>
                                </form>
                            </>
                        ) : (
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <MessageSquareWarning className="h-5 w-5"/>
                                <span>Esta orden ya ha sido procesada y no admite más acciones.</span>
                             </div>
                        )}
                         <Button variant="outline" asChild className="w-full sm:w-auto">
                            <a href={`mailto:admin@orderflow.com?subject=Consulta sobre orden ${order.orderNumber}`}>
                                <Info className="mr-2 h-4 w-4" />
                                Solicitar Información
                            </a>
                        </