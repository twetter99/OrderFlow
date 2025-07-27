
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
import { deliveryNotes as initialDeliveryNotes, projects as initialProjects, inventory as initialInventory, locations, inventoryLocations as initialInventoryLocations, clients as initialClients } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusCircle, Printer, Eye } from "lucide-react";
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
import type { DeliveryNote, InventoryItem, Location as LocationType, InventoryLocation, Client } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { DespatchForm } from "@/components/despatches/despatch-form";

export default function DespatchesPage() {
  const { toast } = useToast();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(initialDeliveryNotes);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>(initialInventoryLocations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);

  const handleAddClick = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleViewClick = (note: DeliveryNote) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handlePrintClick = (noteId: string) => {
    window.open(`/despatches/${noteId}/print`, '_blank');
  };

  const handleSave = (values: any) => {
    if (selectedNote) {
      // Logic for editing (if needed)
    } else {
        const newNote: DeliveryNote = {
            ...values,
            id: `WF-DN-2024-${String(deliveryNotes.length + 1).padStart(4, '0')}`,
            date: new Date().toISOString(),
            status: 'Completado'
        };
      setDeliveryNotes([
        ...deliveryNotes,
        newNote
      ]);

      // Update inventory based on the new despatch note from a specific location
      let updatedInventoryLocations = [...inventoryLocations];
      newNote.items.forEach(itemToDespatch => {
          const stockItem = inventory.find(i => i.id === itemToDespatch.itemId);
          if (!stockItem) return;

          if (stockItem.type === 'composite' && stockItem.components) {
              // Deduct components from the selected location
              stockItem.components.forEach(component => {
                  const componentToDespatchQty = component.quantity * itemToDespatch.quantity;
                  const locIndex = updatedInventoryLocations.findIndex(l => l.locationId === newNote.locationId && l.itemId === component.itemId);
                  if (locIndex > -1) {
                      updatedInventoryLocations[locIndex].quantity -= componentToDespatchQty;
                  }
              });
          } else {
              // Deduct simple item from the selected location
              const locIndex = updatedInventoryLocations.findIndex(l => l.locationId === newNote.locationId && l.itemId === itemToDespatch.itemId);
              if (locIndex > -1) {
                  updatedInventoryLocations[locIndex].quantity -= itemToDespatch.quantity;
              }
          }
      });
      setInventoryLocations(updatedInventoryLocations);

      toast({ title: "Despacho Creado", description: "El albarán de salida se ha generado y el stock ha sido actualizado." });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Despachos a Proyectos</h1>
          <p className="text-muted-foreground">
            Crea albaranes de salida y gestiona el envío de materiales.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Albarán de Salida
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Albarán ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Almacén Origen</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryNotes.map((note) => {
                const project = initialProjects.find(p => p.id === note.projectId);
                const client = initialClients.find(c => c.id === note.clientId);
                const location = locations.find(l => l.id === note.locationId);
                return (
                    <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.id}</TableCell>
                    <TableCell>{client?.name || 'Desconocido'}</TableCell>
                    <TableCell>{project?.name || note.projectId}</TableCell>
                    <TableCell>{location?.name || 'Desconocido'}</TableCell>
                    <TableCell>{new Date(note.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <Badge
                        variant="outline"
                        className={cn(
                            "capitalize",
                            note.status === "Completado" && "bg-green-100 text-green-800 border-green-200",
                            note.status === "Pendiente" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                        )}
                        >
                        {note.status}
                        </Badge>
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
                              <DropdownMenuItem onClick={() => handleViewClick(note)}>
                                <Eye className="mr-2 h-4 w-4"/>
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintClick(note.id)}>
                                <Printer className="mr-2 h-4 w-4"/>
                                Imprimir Albarán
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
            })}
             {deliveryNotes.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No se ha creado ningún despacho.
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
            <DialogTitle>
              {selectedNote ? `Detalles del Albarán ${selectedNote.id}` : "Crear Albarán de Salida"}
            </DialogTitle>
            <DialogDescription>
              {selectedNote
                ? "Visualiza los artículos incluidos en este despacho."
                : "Selecciona un cliente, proyecto, almacén y añade los artículos a enviar."
              }
            </DialogDescription>
          </DialogHeader>
          <DespatchForm
            note={selectedNote}
            clients={initialClients}
            projects={initialProjects}
            inventoryItems={initialInventory}
            locations={locations}
            inventoryLocations={inventoryLocations}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
