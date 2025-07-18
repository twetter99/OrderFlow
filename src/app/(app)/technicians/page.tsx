
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
import { UserForm } from "@/components/users/user-form";
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addUser, updateUser, deleteUser, deleteMultipleUsers } from "../users/actions";

export default function TechniciansPage() {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Query for users that are NOT administrators
    const q = query(collection(db, "users"), where("role", "!=", "Administrador"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const techsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setTechnicians(techsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching technicians: ", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los técnicos." });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteTrigger = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setUserToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (values: any) => {
    const result = selectedUser 
      ? await updateUser(selectedUser.id, values) 
      : await addUser(values);

    if (result.success) {
      toast({ title: selectedUser ? "Técnico actualizado" : "Técnico creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const confirmDelete = async () => {
    let result;
    if (userToDelete) {
        result = await deleteUser(userToDelete.id);
    } else if (selectedRowIds.length > 0) {
        result = await deleteMultipleUsers(selectedRowIds);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
    setSelectedRowIds([]);
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(technicians.map(u => u.id));
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
    return <div>Cargando técnicos desde Firestore...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Técnicos</h1>
          <p className="text-muted-foreground">
            Gestiona el personal técnico y de almacén de la empresa.
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
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((user) => (
                <TableRow key={user.id} data-state={selectedRowIds.includes(user.id) ? "selected" : ""}>
                   <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRowIds.includes(user.id)}
                      onCheckedChange={() => handleRowSelect(user.id)}
                      aria-label={`Seleccionar usuario ${user.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                   <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                         user.role.includes('Jefe') && "bg-purple-100 text-purple-800 border-purple-200",
                         user.role.includes('Instalador') && "bg-blue-100 text-blue-800 border-blue-200",
                         user.role.includes('Almacén') && "bg-yellow-100 text-yellow-800 border-yellow-200",
                      )}
                    >
                      {user.role}
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
                          <DropdownMenuItem onClick={() => handleEditClick(user)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTrigger(user)}
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
              {selectedUser ? "Editar Técnico" : "Añadir Nuevo Técnico"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Edita la información del técnico."
                : "Rellena los detalles para crear un nuevo técnico."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
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
              {userToDelete ? ` el técnico "${userToDelete.name}".` : (selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} técnicos seleccionados.` : " el técnico seleccionado.")}
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
