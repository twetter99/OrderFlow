
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Users, Package } from "lucide-react";

export default function ResourcePlanningPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Planificación de Recursos</h1>
        <p className="text-muted-foreground">
          Asigna técnicos y gestiona los materiales necesarios para tus proyectos.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Módulo en Desarrollo</CardTitle>
            <CardDescription>
                Esta sección centralizará la gestión de recursos humanos y materiales para cada proyecto.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>Gestión de Técnicos</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Asignación de técnicos a proyectos.</li>
                    <li>Calendario de disponibilidad y carga de trabajo.</li>
                    <li>Gestión de especialidades y certificaciones.</li>
                </ul>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-primary"/>Gestión de Materiales</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Vista consolidada de todos los materiales necesarios por proyecto.</li>
                    <li>Control de stock disponible frente a la demanda del proyecto.</li>
                    <li>Generación de solicitudes de compra para cubrir déficits.</li>
                    <li>Planificación de entregas de material.</li>
                </ul>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
