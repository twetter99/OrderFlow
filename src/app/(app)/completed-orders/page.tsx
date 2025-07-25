
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
import { MoreHorizontal, Printer, Eye, Trash2, History, Mail, Copy } from "lucide-react";
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
import type { PurchaseOrder, Supplier, InventoryItem, Project, User, Location } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addPurchaseOrder, deletePurchaseOrder, deleteMultiplePurchaseOrders, updatePurchaseOrder } from "../purchasing/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderStatusHistory } from "@/components/purchasing/order-status-history";
import { PurchasingForm } from "@/components/purchasing/purchasing-form";


const convertTimestamps = (order: any): PurchaseOrder => {
    return {
      ...order,
      id: order.id,
      date: order.date instanceof Timestamp ? order.date.toDate().toISOString() : order.date,
      estimatedDeliveryDate: order.estimatedDeliveryDate instanceof Timestamp ? order.estimatedDeliveryDate.toDate().toISOString() : order.estimatedDeliveryDate,
      statusHistory: order.statusHistory?.map((h: any) => ({
        ...h,
        date: h.date instanceof Timestamp ? h.date.toDate().toISOString() : h.date
      })) || [],
    };
};

export default function CompletedOrdersPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | Partial<PurchaseOrder> | null>(null);

  useEffect(() => {
    const unsubPO = onSnapshot(collection(db, "purchaseOrders"), (snapshot) => {
        const ordersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return convertTimestamps({ ...data, id: doc.id });
        });
        setPurchaseOrders(ordersData);
        setLoading(false);
    });

    // Fetch related data for the form modal
    const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snapshot) => setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier))));
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem))));
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project))));
    const unsubLocations = onSnapshot(collection(db, "locations"), (snapshot) => setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location))));

    return () => {
        unsubPO();
        unsubSuppliers();
        unsubInventory();
        unsubProjects();
        unsubLocations();
    };
  }, []);
  
  const completedOrders = useMemo(() => {
    const finalStatuses: PurchaseOrder['status'][] = ['Recibida', 'Almacenada'];
    return purchaseOrders
      .filter(order => finalStatuses.includes(order.status))
      .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());
  }, [purchaseOrders]);

  const handleViewDetailsClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  const handleDuplicateClick = (order: PurchaseOrder) => {
    const { id, orderNumber, ...orderToDuplicate } = order;
    setSelectedOrder({
      ...orderToDuplicate,
      status: 'Pendiente de Aprobación', // Reset status for new order
      date: new Date().toISOString(), // Set date to today
    });
    setIsModalOpen(true);
  };
  
  const handleHistoryClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsHistoryModalOpen(true);
  };

  const handleDeleteTrigger = (order: PurchaseOrder) => {
    setOrderToDelete(order);
    setIsDeleteDialogOpen(true);
  };
  
  const handleBulkDeleteClick = () => {
    setOrderToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const handlePrintClick = (order: PurchaseOrder) => {
    const projectDetails = projects.find(p => p.id === order.project);
    const supplierDetails = suppliers.find(s => s.name === order.supplier);
    const deliveryLocationDetails = locations.find(l => l.id === order.deliveryLocationId);
    
    const enrichedOrder = {
        ...order,
        projectDetails,
        supplierDetails,
        deliveryLocationDetails,
    };

    try {
        localStorage.setItem(`print_order_${order.id}`, JSON.stringify(enrichedOrder));
        window.open(`/purchasing/${order.id}/print`, '_blank');
    } catch (e) {
        console.error("Could not save to localStorage", e);
        toast({
            variant: "destructive",
            title: "Error de Impresión",
            description: "No se pudo preparar la orden para imprimir. Inténtalo de nuevo."
        })
    }
  };

  const handleEmailClick = (order: PurchaseOrder) => {
    const supplierInfo = suppliers.find(s => s.name === order.supplier);
    if (!supplierInfo) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se encontró la información del proveedor.' });
      return;
    }
    const subject = `Orden de Compra ${order.orderNumber} de WINFIN`;
    const body = `Hola ${supplierInfo.contactPerson},\n\nAdjuntamos la orden de compra ${order.orderNumber}.\n\nPor favor, confirma la recepción y la fecha de entrega estimada.\n\nGracias,\nEl equipo de WINFIN`;
    window.location.href = `mailto:${supplierInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const handleSave = async (values: any) => {
    // Duplicating always creates a new order
    const result = await addPurchaseOrder(values);
      
    if (result.success) {
      toast({ title: "Pedido Duplicado Creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const confirmDelete = async () => {
    let result;
    if (orderToDelete) {
        result = await deletePurchaseOrder(orderToDelete.id);
    } else if (selectedRowIds.length > 0) {
        result = await deleteMultiplePurchaseOrders(selectedRowIds);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setOrderToDelete(null);
    setSelectedRowIds([]);
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(completedOrders.map(p => p.id));
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
    return <div>Cargando órdenes completadas...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Órdenes Completadas</h1>
          <p className="text-muted-foreground">
            Historial de todas las órdenes de compra que han sido recibidas y almacenadas.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Historial de Pedidos</CardTitle>
                    <CardDescription>Consulta todas las órdenes de compra finalizadas.</CardDescription>
                </div>
                {selectedRowIds.length > 0 && (
                    <Button variant="destructive" onClick={handleBulkDeleteClick}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar ({selectedRowIds.length})
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead padding="checkbox" className="w-[50px]">
                  <Checkbox
                    checked={selectedRowIds.length === completedOrders.length && completedOrders.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>ID de Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedOrders.map((order) => {
                return (
                <TableRow key={order.id} data-state={selectedRowIds.includes(order.id) ? "selected" : ""}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(order.id)}
                      onCheckedChange={() => handleRowSelect(order.id)}
                      aria-label={`Seleccionar orden ${order.orderNumber}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.orderNumber || order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                   <TableCell>{projects.find(p => p.id === order.project)?.name || order.project}</TableCell>
                  <TableCell>{new Date(order.date as string).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        order.status === "Recibida" && "bg-purple-100 text-purple-800 border-purple-200",
                        order.status === "Almacenada" && "bg-primary/10 text-primary border-primary/20",
                      )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(order.total)}
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
                           <DropdownMenuItem onClick={() => handleViewDetailsClick(order)}>
                            <Eye className="mr-2 h-4 w-4"/>
                            Ver Detalles
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleHistoryClick(order)}>
                            <History className="mr-2 h-4 w-4"/>
                            Trazabilidad
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDuplicateClick(order)}>
                            <Copy className="mr-2 h-4 w-4"/>
                            Duplicar Orden
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintClick(order)}>
                            <Printer className="mr-2 h-4 w-4"/>
                            Imprimir Orden
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEmailClick(order)}>
                            <Mail className="mr-2 h-4 w-4"/>
                            Enviar por Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTrigger(order)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
              )})}
              {completedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No hay órdenes de compra completadas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) {
          setSelectedOrder(null);
        }
      }}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder && 'id' in selectedOrder ? "Detalles del Pedido" : "Crear Pedido Duplicado"}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && 'id' in selectedOrder
                ? `Viendo los detalles del pedido ${selectedOrder.orderNumber}.`
                : "Modifica los detalles necesarios para la nueva orden de compra."}
            </DialogDescription>
          </DialogHeader>
          <PurchasingForm
            order={selectedOrder}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedOrder(null);
            }}
            canApprove={true}
            suppliers={suppliers}
            inventoryItems={inventory}
            projects={projects}
            locations={locations}
          />
        </DialogContent>
      </Dialog>
      
       <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Trazabilidad del Pedido {selectedOrder?.orderNumber}</DialogTitle>
                <DialogDescription>
                    Historial de todos los cambios de estado para este pedido.
                </DialogDescription>
            </DialogHeader>
            {selectedOrder && <OrderStatusHistory history={selectedOrder.statusHistory || []} />}
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
               {orderToDelete ? ` el pedido "${orderToDelete.orderNumber}".` : (selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} pedidos seleccionados.` : " el pedido seleccionado.")}
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

    