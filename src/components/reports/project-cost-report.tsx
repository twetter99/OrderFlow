
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projects } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
  
export function ProjectCostReport() {

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    const projectsWithVariance = projects.map(p => {
        const variance = p.budget - p.spent;
        const progress = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
        return { ...p, variance, progress };
    });

    return (
      <Card>
        <CardHeader>
            <CardTitle>Informe de Costos de Proyectos</CardTitle>
            <CardDescription>Análisis del presupuesto frente al gasto real de cada proyecto.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead className="text-right">Presupuesto</TableHead>
                <TableHead className="text-right">Gasto Real</TableHead>
                <TableHead className="text-right">Desviación</TableHead>
                <TableHead>Progreso del Gasto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectsWithVariance.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(project.budget)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(project.spent)}</TableCell>
                  <TableCell className={cn(
                      "text-right font-semibold",
                      project.variance >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(project.variance)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="w-32" />
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
}
