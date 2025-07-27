
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Boxes, PackagePlus } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import type { InventoryItem, Supplier, Location, InventoryLocation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, where, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ItemDetailsModal } from "@/components/inventory/item-details-modal";
import { Input } from "@/components/ui/input";
import { AddStockForm } from "./add-stock-form";

export function InventoryClientPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
      setLoading(false);
    });
    const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snapshot) => {
      setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    });
    const unsubLocations = onSnapshot(collection(db, "locations"), (snapshot) => {
      setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location)));
    });
     const unsubInvLocations = onSnapshot(collection(db, "inventoryLocations"), (snapshot) => {
      setInventoryLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryLocation)));
    });

    return () => {
      unsubInventory();
      unsubSuppliers();
      unsubLocations();
      unsubInvLocations();
    };
  }, []);

  const filteredInventory = useMemo(() => {
    const lowercasedFilter = filter.toLowerCase();
    if (!lowercasedFilter) {
      return inventory;
    }

    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

    return inventory.filter(item => {
      const hasMatchingSupplier = item.suppliers?.some(supplierId => {
        const supplierName = supplierMap.get(supplierId);
        return supplierName?.toLowerCase().includes(lowercasedFilter);
      });

      return (
        item.name.toLowerCase().includes(lowercasedFilter) ||
        item.sku.toLowerCase().includes(lowercasedFilter) ||
        hasMatchingSupplier
      );
    });
  }, [inventory, filter, suppliers]);


  const handleAddClick = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const handleDetailsClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
  };

  const handleAddStockClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsAddStockModalOpen(true);
  };

  const handleDeleteTrigger = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    // Check if item is used in any composite item
     const isComponent = inventory.some(item => 
        item.type === 'composite' && item.components?.some(c => c.itemId === itemToDelete.id)
     );

     if (isComponent) {
        toast({
            variant: "destructive",
            title: "Error de eliminación",
            description: `El artículo "${itemToDelete.name}" no se puede eliminar porque es un componente de al menos un kit.`,
        });
        setIsDeleteDialogOpen(false);
        return;
     }

    try {
      await deleteDoc(doc(db, "inventory", itemToDelete.id));
      
      // Also delete all inventoryLocation entries for this item
      const q = query(collection(db, "inventoryLocations"), where("itemId", "==", itemToDelete.id));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => {
          batch.delete(doc.ref);
      });
      await batch.commit();

      toast({
        variant: "destructive",
        title: "Artículo eliminado",
        description: `El artículo "${itemToDelete.name}" ha sido eliminado.`,
      });
    } catch (error) {
        console.error("Error deleting item:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo eliminar el artículo."
        });
    }
    
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSave = async (values: any) => {
    try {
      if (selectedItem) {
        // Update
        const docRef = doc(db, "inventory", selectedItem.id);
        await updateDoc(docRef, values);
        toast({
          title: "Artículo actualizado",
          description: `El artículo "${values.name}" se ha actualizado correctamente.`,
        });
      } else {
        // Create
        await addDoc(collection(db, "inventory"), values);
        toast({
          title: "Artículo creado",
          description: `El artículo "${values.name}" se ha creado correctamente.`,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el artículo.",
      });
    }
  };

  const handleSaveStock = async (values: { locationId: string; quantity: number }) => {
     if (!selectedItem) return;

    try {
        const q = query(collection(db, "inventoryLocations"), where("itemId", "==", selectedItem.id), where("locationId", "==", values.locationId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Update existing stock
            const docRef = querySnapshot.docs[0].ref;
            const currentQuantity = querySnapshot.docs[0].data().quantity || 0;
            await updateDoc(docRef, { quantity: currentQuantity + values.quantity });
        } else {
            // Add new stock entry
            await addDoc(collection(db, "inventoryLocations"), {
                itemId: selectedItem.id,
                locationId: values.locationId,
                quantity: values.quantity
            });
        }
        
        toast({
            title: "Stock Añadido",
            description: `Se añadieron ${values.quantity} unidades de "${selectedItem.name}" al almacén.`,
        });
        setIsAddStockModalOpen(false);
        setSelectedItem(null);
        
    } catch(error) {
        console.error("Error adding stock:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo añadir el stock."
        });
    }
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const getItemTotalStock = (itemId: string) => {
    return inventoryLocations
      .filter(l => l.itemId === itemId)
      .reduce((sum, current) => sum + current.quantity, 0);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline uppercase">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona todos los artículos, kits y servicios de tu empresa.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Artículo
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Listado de Artículos</CardTitle>
           <CardDescription>
                Busca y filtra para encontrar artículos, kits o servicios en tu inventario.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
                placeholder="Filtrar por nombre, SKU o proveedor..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Stock Total</TableHead>
                <TableHead className="text-right">Costo Unitario</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Cargando...</TableCell></TableRow>
              ) : filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                        item.type === 'composite' ? 'default' : 
                        item.type === 'service' ? 'secondary' : 'outline'
                    }>
                        {item.type === 'simple' ? 'Simple' : item.type === 'composite' ? 'Kit' : 'Servicio'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">{item.type !== 'service' ? getItemTotalStock(item.id) : 'N/A'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
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
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {item.type !== 'service' && (
                            <DropdownMenuItem onClick={() => handleAddStockClick(item)}>
                                <PackagePlus className="mr-2 h-4 w-4" />
                                Añadir Stock
                            </DropdownMenuItem>
                        )}
                        {item.type === 'composite' && (
                          <DropdownMenuItem onClick={() => handleDetailsClick(item)}>
                            <Boxes className="mr-2 h-4 w-4" />
                            Ver Componentes
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteTrigger(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!loading && filteredInventory.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {filter ? "No se han encontrado artículos que coincidan con tu búsqueda." : "No se encontraron artículos."}
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
           <DialogHeader>
            <DialogTitle>{selectedItem ? "Editar Artículo" : "Crear Nuevo Artículo"}</DialogTitle>
          </DialogHeader>
          <InventoryForm 
            item={selectedItem}
            suppliers={suppliers}
            inventoryItems={inventory}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            onAddNewSupplier={() => { /* Lógica para añadir proveedor */}}
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
       
       {selectedItem && (
        <Dialog open={isAddStockModalOpen} onOpenChange={setIsAddStockModalOpen}>
            <DialogContent className="sm:max-w-md">
                 <DialogHeader>
                    <DialogTitle>Añadir Stock a Almacén</DialogTitle>
                </DialogHeader>
                <AddStockForm 
                    item={selectedItem}
                    locations={locations}
                    onSave={handleSaveStock}
                    onCancel={() => setIsAddStockModalOpen(false)}
                />
            </DialogContent>
        </Dialog>
       )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el artículo "{itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
