
"use client";

import React from 'react';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Operador, OperadorRates } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


const rateSchema = z.object({
  rateWorkHour: z.coerce.number().min(0, "La tarifa debe ser positiva").optional(),
  rateTravelHour: z.coerce.number().min(0, "La tarifa debe ser positiva").optional(),
  rateOvertimeWeekdayDay: z.coerce.number().min(0, "La tarifa debe ser positiva").optional(),
  rateOvertimeWeekdayNight: z.coerce.number().min(0, "La tarifa debe ser positiva").optional(),
  rateOvertimeWeekendDay: z.coerce.number().min(0, "La tarifa debe ser positiva").optional(),
  rateOvertimeWeekendNight: z.coerce.number().min(0, "La tarifa debe ser positiva").optional(),
  rateNotes: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  cif: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Debe ser un correo electrónico válido.").optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  rates: rateSchema.optional(),
});

type OperadorFormValues = z.infer<typeof formSchema>;

interface OperadorFormProps {
  operador?: Operador | null;
  onSave: (values: OperadorFormValues) => void;
  onCancel: () => void;
}


function CurrencyInput({
  field,
  label,
  tooltipText,
}: {
  field: any;
  label: string;
  tooltipText: string;
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState('');

  const formatCurrency = (value: number | string) => {
    const num = Number(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };
  
  React.useEffect(() => {
    if (!isFocused) {
        setDisplayValue(field.value === 0 || field.value === undefined ? '' : formatCurrency(field.value));
    } else {
        setDisplayValue(field.value === 0 || field.value === undefined ? '' : String(field.value));
    }
  }, [field.value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const rawValue = e.target.value;
    if (rawValue === '') {
        field.onChange(0);
        return;
    }
    const numericValue = parseFloat(rawValue.replace(',', '.'));
    if (!isNaN(numericValue)) {
      field.onChange(numericValue);
    } else {
      field.onChange(0);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
        setDisplayValue(value);
      }
  }

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <FormLabel className="cursor-help">{label}</FormLabel>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="relative">
        <FormControl>
          <Input
            type="text"
            value={displayValue}
            placeholder="0,00 €"
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className="pr-8"
          />
        </FormControl>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
          €
        </div>
      </div>
       <FormMessage />
    </div>
  );
}


export function OperadorForm({ operador, onSave, onCancel }: OperadorFormProps) {
  const defaultValues: Partial<Operador> = operador
    ? { 
        ...operador, 
        notes: operador.notes || '',
        rates: operador.rates || {
            rateWorkHour: 0,
            rateTravelHour: 0,
            rateOvertimeWeekdayDay: 0,
            rateOvertimeWeekdayNight: 0,
            rateOvertimeWeekendDay: 0,
            rateOvertimeWeekendNight: 0,
            rateNotes: "",
        }
      }
    : {
        name: "",
        cif: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        rates: {
            rateWorkHour: 0,
            rateTravelHour: 0,
            rateOvertimeWeekdayDay: 0,
            rateOvertimeWeekdayNight: 0,
            rateOvertimeWeekendDay: 0,
            rateOvertimeWeekendNight: 0,
            rateNotes: "",
        }
      };

  const form = useForm<OperadorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: OperadorFormValues) {
    onSave(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader><CardTitle>Información General</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                            <Input placeholder="Razón social o nombre del técnico" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="cif"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Código/CIF (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Identificador fiscal" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Teléfono (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Número de contacto principal" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email (Opcional)</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="Correo electrónico" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Dirección (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Domicilio social o sede principal" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Notas Generales (Opcional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Comentarios adicionales sobre el operador..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Tabla de Tarifas (€/hora)</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <FormField name="rates.rateWorkHour" render={({ field }) => (
                            <FormItem><CurrencyInput field={field} label="Hora trabajo" tooltipText="Tarifa estándar por hora de trabajo efectivo en el proyecto." /></FormItem>
                        )} />
                        <FormField name="rates.rateTravelHour" render={({ field }) => (
                            <FormItem><CurrencyInput field={field} label="Hora desplaz." tooltipText="Tarifa por hora durante los desplazamientos hacia/desde el lugar de trabajo."/></FormItem>
                        )} />
                        <FormField name="rates.rateOvertimeWeekdayDay" render={({ field }) => (
                            <FormItem><CurrencyInput field={field} label="Extra laboral (día)" tooltipText="Tarifa para horas extra realizadas en día laborable, en horario diurno." /></FormItem>
                        )} />
                          <FormField name="rates.rateOvertimeWeekdayNight" render={({ field }) => (
                            <FormItem><CurrencyInput field={field} label="Extra laboral (noche)" tooltipText="Tarifa para horas extra realizadas en día laborable, en horario nocturno." /></FormItem>
                        )} />
                          <FormField name="rates.rateOvertimeWeekendDay" render={({ field }) => (
                            <FormItem><CurrencyInput field={field} label="Extra festivo (día)" tooltipText="Tarifa para horas extra realizadas en sábado, domingo o festivo, en horario diurno." /></FormItem>
                        )} />
                          <FormField name="rates.rateOvertimeWeekendNight" render={({ field }) => (
                            <FormItem><CurrencyInput field={field} label="Extra festivo (noche)" tooltipText="Tarifa para horas extra realizadas en sábado, domingo o festivo, en horario nocturno."/></FormItem>
                        )} />
                    </div>
                    <FormField name="rates.rateNotes" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notas sobre Tarifas</FormLabel>
                            <FormControl><Textarea placeholder="Añade cualquier observación sobre las tarifas de este técnico..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Operador</Button>
        </div>
      </form>
    </Form>
  );
}
