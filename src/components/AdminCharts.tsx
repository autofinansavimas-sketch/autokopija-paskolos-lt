import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";

interface Submission {
  id: string;
  status: string;
  source?: string | null;
  loan_type?: string | null;
  amount?: string | null;
  created_at: string;
}

interface AdminChartsProps {
  submissions: Submission[];
}

const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  contacted: "#eab308",
  completed: "#22c55e",
  not_financed: "#f97316",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nauji",
  contacted: "Susisiekta",
  completed: "Užbaigti",
  not_financed: "Nefinansuojami",
  cancelled: "Atšaukti",
};

const SOURCE_COLORS: Record<string, string> = {
  autopaskolos: "#3b82f6",
  autokopers: "#8b5cf6",
};

export default function AdminCharts({ submissions }: AdminChartsProps) {
  // Weekly submissions data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('lt-LT', { weekday: 'short' });
      
      const count = submissions.filter(s => {
        const created = new Date(s.created_at).toISOString().split('T')[0];
        return created === dateStr;
      }).length;
      
      data.push({
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        paraiškos: count,
        date: dateStr,
      });
    }
    
    return data;
  }, [submissions]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    submissions.forEach(s => {
      const status = s.status || 'new';
      counts[status] = (counts[status] || 0) + 1;
    });
    
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || "#6b7280",
    }));
  }, [submissions]);

  // Source distribution
  const sourceData = useMemo(() => {
    const ap = submissions.filter(s => s.source === 'autopaskolos' || !s.source).length;
    const ak = submissions.filter(s => s.source === 'autokopers').length;
    
    return [
      { name: "Autopaskolos.lt", value: ap, color: SOURCE_COLORS.autopaskolos },
      { name: "Autokopers.lt", value: ak, color: SOURCE_COLORS.autokopers },
    ].filter(d => d.value > 0);
  }, [submissions]);

  // Loan type distribution
  const loanTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    submissions.forEach(s => {
      const type = s.loan_type || 'Nenurodyta';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([type, count], index) => ({
        name: type.length > 15 ? type.slice(0, 15) + '...' : type,
        fullName: type,
        paraiškos: count,
        color: colors[index % colors.length],
      }));
  }, [submissions]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('lt-LT', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const count = submissions.filter(s => {
        const created = new Date(s.created_at);
        return created.getFullYear() === year && created.getMonth() === month;
      }).length;
      
      data.push({
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        paraiškos: count,
      });
    }
    
    return data;
  }, [submissions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-primary">
            {payload[0].value} {payload[0].value === 1 ? 'paraiška' : 'paraiškos'}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{payload[0].payload.fullName || payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            {payload[0].value} ({((payload[0].value / submissions.length) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Weekly Submissions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Savaitės paraiškos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorParaiskos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="paraiškos" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorParaiskos)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Statusų pasiskirstymas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Loan Types */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Paskolų tipai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis 
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  width={100}
                />
                <Tooltip content={<PieTooltip />} />
                <Bar dataKey="paraiškos" radius={[0, 4, 4, 0]}>
                  {loanTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Mėnesio tendencijos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="paraiškos" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
