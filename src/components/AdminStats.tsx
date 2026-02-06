import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Phone
} from "lucide-react";

interface Submission {
  id: string;
  status: string;
  created_at: string;
}

interface Reminder {
  id: string;
  call_date: string;
  completed: boolean;
}

interface AdminStatsProps {
  submissions: Submission[];
  reminders: Reminder[];
}

export default function AdminStats({ submissions, reminders }: AdminStatsProps) {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toISOString().split('T')[0];
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Today's submissions
    const todaySubmissions = submissions.filter(s => {
      const created = new Date(s.created_at);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    });
    
    // This week's submissions
    const weekSubmissions = submissions.filter(s => {
      const created = new Date(s.created_at);
      return created >= weekAgo;
    });
    
    // By status
    const newCount = submissions.filter(s => s.status === 'new').length;
    const contactedCount = submissions.filter(s => s.status === 'contacted').length;
    const completedCount = submissions.filter(s => s.status === 'completed').length;
    
    // Today's reminders
    const todayReminders = reminders.filter(r => r.call_date === todayStr && !r.completed);
    
    return {
      total: submissions.length,
      today: todaySubmissions.length,
      week: weekSubmissions.length,
      new: newCount,
      contacted: contactedCount,
      completed: completedCount,
      todayReminders: todayReminders.length,
    };
  }, [submissions, reminders]);

  const statCards = [
    {
      label: "Šiandien",
      value: stats.today,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Šią savaitę",
      value: stats.week,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Nauji",
      value: stats.new,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Susisiekta",
      value: stats.contacted,
      icon: Phone,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Užbaigti",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Iš viso",
      value: stats.total,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
      {statCards.map((stat, index) => (
        <Card 
          key={stat.label} 
          className="overflow-hidden animate-fade-in border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                  {stat.label}
                </p>
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
