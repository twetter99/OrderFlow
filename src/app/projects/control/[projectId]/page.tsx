"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectDetails {
  id: string;
  name: string;
  budget?: number;
}

interface PurchaseOrder {
  id: string;
  supplier?: string;
  total: number;
  status: string;
  date: Timestamp | string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

const safeFormatDate = (dateInput: any): string => {
  if (!dateInput) return 'N/D';
  if (typeof dateInput.toDate === 'function') {
    return dateInput.toDate().toLocaleDateString('es-ES');
  }
  const date = new Date(dateInput);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('es-ES');
  }
  return 'Fecha inválida';
};

export default function ProjectDetailPage() { 
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const fetchProjectDetails = async () => {
      try {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          setProject({ id: projectSnap.id, ...projectSnap.data() } as ProjectDetails);
        } else {
          console.error("No se encontró el proyecto.");
        }

        const ordersQuery = query(
          collection(db, "purchaseOrders"),
          where("project", "==", projectId)
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PurchaseOrder));
        setOrders(ordersData);

      } catch (error) {
        console.error("Error al obtener los detalles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Cargando detalles del proyecto...</div>;
  }

  if (!project) {
    return <div className="container mx-auto py-10 text-center">Proyecto no encontrado.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        &larr; Volver a Proyectos
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Proyecto: {project.name}</CardTitle>
          <CardDescription>
            Aquí se listan todas las órdenes de compra asociadas a este proyecto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            {/* ✅ SECCIÓN CORREGIDA PARA EVITAR ERROR DE HIDRATACIÓN */}
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.supplier || 'N/D'}</TableCell>
                  <TableCell>{safeFormatDate(order.date)}</TableCell>
                  <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(order.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/orders/${order.id}`}>Ver Detalle</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No se encontraron órdenes de compra para este proyecto.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}