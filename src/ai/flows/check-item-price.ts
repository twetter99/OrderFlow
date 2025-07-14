'use server';

/**
 * @fileOverview Implements a Genkit flow to check if the price of an item in a purchase request
 *               is significantly higher than similar items from other suppliers.
 *
 * - checkItemPrice - A function that checks the item price.
 * - CheckItemPriceInput - The input type for the checkItemPrice function.
 * - CheckItemPriceOutput - The return type for the checkItemPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { suppliers, purchaseOrders } from '@/lib/data';

const CheckItemPriceInputSchema = z.object({
  itemName: z.string().describe('The name of the item.'),
  itemPrice: z.number().describe('The price of the item in the purchase request.'),
  supplierName: z.string().describe('The name of the supplier for the item.'),
});
export type CheckItemPriceInput = z.infer<typeof CheckItemPriceInputSchema>;

const CheckItemPriceOutputSchema = z.object({
  isPriceTooHigh: z.boolean().describe('Whether the item price is significantly higher than similar items from other suppliers.'),
  suggestedSuppliers: z.array(z.string()).describe('A list of suggested suppliers with lower prices for the item.'),
  averagePrice: z.number().describe('The average price of the item from other suppliers.'),
});
export type CheckItemPriceOutput = z.infer<typeof CheckItemPriceOutputSchema>;

export async function checkItemPrice(input: CheckItemPriceInput): Promise<CheckItemPriceOutput> {
  return checkItemPriceFlow(input);
}

const getSuggestedSuppliers = ai.defineTool({
  name: 'getSuggestedSuppliers',
  description: 'Retrieves a list of suppliers offering the specified item at a lower price based on historical purchase order data.',
  inputSchema: z.object({
    itemName: z.string().describe('The name of the item to find suppliers for.'),
    currentSupplier: z.string().describe('The name of the current supplier.'),
    currentPrice: z.number().describe('The current price of the item.'),
  }),
  outputSchema: z.array(z.string()).describe('A list of supplier names offering the item at a lower price.'),
},
async ({ itemName, currentSupplier, currentPrice }) => {
    const alternativeSuppliers = new Set<string>();

    // Find purchase orders containing the item from different suppliers
    for (const order of purchaseOrders) {
      if (order.supplier === currentSupplier) continue;

      for (const item of order.items) {
          // This is a simplified lookup. In a real app, you'd match by SKU or item ID.
          // We'll use a case-insensitive name match for this prototype.
          const poItem = purchaseOrders.flatMap(po => po.items).find(i => i.itemId === item.itemId);
          if (poItem) { // A more robust check might be needed here
              const historicalItemName = 'itemName' in item ? (item as any).itemName : undefined;
              if (historicalItemName && historicalItemName.toLowerCase() === itemName.toLowerCase() && item.price < currentPrice) {
                  alternativeSuppliers.add(order.supplier);
              }
          }
      }
    }
    
    return Array.from(alternativeSuppliers);
});

const checkItemPricePrompt = ai.definePrompt({
  name: 'checkItemPricePrompt',
  input: {schema: CheckItemPriceInputSchema},
  output: {schema: CheckItemPriceOutputSchema},
  tools: [getSuggestedSuppliers],
  prompt: `Eres un analista de adquisiciones experto. Tu tarea es determinar si el precio de un artículo en una solicitud de compra es significativamente más alto que el precio promedio de otros proveedores.

  Nombre del Artículo: {{{itemName}}}
  Precio del Artículo: {{{itemPrice}}}
  Nombre del Proveedor: {{{supplierName}}}

  Primero, utiliza tus conocimientos y las herramientas disponibles para investigar el precio promedio de este artículo de otros proveedores. Si el precio del artículo es significativamente más alto (por ejemplo, más de un 20% más alto que el promedio), entonces establece isPriceTooHigh en verdadero.

  Considera factores como la reputación del proveedor, la calidad del artículo y los tiempos de entrega al evaluar la diferencia de precio. Usa la herramienta getSuggestedSuppliers para encontrar proveedores alternativos con un precio inferior al actual.

  Según tu análisis, proporciona una lista de proveedores sugeridos con precios más bajos para el artículo en el campo suggestedSuppliers. Incluye el precio promedio del artículo de otros proveedores.

  Devuelve un objeto JSON con el siguiente formato:
  {
    "isPriceTooHigh": boolean,
    "suggestedSuppliers": string[],
    "averagePrice": number
  }`,
});

const checkItemPriceFlow = ai.defineFlow(
  {
    name: 'checkItemPriceFlow',
    inputSchema: CheckItemPriceInputSchema,
    outputSchema: CheckItemPriceOutputSchema,
  },
  async input => {
    const {output} = await checkItemPricePrompt(input);
    return output!;
  }
);
