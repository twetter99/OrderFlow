
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
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, PlusCircle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "@/components/users/user-form";
import type { User, UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addUser, updateUser } from "@/app/main/users/actions";

export default function SupervisorsPage() {
  const { toast } = useToast();
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Esto es un ejemplo. Cuando los permisos estén implementados, se filtrará por `permissions.includes('purchasing')` o similar.
    // Por ahora, asumimos que todos los usuarios pueden ser supervisores para la demo.
    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setSupervisors(usersData); // Temporalmente, mostramos todos los usuarios.
        setLoading(false);
    }, (error) => {
        console.error("Error fetching supervisors: ", error);
        toast({
          variant: "destructive",
          title: "Error de Carga",
          description: "No se pudieron cargar los supervisores desde Firestore.",
        });
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

  const handleSave = async (values: any) => {
    const result = selectedUser 
      ? await updateUser(selectedUser.id, values) 
      : await addUser(values);

    if (result.success) {
      toast({ title: selectedUser ? "Usuario actualizado" : "Usuario creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  if (loading) {
    return <div>Cargando supervisores...</div>;
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Supervisores y Validadores</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios responsables de la aprobación técnica y financiera de los pedidos.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Supervisor/Validador
        </Button>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Roles de Aprobación</CardTitle>
            <CardDescription>
                Estos roles son conceptuales y se asignan otorgando permisos en el módulo de Usuarios.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
                <Eye className="h-5 w-5 text-primary mt-1"/>
                <div>
                    <h3 className="font-semibold">Supervisor</h3>
                    <p className="text-sm text-muted-foreground">Expertos en material que revisan la idoneidad de los productos en un pedido. Aprueban o rechazan técnicamente la solicitud.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <ShieldCheck className="h-5 w-5 text-primary mt-1"/>
                <div>
                    <h3 className="font-semibold">Validador</h3>
                    <p className="text-sm text-muted-foreground">Responsables financieros que autorizan la compra de un pedido que ya ha sido aprobado técnicamente por un supervisor.</p>
                </div>
            </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
            <CardTitle>Listado de Personal con Permisos de Aprobación</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supervisors.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                   <TableCell>
                    {user.permissions?.includes('purchasing') ? 
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                            Permisos de Compras
                        </Badge>
                        : "N/A"
                    }
                  </TableCell>
                  <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                        Editar
                      </Button>
                    </TableCell>
                </TableRow>
              ))}
               {supervisors.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay usuarios con permisos para supervisar o validar.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Editar Usuario" : "Añadir Nuevo Supervisor/Validador"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Edita la información y el rol del usuario."
                : "Rellena los detalles para crear un nuevo usuario y asignarle un rol."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
