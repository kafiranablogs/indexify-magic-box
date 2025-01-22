import { Card } from "@/components/ui/card";
import { BarChart, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total URLs Indexed",
      value: "156",
      icon: LinkIcon,
      color: "text-google-blue",
    },
    {
      title: "Successful",
      value: "142",
      icon: CheckCircle,
      color: "text-google-green",
    },
    {
      title: "Failed",
      value: "14",
      icon: XCircle,
      color: "text-google-red",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">No recent activity to display.</p>
        </div>
      </Card>
    </div>
  );
}