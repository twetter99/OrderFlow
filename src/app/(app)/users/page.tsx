
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
import { Button } from "@/components/ui/button";
import { users as initialUsers } from "@/lib/data";
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

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (values: any) => {
    if (selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, ...values, id: u.id } : u
        )
      );
      toast({ title: "Usuario actualizado", description: "El usuario se ha actualizado correctamente." });
    } else {
      setUsers([
        ...users,
        { ...values, id: `WF-USER-${String(users.length + 1).padStart(3, '0')}` },
      ]);
      toast({ title: "Usuario creado", description: "El nuevo usuario se ha creado correctamente." });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedRowIds.length > 0) {
        setUsers(users.filter((u) => !selectedRowIds.includes(u.id)));
        toast({ variant: "destructive", title: "Usuarios eliminados", description: `${selectedRowIds.length} usuarios han sido eliminados.` });
        setSelectedRowIds([]);
    } else if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      toast({ variant: "destructive", title: "Usuario eliminado", description: "El usuario se ha eliminado correctamente." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(users.map(u => u.id));
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
          <h1 className="text-3xl font-bold font-headline">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los roles y permisos de los usuarios.
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
            Añadir Usuario
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
                    checked={selectedRowIds.length === users.length && users.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
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
                        user.role === "Administrador" && "bg-primary/10 text-primary border-primary/20",
                        user.role === "Empleado" && "bg-blue-100 text-blue-800 border-blue-200",
                        user.role === "Almacén" && "bg-yellow-100 text-yellow-800 border-yellow-200"
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
                            onClick={() => handleDeleteClick(user)}
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
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Editar Usuario" : "Añadir Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Edita la información del usuario."
                : "Rellena los detalles para crear un nuevo usuario."}
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
              {selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} usuarios seleccionados.` : " el usuario."}
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
