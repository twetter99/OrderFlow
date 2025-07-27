
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleSuggestSuppliers, type FormState } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Loader2, Star, Terminal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
      Sugerir Proveedores
    </Button>
  );
}

export function SuggestSuppliersForm() {
  const [state, formAction] = useFormState(handleSuggestSuppliers, initialState);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Sugerir Proveedores</CardTitle>
          <CardDescription>
            Ingrese un artículo y una cantidad para obtener sugerencias de proveedores basadas en el rendimiento histórico.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Nombre del Artículo</Label>
            <Input id="itemName" name="itemName" placeholder="p. ej., Soporte de montaje pequeño" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input id="quantity" name="quantity" type="number" placeholder="p. ej., 100" onFocus={(e) => e.target.select()} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <SubmitButton />
        </CardFooter>
      </form>
      {state.message && state.data && Array.isArray(state.data) && (
        <CardContent>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Proveedores Sugeridos</AlertTitle>
            <AlertDescription className="mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Precio (€)</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Calidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.data.map((supplier: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{supplier.supplierName}</TableCell>
                      <TableCell>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(supplier.historicalPrice)}</TableCell>
                      <TableCell><div className="flex items-center gap-1">{supplier.deliveryRating}<Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/></div></TableCell>
                      <TableCell><div className="flex items-center gap-1">{supplier.qualityRating}<Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
