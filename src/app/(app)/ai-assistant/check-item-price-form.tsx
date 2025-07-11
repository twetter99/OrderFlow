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
      Check Price
    </Button>
  );
}

export function CheckItemPriceForm() {
  const [state, formAction] = useFormState(handleCheckItemPrice, initialState);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Check Item Price</CardTitle>
          <CardDescription>
            Verify if an item price is competitive compared to other suppliers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input id="itemName" name="itemName" placeholder="e.g., GPS Module v2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="itemPrice">Item Price ($)</Label>
            <Input id="itemPrice" name="itemPrice" type="number" step="0.01" placeholder="e.g., 150.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input id="supplierName" name="supplierName" placeholder="e.g., Overpriced Nav" />
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
            <AlertTitle>{state.data.isPriceTooHigh ? 'Price is likely too high' : 'Price seems reasonable'}</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>The average price for this item from other suppliers is approximately <strong>${state.data.averagePrice.toFixed(2)}</strong>.</p>
              {state.data.isPriceTooHigh && state.data.suggestedSuppliers.length > 0 && (
                <div>
                    <p>Consider these alternative suppliers:</p>
                    <ul className="list-disc pl-5">
                        {state.data.suggestedSuppliers.map((s: string) => <li key={s}>{s}</li>)}
                    </ul>
                </div>
              )}
               {state.data.isPriceTooHigh && state.data.suggestedSuppliers.length === 0 && (
                <p>No alternative suppliers with lower prices were found immediately.</p>
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
