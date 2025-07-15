
"use client";

import React, { useState, useMemo } from "react";
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
import { clients as initialClients } from "@/lib/data";
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
import { ClientForm } from "@/components/clients/client-form";
import type { Client } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const handleAddClick = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };
  
  const handleBulkDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (values: any) => {
    if (selectedClient) {
      setClients(
        clients.map((c) =>
          c.id === selectedClient.id ? { ...c, ...values, id: c.id } : c
        )
      );
      toast({ title: "Cliente actualizado", description: "El cliente se ha actualizado correctamente." });
    } else {
      setClients([
        ...clients,
        { ...values, id: `WF-CLI-${String(clients.length + 1).padStart(3, '0')}` },
      ]);
      toast({ title: "Cliente creado", description: "El nuevo cliente se ha creado correctamente." });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedRowIds.length > 0) {
        setClients(clients.filter((c) => !selectedRowIds.includes(c.id)));
        toast({ variant: "destructive", title: "Clientes eliminados", description: `${selectedRowIds.length} clientes han sido eliminados.` });
        setSelectedRowIds([]);
    } else if (selectedClient) {
      setClients(clients.filter((c) => c.id !== selectedClient.id));
      toast({ variant: "destructive", title: "Cliente eliminado", description: "El cliente se ha eliminado correctamente." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(clients.map(c => c.id));
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
          <h1 className="text-3xl font-bold font-headline">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus clientes.
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
            Añadir Cliente
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
                    checked={selectedRowIds.length === clients.length && clients.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Persona de Contacto</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} data-state={selectedRowIds.includes(client.id) ? "selected" : ""}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(client.id)}
                      onCheckedChange={() => handleRowSelect(client.id)}
                      aria-label={`Seleccionar cliente ${client.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.contactPerson}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(client)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(client)}
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
              {selectedClient ? "Editar Cliente" : "Añadir Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {selectedClient
                ? "Edita la información del cliente."
                : "Rellena los detalles para crear un nuevo cliente."}
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            client={selectedClient}
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
              {selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} clientes seleccionados.` : " el cliente."}
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
