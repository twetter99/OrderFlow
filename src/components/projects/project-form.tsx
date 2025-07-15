
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Project, Client, User } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  clientId: z.string().min(1, "El cliente es obligatorio."),
  status: z.enum(["Planificado", "En Progreso", "Completado"]),
  tipo_flota: z.enum(['autobuses', 'camiones', 'furgonetas', 'otros']),
  numero_vehiculos: z.coerce.number().int().min(1, "Debe haber al menos un vehículo."),
  responsable_proyecto_id: z.string().min(1, "Debes asignar un responsable."),
  centro_coste: z.string().min(1, "El centro de coste es obligatorio."),
  
  localizacion_base: z.object({
    direccion: z.string().min(1, "La dirección es obligatoria."),
    ciudad: z.string().min(1, "La ciudad es obligatoria."),
    provincia: z.string().min(1, "La provincia es obligatoria."),
  }),

  startDate: z.date({ required_error: "La fecha de inicio es obligatoria." }),
  endDate: z.date({ required_error: "La fecha de fin es obligatoria." }),
  
  budget: z.coerce.number().positive("El presupuesto debe ser un número positivo."),
  spent: z.coerce.number().nonnegative("El gasto no puede ser negativo."),
  margen_previsto: z.coerce.number().min(0, "El margen no puede ser negativo."),
});

type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  project?: Project | null;
  clients: Client[];
  users: User[];
  onSave: (values: ProjectFormValues) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, clients, users, onSave, onCancel }: ProjectFormProps) {
  const defaultValues = project
    ? {
        ...project,
        startDate: new Date(project.startDate),
        endDate: new Date(project.endDate),
        margen_previsto: project.margen_previsto * 100 // Convert to percentage for display
      }
    : {
        name: "",
        clientId: "",
        status: "Planificado",
        tipo_flota: "autobuses",
        numero_vehiculos: 1,
        responsable_proyecto_id: "",
        centro_coste: "",
        localizacion_base: { direccion: "", ciudad: "", provincia: "" },
        startDate: new Date(),
        endDate: new Date(),
        budget: 0,
        spent: 0,
        margen_previsto: 15,
      };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: ProjectFormValues) {
    onSave({
      ...values,
      margen_previsto: values.margen_previsto / 100 // Convert back to decimal before saving
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Project and Client Info */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Información General</h3>
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre del Proyecto</FormLabel>
                <FormControl>
                    <Input placeholder="p. ej., Actualización Flota A" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un cliente" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="responsable_proyecto_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Responsable del Proyecto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un responsable" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        {/* Fleet and Location Info */}
        <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Flota y Localización</h3>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="tipo_flota"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Flota</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Tipo de flota" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="autobuses">Autobuses</SelectItem>
                                <SelectItem value="camiones">Camiones</SelectItem>
                                <SelectItem value="furgonetas">Furgonetas</SelectItem>
                                <SelectItem value="otros">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="numero_vehiculos"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nº de Vehículos</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="50" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="localizacion_base.direccion"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dirección Base</FormLabel>
                        <FormControl>
                        <Input placeholder="Calle Ficticia, 123" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="localizacion_base.ciudad"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                            <Input placeholder="Madrid" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="localizacion_base.provincia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Provincia</FormLabel>
                            <FormControl>
                            <Input placeholder="Madrid" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        {/* Dates and Status */}
         <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Plazos y Estado</h3>
            <div className="grid grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Inicio Prevista</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? (
                                format(field.value, "PPP", { locale: es })
                                ) : (
                                <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Fin Prevista</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? (
                                format(field.value, "PPP", { locale: es })
                                ) : (
                                <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Planificado">Planificado</SelectItem>
                            <SelectItem value="En Progreso">En Progreso</SelectItem>
                            <SelectItem value="Completado">Completado</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
         </div>
        
        {/* Financial Info */}
         <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Información Financiera</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Presupuesto (€)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="50000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="spent"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gasto (€)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="23000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="margen_previsto"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Margen Previsto (%)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="15" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="centro_coste"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Centro de Coste</FormLabel>
                        <FormControl>
                        <Input placeholder="CC-INST-VEH" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
