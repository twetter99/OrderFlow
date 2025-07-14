
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
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
        .filter(item => item.supplier === supplier.name)
        .reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    return { name: supplier.name, value: value };
}).filter(s => s.value > 0);


const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--primary))",
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
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <XAxis
                type="number"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value as number)}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent 
                    formatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number)}
                    nameKey="value" 
                 />}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
