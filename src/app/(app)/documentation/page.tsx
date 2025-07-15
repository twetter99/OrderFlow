
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Camera, ShieldCheck, HardHat } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Gestión Documental</h1>
        <p className="text-muted-foreground">
          Centraliza y gestiona todos los documentos asociados a tus proyectos.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Módulo en Desarrollo</CardTitle>
            <CardDescription>
                Esta sección permitirá una gestión documental integral para cada proyecto, asegurando que toda la información esté accesible y organizada.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>Almacén de Documentos</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Subida de documentos mediante "arrastrar y soltar" (contratos, órdenes de trabajo, etc.).</li>
                    <li>Asociación de documentos a proyectos y vehículos específicos.</li>
                    <li>Control de versiones de planos y manuales.</li>
                    <li>Visor de documentos integrado para PDF e imágenes.</li>
                </ul>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><Camera className="h-5 w-5 text-primary"/>Galería Fotográfica</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Organización de fotos por vehículo: Antes, Durante y Después.</li>
                    <li>Carga directa desde dispositivos móviles para facilitar el trabajo en campo.</li>
                    <li>Posibilidad de añadir comentarios y anotaciones en las imágenes.</li>
                </ul>
            </div>
             <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>Generación de Certificados</h3>
                <ul className="list-disc list-inside text-muted-foreground pl-4">
                    <li>Generación automática de certificados de instalación por vehículo.</li>
                    <li>Uso de plantillas personalizables con la marca de la empresa.</li>
                    <li>Portal para que el cliente pueda descargar sus certificados.</li>
                </ul>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
