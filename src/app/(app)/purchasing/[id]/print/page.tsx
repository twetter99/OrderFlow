
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { purchaseOrders, suppliers, projects, clients } from '@/lib/data';
import type { PurchaseOrder, Supplier, Project, Client } from '@/lib/types';
import { Bot, Printer } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EnrichedPurchaseOrder extends PurchaseOrder {
  supplierDetails?: Supplier;
  projectDetails?: Project;
  clientDetails?: Client;
}

export default function PurchaseOrderPrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<EnrichedPurchaseOrder | null>(null);

  useEffect(() => {
    const foundOrder = purchaseOrders.find((o) => o.id === id);
    if (foundOrder) {
      const supplierDetails = suppliers.find((s) => s.name === foundOrder.supplier);
      const projectDetails = projects.find((p) => p.id === foundOrder.project);
      const clientDetails = projectDetails ? clients.find(c => c.id === projectDetails.clientId) : undefined;
      setOrder({ ...foundOrder, supplierDetails, projectDetails, clientDetails });
    }
  }, [id]);

  useEffect(() => {
    if (order) {
        setTimeout(() => window.print(), 500);
    }
  }, [order])

  if (!order) {
    return <div className="p-10 text-center">Cargando orden de compra...</div>;
  }
  
  const handlePrint = () => {
    window.print();
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="bg-white text-black p-8 font-sans">
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
      
      <header className="flex justify-between items-start pb-4 border-b-2 border-black">
        <div className="flex items-center gap-4">
          <Bot className="h-12 w-12 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">WINFIN</h1>
            <p className="text-sm">Calle Ficticia 123, 28080 Madrid</p>
            <p className="text-sm">CIF: B12345678</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase">Orden de Compra</h2>
          <p className="text-lg font-mono">{order.orderNumber || order.id}</p>
          <p className="text-sm">Fecha: {new Date(order.date).toLocaleDateString('es-ES')}</p>
        </div>
      </header>
      
      <section className="grid grid-cols-2 gap-8 my-8">
        <div>
            <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Proveedor</h3>
            <p className="font-semibold">{order.supplierDetails?.name}</p>
            <p>Att: {order.supplierDetails?.contactPerson}</p>
            <p>{order.supplierDetails?.email}</p>
            <p>{order.supplierDetails?.phone}</p>
        </div>
         <div>
            <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Enviar a</h3>
            <p className="font-semibold">WINFIN Almacén Principal</p>
            <p>Polígono Industrial "El Futuro", Nave 7</p>
            <p>28080 Madrid, España</p>
        </div>
      </section>

      <main className="my-8">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="text-black font-bold w-[50%]">Descripción</TableHead>
                    <TableHead className="text-right text-black font-bold">Cantidad</TableHead>
                    <TableHead className="text-right text-black font-bold">Precio Unitario</TableHead>
                    <TableHead className="text-right text-black font-bold">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {order.items.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableBody>
                 <TableRow className="border-t-2 border-black">
                    <TableCell colSpan={3} className="text-right font-bold">Subtotal</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(order.total)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">IVA (21%)</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(order.total * 0.21)}</TableCell>
                </TableRow>
                 <TableRow className="bg-gray-100">
                    <TableCell colSpan={3} className="text-right font-bold text-lg">TOTAL</TableCell>
                    <TableCell className="text-right font-bold text-lg">{formatCurrency(order.total * 1.21)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
      </main>

      <footer className="mt-16 text-sm text-gray-600">
        <p><span className="font-bold">Proyecto asociado:</span> {order.projectDetails?.name || order.project}</p>
        <p className="mt-4">Por favor, incluir el número de orden de compra en todas las facturas y comunicaciones. La entrega debe realizarse antes del <span className="font-bold">{new Date(order.estimatedDeliveryDate).toLocaleDateString('es-ES')}</span>.</p>
        <p className="text-center text-xs text-gray-500 mt-8">Gracias por su colaboración.</p>
      </footer>
      
      <div className="no-print fixed bottom-4 right-4">
        <Button onClick={handlePrint}>
            <Printer className="mr-2"/>
            Imprimir
        </Button>
      </div>
    </div>
  );
}
