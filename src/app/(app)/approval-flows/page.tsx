

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Eye, ShieldCheck, UserPlus } from "lucide-react";

export default function ApprovalFlowsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Flujos de Aprobación de Pedidos</h1>
        <p className="text-muted-foreground">
          Define y gestiona los roles y permisos del flujo de aprobación de compras.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Roles del Sistema de Aprobación</CardTitle>
            <CardDescription>
                Cada usuario asignado a un rol tiene permisos específicos para garantizar la integridad del proceso de compra.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary"/>Solicitante</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Crear nuevos pedidos de compra.</li>
                    <li>Consultar y visualizar el estado de los pedidos que ha creado.</li>
                    <li>Enviar mensajes o notas asociadas a sus pedidos.</li>
                    <li>Lanzar el pedido al siguiente responsable del flujo de trabajo (Supervisor).</li>
                </ul>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Eye className="h-5 w-5 text-primary"/>Supervisor</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Ver los pedidos que le han sido asignados para su revisión.</li>
                    <li>Aprobar o rechazar los pedidos.</li>
                    <li>Añadir comentarios, observaciones o motivos de rechazo.</li>
                </ul>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>Validador</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Ver únicamente los pedidos que ya han sido aprobados por un Supervisor.</li>
                    <li>Dar la autorización final o rechazar la compra.</li>
                    <li>Añadir comentarios finales que cerrarán el ciclo de aprobación.</li>
                </ul>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
