'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest potential suppliers for an item.
 *
 * - suggestSuppliers - A function that suggests suppliers for an item based on historical data and performance.
 * - SuggestSuppliersInput - The input type for the suggestSuppliers function.
 * - SuggestSuppliersOutput - The return type for the suggestSuppliers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSuppliersInputSchema = z.object({
  itemName: z.string().describe('The name of the item to find suppliers for.'),
  quantity: z.number().describe('The quantity of the item needed.'),
});
export type SuggestSuppliersInput = z.infer<typeof SuggestSuppliersInputSchema>;

const SuggestSuppliersOutputSchema = z.array(
  z.object({
    supplierName: z.string().describe('The name of the suggested supplier.'),
    historicalPrice: z.number().describe('The historical price for the item from this supplier.'),
    deliveryRating: z.number().describe('The delivery rating of the supplier (1-5).'),
    qualityRating: z.number().describe('The quality rating of the supplier (1-5).'),
  })
);
export type SuggestSuppliersOutput = z.infer<typeof SuggestSuppliersOutputSchema>;

export async function suggestSuppliers(input: SuggestSuppliersInput): Promise<SuggestSuppliersOutput> {
  return suggestSuppliersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSuppliersPrompt',
  input: {schema: SuggestSuppliersInputSchema},
  output: {schema: SuggestSuppliersOutputSchema},
  prompt: `You are an expert procurement assistant. Given the item name and quantity, suggest the top suppliers based on historical price, delivery rating, and quality rating.

Item Name: {{{itemName}}}
Quantity: {{{quantity}}}

Format your response as a JSON array of supplier objects. Each object should include supplierName, historicalPrice, deliveryRating (1-5), and qualityRating (1-5).`,
});

const suggestSuppliersFlow = ai.defineFlow(
  {
    name: 'suggestSuppliersFlow',
    inputSchema: SuggestSuppliersInputSchema,
    outputSchema: SuggestSuppliersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
