
"use client";

import React, { useState, useEffect } from "react";
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
import { MoreHorizontal, PlusCircle, Star, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { addSupplier, updateSupplier, deleteSupplier, deleteMultipleSuppliers } from "./actions";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

   useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "suppliers"), (snapshot) => {
        const suppliersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
        setSuppliers(suppliersData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching suppliers: ", error);
        setSuppliers(initialSuppliers); // Fallback to mock data on error
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddClick = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setSupplierToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (values: any) => {
    const result = selectedSupplier 
      ? await updateSupplier(selectedSupplier.id, values) 
      : await addSupplier(values);

    if (result.success) {
      toast({ title: selectedSupplier ? "Proveedor actualizado" : "Proveedor creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const confirmDelete = async () => {
    let result;
    if (supplierToDelete) {
        result = await deleteSupplier(supplierToDelete.id);
    } else if (selectedRowIds.length > 0) {
        result = await deleteMultipleSuppliers(selectedRowIds);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setSupplierToDelete(null);
    setSelectedRowIds([]);
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(suppliers.map(s => s.id));
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
          <h1 className="text-3xl font-bold font-headline">Proveedores</h1>
          <p className="text-muted-foreground">
            Gestiona la información y el rendimiento de tus proveedores.
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
            Añadir Proveedor
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
                    checked={selectedRowIds.length === suppliers.length && suppliers.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
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
                <TableRow key={supplier.id} data-state={selectedRowIds.includes(supplier.id) ? "selected" : ""}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(supplier.id)}
                      onCheckedChange={() => handleRowSelect(supplier.id)}
                      aria-label={`Seleccionar proveedor ${supplier.name}`}
                    />
                  </TableCell>
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
        <DialogContent className="sm:max-w-xl">
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
              {supplierToDelete ? ` el proveedor "${supplierToDelete.name}".` : (selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} proveedores seleccionados.` : " el proveedor.")}
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
