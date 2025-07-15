
"use client";

import React, { useState } from "react";
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
import { locations as initialLocations } from "@/lib/data";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
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

export default function LocationsPage() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

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

  const handleSave = (values: any) => {
    if (selectedLocation) {
      setLocations(
        locations.map((c) =>
          c.id === selectedLocation.id ? { ...c, ...values, id: c.id } : c
        )
      );
      toast({ title: "Almacén actualizado", description: "El almacén se ha actualizado correctamente." });
    } else {
      setLocations([
        ...locations,
        { ...values, id: `LOC-${String(locations.length + 1).padStart(3, '0')}` },
      ]);
      toast({ title: "Almacén creado", description: "El nuevo almacén se ha creado correctamente." });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedRowIds.length > 0) {
        setLocations(locations.filter((loc) => !selectedRowIds.includes(loc.id)));
        toast({ variant: "destructive", title: "Almacenes eliminados", description: `${selectedRowIds.length} almacenes han sido eliminados.` });
        setSelectedRowIds([]);
    } else if (selectedLocation) {
      setLocations(locations.filter((c) => c.id !== selectedLocation.id));
      toast({ variant: "destructive", title: "Almacén eliminado", description: "El almacén se ha eliminado correctamente." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedLocation(null);
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
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Almacenes</h1>
          <p className="text-muted-foreground">
            Gestiona tus almacenes y sus ubicaciones.
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
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id} data-state={selectedRowIds.includes(location.id) ? "selected" : ""}>
                   <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(location.id)}
                      onCheckedChange={() => handleRowSelect(location.id)}
                      aria-label={`Seleccionar almacén ${location.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.description}</TableCell>
                  <TableCell className="text-right">
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
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(location)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
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
              {selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} almacenes seleccionados.` : " el almacén."}
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
