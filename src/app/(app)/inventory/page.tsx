

"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle, Boxes, View, Wrench, Trash2 } from "lucide-react";
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
import type { InventoryItem, Supplier, InventoryLocation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { ItemDetailsModal } from "@/components/inventory/item-details-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addInventoryItem, updateInventoryItem, deleteInventoryItem, deleteMultipleInventoryItems } from "./actions";
import { addSupplier } from "../suppliers/actions";

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
        setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
        setLoading(false);
    });
    const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snapshot) => {
        setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    });
    const unsubInvLocations = onSnapshot(collection(db, "inventoryLocations"), (snapshot) => {
        setInventoryLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryLocation)));
    });

    return () => {
        unsubInventory();
        unsubSuppliers();
        unsubInvLocations();
    }
  }, []);

  const inventoryWithCalculations = useMemo(() => {
    return inventory.map(item => {
      const totalQuantity = inventoryLocations
        .filter(loc => loc.itemId === item.id)
        .reduce((sum, loc) => sum + loc.quantity, 0);
      
      let buildableQuantity = totalQuantity;
      if (item.type === 'composite') {
        buildableQuantity = Math.min(
          ...(item.components?.map(c => {
            const componentItem = inventory.find(i => i.id === c.itemId);
            const componentTotalQuantity = inventoryLocations
              .filter(loc => loc.itemId === c.itemId)
              .reduce((sum, loc) => sum + loc.quantity, 0);
            return componentItem ? Math.floor(componentTotalQuantity / c.quantity) : 0;
          }) || [0])
        );
      }
      
      return { ...item, quantity: totalQuantity, buildableQuantity };
    });
  }, [inventory, inventoryLocations]);


  const handleAddClick = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteTrigger = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };
  
  const handleBulkDeleteClick = () => {
    setSelectedItem(null);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetailsClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    const result = selectedItem
      ? await updateInventoryItem(selectedItem.id, values)
      : await addInventoryItem(values);

    if (result.success) {
      toast({ title: selectedItem ? "Artículo actualizado" : "Artículo creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const confirmDelete = async () => {
    let result;
    if (selectedItem) {
        result = await deleteInventoryItem(selectedItem.id);
    } else if (selectedRowIds.length > 0) {
        result = await deleteMultipleInventoryItems(selectedRowIds);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
    setSelectedRowIds([]);
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

  const handleSaveSupplier = async (values: any) => {
    const result = await addSupplier(values);
    if (result.success) {
      toast({ title: "Proveedor creado", description: "El nuevo proveedor se ha creado correctamente." });
      setIsSupplierModalOpen(false);
      setIsModalOpen(true);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };
  
  if (loading) {
      return <div>Cargando inventario desde Firestore...</div>
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Inventario</h1>
          <p className="text-muted-foreground">
            Rastrea y gestiona tus artículos, kits y servicios. La cantidad total es la suma de todas las ubicaciones.
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
                <TableHead>SKU</TableHead>
                <TableHead>Nombre del Artículo</TableHead>
                <TableHead>Cantidad Total</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Costo Unitario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryWithCalculations.map((item) => {
                const isPhysical = item.type === 'simple' || item.type === 'composite';
                // @ts-ignore
                const quantityToShow = item.type === 'composite' ? item.buildableQuantity : item.quantity;
                
                return (
                  <TableRow key={item.id} data-state={selectedRowIds.includes(item.id) ? "selected" : ""}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRowIds.includes(item.id)}
                        onCheckedChange={() => handleRowSelect(item.id)}
                        aria-label={`Seleccionar artículo ${item.name}`}
                      />
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
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold">{quantityToShow}</span>
                          <span className="text-xs text-muted-foreground">{item.unit}</span>
                          {item.type === 'composite' && <span className="text-xs text-muted-foreground"> (Construible)</span>}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{isPhysical ? (item.suppliers || []).join(', ') : 'N/A'}</TableCell>
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
                            onClick={() => handleDeleteTrigger(item)}
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Editar Artículo" : "Añadir Nuevo Artículo"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? "Edita la información del artículo."
                : "Rellena los detalles para crear un nuevo artículo, kit o servicio. El stock se añade desde recepciones o almacenes."}
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
        <DialogContent className="sm:max-w-xl">
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
