

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
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
import { MoreHorizontal, PlusCircle, MessageSquareWarning, Bot, Loader2, Wand2, Mail, Printer, Eye, ChevronRight, Trash2, History, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { PurchasingForm } from "@/components/purchasing/purchasing-form";
import type { PurchaseOrder, PurchaseOrderItem, Supplier, InventoryItem, Project, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generatePurchaseOrder } from "@/ai/flows/generate-purchase-order";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInDays, isPast, isToday } from "date-fns";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, updatePurchaseOrderStatus, deleteMultiplePurchaseOrders } from "./actions";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderStatusHistory } from "@/components/purchasing/order-status-history";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp";

const LOGGED_IN_USER_ID = 'WF-USER-001'; // Simula el Admin
const APPROVAL_PIN = '0707';

const convertTimestamps = (order: any): PurchaseOrder => {
    return {
      ...order,
      orderNumber: order.orderNumber,
      date: order.date instanceof Timestamp ? order.date.toDate().toISOString() : order.date,
      estimatedDeliveryDate: order.estimatedDeliveryDate instanceof Timestamp ? order.estimatedDeliveryDate.toDate().toISOString() : order.estimatedDeliveryDate,
      statusHistory: order.statusHistory?.map((h: any) => ({
        ...h,
        date: h.date instanceof Timestamp ? h.date.toDate().toISOString() : h.date
      })) || [],
      // Ensure the id is always the firestore doc id
      id: order.id
    };
};


const ALL_STATUSES: PurchaseOrder['status'][] = ["Pendiente de Aprobación", "Aprobada", "Enviada al Proveedor", "Recibida", "Almacenada", "Rechazado"];

// Lógica de la máquina de estados
const validTransitions: { [key in PurchaseOrder['status']]: PurchaseOrder['status'][] } = {
    'Pendiente de Aprobación': ['Aprobada', 'Rechazado'],
    'Aprobada': ['Enviada al Proveedor', 'Pendiente de Aprobación'], // Permitir revertir a pendiente
    'Rechazado': ['Pendiente de Aprobación'], // Permitir re-evaluar un rechazo
    'Enviada al Proveedor': ['Recibida'],
    'Recibida': ['Almacenada'],
    'Almacenada': [],
};

type SortDescriptor = {
    column: keyof PurchaseOrder | 'projectName';
    direction: 'ascending' | 'descending';
};

export function PurchasingClientPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinValue, setPinValue] = useState('');
  
  const [orderToProcess, setOrderToProcess] = useState<{ id: string; status: PurchaseOrder['status'] } | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | Partial<PurchaseOrder> | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
      column: 'estimatedDeliveryDate',
      direction: 'ascending',
  });
  
  useEffect(() => {
    const unsubPO = onSnapshot(collection(db, "purchaseOrders"), (snapshot) => {
        const ordersData = snapshot.docs.map(doc => {
            const data = doc.data();
            // IMPORTANT: Use doc.id as the primary id
            return convertTimestamps({ ...data, id: doc.id, orderNumber: data.orderNumber || data.id });
        });
        setPurchaseOrders(ordersData);
        setLoading(false);
    });
    const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snapshot) => setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier))));
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem))));
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project))));
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))));

    return () => {
        unsubPO();
        unsubSuppliers();
        unsubInventory();
        unsubProjects();
        unsubUsers();
    };
  }, []);
  
  const activePurchaseOrders = useMemo(() => {
    
    const projectMap = new Map(projects.map(p => [p.id, p.name]));
    
    let filteredOrders = purchaseOrders.filter(order => order.status !== 'Almacenada');
    
    const ordersWithProjectName = filteredOrders.map(order => ({
        ...order,
        projectName: projectMap.get(order.project) || order.project,
    }));


    return ordersWithProjectName.sort((a, b) => {
            const first = a[sortDescriptor.column as keyof typeof a];
            const second = b[sortDescriptor.column as keyof typeof b];
            let cmp = 0;

            if (first === undefined || first === null) cmp = -1;
            else if (second === undefined || second === null) cmp = 1;
            else if (typeof first === 'string' && typeof second === 'string') {
                 if (sortDescriptor.column === 'estimatedDeliveryDate' || sortDescriptor.column === 'date') {
                    cmp = new Date(first).getTime() - new Date(second).getTime();
                } else {
                    cmp = first.localeCompare(second);
                }
            } else if (typeof first === 'number' && typeof second === 'number') {
                cmp = first - second;
            }

            return sortDescriptor.direction === 'descending' ? -cmp : cmp;
        });
  }, [purchaseOrders, projects, sortDescriptor]);


  const currentUser = users.find(u => u.id === LOGGED_IN_USER_ID);
  const canApprove = currentUser?.role === 'Administrador';

  useEffect(() => {
    const project = searchParams.get('project');
    const supplier = searchParams.get('supplier');
    const itemsStr = searchParams.get('items');
    
    if (project && supplier && itemsStr) {
      try {
        const items = JSON.parse(itemsStr) as PurchaseOrderItem[];
        const newOrder: Partial<PurchaseOrder> = {
          project,
          supplier,
          items,
          status: 'Pendiente de Aprobación',
        };
        handleAddClick(newOrder);
      } catch (error) {
        console.error("Error parsing items from query params", error);
      }
    }
  }, [searchParams]);

  const handleAddClick = (initialData: Partial<PurchaseOrder> | null = null) => {
    setSelectedOrder(initialData);
    setIsModalOpen(true);
  };

  const handleEditClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
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

  const handlePrintClick = (orderId: string) => {
    window.open(`/purchasing/${orderId}/print`, '_blank');
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
  
  const handleStatusChange = async (id: string, currentStatus: PurchaseOrder['status'], newStatus: PurchaseOrder['status']) => {
    if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(newStatus)) {
        toast({
            variant: "destructive",
            title: "Transición de Estado No Válida",
            description: `No se puede cambiar el estado de "${currentStatus}" a "${newStatus}".`,
        });
        return;
    }
    
    if (newStatus === 'Aprobada') {
        setOrderToProcess({ id, status: newStatus });
        setIsPinModalOpen(true);
        return;
    }

    const result = await updatePurchaseOrderStatus(id, newStatus);
    if (result.success) {
      toast({ title: 'Estado Actualizado', description: result.message });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };


  const handleGenerateWithAI = async () => {
    if (!aiPrompt) {
      toast({ variant: "destructive", title: "Prompt vacío", description: "Por favor, escribe lo que necesitas pedir." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generatePurchaseOrder({ prompt: aiPrompt });
      if (result && result.items.length > 0) {
        const newOrder: Partial<PurchaseOrder> = {
          supplier: result.supplier,
          items: result.items,
          status: 'Pendiente de Aprobación',
        };
        handleAddClick(newOrder);
      } else {
        toast({ variant: "destructive", title: "Error de IA", description: "No se pudo generar el pedido. Revisa el prompt o los datos del proveedor/artículo." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error de IA", description: `Ocurrió un error: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (values: any) => {
    const dataToSave = { ...values };
     if (dataToSave.date && !(dataToSave.date instanceof Timestamp)) {
        dataToSave.date = new Date(dataToSave.date);
    }
    if (dataToSave.estimatedDeliveryDate && !(dataToSave.estimatedDeliveryDate instanceof Timestamp)) {
        dataToSave.estimatedDeliveryDate = new Date(dataToSave.estimatedDeliveryDate);
    }


    const result = selectedOrder && 'id' in selectedOrder
      ? await updatePurchaseOrder(selectedOrder.id as string, dataToSave)
      : await addPurchaseOrder(dataToSave);
      
    if (result.success) {
      toast({ title: selectedOrder && 'id' in selectedOrder ? "Pedido actualizado" : "Pedido creado", description: result.message });
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
      setSelectedRowIds(activePurchaseOrders.map(p => p.id));
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

  const getDeliveryStatus = (order: PurchaseOrder) => {
    if (order.status === 'Almacenada' || order.status === 'Recibida') {
        return { text: 'Entregado', color: 'bg-primary/10 text-primary border-primary/20' };
    }
    const deliveryDate = new Date(order.estimatedDeliveryDate);
    if (isPast(deliveryDate) && !isToday(deliveryDate)) {
        return { text: 'Retrasado', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    const daysUntilDelivery = differenceInDays(deliveryDate, new Date());
    if (daysUntilDelivery <= 5) {
        return { text: `Vence en ${daysUntilDelivery + 1} días`, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
    return { text: 'En Plazo', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const handlePinSubmit = async () => {
      if (pinValue === APPROVAL_PIN && orderToProcess) {
        const { id, status } = orderToProcess;
        const result = await updatePurchaseOrderStatus(id, status);
        if (result.success) {
          toast({ title: 'Pedido Aprobado', description: result.message });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsPinModalOpen(false);
        setPinValue('');
        setOrderToProcess(null);
      } else {
        toast({ variant: 'destructive', title: 'PIN Incorrecto', description: 'El PIN introducido no es válido.' });
        setPinValue('');
      }
  };

  const onSortChange = (column: SortDescriptor['column']) => {
    if (sortDescriptor.column === column) {
        setSortDescriptor({
            ...sortDescriptor,
            direction: sortDescriptor.direction === 'ascending' ? 'descending' : 'ascending',
        });
    } else {
        setSortDescriptor({ column, direction: 'ascending' });
    }
  };

  const getSortIcon = (column: SortDescriptor['column']) => {
    if (sortDescriptor.column !== column) return null;
    return sortDescriptor.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Compras</h1>
          <p className="text-muted-foreground">
            Crea y rastrea todas tus órdenes de compra activas. Las órdenes completadas se archivan.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="text-primary"/>Creación Rápida con IA</CardTitle>
          <CardDescription>
            Escribe lo que necesitas y deja que la IA genere un borrador del pedido de compra por ti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="ai-prompt">Tu Solicitud</Label>
            <div className="flex gap-2">
              <Input 
                id="ai-prompt" 
                placeholder="Ej: Pedir 20 soportes de montaje pequeños de MetalWorks Ltd." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateWithAI()}
                disabled={isGenerating}
              />
              <Button onClick={handleGenerateWithAI} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Bot className="mr-2" />}
                Generar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Órdenes de Compra Activas</CardTitle>
                    <CardDescription>Visualiza y gestiona todas tus solicitudes de compra en curso.</CardDescription>
                </div>
                {selectedRowIds.length > 0 ? (
                    <Button variant="destructive" onClick={handleBulkDeleteClick}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar ({selectedRowIds.length})
                    </Button>
                ) : (
                    <Button onClick={() => handleAddClick()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Pedido Manualmente
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead padding="checkbox" className="w-[50px]">
                  <Checkbox
                    checked={selectedRowIds.length === activePurchaseOrders.length && activePurchaseOrders.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>
                    <Button variant="ghost" onClick={() => onSortChange('orderNumber')}>
                        ID de Orden {getSortIcon('orderNumber')}
                    </Button>
                </TableHead>
                <TableHead>
                    <Button variant="ghost" onClick={() => onSortChange('supplier')}>
                        Proveedor {getSortIcon('supplier')}
                    </Button>
                </TableHead>
                <TableHead>
                    <Button variant="ghost" onClick={() => onSortChange('status')}>
                        Estado {getSortIcon('status')}
                    </Button>
                </TableHead>
                <TableHead>
                    <Button variant="ghost" onClick={() => onSortChange('estimatedDeliveryDate')}>
                        Entrega Estimada {getSortIcon('estimatedDeliveryDate')}
                    </Button>
                </TableHead>
                <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => onSortChange('total')}>
                        Total {getSortIcon('total')}
                    </Button>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePurchaseOrders.map((order) => {
                const deliveryStatus = getDeliveryStatus(order);
                return (
                <TableRow key={order.id} data-state={selectedRowIds.includes(order.id) ? "selected" : ""} className={cn(order.status === "Pendiente de Aprobación" && "bg-yellow-50 dark:bg-yellow-900/20")}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(order.id)}
                      onCheckedChange={() => handleRowSelect(order.id)}
                      aria-label={`Seleccionar orden ${order.orderNumber}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.orderNumber || order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          order.status === "Aprobada" && "bg-green-100 text-green-800 border-green-200",
                          order.status === "Pendiente de Aprobación" && "bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse",
                          order.status === "Enviada al Proveedor" && "bg-blue-100 text-blue-800 border-blue-200",
                          order.status === "Recibida" && "bg-orange-100 text-orange-800 border-orange-200",
                          order.status === "Almacenada" && "bg-primary/10 text-primary border-primary/20",
                          order.status === "Rechazado" && "bg-red-100 text-red-800 border-red-200"
                        )}
                      >
                        {order.status}
                      </Badge>
                      {order.status === 'Rechazado' && order.rejectionReason && (
                        <Tooltip>
                            <TooltipTrigger>
                                <MessageSquareWarning className="h-4 w-4 text-destructive" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{order.rejectionReason}</p>
                            </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span>{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span>
                        <Badge variant="outline" className={cn("capitalize w-fit", deliveryStatus.color)}>
                            {deliveryStatus.text}
                        </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
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
                          <DropdownMenuItem onClick={() => handleEditClick(order)}>
                            <Eye className="mr-2 h-4 w-4"/>
                            {canApprove ? "Revisar y Aprobar" : "Ver Detalles"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleHistoryClick(order)}>
                            <History className="mr-2 h-4 w-4"/>
                            Trazabilidad
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <ChevronRight className="mr-2 h-4 w-4" />
                              <span>Cambiar Estado</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {ALL_STATUSES.map(status => (
                                    <DropdownMenuItem 
                                        key={status} 
                                        onClick={() => handleStatusChange(order.id, order.status, status)}
                                        disabled={order.status === status}
                                    >
                                        {status}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePrintClick(order.id)}>
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
              {activePurchaseOrders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No se encontraron órdenes de compra que coincidan con los filtros.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </TooltipProvider>
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
              {selectedOrder && ('id' in selectedOrder || 'items' in selectedOrder) ? (canApprove ? `Revisar Pedido ${('orderNumber' in selectedOrder ? selectedOrder.orderNumber : '')}` : `Detalles del Pedido ${('orderNumber' in selectedOrder ? selectedOrder.orderNumber : '')}`) : "Crear Nuevo Pedido de Compra"}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder
                ? "Edita la información del pedido de compra."
                : "Rellena los detalles para crear un nuevo pedido."}
            </DialogDescription>
          </DialogHeader>
          <PurchasingForm
            order={selectedOrder}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedOrder(null);
            }}
            canApprove={canApprove}
            suppliers={suppliers}
            inventoryItems={inventory}
            projects={projects}
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
      
      <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verificación Requerida</DialogTitle>
            <DialogDescription>
              Introduce el PIN de 4 dígitos para aprobar este pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <InputOTP maxLength={4} value={pinValue} onChange={setPinValue} pattern={REGEXP_ONLY_DIGITS}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <Button type="button" onClick={handlePinSubmit} disabled={pinValue.length < 4}>Confirmar Aprobación</Button>
          </div>
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
}


    
