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
          <h1 className="text-3xl font-bold font-headline">Inventory</h1>
          <p className="text-muted-foreground">
            Track and manage your stock levels.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
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
                        {isLowStock ? "Low Stock" : "In Stock"}
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
