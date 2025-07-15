
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Users, Package, Calendar, GanttChartSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projects } from '@/lib/data';

export default function ResourcePlanningPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Planificación de Recursos</h1>
        <p className="text-muted-foreground">
          Asigna técnicos y gestiona los materiales necesarios para tus proyectos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selector de Proyecto</CardTitle>
          <CardDescription>
            Elige un proyecto para ver y gestionar sus recursos asignados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedProject}>
            <SelectTrigger className="md:w-1/3">
              <SelectValue placeholder="Selecciona un proyecto..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedProject && (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>Gestión de Técnicos</CardTitle>
                    <CardDescription>Asigna técnicos y visualiza la carga de trabajo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <Calendar className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="font-semibold">Calendario de Disponibilidad</h3>
                        <p className="text-sm">Próximamente: Un calendario visual para asignar técnicos y ver su disponibilidad y carga de trabajo.</p>
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="h-6 w-6 text-primary"/>Gestión de Materiales</CardTitle>
                    <CardDescription>Consulta las necesidades de material y planifica las entregas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <GanttChartSquare className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="font-semibold">Planificación de Materiales</h3>
                        <p className="text-sm">Próximamente: Una vista consolidada del material requerido, stock disponible y planificación de entregas.</p>
                     </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
