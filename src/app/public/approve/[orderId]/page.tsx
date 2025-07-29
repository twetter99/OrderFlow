
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PurchaseOrder, StatusHistoryEntry } from '@/lib/types';
import { convertPurchaseOrderTimestamps } from '@/lib/utils';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, FileText, Calendar, ShoppingCart, Landmark } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { updatePurchaseOrderStatus } from '@/app/purchasing/actions';

export default function ApproveOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError('No se ha proporcionado un ID de orden.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, 'purchaseOrders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          setError('La orden de compra no existe o ya ha sido procesada.');
        } else {
          setOrder(convertPurchaseOrderTimestamps(orderSnap.data() as PurchaseOrder));
        }
      } catch (err) {
        console.error("Error fetching order: ", err);
        setError('Ocurrió un error al cargar la orden.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsProcessing(true);
    const newStatus = action === 'approve' ? 'Aprobada' : 'Rechazado';
    const result = await updatePurchaseOrderStatus(orderId, newStatus, `Acción realizada desde enlace público por el aprobador.`);
    
    if (result.success) {
      if (action === 'approve') {
        const orderRef = doc(db, 'purchaseOrders', orderId);
        const orderSnap = await getDoc(orderRef);
        setOrder(convertPurchaseOrderTimestamps(orderSnap.data() as PurchaseOrder));
      } else {
        router.push(`/public/approve/rejected`);
      }
    } else {
      setError(result.message || 'No se pudo procesar la acción.');
    }
    setIsProcessing(false);
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);


  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando orden de compra...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-destructive/10 text-destructive">
        <XCircle className="h-12 w-12" />
        <h1 className="mt-4 text-2xl font-bold">Error</h1>
        <p className="mt-2 text-center">{error}</p>
      </div>
    );
  }

  if (!order) {
    return null; // Should be handled by error state
  }
  
  const isActionable = order.status === 'Pendiente de Aprobación';

  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 font-sans">
           <div className="w-full max-w-4xl">
              <div className="flex justify-center mb-6">
                  <Image src="/images/logo.png" alt="OrderFlow Logo" width={200} height={50} />
              </div>
              <Card className="shadow-2xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                          <CardTitle className="text-2xl md:text-3xl">Solicitud de Aprobación</CardTitle>
                          <CardDescription>Revisa los detalles de la orden de compra antes de tomar una acción.</CardDescription>
                      </div>
                      <Badge className="mt-2 sm:mt-0 text-base px-4 py-1" variant={isActionable ? 'default' : 'secondary'}>{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-1">
                            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><ShoppingCart className="h-4 w-4" /> Proveedor</h3>
                            <p>{order.supplier}</p>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /> Proyecto</h3>
                            <p>{order.project}</p>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Fecha de Orden</h3>
                            <p>{new Date(order.date as string).toLocaleDateString('es-ES')}</p>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Artículos</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-center">Cantidad</TableHead>
                                    <TableHead className="text-right">Precio Unitario</TableHead>
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
                    </div>
                     <Separator />
                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between font-semibold">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.total)}</span>
                             </div>
                             <div className="flex justify-between text-muted-foreground">
                                <span>IVA (21%)</span>
                                <span>{formatCurrency(order.total * 0.21)}</span>
                             </div>
                             <Separator/>
                             <div className="flex justify-between text-xl font-bold text-primary">
                                <span>TOTAL</span>
                                <span>{formatCurrency(order.total * 1.21)}</span>
                             </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="bg-muted/50 p-6 flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
                    {isActionable ? (
                        <>
                           <Button 
                              size="lg" 
                              className="w-full md:w-auto bg-red-600 hover:bg-red-700" 
                              onClick={() => handleAction('reject')}
                              disabled={isProcessing}
                            >
                                <XCircle className="mr-2 h-5 w-5" />
                                {isProcessing ? 'Procesando...' : 'Rechazar'}
                           </Button>
                           <Button 
                              size="lg" 
                              className="w-full md:w-auto bg-green-600 hover:bg-green-700" 
                              onClick={() => handleAction('approve')}
                              disabled={isProcessing}
                            >
                               {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <CheckCircle className="mr-2 h-5 w-5" />}
                               {isProcessing ? 'Procesando...' : 'Aprobar Orden'}
                           </Button>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <p>Esta orden ya ha sido procesada. Estado actual: <strong className="text-foreground">{order.status}</strong></p>
                            <p className="text-sm">Ya puedes cerrar esta ventana.</p>
                        </div>
                    )}
                </CardFooter>
              </Card>
           </div>
      </div>
    );
}
