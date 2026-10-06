import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { AlertTriangle, Shield, Globe, Users, ShieldAlert, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { RegionalThreatWidget } from './RegionalThreatWidget';

interface Alert {
  id: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium';
  message: string;
  type: string;
}

interface LiveStats {
  totalThreats: number;
  mitigated: number;
  activeNodes: number;
  analysts: number;
  isUnderAttack: boolean;
}

const initialData = [
  { name: '00:00', attacks: 400 },
  { name: '04:00', attacks: 300 },
  { name: '08:00', attacks: 600 },
  { name: '12:00', attacks: 800 },
  { name: '16:00', attacks: 500 },
  { name: '20:00', attacks: 900 },
  { name: '23:59', attacks: 700 },
];

export function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalThreats: 12482,
    mitigated: 11902,
    activeNodes: 452,
    analysts: 24,
    isUnderAttack: false
  });
  const [chartData, setChartData] = useState(initialData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsData, statusData] = await Promise.all([
          fetchJson<Alert[]>('/api/alerts'),
          fetchJson<{ isUnderAttack: boolean; alertCount: number }>('/api/status')
        ]);
        
        if (!Array.isArray(alertsData)) {
          throw new Error('Alerts data is not an array');
        }
        
        setAlerts(alertsData.slice(0, 5));
        
        setLiveStats(prev => ({
          ...prev,
          isUnderAttack: statusData.isUnderAttack,
          totalThreats: prev.totalThreats + (statusData.isUnderAttack ? Math.floor(Math.random() * 10) : 1),
          activeNodes: 450 + Math.floor(Math.random() * 10)
        }));

        setChartData(prev => {
          const newData = [...prev.slice(1), { 
            name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            attacks: Math.floor(Math.random() * 400) + 400 + (statusData.isUnderAttack ? 300 : 0)
          }];
          return newData;
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Threats', value: liveStats.totalThreats.toLocaleString(), change: '+12%', icon: AlertTriangle, color: 'text-critical' },
    { label: 'Mitigated', value: liveStats.mitigated.toLocaleString(), change: '+5%', icon: Shield, color: 'text-low' },
    { label: 'Active Nodes', value: liveStats.activeNodes.toString(), change: '+2%', icon: Globe, color: 'text-accent' },
    { label: 'Analysts', value: liveStats.analysts.toString(), change: '0%', icon: Users, color: 'text-zinc-400' },
  ];

  return (
    <div className="space-y-6">
      {liveStats.isUnderAttack && (
        <div className="bg-critical/10 border border-critical/30 p-4 rounded-xl flex items-center gap-4 animate-pulse">
          <div className="p-2 bg-critical/20 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-critical" />
          </div>
          <div>
            <h4 className="text-critical font-bold text-sm uppercase tracking-wider">Active Intrusion Detected</h4>
            <p className="text-critical/70 text-xs font-mono">Automated countermeasures engaged. System integrity at 84%.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-12 h-12" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs font-mono",
                stat.change.startsWith('+') ? "text-low" : "text-critical"
              )}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-wider">{stat.label}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Regional Threat Density Correlated Widget */}
      <RegionalThreatWidget />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Live Threat Velocity
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent/30 border border-accent" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-critical/30 border border-critical" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Anomaly</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#525252" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#525252" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#00ff41' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="attacks" 
                  stroke="#00ff41" 
                  fillOpacity={1} 
                  fill="url(#colorAttacks)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
            <h3 className="text-white font-medium flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-critical" />
              Recent Security Alerts
            </h3>
          </div>
          <div className="flex-1 divide-y divide-border">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[8px] font-mono px-1.5 py-0.5 rounded uppercase",
                          alert.severity === 'Critical' ? "bg-critical/20 text-critical" :
                          alert.severity === 'High' ? "bg-high/20 text-high" : "bg-medium/20 text-medium"
                        )}>
                          {alert.severity}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium line-clamp-2">{alert.message}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-zinc-600">
                <Shield className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-[10px] font-mono uppercase">No active alerts</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border text-center">
            <button className="text-[10px] font-mono text-accent hover:underline uppercase">
              View All Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
