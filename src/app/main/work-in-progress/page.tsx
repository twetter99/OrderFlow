
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat } from "lucide-react";

export default function WorkInProgressPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Módulo en Desarrollo</h1>
        <p className="text-muted-foreground">
          Esta funcionalidad está siendo construida y estará disponible próximamente.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <HardHat className="h-6 w-6 text-primary" />
                ¡Estamos en ello!
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p>
                Gracias por tu interés en esta sección. Nuestro equipo está trabajando activamente para desarrollar esta funcionalidad y ofrecerte la mejor experiencia.
            </p>
            <p className="mt-4 text-muted-foreground">
                Vuelve a consultar pronto para ver las actualizaciones.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
