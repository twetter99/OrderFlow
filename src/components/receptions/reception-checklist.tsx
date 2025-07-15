
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, AlertTriangle, QrCode, FileWarning, PackageCheck, Anchor, Warehouse } from "lucide-react";
import type { PurchaseOrder, Location } from '@/lib/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
    locations: Location[];
    onUpdateStatus: (orderId: string, status: PurchaseOrder['status'], receivingLocationId?: string, receivedItems?: { itemId: string; quantity: number }[]) => void;
    onCancel: () => void;
}

export function ReceptionChecklist({ order, locations, onUpdateStatus, onCancel }: ReceptionChecklistProps) {
    const itemsForReception = useMemo(() => 
        order.items
            .filter(item => item.type === 'Material' && item.itemId)
            .map(item => ({
                id: item.itemId!,
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
    const [receivingLocationId, setReceivingLocationId] = useState<string>("");

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
    const hasDiscrepancy = items.some(item => item.status === 'discrepancy' || (item.scanned !== item.expected && item.status !== 'ok'));

    const getStatusIcon = (status: ItemStatus) => {
        switch (status) {
            case 'ok': return <Check className="text-green-500" />;
            case 'discrepancy': return <AlertTriangle className="text-yellow-500" />;
            default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
        }
    };

    const handleConfirm = () => {
        const receivedItems = items
            .filter(item => item.scanned > 0)
            .map(item => ({ itemId: item.id, quantity: item.scanned }));

        onUpdateStatus(order.id, 'Recibido', receivingLocationId, receivedItems);
    }
    
    const canConfirm = !!receivingLocationId && items.length > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Warehouse className="h-5 w-5"/> Almacén de Destino</CardTitle>
                        <CardDescription>Selecciona el almacén donde se guardará esta mercancía.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Select onValueChange={setReceivingLocationId} value={receivingLocationId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un almacén..." />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map(loc => (
                                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Lista de Verificación de Artículos</CardTitle>
                        <CardDescription>Verifica las cantidades recibidas. Los servicios no se muestran aquí.</CardDescription>
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
                                      disabled={!receivingLocationId}
                                    />
                                    <span className="text-muted-foreground">/ {item.expected}</span>
                                </div>
                                <Button size="icon" variant="outline" onClick={() => handleScan(item.id)} disabled={!receivingLocationId}>
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
                                 <Button className="w-full" disabled={!canConfirm || !hasDiscrepancy}>
                                    <FileWarning className="mr-2 h-4 w-4" />
                                    Recibir con Incidencia
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Recepción con Incidencia</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Se registrará una incidencia y se recibirá la cantidad escaneada. El inventario se actualizará y la orden se marcará como "Recibido". ¿Deseas continuar?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirm}>
                                    Confirmar y Recibir
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button className="w-full" disabled={!canConfirm || !allItemsOk}>
                                    <PackageCheck className="mr-2 h-4 w-4" />
                                    Confirmar Recepción Completa
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Recepción Completa</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Todos los artículos coinciden. El inventario en {locations.find(l => l.id === receivingLocationId)?.name || 'el almacén seleccionado'} se actualizará y la orden se marcará como "Recibido". ¿Estás seguro?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirm}>
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
