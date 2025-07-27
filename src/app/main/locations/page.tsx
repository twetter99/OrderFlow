
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inventoryLocations as initialInventoryLocations, inventory } from "@/lib/data";
import { MoreHorizontal, PlusCircle, Trash2, View } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LocationForm } from "@/components/locations/location-form";
import type { Location } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { addLocation, updateLocation, deleteLocation, deleteMultipleLocations } from "./actions";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LocationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "locations"), (snapshot) => {
      const locationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
      setLocations(locationsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching locations: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los almacenes." });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  const locationStats = useMemo(() => {
    return locations.map(location => {
      const itemsInLocation = initialInventoryLocations.filter(il => il.locationId === location.id);
      const uniqueSkus = new Set(itemsInLocation.map(il => il.itemId)).size;
      const totalValue = itemsInLocation.reduce((sum, il) => {
        const itemDetails = inventory.find(i => i.id === il.itemId);
        return sum + (itemDetails ? itemDetails.unitCost * il.quantity : 0);
      }, 0);
      return {
        ...location,
        uniqueSkus,
        totalValue
      };
    });
  }, [locations]);

  const handleAddClick = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewInventoryClick = (locationId: string) => {
    router.push(`/locations/${locationId}`);
  };

  const handleSave = async (values: any) => {
    const result = selectedLocation
      ? await updateLocation(selectedLocation.id, values)
      : await addLocation(values);

    if (result.success) {
      toast({ title: selectedLocation ? "Almacén actualizado" : "Almacén creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const confirmDelete = async () => {
    let result;
    if (selectedRowIds.length > 0) {
        result = await deleteMultipleLocations(selectedRowIds);
    } else if (selectedLocation) {
        result = await deleteLocation(selectedLocation.id);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedLocation(null);
    setSelectedRowIds([]);
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(locations.map(l => l.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowSelect = (rowId: string) => {
    setSelectedRowIds(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId) 
        : [...prev, rowId]
    );
  };
  
  if (loading) {
    return <div>Cargando almacenes...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Almacenes</h1>
          <p className="text-muted-foreground">
            Gestiona tus almacenes y consulta un resumen de su inventario.
          </p>
        </div>
        {selectedRowIds.length > 0 ? (
          <Button variant="destructive" onClick={handleBulkDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar ({selectedRowIds.length})
          </Button>
        ) : (
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Almacén
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead padding="checkbox" className="w-[50px]">
                  <Checkbox
                    checked={selectedRowIds.length === locations.length && locations.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>SKUs Únicos</TableHead>
                <TableHead>Valor Total de Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationStats.map((location) => (
                <TableRow key={location.id} data-state={selectedRowIds.includes(location.id) ? "selected" : ""}>
                   <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(location.id)}
                      onCheckedChange={() => handleRowSelect(location.id)}
                      aria-label={`Seleccionar almacén ${location.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.uniqueSkus}</TableCell>
                  <TableCell>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(location.totalValue)}</TableCell>
                  <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewInventoryClick(location.id)} className="mr-2">
                          <View className="mr-2 h-4 w-4" />
                          Ver Inventario
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditClick(location)}>
                            Editar Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(location)}
                          >
                            Eliminar Almacén
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
              ))}
              {locations.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay almacenes creados. ¡Añade el primero!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLocation ? "Editar Almacén" : "Añadir Nuevo Almacén"}
            </DialogTitle>
            <DialogDescription>
              {selectedLocation
                ? "Edita la información del almacén."
                : "Rellena los detalles para crear un nuevo almacén."}
            </DialogDescription>
          </DialogHeader>
          <LocationForm
            location={selectedLocation}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              {selectedLocation ? ` el almacén "${selectedLocation.name}".` : (selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} almacenes seleccionados.` : " el almacén.")}
              Eliminar un almacén no elimina los artículos, pero su stock asignado quedará huérfano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
