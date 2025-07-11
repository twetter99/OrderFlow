'use server';

import { suggestStockNeeds } from '@/ai/flows/suggest-stock-needs';
import { suggestSuppliers } from '@/ai/flows/suggest-suppliers';
import { checkItemPrice } from '@/ai/flows/check-item-price';
import { z } from 'zod';

const stockNeedsSchema = z.object({
  projectForecasts: z.string().min(1, 'Project forecasts are required.'),
  historicalData: z.string().min(1, 'Historical data is required.'),
  currentStockLevels: z.string().min(1, 'Current stock levels are required.'),
});

const suggestSuppliersSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
});

const checkPriceSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  itemPrice: z.coerce.number().min(0.01, 'Price must be greater than 0.'),
  supplierName: z.string().min(1, 'Supplier name is required.'),
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
      message: 'Invalid form data.',
      fields: rawFormData as Record<string, string>,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }
  
  try {
    const result = await suggestStockNeeds(parsed.data);
    return { message: 'Suggestions generated successfully.', data: result };
  } catch (error) {
    return { message: `An error occurred: ${error instanceof Error ? error.message : String(error)}` };
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
      message: 'Invalid form data.',
      fields: rawFormData as Record<string, string>,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  try {
    const result = await suggestSuppliers(parsed.data);
    return { message: 'Suppliers suggested successfully.', data: result };
  } catch (error) {
    return { message: `An error occurred: ${error instanceof Error ? error.message : String(error)}` };
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
      message: 'Invalid form data.',
      fields: rawFormData as Record<string, string>,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  try {
    const result = await checkItemPrice(parsed.data);
    return { message: 'Price check complete.', data: result };
  } catch (error) {
    return { message: `An error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}
