
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { replanteos as initialReplanteos } from "@/lib/data";
import type { Replanteo, Technician } from "@/lib/types";
import { ReplanCard } from "@/components/replan/replan-card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReplanForm } from "@/components/replan/replan-form";
import { projects, installationTemplates, technicians, inventory } from "@/lib/data";


export default function ReplanPage() {
  const { toast } = useToast();
  const [replanteos, setReplanteos] = useState<Replanteo[]>(initialReplanteos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReplan, setSelectedReplan] = useState<Replanteo | null>(null);

  const handleAddClick = () => {
    setSelectedReplan(null);
    setIsModalOpen(true);
  };
  
  const handleEditClick = (replan: Replanteo) => {
    setSelectedReplan(replan);
    setIsModalOpen(true);
  };

  const handleSave = (values: any) => {
    if (selectedReplan) {
      setReplanteos(replanteos.map(r => r.id === selectedReplan.id ? { ...r, ...values } : r));
      toast({ title: "Informe actualizado", description: "El informe de replanteo ha sido actualizado." });
    } else {
      const newReplan = {
        ...values,
        id: `RE-${String(replanteos.length + 1).padStart(3, '0')}`,
      };
      setReplanteos([newReplan, ...replanteos]);
      toast({ title: "Informe creado", description: "El nuevo informe de replanteo se ha creado correctamente." });
    }
    setIsModalOpen(false);
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Informes de Replanteo</h1>
          <p className="text-muted-foreground">
            Gestiona los informes de replanteo para cada vehículo de un proyecto.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Informe
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {replanteos.map(replan => (
            <ReplanCard key={replan.id} replan={replan} onEdit={handleEditClick} />
        ))}
         {replanteos.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-16">
                No hay informes de replanteo creados.
            </div>
         )}
      </div>

       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedReplan ? "Editar Informe de Replanteo" : "Crear Nuevo Informe"}
            </DialogTitle>
            <DialogDescription>
              {selectedReplan
                ? "Edita los detalles del informe de replanteo."
                : "Rellena los detalles para crear un nuevo informe."}
            </DialogDescription>
          </DialogHeader>
          <ReplanForm
            replan={selectedReplan}
            projects={projects}
            templates={installationTemplates}
            technicians={technicians}
            inventoryItems={inventory}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
