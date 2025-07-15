
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
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
import { MoreHorizontal, PlusCircle, Boxes, View, Wrench, Trash2, ImageOff } from "lucide-react";
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
import { ItemDetailsModal } from "@/components/inventory/item-details-modal";
import { Checkbox } from "@/components/ui/checkbox";

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const inventoryWithCalculations = useMemo(() => {
    return inventory.map(item => {
      if (item.type === 'composite') {
        const buildableQuantity = Math.min(
          ...(item.components?.map(c => {
            const componentItem = inventory.find(i => i.id === c.itemId);
            return componentItem ? Math.floor(componentItem.quantity / c.quantity) : 0;
          }) || [0])
        );
        return { ...item, buildableQuantity };
      }
      return { ...item, buildableQuantity: item.quantity };
    });
  }, [inventory]);

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
  
  const handleBulkDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetailsClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  };

  const handleSave = (values: any) => {
    if (selectedItem && 'id' in selectedItem) {
      setInventory(
        inventory.map((p) =>
          p.id === selectedItem.id ? { ...p, ...values, id: p.id } : p
        )
      );
      toast({ title: "Artículo actualizado", description: "El artículo del inventario se ha actualizado correctamente." });
    } else {
      setInventory([
        ...inventory,
        { ...values, id: `ITEM-${String(inventory.length + 1).padStart(3, '0')}` },
      ]);
      toast({ title: "Artículo creado", description: "El nuevo artículo se ha añadido al inventario." });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedRowIds.length > 0) {
        setInventory(inventory.filter((item) => !selectedRowIds.includes(item.id)));
        toast({ variant: "destructive", title: "Artículos eliminados", description: `${selectedRowIds.length} artículos han sido eliminados.` });
        setSelectedRowIds([]);
    } else if (selectedItem) {
      setInventory(inventory.filter((p) => p.id !== selectedItem.id));
      toast({ variant: "destructive", title: "Artículo eliminado", description: "El artículo se ha eliminado del inventario." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(inventory.map(item => item.id));
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


  const handleAddNewSupplier = () => {
    setIsModalOpen(false);
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (values: any) => {
    const newSupplier = { ...values, id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}` };
    setSuppliers([...suppliers, newSupplier]);
    toast({ title: "Proveedor creado", description: "El nuevo proveedor se ha creado correctamente." });
    setIsSupplierModalOpen(false);
    setIsModalOpen(true);
  };
  
  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Inventario</h1>
          <p className="text-muted-foreground">
            Rastrea y gestiona tus artículos, kits y servicios.
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
          Añadir Artículo
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
                    checked={selectedRowIds.length === inventory.length && inventory.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Imagen</TableHead>
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
              {inventoryWithCalculations.map((item) => {
                const isPhysical = item.type === 'simple' || item.type === 'composite';
                const quantityToShow = item.type === 'composite' ? item.buildableQuantity : item.quantity;
                const isLowStock = isPhysical && quantityToShow < item.minThreshold;
                
                return (
                  <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""} className={cn(isLowStock && !selectedRowIds.includes(item.id) && "bg-red-50 dark:bg-red-900/20")}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRowIds.includes(item.id)}
                        onCheckedChange={() => handleRowSelect(item.id)}
                        aria-label={`Seleccionar artículo ${item.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md">
                            <ImageOff className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.type === 'composite' && <Boxes className="h-4 w-4 text-muted-foreground" title="Kit/Compuesto" />}
                        {item.type === 'service' && <Wrench className="h-4 w-4 text-muted-foreground" title="Servicio" />}
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isPhysical && (
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
                      )}
                      {item.type === 'service' && <Badge variant="secondary">Servicio</Badge>}
                    </TableCell>
                    <TableCell>
                      {isPhysical && (
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold">{quantityToShow}</span>
                          <span className="text-xs text-muted-foreground">{item.unit}</span>
                          {item.type === 'simple' && <span className="text-xs text-muted-foreground">/ {item.minThreshold}</span>}
                          {item.type === 'composite' && <span className="text-xs text-muted-foreground"> (Construible)</span>}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{isPhysical ? item.supplier : 'N/A'}</TableCell>
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
                          {item.type === 'composite' && (
                            <DropdownMenuItem onClick={() => handleViewDetailsClick(item)}>
                              <View className="mr-2 h-4 w-4" />
                              Ver Componentes
                            </DropdownMenuItem>
                          )}
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
                : "Rellena los detalles para crear un nuevo artículo, kit o servicio."}
            </DialogDescription>
          </DialogHeader>
          <InventoryForm
            item={selectedItem}
            suppliers={suppliers}
            inventoryItems={inventory}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            onAddNewSupplier={handleAddNewSupplier}
          />
        </DialogContent>
      </Dialog>
      
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          allInvetoryItems={inventory}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

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
              {selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} artículos seleccionados.` : " el artículo del inventario."}
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
