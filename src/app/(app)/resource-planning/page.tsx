
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Users, Package, Calendar, GanttChartSquare, PackagePlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projects, replanteos, inventory, inventoryLocations, installationTemplates } from '@/lib/data';
import type { InventoryItem, ReplanteoMaterial } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MaterialNeed = {
  item: InventoryItem;
  needed: number;
  available: number;
  balance: number;
};

export default function ResourcePlanningPage() {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const materialNeeds = useMemo((): MaterialNeed[] => {
    if (!selectedProjectId) return [];

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return [];

    const projectReplanteos = replanteos.filter(r => r.proyecto_id === selectedProjectId);

    let requiredMaterials: Map<string, number> = new Map();

    if (projectReplanteos.length > 0) {
      // Usar datos de replanteos si existen
      projectReplanteos.forEach(replan => {
        replan.materiales.forEach(mat => {
          requiredMaterials.set(mat.material_id, (requiredMaterials.get(mat.material_id) || 0) + mat.cantidad_prevista);
        });
      });
    } else {
      // Usar plantilla base si no hay replanteos
      const template = installationTemplates.find(t => t.id === "TPL-001"); // Asumiendo una plantilla por defecto si no está en el proyecto
      if (template) {
        template.materiales.forEach(mat => {
          requiredMaterials.set(mat.material_id, (requiredMaterials.get(mat.material_id) || 0) + (mat.cantidad_estandar * project.numero_vehiculos));
        });
      }
    }

    const needs: MaterialNeed[] = [];
    requiredMaterials.forEach((quantity, itemId) => {
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            const available = inventoryLocations
                .filter(l => l.itemId === itemId)
                .reduce((sum, loc) => sum + loc.quantity, 0);
            
            needs.push({
                item,
                needed: quantity,
                available,
                balance: available - quantity,
            });
        }
    });

    return needs;

  }, [selectedProjectId]);
  
  const deficitItems = useMemo(() => {
    return materialNeeds.filter(n => n.balance < 0);
  }, [materialNeeds]);

  const handleGeneratePO = () => {
    const itemsToOrder = deficitItems.map(n => ({
        itemName: n.item.name,
        quantity: Math.abs(n.balance),
        price: n.item.unitCost,
        unit: n.item.unit,
        type: 'Material',
    }));
    
    // Suponemos que los artículos con déficit tienen el mismo proveedor para simplificar.
    // En una app real, habría que agrupar por proveedor.
    const supplier = deficitItems.length > 0 ? deficitItems[0].item.supplier : '';

    const query = new URLSearchParams({
        project: selectedProjectId || '',
        supplier: supplier,
        items: JSON.stringify(itemsToOrder),
    });

    router.push(`/purchasing?${query.toString()}`);
  }

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
          <Select onValueChange={setSelectedProjectId}>
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
      
      {selectedProjectId && (
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
                    <CardDescription>Consulta las necesidades de material y planifica las entregas. Los cálculos se basan en los informes de replanteo; si no existen, se usa la plantilla base.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {materialNeeds.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Artículo</TableHead>
                                        <TableHead className="text-right">Necesario</TableHead>
                                        <TableHead className="text-right">Disponible</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {materialNeeds.map(need => (
                                        <TableRow key={need.item.id}>
                                            <TableCell className="font-medium">{need.item.name}</TableCell>
                                            <TableCell className="text-right">{need.needed}</TableCell>
                                            <TableCell className="text-right">{need.available}</TableCell>
                                            <TableCell className={cn(
                                                "text-right font-bold",
                                                need.balance < 0 ? 'text-destructive' : 'text-green-600'
                                            )}>{need.balance}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {deficitItems.length > 0 && (
                                <Button onClick={handleGeneratePO} className="w-full">
                                    <PackagePlus className="mr-2" />
                                    Generar Pedido de Compra para {deficitItems.length} artículo(s)
                                </Button>
                            )}
                        </>
                     ) : (
                        <div className="p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <GanttChartSquare className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="font-semibold">Sin Necesidades de Material</h3>
                            <p className="text-sm">Este proyecto no tiene materiales asignados o el stock actual es suficiente.</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
