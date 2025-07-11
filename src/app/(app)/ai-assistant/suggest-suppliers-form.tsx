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
      Suggest Suppliers
    </Button>
  );
}

export function SuggestSuppliersForm() {
  const [state, formAction] = useFormState(handleSuggestSuppliers, initialState);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Suggest Suppliers</CardTitle>
          <CardDescription>
            Enter an item and quantity to get supplier suggestions based on historical performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input id="itemName" name="itemName" placeholder="e.g., Small Mounting Bracket" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" type="number" placeholder="e.g., 100" />
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
            <AlertTitle>Suggested Suppliers</AlertTitle>
            <AlertDescription className="mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Quality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.data.map((supplier: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{supplier.supplierName}</TableCell>
                      <TableCell>${supplier.historicalPrice.toFixed(2)}</TableCell>
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
