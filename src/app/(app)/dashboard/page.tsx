import { StatsCard } from "@/components/dashboard/stats-card";
import { ExpensesChart } from "@/components/dashboard/expenses-chart";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { ActiveProjectsList } from "@/components/dashboard/active-projects-list";
import { DollarSign, Package, FolderKanban, AlertTriangle } from "lucide-react";
import { purchaseOrders } from "@/lib/data";

export default function DashboardPage() {
    const pendingApprovals = purchaseOrders.filter(po => po.status === 'Pendiente').length;

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
          title="Gasto Total (Mes)"
          value="42.350 €"
          icon={DollarSign}
          description="+15.2% desde el mes pasado"
        />
        <StatsCard 
          title="Proyectos Activos"
          value="3"
          icon={FolderKanban}
          description="1 nuevo proyecto esta semana"
        />
        <StatsCard 
          title="Aprobaciones Pendientes"
          value={pendingApprovals.toString()}
          icon={Package}
          description="Necesita tu revisión"
          isAlert={pendingApprovals > 0}
        />
        <StatsCard 
          title="Artículos con Stock Bajo"
          value="2"
          icon={AlertTriangle}
          description="Acción requerida"
          isAlert
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
            <ExpensesChart />
        </div>
        <div className="lg:col-span-2">
            <ActiveProjectsList />
        </div>
      </div>
      <div>
        <RecentOrdersTable />
      </div>
    </div>
  );
}
