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
  description: 'Retrieves a list of suppliers offering the specified item at a lower price.',
  inputSchema: z.object({
    itemName: z.string().describe('The name of the item to find suppliers for.'),
    currentSupplier: z.string().describe('The name of the current supplier.'),
  }),
  outputSchema: z.array(z.string()).describe('A list of supplier names offering the item at a lower price.'),
},
async (input) => {
    // TODO: Implement the logic to fetch suggested suppliers from a database or external API.
    // For now, return an empty array.
    return [];
});

const checkItemPricePrompt = ai.definePrompt({
  name: 'checkItemPricePrompt',
  input: {schema: CheckItemPriceInputSchema},
  output: {schema: CheckItemPriceOutputSchema},
  tools: [getSuggestedSuppliers],
  prompt: `You are an expert procurement analyst. Your task is to determine if the price of an item in a purchase request is significantly higher than the average price from other suppliers.

  Item Name: {{{itemName}}}
  Item Price: {{{itemPrice}}}
  Supplier Name: {{{supplierName}}}

  First, use your knowledge and available tools to research the average price of this item from other suppliers. If the item price is significantly higher (e.g., more than 20% higher than the average), then set isPriceTooHigh to true.

  Consider factors such as supplier reputation, item quality, and delivery times when evaluating the price difference.  Use the getSuggestedSuppliers tool to find alternative suppliers.

  Based on your analysis, provide a list of suggested suppliers with lower prices for the item in the suggestedSuppliers field.  Include the average price of the item from other suppliers.

  Return a JSON object with the following format:
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
