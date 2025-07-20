
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { OperadorForm } from "@/components/operadores/operador-form";
import type { Operador } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addOperador, updateOperador, deleteOperador, deleteMultipleOperadores } from "./actions";

export default function OperadoresPage() {
  const { toast } = useToast();
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [operadorToDelete, setOperadorToDelete] = useState<Operador | null>(null);
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "operadores"), (snapshot) => {
        const operadoresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Operador));
        setOperadores(operadoresData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching operadores: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los operadores." });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddClick = () => {
    setSelectedOperador(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (operador: Operador) => {
    setSelectedOperador(operador);
    setIsModalOpen(true);
  };

  const handleDeleteTrigger = (operador: Operador) => {
    setOperadorToDelete(operador);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setOperadorToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (values: any) => {
    const result = selectedOperador 
      ? await updateOperador(selectedOperador.id, values) 
      : await addOperador(values);

    if (result.success) {
      toast({ title: selectedOperador ? "Operador actualizado" : "Operador creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const confirmDelete = async () => {
    let result;
    if (operadorToDelete) {
        result = await deleteOperador(operadorToDelete.id);
    } else if (selectedRowIds.length > 0) {
        result = await deleteMultipleOperadores(selectedRowIds);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setOperadorToDelete(null);
    setSelectedRowIds([]);
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(operadores.map(o => o.id));
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
      return <div>Cargando operadores desde Firestore...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Operadores (Flotas)</h1>
          <p className="text-muted-foreground">
            Gestiona los operadores de flotas de vehículos.
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
            Añadir Operador
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Listado de Operadores</CardTitle>
            <CardDescription>Entidades propietarias de las flotas de vehículos.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead padding="checkbox" className="w-[50px]">
                  <Checkbox
                    checked={selectedRowIds.length === operadores.length && operadores.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Código/CIF</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operadores.map((operador) => (
                <TableRow key={operador.id} data-state={selectedRowIds.includes(operador.id) ? "selected" : ""}>
                   <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(operador.id)}
                      onCheckedChange={() => handleRowSelect(operador.id)}
                      aria-label={`Seleccionar operador ${operador.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{operador.name}</TableCell>
                  <TableCell>{operador.cif}</TableCell>
                  <TableCell>{operador.email}</TableCell>
                  <TableCell>{operador.phone}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditClick(operador)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTrigger(operador)}
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
              {selectedOperador ? "Editar Operador" : "Añadir Nuevo Operador"}
            </DialogTitle>
            <DialogDescription>
              {selectedOperador
                ? "Edita la información del operador."
                : "Rellena los detalles para crear un nuevo operador."}
            </DialogDescription>
          </DialogHeader>
          <OperadorForm
            operador={selectedOperador}
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
              {operadorToDelete ? ` el operador "${operadorToDelete.name}".` : (selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} operadores seleccionados.` : " el operador seleccionado.")}
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
