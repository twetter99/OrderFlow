
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inventory as initialInventory, inventoryLocations as initialInventoryLocations } from "@/lib/data";
import { ArrowLeft, PlusCircle, ArrowRightLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem, Location, InventoryLocation } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransferForm } from "@/components/inventory-locations/transfer-form";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";

function AddStockForm({
    location,
    inventoryItems,
    onSave,
    onCancel,
}: {
    location: Location,
    inventoryItems: InventoryItem[],
    onSave: (values: { itemId: string; quantity: number }) => void;
    onCancel: () => void;
}) {
    const [itemId, setItemId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const simpleItems = inventoryItems.filter(i => i.type === 'simple');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (itemId && quantity > 0) {
            onSave({ itemId, quantity });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="item">Artículo</Label>
                 <Select onValueChange={setItemId} value={itemId}>
                    <SelectTrigger id="item">
                        <SelectValue placeholder="Selecciona un artículo..." />
                    </SelectTrigger>
                    <SelectContent>
                        {simpleItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.sku})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad a Añadir</Label>
                <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    min="1"
                />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Añadir Stock</Button>
            </div>
        </form>
    );
}


export default function LocationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const id = params.id as string;
  const [location, setLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>(initialInventoryLocations);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "locations", id), (doc) => {
      if (doc.exists()) {
        setLocation({ id: doc.id, ...doc.data() } as Location);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Almacén no encontrado.' });
        setLocation(null);
      }
      setLoading(false);
    });

    const unsubAll = onSnapshot(collection(db, "locations"), (snapshot) => {
        setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location)));
    });

    return () => {
        unsub();
        unsubAll();
    }
  }, [id, toast]);


  const stockInLocation = useMemo(() => {
    return inventoryLocations
      .filter(il => il.locationId === id)
      .map(il => {
        const itemDetails = initialInventory.find(i => i.id === il.itemId);
        return {
          ...il,
          ...itemDetails,
        };
      })
      .filter(item => item.name);
  }, [id, inventoryLocations]);

  const handleSaveStock = (values: { itemId: string; quantity: number }) => {
    setInventoryLocations(prev => {
        const existingEntryIndex = prev.findIndex(
            il => il.itemId === values.itemId && il.locationId === id
        );

        if (existingEntryIndex > -1) {
            const updated = [...prev];
            updated[existingEntryIndex].quantity += values.quantity;
            return updated;
        } else {
            const newEntry = {
                id: `INVLOC-${Date.now()}`,
                itemId: values.itemId,
                locationId: id,
                quantity: values.quantity,
            };
            return [...prev, newEntry];
        }
    });
    toast({ title: "Stock Añadido", description: `Se ha añadido stock al almacén ${location?.name}.` });
    setIsAddStockModalOpen(false);
  };
  
   const handleSaveTransfer = (values: { itemId: string; fromLocationId: string; toLocationId: string; quantity: number }) => {
    setInventoryLocations(prev => {
        let updatedLocations = [...prev];
        
        const fromIndex = updatedLocations.findIndex(l => l.itemId === values.itemId && l.locationId === values.fromLocationId);
        if (fromIndex > -1) {
            updatedLocations[fromIndex].quantity -= values.quantity;
        }

        const toIndex = updatedLocations.findIndex(l => l.itemId === values.itemId && l.locationId === values.toLocationId);
        if (toIndex > -1) {
            updatedLocations[toIndex].quantity += values.quantity;
        } else {
            updatedLocations.push({
                id: `INVLOC-${Date.now()}`,
                itemId: values.itemId,
                locationId: values.toLocationId,
                quantity: values.quantity,
            });
        }
        
        return updatedLocations.filter(l => l.quantity > 0);
    });

    toast({ title: "Transferencia Exitosa", description: `Se movieron ${values.quantity} unidades del artículo seleccionado.` });
    setIsTransferModalOpen(false);
  };

  if (loading) {
      return <div>Cargando almacén...</div>;
  }

  if (!location) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold font-headline">Almacén no encontrado</h1>
        <p className="text-muted-foreground">El almacén que buscas no existe o ha sido eliminado.</p>
         <Button onClick={() => router.push('/locations')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Almacenes
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/locations')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Almacenes
          </Button>
          <h1 className="text-3xl font-bold font-headline">Inventario de: {location.name}</h1>
          <p className="text-muted-foreground">{location.description}</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => setIsAddStockModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Stock
            </Button>
             <Button variant="outline" onClick={() => setIsTransferModalOpen(true)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Transferir Stock
            </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Artículos en este Almacén</CardTitle>
            <CardDescription>Esta es una lista de todos los artículos y sus cantidades disponibles exclusivamente en {location.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre del Artículo</TableHead>
                <TableHead className="text-right">Cantidad en esta Ubicación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockInLocation.length > 0 ? stockInLocation.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Este almacén no tiene ningún artículo en stock.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <Dialog open={isAddStockModalOpen} onOpenChange={setIsAddStockModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Añadir Stock a {location.name}</DialogTitle>
                <DialogDescription>
                    Selecciona un artículo para añadir stock manualmente. Esto debe usarse para ajustes o ingresos iniciales.
                </DialogDescription>
            </DialogHeader>
            <AddStockForm 
                location={location}
                inventoryItems={initialInventory}
                onSave={handleSaveStock}
                onCancel={() => setIsAddStockModalOpen(false)}
            />
        </DialogContent>
      </Dialog>
      
       <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Transferir Stock entre Almacenes</DialogTitle>
                <DialogDescription>
                    Selecciona el artículo y las ubicaciones de origen y destino.
                </DialogDescription>
            </DialogHeader>
            <TransferForm
                inventoryItems={initialInventory.filter(i => i.type === 'simple')}
                locations={locations}
                inventoryLocations={inventoryLocations}
                onSave={handleSaveTransfer}
                onCancel={() => setIsTransferModalOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
