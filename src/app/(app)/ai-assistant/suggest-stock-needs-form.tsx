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
      Generar Sugerencias
    </Button>
  );
}

export function SuggestStockNeedsForm() {
  const [state, formAction] = useFormState(handleSuggestStockNeeds, initialState);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Sugerir Necesidades de Stock</CardTitle>
          <CardDescription>
            Proporcione pronósticos de proyectos, datos históricos y niveles de stock actuales para obtener sugerencias de inventario impulsadas por IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectForecasts">Pronósticos de Proyectos</Label>
            <Textarea
              id="projectForecasts"
              name="projectForecasts"
              placeholder="p. ej., Proyecto X: 50 unidades de CPU-45, 200 unidades de SCRW-M5..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="historicalData">Datos Históricos</Label>
            <Textarea
              id="historicalData"
              name="historicalData"
              placeholder="p. ej., Uso de los últimos 3 meses para CPU-45: 15 unidades/mes..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentStockLevels">Niveles de Stock Actuales</Label>
            <Textarea
              id="currentStockLevels"
              name="currentStockLevels"
              placeholder="p. ej., CPU-45: 25 unidades, SCRW-M5: 200 paquetes..."
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
                <AlertTitle>Sugerencias de IA</AlertTitle>
                <AlertDescription className="prose dark:prose-invert prose-sm mt-2">
                    <p><strong>Sugerencias:</strong> {state.data.stockSuggestions}</p>
                    <p><strong>Explicación:</strong> {state.data.explanation}</p>
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
