"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDigit } from "lucide-react";

export default function SupplierInvoicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline uppercase">Facturas de Proveedor</h1>
          <p className="text-muted-foreground">
            Gestiona y valida las facturas recibidas de tus proveedores.
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Módulo en Construcción</CardTitle>
          <CardDescription>
            Esta sección para gestionar las facturas de proveedores estará disponible próximamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
          <FileDigit className="h-16 w-16 mb-4" />
          <p>La funcionalidad para la gestión de facturas está siendo desarrollada.</p>
        </CardContent>
      </Card>
    </div>
  );
}
