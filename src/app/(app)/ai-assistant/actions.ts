
'use server';

import { suggestStockNeeds } from '@/ai/flows/suggest-stock-needs';
import { suggestSuppliers } from '@/ai/flows/suggest-suppliers';
import { checkItemPrice, type CheckItemPriceOutput } from '@/ai/flows/check-item-price';
import { z } from 'zod';
import { projects, inventory, inventoryLocations } from '@/lib/data';

// This is a simplified resolver. In a real app, this would involve a complex BOM lookup.
// For now, we'll assume a project name hints at the needed kits or items.
function getItemsForProject(projectName: string): { itemId: string, quantity: number }[] {
    if (projectName.toLowerCase().includes('flota a')) {
        return [{ itemId: 'ITEM-100', quantity: 1 }]; // Basic Install Kit
    }
    if (projectName.toLowerCase().includes('turístico')) {
         return [{ itemId: 'ITEM-100', quantity: 1 }, { itemId: 'ITEM-006', quantity: 2 }]; // Basic Kit + 2 Security Cameras
    }
    if (projectName.toLowerCase().includes('escolar')) {
        return [{ itemId: 'ITEM-100', quantity: 1 }, { itemId: 'ITEM-006', quantity: 4 }]; // Basic Kit + 4 Security Cameras
    }
    return [];
}


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
  
  try {
    const plannedProjects = projects.filter(p => p.status === 'Planificado');
    
    // In a real app, you would resolve the full BOM for each project.
    // Here we'll just pass the raw data for the AI to analyze.
    const requiredMaterials = plannedProjects.map(p => ({
        projectId: p.id,
        projectName: p.name,
        // This is a simplified lookup for demo purposes.
        requiredItems: getItemsForProject(p.name)
    }))

    const result = await suggestStockNeeds({
        projects: JSON.stringify(requiredMaterials, null, 2),
        inventory: JSON.stringify(inventory, null, 2),
    });
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

// Nueva acción para la verificación de precios en línea
export async function getPriceInsight(
  itemName: string,
  itemPrice: number,
  supplierName: string
): Promise<{ insight: CheckItemPriceOutput | null, error?: string }> {
  if (!itemName || !itemPrice || !supplierName) {
    return { insight: null };
  }
  try {
    const result = await checkItemPrice({ itemName, itemPrice, supplierName });
    return { insight: result };
  } catch (error) {
    console.error('Error getting price insight:', error);
    return { insight: null, error: 'No se pudo obtener el análisis de precios.' };
  }
}
