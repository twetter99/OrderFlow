'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleSuggestStockNeeds, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Loader2, Terminal } from 'lucide-react';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Generate Suggestions
    </Button>
  );
}

export function SuggestStockNeedsForm() {
  const [state, formAction] = useFormState(handleSuggestStockNeeds, initialState);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Suggest Stock Needs</CardTitle>
          <CardDescription>
            Provide project forecasts, historical data, and current stock levels to get AI-powered inventory suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectForecasts">Project Forecasts</Label>
            <Textarea
              id="projectForecasts"
              name="projectForecasts"
              placeholder="e.g., Project X: 50 units of CPU-45, 200 units of SCRW-M5..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="historicalData">Historical Data</Label>
            <Textarea
              id="historicalData"
              name="historicalData"
              placeholder="e.g., Last 3 months usage for CPU-45: 15 units/month..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentStockLevels">Current Stock Levels</Label>
            <Textarea
              id="currentStockLevels"
              name="currentStockLevels"
              placeholder="e.g., CPU-45: 25 units, SCRW-M5: 200 packs..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <SubmitButton />
        </CardFooter>
      </form>
        {state.message && state.data && (
            <CardContent>
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>AI Suggestions</AlertTitle>
                <AlertDescription className="prose dark:prose-invert prose-sm mt-2">
                    <p><strong>Suggestions:</strong> {state.data.stockSuggestions}</p>
                    <p><strong>Explanation:</strong> {state.data.explanation}</p>
                </AlertDescription>
            </Alert>
            </CardContent>
        )}
        {state.message && !state.data && (
            <CardContent>
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            </CardContent>
        )}
    </Card>
  );
}
