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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { purchaseOrders } from "@/lib/data"
import { cn } from "@/lib/utils"

export function RecentOrdersTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Orders</CardTitle>
        <CardDescription>
          A list of the most recent purchase orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.slice(0, 5).map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.project}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      order.status === "Approved" && "bg-green-100 text-green-800 border-green-200",
                      order.status === "Pending" && "bg-yellow-100 text-yellow-800 border-yellow-200",
                      order.status === "Sent" && "bg-blue-100 text-blue-800 border-blue-200",
                      order.status === "Received" && "bg-primary/10 text-primary border-primary/20",
                      order.status === "Rejected" && "bg-red-100 text-red-800 border-red-200",
                      "capitalize"
                    )}
                  >
                    {order.status.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${order.total.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
