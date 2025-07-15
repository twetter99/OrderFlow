import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { ActiveProjectsList } from "@/components/dashboard/active-projects-list";
import { DollarSign, Package, FolderKanban, AlertTriangle } from "lucide-react";
import { purchaseOrders, inventory, projects } from "@/lib/data";

export default function DashboardPage() {
    const pendingApprovals = purchaseOrders.filter(po => po.status === 'Pendiente').length;
    const lowStockItems = inventory.filter(item => {
        if (item.type === 'composite') {
            const buildableQuantity = Math.min(
                ...(item.components?.map(c => {
                    const componentItem = inventory.find(i => i.id === c.itemId);
                    return componentItem ? Math.floor(componentItem.quantity / c.quantity) : 0;
                }) || [0])
            );
            return buildableQuantity < item.minThreshold;
        }
        return item.quantity < item.minThreshold;
    }).length;
    const totalInventoryValue = inventory.reduce((acc, item) => {
        if (item.type === 'simple') {
            return acc + (item.quantity * item.unitCost)
        }
        return acc;
    }, 0);
    const activeProjectsCount = projects.filter(p => p.status === 'En Progreso').length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Panel de Control</h1>
        <p className="text-muted-foreground">
          ¡Bienvenido de nuevo! Aquí tienes un resumen de tus operaciones.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <StatsCard 
          title="Artículos con Stock Bajo"
          value={lowStockItems.toString()}
          icon={AlertTriangle}
          description="Acción requerida"
          isAlert={lowStockItems > 0}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ActiveProjectsList />
        <RecentOrdersTable />
      </div>
    </div>
  );
}
