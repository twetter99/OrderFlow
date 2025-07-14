
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCostReport } from "@/components/reports/project-cost-report";
import { InventoryAnalysisReport } from "@/components/reports/inventory-analysis-report";
import { SupplierPerformanceReport } from "@/components/reports/supplier-performance-report";
import { PurchaseOrderHistoryReport } from "@/components/reports/purchase-order-history-report";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Reportes</h1>
        <p className="text-muted-foreground">
          Analiza el rendimiento y los datos clave de tu operación.
        </p>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">Costos de Proyectos</TabsTrigger>
          <TabsTrigger value="inventory">Análisis de Inventario</TabsTrigger>
          <TabsTrigger value="suppliers">Rendimiento de Proveedores</TabsTrigger>
          <TabsTrigger value="purchase-orders">Historial de Compras</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <ProjectCostReport />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryAnalysisReport />
        </TabsContent>
        <TabsContent value="suppliers">
          <SupplierPerformanceReport />
        </TabsContent>
        <TabsContent value="purchase-orders">
            <PurchaseOrderHistoryReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
