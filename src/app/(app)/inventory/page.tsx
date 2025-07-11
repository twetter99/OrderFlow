import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { inventory } from "@/lib/data"
import { cn } from "@/lib/utils"
import { PlusCircle } from "lucide-react"

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Inventario</h1>
          <p className="text-muted-foreground">
            Rastrea y gestiona tus niveles de stock.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Artículo
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre del Artículo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Costo Unitario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const isLowStock = item.quantity < item.minThreshold;
                return (
                  <TableRow key={item.id} className={cn(isLowStock && "bg-red-50 dark:bg-red-900/20")}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          isLowStock 
                            ? "bg-destructive/10 text-destructive border-destructive/20" 
                            : "bg-green-100 text-green-800 border-green-200"
                        )}
                      >
                        {isLowStock ? "Stock Bajo" : "En Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.quantity} / {item.minThreshold}
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell className="text-right">
                      ${item.unitCost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
