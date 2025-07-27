
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleCheckItemPrice, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, CheckCircle2, Loader2, Terminal, XCircle } from 'lucide-react';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Verificar Precio
    </Button>
  );
}

export function CheckItemPriceForm() {
  const [state, formAction] = useFormState(handleCheckItemPrice, initialState);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Verificar Precio de Artículo</CardTitle>
          <CardDescription>
            Verifique si el precio de un artículo es competitivo en comparación con otros proveedores.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Nombre del Artículo</Label>
            <Input id="itemName" name="itemName" placeholder="p. ej., Módulo GPS v2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemPrice">Precio del Artículo (€)</Label>
            <Input id="itemPrice" name="itemPrice" type="number" step="0.01" placeholder="p. ej., 150,00" onFocus={(e) => e.target.select()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierName">Nombre del Proveedor</Label>
            <Input id="supplierName" name="supplierName" placeholder="p. ej., Navegación Global" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <SubmitButton />
        </CardFooter>
      </form>
      {state.message && state.data && (
        <CardContent>
          <Alert variant={state.data.isPriceTooHigh ? 'destructive' : 'default'} className={!state.data.isPriceTooHigh ? 'border-green-500' : ''}>
            {state.data.isPriceTooHigh ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <AlertTitle>{state.data.isPriceTooHigh ? 'El precio es probablemente demasiado alto' : 'El precio parece razonable'}</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>El precio promedio para este artículo de otros proveedores es aproximadamente <strong>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(state.data.averagePrice)}</strong>.</p>
              {state.data.isPriceTooHigh && state.data.suggestedSuppliers.length > 0 && (
                <div>
                    <p>Considere estos proveedores alternativos:</p>
                    <ul className="list-disc pl-5">
                        {state.data.suggestedSuppliers.map((s: string) => <li key={s}>{s}</li>)}
                    </ul>
                </div>
              )}
               {state.data.isPriceTooHigh && state.data.suggestedSuppliers.length === 0 && (
                <p>No se encontraron proveedores alternativos con precios más bajos de inmediato.</p>
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
