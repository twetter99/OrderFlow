
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { installationTemplates as initialTemplates } from "@/lib/data";
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
import { useToast } from "@/hooks/use-toast";
import type { PlantillaInstalacion } from "@/lib/types";
import { TemplateForm } from "@/components/installation-templates/template-form";
import { inventory, users } from "@/lib/data";

export default function InstallationTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PlantillaInstalacion[]>(initialTemplates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PlantillaInstalacion | null>(null);

  const handleAddClick = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (template: PlantillaInstalacion) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (template: PlantillaInstalacion) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (values: any) => {
    if (selectedTemplate) {
      // Logic for editing (potentially creating a new version)
      setTemplates(templates.map(t => (t.id === selectedTemplate.id ? { ...t, ...values } : t)));
      toast({ title: "Plantilla actualizada", description: "La plantilla se ha actualizado correctamente." });
    } else {
      const newTemplate = {
        ...values,
        id: `TPL-${String(templates.length + 1).padStart(3, '0')}`,
        version: 1,
        fecha_creacion: new Date().toISOString(),
      };
      setTemplates([...templates, newTemplate]);
      toast({ title: "Plantilla creada", description: "La nueva plantilla de instalación se ha creado correctamente." });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedTemplate) {
      setTemplates(templates.filter(t => t.id !== selectedTemplate.id));
      toast({ variant: "destructive", title: "Plantilla eliminada", description: "La plantilla se ha eliminado correctamente." });
    }
    setIsDeleteDialogOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Plantillas de Instalación</h1>
          <p className="text-muted-foreground">
            Gestiona las plantillas estándar para las instalaciones en vehículos.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Plantilla
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo Vehículo</TableHead>
                <TableHead>Horas Estimadas</TableHead>
                <TableHead>Técnicos Req.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Versión</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.nombre}</TableCell>
                  <TableCell className="capitalize">{template.tipo_vehiculo}</TableCell>
                  <TableCell>{template.tiempo_estimado_horas}h</TableCell>
                  <TableCell>{template.num_tecnicos_requeridos}</TableCell>
                  <TableCell>
                    <Badge variant={template.activa ? "default" : "secondary"}>
                      {template.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>v{template.version}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditClick(template)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(template)}
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
              {selectedTemplate ? "Editar Plantilla" : "Crear Nueva Plantilla"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? "Edita los detalles de la plantilla de instalación."
                : "Rellena los detalles para crear una nueva plantilla."}
            </DialogDescription>
          </DialogHeader>
          <TemplateForm
            template={selectedTemplate}
            inventoryItems={inventory}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la plantilla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
