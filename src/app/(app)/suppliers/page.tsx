
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
import { suppliers as initialSuppliers } from "@/lib/data";
import { MoreHorizontal, PlusCircle, Star } from "lucide-react";
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
import { SupplierForm } from "@/components/suppliers/supplier-form";
import type { Supplier } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleAddClick = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (values: any) => {
    if (selectedSupplier) {
      setSuppliers(
        suppliers.map((p) =>
          p.id === selectedSupplier.id ? { ...p, ...values, id: p.id } : p
        )
      );
      toast({ title: "Proveedor actualizado", description: "El proveedor se ha actualizado correctamente." });
    } else {
      setSuppliers([
        ...suppliers,
        { ...values, id: `WF-SUP-${String(suppliers.length + 1).padStart(3, '0')}` },
      ]);
      toast({ title: "Proveedor creado", description: "El nuevo proveedor se ha creado correctamente." });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedSupplier) {
      setSuppliers(suppliers.filter((p) => p.id !== selectedSupplier.id));
      toast({ variant: "destructive", title: "Proveedor eliminado", description: "El proveedor se ha eliminado correctamente." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedSupplier(null);
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Proveedores</h1>
          <p className="text-muted-foreground">
            Gestiona la información y el rendimiento de tus proveedores.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Proveedor
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Persona de Contacto</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Calificación de Entrega</TableHead>
                <TableHead>Calificación de Calidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {supplier.deliveryRating.toFixed(1)} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {supplier.qualityRating.toFixed(1)} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                  </TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(supplier)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(supplier)}
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
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? "Editar Proveedor" : "Añadir Nuevo Proveedor"}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplier
                ? "Edita la información del proveedor."
                : "Rellena los detalles para crear un nuevo proveedor."}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            supplier={selectedSupplier}
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
              el proveedor.
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
