
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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
import { ProjectForm } from "@/components/projects/project-form";
import type { Project, Client, User, Operador, Technician } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { addProject, updateProject, deleteProject, deleteMultipleProjects } from "./actions";

// Helper to convert Firestore Timestamps to string dates
const convertTimestamps = (project: any): Project => {
    return {
      ...project,
      startDate: project.startDate instanceof Timestamp ? project.startDate.toDate().toISOString() : project.startDate,
      endDate: project.endDate instanceof Timestamp ? project.endDate.toDate().toISOString() : project.endDate,
    };
};

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  useEffect(() => {
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projectsData = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      toast({ variant: "destructive", title: "Error de Carga", description: "No se pudieron cargar los proyectos desde Firestore." });
      setLoading(false);
    });

    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsData);
    });
    
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    });

    const unsubOperadores = onSnapshot(collection(db, "operadores"), (snapshot) => {
        const operadoresData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Operador));
        setOperadores(operadoresData);
    });

    const unsubTechnicians = onSnapshot(collection(db, "technicians"), (snapshot) => {
        const techniciansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Technician));
        setTechnicians(techniciansData);
    });
    
    return () => {
      unsubProjects();
      unsubClients();
      unsubUsers();
      unsubOperadores();
      unsubTechnicians();
    }
  }, [toast]);

  const handleAddClick = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteTrigger = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    setProjectToDelete(null); // Ensure single delete is not triggered
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (values: any) => {
    const clientName = clients.find(c => c.id === values.clientId)?.name || 'Desconocido';
    const valuesToSave = { ...values, client: clientName };

    const result = selectedProject 
      ? await updateProject(selectedProject.id, valuesToSave)
      : await addProject(valuesToSave);

    if (result.success) {
      toast({ title: selectedProject ? "Proyecto actualizado" : "Proyecto creado", description: result.message });
      setIsModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const confirmDelete = async () => {
    let result;
    if (projectToDelete) {
        result = await deleteProject(projectToDelete.id);
    } else if (selectedRowIds.length > 0) {
        result = await deleteMultipleProjects(selectedRowIds);
    } else {
        return;
    }

    if (result.success) {
        toast({ variant: "destructive", title: "Eliminación exitosa", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsDeleteDialogOpen(false);
    setProjectToDelete(null);
    setSelectedRowIds([]);
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRowIds(projects.map(p => p.id));
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
    return <div>Cargando proyectos desde Firestore...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona tus proyectos de instalación y sigue su progreso.
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
            Añadir Proyecto
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
                    checked={selectedRowIds.length === projects.length && projects.length > 0 ? true : (selectedRowIds.length > 0 ? 'indeterminate' : false)}
                    onCheckedChange={(checked) => handleSelectAll(checked)}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
                <TableHead>Nombre del Proyecto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Operadores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const progress = (project.budget ?? 0) > 0 && project.spent ? Math.round(
                  (project.spent / project.budget!) * 100
                ) : 0;
                const assignedOperators = project.operador_ids?.map(id => operadores.find(o => o.id === id)?.name).filter(Boolean);
                return (
                  <TableRow key={project.id} data-state={selectedRowIds.includes(project.id) ? "selected" : ""}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRowIds.includes(project.id)}
                        onCheckedChange={() => handleRowSelect(project.id)}
                        aria-label={`Seleccionar proyecto ${project.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{clients.find(c => c.id === project.clientId)?.name || project.client}</TableCell>
                    <TableCell>{assignedOperators?.join(', ') || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          project.status === "En Progreso" &&
                            "bg-blue-100 text-blue-800 border-blue-200",
                          project.status === "Planificado" &&
                            "bg-gray-100 text-gray-800 border-gray-200",
                          project.status === "Completado" &&
                            "bg-green-100 text-green-800 border-green-200",
                          "capitalize"
                        )}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-32" />
                        <span className="text-sm text-muted-foreground">
                          {progress}%
                        </span>
                      </div>
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
                          <DropdownMenuItem onClick={() => handleEditClick(project)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTrigger(project)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Editar Proyecto" : "Añadir Nuevo Proyecto"}
            </DialogTitle>
            <DialogDescription>
              {selectedProject
                ? "Edita la información del proyecto."
                : "Rellena los detalles para crear un nuevo proyecto."}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            project={selectedProject}
            clients={clients}
            users={users}
            operadores={operadores}
            technicians={technicians}
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
              {projectToDelete ? ` el proyecto "${projectToDelete.name}".` : (selectedRowIds.length > 1 ? ` los ${selectedRowIds.length} proyectos seleccionados.` : " el proyecto seleccionado.")}
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
  );
}
