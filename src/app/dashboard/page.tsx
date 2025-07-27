
"use client";

import { useState, useEffect } from 'react';
import { inventory, projects, purchaseOrders, inventoryLocations } from "@/lib/data";
import type { Project, PurchaseOrder } from "@/lib/types";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActiveProjectsList } from "@/components/dashboard/active-projects-list";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { Package, FolderKanban, AlertTriangle, BadgeDollarSign } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { convertPurchaseOrderTimestamps } from '@/lib/utils';


export default function DashboardPage() {
    const [stats, setStats] = useState({
        inventoryValue: 0,
        activeProjects: 0,
        lowStockAlerts: 0,
        pendingPOsValue: 0,
    });
    
    const [liveProjects, setLiveProjects] = useState<Project[]>(projects);
    const [livePurchaseOrders, setLivePurchaseOrders] = useState<PurchaseOrder[]>(purchaseOrders);

    useEffect(() => {
        // Correct calculation for inventory value
        const totalInventoryValue = inventory.reduce((acc, item) => {
            if (item.type === 'service') return acc; // Exclude services from value calculation
            const totalStock = inventoryLocations
                .filter(loc => loc.itemId === item.id)
                .reduce((sum, loc) => sum + loc.quantity, 0);
            return acc + (totalStock * (item.unitCost || 0));
        }, 0);

        const activeProjectsCount = projects.filter(p => p.status === 'En Progreso').length;
        const lowStockCount = inventory.filter(item => {
             if (item.type !== 'simple') return false;
             const totalStock = inventoryLocations
                .filter(loc => loc.itemId === item.id)
                .reduce((sum, loc) => sum + loc.quantity, 0);
            return item.minThreshold && totalStock < item.minThreshold;
        }).length;

        const pendingValue = purchaseOrders
            .filter(p => p.status === 'Pendiente de Aprobación')
            .reduce((acc, p) => acc + p.total, 0);

        setStats({
            inventoryValue: totalInventoryValue,
            activeProjects: activeProjectsCount,
            lowStockAlerts: lowStockCount,
            pendingPOsValue: pendingValue,
        });

        // En una app real, aquí irían los listeners de Firestore
        const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
            setLiveProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        });
        
        const unsubPOs = onSnapshot(collection(db, "purchaseOrders"), (snapshot) => {
             const ordersData = snapshot.docs.map(doc => convertPurchaseOrderTimestamps({ id: doc.id, ...doc.data() }));
            setLivePurchaseOrders(ordersData);
        });

        return () => {
            unsubProjects();
            unsubPOs();
        }

    }, []);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline uppercase">Panel de Control</h1>
                    <p className="text-muted-foreground">
                        Una vista general de las operaciones de tu empresa.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                    title="Valor del Inventario"
                    value={formatCurrency(stats.inventoryValue)}
                    icon={Package}
                    description="Valor total de todos los artículos en stock"
                />
                 <StatsCard 
                    title="Proyectos Activos"
                    value={String(stats.activeProjects)}
                    icon={FolderKanban}
                    description="Proyectos actualmente en estado 'En Progreso'"
                />
                 <StatsCard 
                    title="Alertas de Stock Bajo"
                    value={String(stats.lowStockAlerts)}
                    icon={AlertTriangle}
                    isAlert={stats.lowStockAlerts > 0}
                    description="Artículos por debajo del umbral mínimo"
                />
                 <StatsCard 
                    title="Pedidos Pendientes de Aprobación"
                    value={formatCurrency(stats.pendingPOsValue)}
                    icon={BadgeDollarSign}
                    description="Valor total de las órdenes de compra pendientes"
                />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <ActiveProjectsList projects={liveProjects} />
                <RecentOrdersTable purchaseOrders={livePurchaseOrders} />
            </div>
        </div>
    )
}
