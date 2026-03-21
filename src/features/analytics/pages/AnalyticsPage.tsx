import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const stats = [
    { title: "Total Users", value: "12,847", icon: Users, change: "+12%" },
    { title: "Active Now", value: "1,429", icon: Activity, change: "+8%" },
    { title: "Matches Today", value: "3,284", icon: TrendingUp, change: "+24%" },
    { title: "Revenue", value: "$48,295", icon: BarChart3, change: "+18%" },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-500">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
