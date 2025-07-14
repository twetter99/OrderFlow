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

const chartData = [
    { month: "Enero", desktop: 1860, mobile: 800 },
    { month: "Febrero", desktop: 3050, mobile: 2000 },
    { month: "Marzo", desktop: 2370, mobile: 1200 },
    { month: "Abril", desktop: 730, mobile: 1900 },
    { month: "Mayo", desktop: 2090, mobile: 1300 },
    { month: "Junio", desktop: 2140, mobile: 1400 },
]

const chartConfig = {
  desktop: {
    label: "Gasto",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function ExpensesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Resumen de Gastos</CardTitle>
        <CardDescription>Gasto mensual en todos los proyectos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value as number)}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent formatter={(value, name) => (
                  <div className="flex flex-col">
                    <span>{name}: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value as number)}</span>
                  </div>
                )} />}
              />
              <Bar dataKey="desktop" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
