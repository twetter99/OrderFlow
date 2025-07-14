
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inventory as initialInventory, suppliers as initialSuppliers } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
import { InventoryForm } from "@/components/inventory/inventory-form";
import type { InventoryItem, Supplier } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { SupplierForm } from "@/components/suppliers/supplier-form";

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleAddClick = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (values: any) => {
    if (selectedItem) {
      setInventory(
        inventory.map((p) =>
          p.id === selectedItem.id ? { ...p, ...values, id: p.id } : p
        )
      );
      toast({ title: "Artículo actualizado", description: "El artículo del inventario se ha actualizado correctamente." });
    } else {
      setInventory([
        ...inventory,
        { ...values, id: `ITEM-00${inventory.length + 1}` },
      ]);
      toast({ title: "Artículo creado", description: "El nuevo artículo se ha añadido al inventario." });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setInventory(inventory.filter((p) => p.id !== selectedItem.id));
      toast({ variant: "destructive", title: "Artículo eliminado", description: "El artículo se ha eliminado del inventario." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleAddNewSupplier = () => {
    setIsModalOpen(false); // Cierra el modal de inventario
    setIsSupplierModalOpen(true); // Abre el modal de proveedor
  };

  const handleSaveSupplier = (values: any) => {
    const newSupplier = { ...values, id: `SUP-00${suppliers.length + 1}` };
    setSuppliers([...suppliers, newSupplier]);
    toast({ title: "Proveedor creado", description: "El nuevo proveedor se ha creado correctamente." });
    setIsSupplierModalOpen(false);
    setIsModalOpen(true); // Vuelve a abrir el modal de inventario
  };
  
  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Inventario</h1>
          <p className="text-muted-foreground">
            Rastrea y gestiona tus niveles de stock.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Artículo
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre del Artículo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Costo Unitario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const isLowStock = item.quantity < item.minThreshold;
                return (
                  <TableRow key={item.id} className={cn(isLowStock && "bg-red-50 dark:bg-red-900/20")}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          isLowStock 
                            ? "bg-destructive/10 text-destructive border-destructive/20" 
                            : "bg-green-100 text-green-800 border-green-200"
                        )}
                      >
                        {isLowStock ? "Stock Bajo" : "En Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.quantity} / {item.minThreshold}
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.unitCost)}
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
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(item)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Editar Artículo" : "Añadir Nuevo Artículo"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? "Edita la información del artículo."
                : "Rellena los detalles para crear un nuevo artículo."}
            </DialogDescription>
          </DialogHeader>
          <InventoryForm
            item={selectedItem}
            suppliers={suppliers}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            onAddNewSupplier={handleAddNewSupplier}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Proveedor</DialogTitle>
            <DialogDescription>
              Rellena los detalles para crear un nuevo proveedor.
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            onSave={handleSaveSupplier}
            onCancel={() => {
              setIsSupplierModalOpen(false);
              setIsModalOpen(true);
            }}
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
              el artículo del inventario.
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
