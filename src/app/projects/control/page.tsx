"use client";

import { useEffect, useState } from "react";
import Link from 'next/link'; // ✅ 1. Importar el componente Link
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Project {
  id: string;
  name: string;
  budget?: number;
}

interface PurchaseOrder {
  project: string; 
  total: number;
  status: string;
}

const validStatuses = ["Aprobada", "Enviada al Proveedor", "Recibida", "Recibida Parcialmente"];

const ProjectControlPage = () => {
  const [projectsData, setProjectsData] = useState<{
    id: string; // ✅ 2. Añadir 'id' al estado
    name: string;
    budget: number;
    spent: number;
    available: number;
    progress: number;
    orderCount: number;
  }[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectsQuery = getDocs(collection(db, "projects"));
        const purchaseOrdersQuery = getDocs(collection(db, "purchaseOrders"));

        const [projectsSnapshot, purchaseOrdersSnapshot] = await Promise.all([
          projectsQuery,
          purchaseOrdersQuery,
        ]);

        const projects: Project[] = projectsSnapshot.docs.map(doc => ({ 
          id: doc.id,
          name: doc.data().name || "Proyecto sin nombre",
          budget: doc.data().budget 
        }));

        const purchaseOrders: PurchaseOrder[] = purchaseOrdersSnapshot.docs.map(
          doc => doc.data() as PurchaseOrder
        );

        const projectData = projects.map(project => {
          const ordersForProject = purchaseOrders.filter(
            po => po.project === project.id && validStatuses.includes(po.status)
          );
          
          const spent = ordersForProject.reduce((sum, po) => sum + po.total, 0);
          const budget = project.budget || 0;
          const available = budget - spent;
          const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const orderCount = ordersForProject.length;

          return {
            id: project.id, // ✅ 3. Asegurarse de que el 'id' se incluye en los datos
            name: project.name,
            budget,
            spent,
            available,
            progress,
            orderCount,
          };
        });

        setProjectsData(projectData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return <div className="container mx-auto py-6 text-center">Cargando datos...</div>;
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Control de Proyectos</h1>
      <Card>
        <Table>
          <TableCaption>Control de presupuesto y gastos por proyecto</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead className="text-right">Presupuesto</TableHead>
              <TableHead className="text-right">Gastado</TableHead>
              <TableHead className="text-right">Disponible</TableHead>
              <TableHead className="w-[200px]">Progreso</TableHead>
              <TableHead className="text-center">Nº de Pedidos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron datos de proyectos.
                </TableCell>
              </TableRow>
            ) : (
              projectsData.map(project => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {/* ✅ 4. Convertir el nombre en un enlace */}
                    <Link href={`/projects/control/${project.id}`} className="hover:underline text-blue-600">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(project.budget)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(project.spent)}</TableCell>
                  <TableCell className={`text-right font-medium ${project.available < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(project.available)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={project.progress} 
                        className="flex-1"
                        indicatorClassName={
                           project.progress > 80 ? "bg-red-500" :
                           project.progress > 50 ? "bg-yellow-500" :
                           "bg-green-500"
                        }
                      />
                      <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                        {project.progress.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                      {project.orderCount}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {projectsData.length > 0 && (
        <Card className="mt-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center md:text-left">
            <div>
              <p className="text-sm text-muted-foreground">Total Proyectos</p>
              <p className="text-2xl font-bold">{projectsData.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Presupuesto Total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(projectsData.reduce((sum, p) => sum + p.budget, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gastado</p>
              <p className="text-2xl font-bold">
                {formatCurrency(projectsData.reduce((sum, p) => sum + p.spent, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Disponible</p>
              <p className="text-2xl font-bold">
                {formatCurrency(projectsData.reduce((sum, p) => sum + p.available, 0))}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectControlPage;