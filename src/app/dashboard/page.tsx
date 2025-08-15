
"use client";

import { useMemo } from 'react';
import { useData } from "@/context/data-context";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActiveProjectsList } from "@/components/dashboard/active-projects-list";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { Package, FolderKanban, AlertTriangle, BadgeDollarSign, Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { 
        projects: liveProjects, 
        purchaseOrders: livePurchaseOrders, 
        inventory: liveInventory, 
        inventoryLocations: liveInventoryLocations,
        loading 
    } = useData();

    const stats = useMemo(() => {
        if (loading) return {
            inventoryValue: 0,
            activeProjects: 0,
            lowStockAlerts: 0,
            pendingPOsValue: 0,
        };

        const totalInventoryValue = liveInventory.reduce((acc, item) => {
            if (item.type === 'service') return acc;
            const totalStock = liveInventoryLocations
                .filter(loc => loc.itemId === item.id)
                .reduce((sum, loc) => sum + loc.quantity, 0);
            return acc + (totalStock * (item.unitCost || 0));
        }, 0);

        const activeProjectsCount = liveProjects.filter(p => p.status === 'En Progreso').length;
        
        const lowStockCount = liveInventory.filter(item => {
             if (item.type !== 'simple') return false;
             const totalStock = liveInventoryLocations
                .filter(loc => loc.itemId === item.id)
                .reduce((sum, loc) => sum + loc.quantity, 0);
            return item.minThreshold && totalStock < item.minThreshold;
        }).length;

        const pendingValue = livePurchaseOrders
            .filter(p => p.status === 'Pendiente de Aprobación')
            .reduce((acc, p) => acc + p.total, 0);

        return {
            inventoryValue: totalInventoryValue,
            activeProjects: activeProjectsCount,
            lowStockAlerts: lowStockCount,
            pendingPOsValue: pendingValue,
        };
    }, [liveProjects, livePurchaseOrders, liveInventory, liveInventoryLocations, loading]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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
