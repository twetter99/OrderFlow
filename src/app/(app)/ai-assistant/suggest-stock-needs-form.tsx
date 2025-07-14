'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleSuggestStockNeeds, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Loader2, Terminal, ListChecks } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Analizar y Sugerir Necesidades
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
            La IA analizará los proyectos planificados y el inventario actual para predecir las necesidades de compra.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert>
                <ListChecks className="h-4 w-4" />
                <AlertTitle>Fuentes de Datos</AlertTitle>
                <AlertDescription>
                    Este análisis utilizará los proyectos con estado "Planificado" y las cantidades actuales de todos los artículos en el inventario.
                </AlertDescription>
            </Alert>
        </CardContent>
        <CardFooter className="flex justify-center md:justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
        {state.message && state.data && (
            <CardContent>
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Sugerencias de IA</AlertTitle>
                <AlertDescription className="prose dark:prose-invert prose-sm mt-4">
                    <p className="mb-4">{state.data.explanation}</p>
                    {state.data.stockSuggestions?.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Artículo (SKU)</TableHead>
                            <TableHead>Cantidad a Pedir</TableHead>
                            <TableHead>Motivo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {state.data.stockSuggestions.map((sug: any) => (
                            <TableRow key={sug.sku}>
                              <TableCell>{sug.itemName} ({sug.sku})</TableCell>
                              <TableCell>{sug.quantityToOrder}</TableCell>
                              <TableCell>{sug.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p>No se encontraron sugerencias de compra por el momento.</p>
                    )}
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
