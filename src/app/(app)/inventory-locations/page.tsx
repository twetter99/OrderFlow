
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InventoryLocationsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Ubicaciones de Inventario</h1>
          <p className="text-muted-foreground">
            Consulta el stock disponible en cada almacén.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Selecciona un Almacén</CardTitle>
          <CardDescription>
            Para ver el inventario detallado de una ubicación específica, ve a la sección de "Almacenes" y selecciona "Ver Inventario" para el almacén deseado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/locations')}>
            Ir a Almacenes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
