'use server';

/**
 * @fileOverview AI-powered suggestions for stock needs based on project forecasts and historical data.
 *
 * - suggestStockNeeds - A function that handles the stock needs suggestion process.
 * - SuggestStockNeedsInput - The input type for the suggestStockNeeds function.
 * - SuggestStockNeedsOutput - The return type for the suggestStockNeeds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStockNeedsInputSchema = z.object({
  projectForecasts: z.string().describe('Project forecasts data.'),
  historicalData: z.string().describe('Historical stock level and usage data.'),
  currentStockLevels: z.string().describe('Current stock levels for each item.'),
});
export type SuggestStockNeedsInput = z.infer<typeof SuggestStockNeedsInputSchema>;

const SuggestStockNeedsOutputSchema = z.object({
  stockSuggestions: z
    .string()
    .describe(
      'A list of suggested stock adjustments, including items to order, quantities, and recommended suppliers.'
    ),
  explanation: z
    .string()
    .describe('An explanation of the reasoning behind the stock suggestions.'),
});
export type SuggestStockNeedsOutput = z.infer<typeof SuggestStockNeedsOutputSchema>;

export async function suggestStockNeeds(input: SuggestStockNeedsInput): Promise<SuggestStockNeedsOutput> {
  return suggestStockNeedsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStockNeedsPrompt',
  input: {schema: SuggestStockNeedsInputSchema},
  output: {schema: SuggestStockNeedsOutputSchema},
  prompt: `You are an AI assistant specialized in inventory management and supply chain optimization. Based on the provided project forecasts, historical data, and current stock levels, provide a list of stock suggestions to optimize inventory levels and reduce costs.

Project Forecasts:
{{projectForecasts}}

Historical Data:
{{historicalData}}

Current Stock Levels:
{{currentStockLevels}}

Provide a clear explanation of your reasoning and the factors you considered when generating the stock suggestions. List out any assumptions you made, and caveats to your suggestions.
`,
});

const suggestStockNeedsFlow = ai.defineFlow(
  {
    name: 'suggestStockNeedsFlow',
    inputSchema: SuggestStockNeedsInputSchema,
    outputSchema: SuggestStockNeedsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
