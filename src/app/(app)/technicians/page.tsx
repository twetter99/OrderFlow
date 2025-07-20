
"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { TechnicianForm } from "@/components/technicians/technician-form";
import type { Technician } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addTechnician, updateTechnician, deleteTechnician, deleteMultipleTechnicians } from "./actions";

export default function TechniciansPage() {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<Technician | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "technicians"), (snapshot) => {
        const techniciansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Technician));
        setTechnicians(techniciansData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching technicians: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los técnicos." });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddClick = () => {
    setSelectedTechnician(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsModalOpen(true);
  };

  const handleDeleteTrigger = (technician: Technician) => {
    setTechnicianToDelete(technician);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setTechnicianToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (values: any) => {
    const result = selectedTechnician 
      ? await updateTechnician(selectedTechnician.id, values) 
      : await addTechnician(values);

    if (result.success) {
      toast({ title: selectedTechnician ? "Técnico actualizado" : "Técnico creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const confirmDelete = async () => {
    let result;
    if (technicianToDelete) {
        result = await deleteTechnician(technicianToDelete.id);
    } else if (selectedRowIds.length > 0) {
        result = await deleteMultipleTechnicians(selectedRowIds);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setTechnicianToDelete(null);
    setSelectedRowIds([]);
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(technicians.map(o => o.id));
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
      return <div>Cargando técnicos...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Técnicos</h1>
          <p className="text-muted-foreground">
            Gestiona el personal técnico de campo y sus tarifas por hora.
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
            Añadir Técnico
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
                    checked={selectedRowIds.length === technicians.length && technicians.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((technician) => (
                <TableRow key={technician.id} data-state={selectedRowIds.includes(technician.id) ? "selected" : ""}>
                   <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(technician.id)}
                      onCheckedChange={() => handleRowSelect(technician.id)}
                      aria-label={`Seleccionar técnico ${technician.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{technician.name}</TableCell>
                  <TableCell>{technician.specialty}</TableCell>
                  <TableCell>{technician.email}</TableCell>
                  <TableCell>{technician.phone}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(technician)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTrigger(technician)}
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
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTechnician ? "Editar Técnico" : "Añadir Nuevo Técnico"}
            </DialogTitle>
            <DialogDescription>
              {selectedTechnician
                ? "Edita la información y tarifas del técnico."
                : "Rellena los detalles para crear un nuevo técnico."}
            </DialogDescription>
          </DialogHeader>
          <TechnicianForm
            technician={selectedTechnician}
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
              {technicianToDelete ? ` el técnico "${technicianToDelete.name}".` : (selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} técnicos seleccionados.` : " el técnico seleccionado.")}
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
