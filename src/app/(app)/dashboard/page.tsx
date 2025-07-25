

"use client";

import React, { useState, useEffect } from 'react';
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { ActiveProjectsList } from "@/components/dashboard/active-projects-list";
import { DollarSign, Package, FolderKanban, AlertTriangle } from "lucide-react";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { PurchaseOrder, InventoryItem, Project, InventoryLocation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

const convertPurchaseOrderTimestamps = (order: any): PurchaseOrder => {
    return {
      ...order,
      id: order.id,
      date: order.date instanceof Timestamp ? order.date.toDate().toISOString() : order.date,
      estimatedDeliveryDate: order.estimatedDeliveryDate instanceof Timestamp ? order.estimatedDeliveryDate.toDate().toISOString() : order.estimatedDeliveryDate,
      statusHistory: (order.statusHistory || []).map((h: any) => ({
            ...h,
            date: h.date instanceof Timestamp ? h.date.toDate().toISOString() : h.date
      }))
    };
};

export default function DashboardPage() {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubPO = onSnapshot(collection(db, "purchaseOrders"), (snapshot) => {
            const ordersData = snapshot.docs.map(doc => convertPurchaseOrderTimestamps({ id: doc.id, ...doc.data() }));
            setPurchaseOrders(ordersData);
        });

        const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
            setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
        });
        
        const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        });

        const unsubInvLocations = onSnapshot(collection(db, "inventoryLocations"), (snapshot) => {
            setInventoryLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryLocation)));
            // Set loading to false after the last listener is attached and has likely fired once
            setLoading(false);
        });

        return () => {
            unsubPO();
            unsubInventory();
            unsubProjects();
            unsubInvLocations();
        };
    }, []);

    const pendingApprovals = purchaseOrders.filter(po => po.status === 'Pendiente de Aprobación').length;

    const totalInventoryValue = inventory.reduce((acc, item) => {
        if (item.type === 'simple') {
            const totalQuantity = inventoryLocations
                .filter(loc => loc.itemId === item.id)
                .reduce((sum, loc) => sum + loc.quantity, 0);
            return acc + (totalQuantity * item.unitCost);
        }
        return acc;
    }, 0);

    const activeProjectsCount = projects.filter(p => p.status === 'En Progreso').length;

    if (loading) {
      return <DashboardSkeleton />;
    }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline uppercase">Panel de Control</h1>
        <p className="text-muted-foreground">
          ¡Bienvenido de nuevo! Aquí tienes un resumen de tus operaciones.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="Valor de Inventario"
          value={new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalInventoryValue)}
          icon={DollarSign}
          description="Valor total de los artículos en stock"
        />
        <StatsCard 
          title="Proyectos Activos"
          value={activeProjectsCount.toString()}
          icon={FolderKanban}
          description="Proyectos actualmente en marcha"
        />
        <StatsCard 
          title="Aprobaciones Pendientes"
          value={pendingApprovals.toString()}
          icon={Package}
          description="Necesitan tu revisión"
          isAlert={pendingApprovals > 0}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ActiveProjectsList projects={projects}/>
        <RecentOrdersTable purchaseOrders={purchaseOrders}/>
      </div>
    </div>
  );
}

    