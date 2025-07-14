
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, AlertTriangle, QrCode, FileWarning, PackageCheck, Anchor } from "lucide-react";
import type { PurchaseOrder } from '@/lib/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

type ItemStatus = 'pending' | 'ok' | 'discrepancy';

interface ChecklistItem {
    id: string; // This is now itemName for services, or itemId for materials
    name: string;
    expected: number;
    scanned: number;
    status: ItemStatus;
    type: 'Material' | 'Servicio';
}

interface ReceptionChecklistProps {
    order: PurchaseOrder;
    onUpdateStatus: (orderId: string, status: PurchaseOrder['status']) => void;
    onCancel: () => void;
}

export function ReceptionChecklist({ order, onUpdateStatus, onCancel }: ReceptionChecklistProps) {
    const itemsForReception = useMemo(() => 
        order.items
            .filter(item => item.type === 'Material')
            .map(item => ({
                id: item.itemId || item.itemName, // Fallback to itemName if itemId is missing
                name: item.itemName,
                expected: item.quantity,
                scanned: 0,
                status: 'pending' as ItemStatus,
                type: item.type,
            })),
        [order.items]
    );
    
    const [items, setItems] = useState<ChecklistItem[]>(itemsForReception);
    const [notes, setNotes] = useState('');

    const handleScan = (itemId: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId && item.scanned < item.expected) {
                const newScanned = item.scanned + 1;
                const newStatus = newScanned === item.expected ? 'ok' : 'pending';
                return { ...item, scanned: newScanned, status: newStatus };
            }
            return item;
        }));
    };
    
    const handleManualChange = (itemId: string, value: number) => {
         setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                const newScanned = Math.max(0, value);
                const newStatus: ItemStatus = newScanned === item.expected ? 'ok' : 'discrepancy';
                return { ...item, scanned: newScanned, status: newStatus };
            }
            return item;
        }));
    }

    const allItemsOk = items.every(item => item.status === 'ok');
    const hasDiscrepancy = items.some(item => item.status === 'discrepancy' || item.scanned !== item.expected);

    const getStatusIcon = (status: ItemStatus) => {
        switch (status) {
            case 'ok': return <Check className="text-green-500" />;
            case 'discrepancy': return <AlertTriangle className="text-yellow-500" />;
            default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Lista de Verificación de Artículos</CardTitle>
                        <CardDescription>Simula el escaneo de códigos QR para cada artículo del pedido. Los servicios no se muestran aquí.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.length > 0 ? items.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="flex-none w-8 h-8 flex items-center justify-center">
                                    {getStatusIcon(item.status)}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.id}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={item.scanned}
                                      onChange={(e) => handleManualChange(item.id, parseInt(e.target.value, 10) || 0)}
                                      className="w-20 text-center"
                                    />
                                    <span className="text-muted-foreground">/ {item.expected}</span>
                                </div>
                                <Button size="icon" variant="outline" onClick={() => handleScan(item.id)}>
                                    <QrCode className="w-5 h-5" />
                                </Button>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Anchor className="mx-auto h-8 w-8 mb-2" />
                                <p>No hay materiales físicos en este pedido para recibir.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen y Acciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div>
                            <Label htmlFor="notes">Notas de Recepción</Label>
                            <Textarea 
                                id="notes" 
                                placeholder="Añade cualquier observación sobre la entrega (ej. caja dañada, etc.)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                       </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button className="w-full" disabled={!hasDiscrepancy || items.length === 0}>
                                    <FileWarning className="mr-2 h-4 w-4" />
                                    Generar Informe de Incidencia
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Incidencia</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Se registrará una incidencia para esta recepción. Esto notificará al departamento de compras para que contacte con el proveedor. ¿Deseas continuar?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onUpdateStatus(order.id, 'Recibido')}>
                                    Confirmar y Recibir
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button className="w-full" disabled={!allItemsOk || items.length === 0}>
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Confirmar Recepción Completa
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Recepción</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Todos los artículos coinciden. El inventario se actualizará y la orden se marcará como "Recibido". ¿Estás seguro?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onUpdateStatus(order.id, 'Recibido')}>
                                    Confirmar
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="ghost" className="w-full" onClick={onCancel}>
                            Cancelar
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
