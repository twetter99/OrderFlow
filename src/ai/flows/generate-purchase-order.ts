
'use server';

/**
 * @fileOverview Implements a Genkit flow to generate a purchase order from a natural language prompt.
 *
 * - generatePurchaseOrder - A function that handles the purchase order generation process.
 * - GeneratePurchaseOrderInput - The input type for the generatePurchaseOrder function.
 * - GeneratePurchaseOrderOutput - The return type for the generatePurchaseOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { suppliers, inventory } from '@/lib/data';

const GeneratePurchaseOrderInputSchema = z.object({
  prompt: z.string().describe('The natural language prompt describing the purchase order.'),
});
export type GeneratePurchaseOrderInput = z.infer<typeof GeneratePurchaseOrderInputSchema>;

const GeneratePurchaseOrderOutputSchema = z.object({
  supplier: z.string().describe("The name of the supplier to order from."),
  items: z.array(z.object({
    itemName: z.string().describe("The name of the item being ordered."),
    quantity: z.number().describe("The quantity to order."),
    price: z.number().describe("The unit price of the item."),
  })).describe("The list of items to include in the purchase order.")
});
export type GeneratePurchaseOrderOutput = z.infer<typeof GeneratePurchaseOrderOutputSchema>;


const findSupplierTool = ai.defineTool({
    name: 'findSupplier',
    description: 'Finds a supplier by name from the list of available suppliers.',
    inputSchema: z.object({ name: z.string().describe('The name of the supplier to find.') }),
    outputSchema: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable(),
}, async ({ name }) => {
    const found = suppliers.find(s => s.name.toLowerCase().includes(name.toLowerCase()));
    return found ? { id: found.id, name: found.name } : null;
});


const findItemTool = ai.defineTool({
    name: 'findItem',
    description: 'Finds an item by name from the inventory list to get its details like current price.',
    inputSchema: z.object({ name: z.string().describe('The name of the item to find.') }),
    outputSchema: z.object({
        id: z.string(),
        name: z.string(),
        unitCost: z.number(),
    }).nullable(),
}, async ({ name }) => {
    const found = inventory.find(i => i.name.toLowerCase().includes(name.toLowerCase()));
    return found ? { id: found.id, name: found.name, unitCost: found.unitCost } : null;
});


export async function generatePurchaseOrder(input: GeneratePurchaseOrderInput): Promise<GeneratePurchaseOrderOutput> {
  return generatePurchaseOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePurchaseOrderPrompt',
  input: {schema: GeneratePurchaseOrderInputSchema},
  output: {schema: GeneratePurchaseOrderOutputSchema},
  tools: [findSupplierTool, findItemTool],
  prompt: `Eres un asistente de IA para la creación de órdenes de compra. Tu tarea es analizar el prompt del usuario y generar una orden de compra estructurada.

Prompt del usuario: {{{prompt}}}

Sigue estos pasos:
1.  Identifica el nombre del proveedor en el prompt. Usa la herramienta 'findSupplier' para confirmar que el proveedor existe. Si no se encuentra, detente y pide al usuario que aclare el nombre del proveedor.
2.  Para cada artículo mencionado en el prompt:
    a. Identifica el nombre del artículo y la cantidad.
    b. Usa la herramienta 'findItem' para obtener los detalles del artículo, especialmente su precio ('unitCost').
    c. Si no encuentras un artículo, omítelo de la orden final.
3.  Construye el resultado final en el formato JSON especificado. El campo 'supplier' debe ser el nombre del proveedor encontrado. La lista 'items' debe contener todos los artículos encontrados con sus cantidades y precios.`,
});

const generatePurchaseOrderFlow = ai.defineFlow(
  {
    name: 'generatePurchaseOrderFlow',
    inputSchema: GeneratePurchaseOrderInputSchema,
    outputSchema: GeneratePurchaseOrderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
