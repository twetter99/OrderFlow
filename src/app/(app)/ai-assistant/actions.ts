'use server';

import { suggestStockNeeds } from '@/ai/flows/suggest-stock-needs';
import { suggestSuppliers } from '@/ai/flows/suggest-suppliers';
import { checkItemPrice } from '@/ai/flows/check-item-price';
import { z } from 'zod';

const stockNeedsSchema = z.object({
  projectForecasts: z.string().min(1, 'Los pronósticos de proyectos son obligatorios.'),
  historicalData: z.string().min(1, 'Los datos históricos son obligatorios.'),
  currentStockLevels: z.string().min(1, 'Los niveles de stock actuales son obligatorios.'),
});

const suggestSuppliersSchema = z.object({
  itemName: z.string().min(1, 'El nombre del artículo es obligatorio.'),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1.'),
});

const checkPriceSchema = z.object({
  itemName: z.string().min(1, 'El nombre del artículo es obligatorio.'),
  itemPrice: z.coerce.number().min(0.01, 'El precio debe ser mayor que 0.'),
  supplierName: z.string().min(1, 'El nombre del proveedor es obligatorio.'),
});

export type FormState = {
  message: string;
  data?: any;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function handleSuggestStockNeeds(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawFormData = Object.fromEntries(formData);
  const parsed = stockNeedsSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return {
      message: 'Datos del formulario no válidos.',
      fields: rawFormData as Record<string, string>,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }
  
  try {
    const result = await suggestStockNeeds(parsed.data);
    return { message: 'Sugerencias generadas con éxito.', data: result };
  } catch (error) {
    return { message: `Ocurrió un error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function handleSuggestSuppliers(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawFormData = Object.fromEntries(formData);
  const parsed = suggestSuppliersSchema.safeParse(rawFormData);
  
  if (!parsed.success) {
    return {
      message: 'Datos del formulario no válidos.',
      fields: rawFormData as Record<string, string>,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  try {
    const result = await suggestSuppliers(parsed.data);
    return { message: 'Proveedores sugeridos con éxito.', data: result };
  } catch (error) {
    return { message: `Ocurrió un error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function handleCheckItemPrice(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawFormData = Object.fromEntries(formData);
  const parsed = checkPriceSchema.safeParse(rawFormData);
  
  if (!parsed.success) {
    return {
      message: 'Datos del formulario no válidos.',
      fields: rawFormData as Record<string, string>,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  try {
    const result = await checkItemPrice(parsed.data);
    return { message: 'Verificación de precio completada.', data: result };
  } catch (error) {
    return { message: `Ocurrió un error: ${error instanceof Error ? error.message : String(error)}` };
  }
}
