
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
import { deliveryNotes as initialDeliveryNotes, projects, inventory } from "@/lib/data";
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
import type { DeliveryNote } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { DespatchForm } from "@/components/despatches/despatch-form";

export default function DespatchesPage() {
  const { toast } = useToast();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(initialDeliveryNotes);
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

  const handleSave = (values: any) => {
    if (selectedNote) {
      // Logic for editing (if needed)
    } else {
        const newNote = { 
            ...values, 
            id: `DN-2024-${String(deliveryNotes.length + 1).padStart(4, '0')}`, 
            date: new Date().toISOString(),
            status: 'Completado'
        };
      setDeliveryNotes([
        ...deliveryNotes,
        newNote
      ]);
      toast({ title: "Despacho Creado", description: "El albarán de salida se ha generado correctamente." });
      // Here you would also update the inventory state
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
                <TableHead>Proyecto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryNotes.map((note) => {
                const project = projects.find(p => p.id === note.projectId);
                return (
                    <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.id}</TableCell>
                    <TableCell>{project?.name || note.projectId}</TableCell>
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
                        <Button variant="outline" size="sm" onClick={() => handleViewClick(note)}>
                            Ver Detalles
                        </Button>
                        </TableCell>
                    </TableRow>
                )
            })}
             {deliveryNotes.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No se ha creado ningún despacho.
                    </TableCell>
                </TableRow>
             )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedNote ? `Detalles del Albarán ${selectedNote.id}` : "Crear Albarán de Salida"}
            </DialogTitle>
            <DialogDescription>
              {selectedNote 
                ? "Visualiza los artículos incluidos en este despacho."
                : "Selecciona un proyecto y añade los artículos a enviar."
              }
            </DialogDescription>
          </DialogHeader>
          <DespatchForm
            note={selectedNote}
            projects={projects}
            inventoryItems={inventory}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
