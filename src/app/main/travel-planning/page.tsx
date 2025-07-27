
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Hotel, Euro } from "lucide-react";

export default function TravelPlanningPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Planificación de Desplazamientos</h1>
        <p className="text-muted-foreground">
          Gestiona los viajes, alojamientos y dietas de tus equipos técnicos.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Módulo en Desarrollo</CardTitle>
            <CardDescription>
                Esta sección centralizará toda la logística de los desplazamientos de los técnicos para cada proyecto.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Plane className="h-5 w-5 text-primary"/>Gestión de Viajes</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Asignación de técnicos a viajes.</li>
                    <li>Planificación de rutas y medios de transporte.</li>
                    <li>Calendario visual de todos los desplazamientos.</li>
                    <li>Integración con mapas para cálculo de rutas y tiempos.</li>
                </ul>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Hotel className="h-5 w-5 text-primary"/>Gestión de Alojamientos</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Registro de reservas de hotel y otros alojamientos.</li>
                    <li>Asignación de técnicos a habitaciones.</li>
                    <li>Control de fechas de check-in y check-out.</li>
                </ul>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Euro className="h-5 w-5 text-primary"/>Presupuesto de Desplazamientos</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Cálculo automático de dietas según convenio.</li>
                    <li>Registro de gastos de transporte, peajes, parking, etc.</li>
                    <li>Resumen de costes de desplazamiento por proyecto.</li>
                </ul>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
