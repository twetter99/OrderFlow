import { StatsCard } from "@/components/dashboard/stats-card";
import { ExpensesChart } from "@/components/dashboard/expenses-chart";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { ActiveProjectsList } from "@/components/dashboard/active-projects-list";
import { DollarSign, Package, FolderKanban, AlertTriangle } from "lucide-react";
import { purchaseOrders } from "@/lib/data";

export default function DashboardPage() {
    const pendingApprovals = purchaseOrders.filter(po => po.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a snapshot of your operations.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Spending (Month)"
          value="$42,350"
          icon={DollarSign}
          description="+15.2% from last month"
        />
        <StatsCard 
          title="Active Projects"
          value="3"
          icon={FolderKanban}
          description="1 new project this week"
        />
        <StatsCard 
          title="Pending Approvals"
          value={pendingApprovals.toString()}
          icon={Package}
          description="Needs your review"
          isAlert={pendingApprovals > 0}
        />
        <StatsCard 
          title="Low Stock Items"
          value="2"
          icon={AlertTriangle}
          description="Action required"
          isAlert
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
            <ExpensesChart />
        </div>
        <div className="lg:col-span-2">
            <ActiveProjectsList />
        </div>
      </div>
      <div>
        <RecentOrdersTable />
      </div>
    </div>
  );
}
