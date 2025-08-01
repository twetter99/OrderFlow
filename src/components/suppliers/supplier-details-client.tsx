
"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { addDays, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Download, Calendar as CalendarIcon, History, Contact, Mail, Phone } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PurchaseOrder, Supplier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SupplierDetailsClientProps {
  supplier: Supplier;
  initialPurchaseOrders: PurchaseOrder[];
}

const ALL_STATUSES: PurchaseOrder['status'][] = ["Pendiente de Aprobación", "Aprobada", "Enviada al Proveedor", "Recibida", "Recibida Parcialmente", "Rechazado"];

export function SupplierDetailsClient({ supplier, initialPurchaseOrders }: SupplierDetailsClientProps) {
  const [filters, setFilters] = useState({
    orderNumber: "",
    status: "all",
    date: undefined as DateRange | undefined,
  });

  const filteredOrders = useMemo(() => {
    return initialPurchaseOrders.filter((order) => {
      const orderDate = new Date(order.date as string);
      const dateFilter = filters.date
        ? orderDate >= (filters.date.from || new Date(0)) &&
          orderDate <= (filters.date.to || new Date())
        : true;
      
      return (
        order.orderNumber?.toLowerCase().includes(filters.orderNumber.toLowerCase()) &&
        (filters.status === "all" || order.status === filters.status) &&
        dateFilter
      );
    }).sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());
  }, [initialPurchaseOrders, filters]);

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ orderNumber: "", status: "all", date: undefined });
  };
  
  const handleExport = () => {
    const headers = ["ID Orden", "Fecha", "Estado", "Total (€)"];
    const rows = filteredOrders.map(order => [
      order.orderNumber,
      new Date(order.date as string).toLocaleDateString(),
      order.status,
      order.total.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `historial_${supplier.name.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const analysisData = useMemo(() => {
    const dataByYear = filteredOrders.reduce((acc, order) => {
      const year = new Date(order.date as string).getFullYear().toString();
      acc[year] = (acc[year] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dataByYear)
      .map(([year, total]) => ({ year, total: parseFloat(total.toFixed(2)) }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredOrders]);


  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                 <div>
                    <CardTitle className="text-3xl font-bold font-headline uppercase">{supplier.name}</CardTitle>
                    <CardDescription>Historial de actividad y detalles del proveedor.</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2"><Contact className="h-4 w-4"/> {supplier.contactPerson}</div>
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> {supplier.email}</div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4"/> {supplier.phone}</div>
                </div>
            </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/> Historial de Pedidos</TabsTrigger>
            <TabsTrigger value="analysis">Análisis Visual</TabsTrigger>
            <TabsTrigger value="export"><Download className="mr-2 h-4 w-4"/>Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Filtrar Historial</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Buscar por ID de orden..."
                            value={filters.orderNumber}
                            onChange={(e) => handleFilterChange("orderNumber", e.target.value)}
                        />
                        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn("justify-start text-left font-normal", !filters.date && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.date?.from ? (
                                filters.date.to ? (
                                    <>
                                    {format(filters.date.from, "LLL dd, y", {locale: es})} -{" "}
                                    {format(filters.date.to, "LLL dd, y", {locale: es})}
                                    </>
                                ) : (
                                    format(filters.date.from, "LLL dd, y", {locale: es})
                                )
                                ) : (
                                <span>Elige un rango de fechas</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={filters.date?.from}
                                selected={filters.date}
                                onSelect={(date) => handleFilterChange("date", date)}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                        <Button variant="ghost" onClick={clearFilters}>Limpiar Filtros</Button>
                    </div>
                </CardContent>
                <CardContent>
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>ID Orden</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                            <TableCell className="font-mono">{order.orderNumber}</TableCell>
                            <TableCell>{new Date(order.date as string).toLocaleDateString()}</TableCell>
                            <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                            </TableRow>
                        ))}
                        {filteredOrders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No se encontraron órdenes con los filtros actuales.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Análisis de Compras</CardTitle>
                    <CardDescription>Resumen visual del volumen de compra a lo largo del tiempo.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysisData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => formatCurrency(value as number)}/>
                            <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} formatter={(value) => formatCurrency(value as number)}/>
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Exportar Historial</CardTitle>
                    <CardDescription>Descarga el historial de compras filtrado en formato CSV.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Se exportarán {filteredOrders.length} órdenes de compra con los filtros aplicados actualmente.
                    </p>
                    <Button onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4"/>
                        Exportar a CSV
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
