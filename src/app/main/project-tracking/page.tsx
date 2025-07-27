
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckSquare } from "lucide-react";

export default function ProjectTrackingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Seguimiento y Control de Proyectos</h1>
        <p className="text-muted-foreground">
          Monitoriza el pulso de tus proyectos, compara el progreso real con el planificado y gestiona las incidencias.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Módulo en Desarrollo</CardTitle>
            <CardDescription>
                Esta sección proporcionará un panel de control detallado para el seguimiento en tiempo real de cada proyecto.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-primary"/>Panel de Control del Proyecto</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Visualización del % de vehículos completados.</li>
                    <li>Gráficos comparativos de consumo de materiales (previsto vs. real).</li>
                    <li>Seguimiento de horas de trabajo (previstas vs. reales).</li>
                    <li>Alertas automáticas sobre desviaciones presupuestarias.</li>
                    <li>Indicadores y métricas de calidad de la instalación.</li>
                </ul>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary"/>Gestión de Incidencias</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Registro centralizado de problemas o imprevistos durante la instalación.</li>
                    <li>Solicitud y aprobación de materiales adicionales no planificados.</li>
                    <li>Documentación de las causas de retrasos.</li>
                    <li>Asignación y seguimiento de acciones correctivas.</li>
                </ul>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
