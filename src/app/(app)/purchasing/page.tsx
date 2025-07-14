
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { purchaseOrders as initialPurchaseOrders, users, suppliers, inventory, projects } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle, MessageSquareWarning, Bot, Loader2, Wand2, Mail, Printer, Eye } from "lucide-react";
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
import { PurchasingForm } from "@/components/purchasing/purchasing-form";
import type { PurchaseOrder } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generatePurchaseOrder } from "@/ai/flows/generate-purchase-order";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInDays, isPast, isToday } from "date-fns";

const LOGGED_IN_USER_ID = 'WF-USER-001'; // Simula el Admin
// Para probar como otro rol, cambia a 'WF-USER-002' (Almacén) o 'WF-USER-003' (Empleado)

export default function PurchasingPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const currentUser = users.find(u => u.id === LOGGED_IN_USER_ID);
  const canApprove = currentUser?.role === 'Administrador';

  const handleAddClick = (initialData: Partial<PurchaseOrder> | null = null) => {
    setSelectedOrder(initialData as PurchaseOrder | null);
    setIsModalOpen(true);
  };

  const handleEditClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
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

    const subject = `Orden de Compra #${order.id} de WINFIN`;
    const body = `Hola ${supplierInfo.contactPerson},\n\nAdjuntamos la orden de compra #${order.id}.\n\nPor favor, confirma la recepción y la fecha de entrega estimada.\n\nGracias,\nEl equipo de WINFIN`;
    
    window.location.href = `mailto:${supplierInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
          status: 'Pendiente',
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

  const handleSave = (values: any) => {
    if (selectedOrder && 'id' in selectedOrder) {
      setPurchaseOrders(
        purchaseOrders.map((p) =>
          p.id === selectedOrder.id ? { ...p, ...values, id: p.id, date: new Date().toISOString() } : p
        )
      );
      toast({ title: "Pedido actualizado", description: "El pedido de compra se ha actualizado correctamente." });
    } else {
      setPurchaseOrders([
        ...purchaseOrders,
        { ...values, id: `WF-PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`, date: new Date().toISOString() },
      ]);
      toast({ title: "Pedido creado", description: "El nuevo pedido de compra se ha creado correctamente." });
    }
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      setPurchaseOrders(purchaseOrders.filter((p) => p.id !== selectedOrder.id));
      toast({ variant: "destructive", title: "Pedido eliminado", description: "El pedido de compra se ha eliminado correctamente." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedOrder(null);
  };

  const getDeliveryStatus = (order: PurchaseOrder) => {
    if (order.status === 'Recibido') {
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
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Compras</h1>
          <p className="text-muted-foreground">
            Crea y rastrea todas tus órdenes de compra.
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
          <CardTitle>Órdenes de Compra</CardTitle>
          <CardDescription>Visualiza y gestiona todas tus solicitudes de compra.</CardDescription>
          <div className="pt-4">
             <Button onClick={() => handleAddClick()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Pedido Manualmente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Entrega Estimada</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((order) => {
                const deliveryStatus = getDeliveryStatus(order);
                return (
                <TableRow key={order.id} className={cn(order.status === "Pendiente" && "bg-yellow-50 dark:bg-yellow-900/20")}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          order.status === "Aprobado" && "bg-green-100 text-green-800 border-green-200",
                          order.status === "Pendiente" && "bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse",
                          order.status === "Enviado" && "bg-blue-100 text-blue-800 border-blue-200",
                          order.status === "Recibido" && "bg-primary/10 text-primary border-primary/20",
                          order.status === "Rechazado" && "bg-red-100 text-red-800 border-red-200"
                        )}
                      >
                        {order.status === 'Pendiente' ? 'Pendiente Aprobación' : order.status}
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
                          <DropdownMenuItem onClick={() => handleEditClick(order)}>
                            <Eye className="mr-2 h-4 w-4"/>
                            {canApprove ? "Revisar y Aprobar" : "Ver Detalles"}
                          </DropdownMenuItem>
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
                            onClick={() => handleDeleteClick(order)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
              )})}
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
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder && 'id' in selectedOrder ? (canApprove ? "Revisar Pedido de Compra" : "Detalles del Pedido") : "Crear Nuevo Pedido de Compra"}
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
      
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el pedido de compra.
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
