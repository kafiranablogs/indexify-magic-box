import { Card } from "@/components/ui/card";
import { BarChart, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  total: number;
  success: number;
  failed: number;
};

type RecentSubmission = {
  id: string;
  url: string;
  status: string;
  created_at: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    success: 0,
    failed: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentSubmissions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'url_submissions'
        },
        () => {
          fetchStats();
          fetchRecentSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { data: submissions, error } = await supabase
        .from('url_submissions')
        .select('status');

      if (error) throw error;

      const stats = submissions.reduce(
        (acc, curr) => {
          acc.total++;
          if (curr.status === 'success') acc.success++;
          if (curr.status === 'failed') acc.failed++;
          return acc;
        },
        { total: 0, success: 0, failed: 0 }
      );

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('url_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentSubmissions(data);
    } catch (error) {
      console.error('Error fetching recent submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total URLs Indexed",
      value: stats.total.toString(),
      icon: LinkIcon,
      color: "text-google-blue",
    },
    {
      title: "Successful",
      value: stats.success.toString(),
      icon: CheckCircle,
      color: "text-google-green",
    },
    {
      title: "Failed",
      value: stats.failed.toString(),
      icon: XCircle,
      color: "text-google-red",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {statsCards.map((stat) => (
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
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{submission.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    submission.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : submission.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity to display.</p>
          )}
        </div>
      </Card>
    </div>
  );
}