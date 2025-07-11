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
  prompt: `Eres un asistente de IA especializado en gestión de inventario y optimización de la cadena de suministro. Basado en los pronósticos de proyectos, datos históricos y niveles de stock actuales proporcionados, proporciona una lista de sugerencias de stock para optimizar los niveles de inventario y reducir costos.

Pronósticos de Proyectos:
{{projectForecasts}}

Datos Históricos:
{{historicalData}}

Niveles de Stock Actuales:
{{currentStockLevels}}

Proporciona una explicación clara de tu razonamiento y los factores que consideraste al generar las sugerencias de stock. Enumera cualquier suposición que hiciste y las advertencias a tus sugerencias.
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
