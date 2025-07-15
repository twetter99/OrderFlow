
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { inventory, suppliers } from "@/lib/data"

// Calculate inventory value per supplier
const supplierInventoryValue = suppliers.map(supplier => {
    const value = inventory
        .filter(item => item.supplier === supplier.name && item.type === 'simple')
        .reduce((acc, item) => {
             const totalQuantity = inventory
              .filter(i => i.id === item.id)
              .reduce((sum, i) => sum + (i.quantity || 0), 0);
            return acc + (totalQuantity * item.unitCost);
        }, 0);
    return { name: supplier.name, value: value };
}).filter(s => s.value > 0);


const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function InventoryValueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Valor de Inventario por Proveedor</CardTitle>
        <CardDescription>Distribución del valor del stock actual entre proveedores.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierInventoryValue} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value as number)}
              />
              <ChartTooltipContent 
                    formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number)}
                    nameKey="value" 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                 />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
