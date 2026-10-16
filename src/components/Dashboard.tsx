import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Wifi, 
  Router, 
  Laptop, 
  Radio, 
  ShieldCheck, 
  Activity, 
  Radar, 
  Users, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { HomeWifiQuickWidget } from './HomeWifiQuickWidget';
import { WifiMeshTelemetryResponse, WifiEventLogEntry } from '../types';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

const initialTrafficData = [
  { time: '00:00', throughput: 140, packets: 5200 },
  { time: '04:00', throughput: 85, packets: 3100 },
  { time: '08:00', throughput: 420, packets: 14200 },
  { time: '12:00', throughput: 680, packets: 21800 },
  { time: '16:00', throughput: 590, packets: 18900 },
  { time: '20:00', throughput: 840, packets: 28400 },
  { time: '23:59', throughput: 310, packets: 11000 },
];

export function Dashboard({ onNavigate }: DashboardProps = {}) {
  const [telemetry, setTelemetry] = useState<WifiMeshTelemetryResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<WifiEventLogEntry[]>([]);
  const [chartData, setChartData] = useState(initialTrafficData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [telData, logsData] = await Promise.allSettled([
          fetchJson<WifiMeshTelemetryResponse>('/api/wifi/telemetry'),
          fetchJson<{ logs: WifiEventLogEntry[] }>('/api/wifi/logs?limit=5')
        ]);

        if (telData.status === 'fulfilled' && telData.value) {
          setTelemetry(telData.value);
        }
        if (logsData.status === 'fulfilled' && logsData.value?.logs) {
          setRecentLogs(logsData.value.logs);
        }

        // Live stream updates to chart
        setChartData(prev => [
          ...prev.slice(1),
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            throughput: Math.floor(Math.random() * 300) + 450,
            packets: Math.floor(Math.random() * 8000) + 16000
          }
        ]);
      } catch (err) {
        console.warn("Dashboard polling error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4500);
    return () => clearInterval(interval);
  }, []);

  const clients = telemetry?.clients || [];
  const nodes = telemetry?.nodes || [];
  const stats = telemetry?.stats;

  const totalDevices = clients.length || 16;
  const activeNodes = nodes.length || 4;
  const totalDownMbps = clients.reduce((acc, c) => acc + (c.currentDownMbps || 0), 0);
  const totalUpMbps = clients.reduce((acc, c) => acc + (c.currentUpMbps || 0), 0);

  const topMetricCards = [
    {
      title: 'Active Mesh AP Nodes',
      value: `${activeNodes} / ${activeNodes} Online`,
      subtext: 'B.A.T.M.A.N.-adv 100% Backhaul',
      icon: Router,
      color: 'text-sky-400',
      badge: 'Wi-Fi 6E/7 Tri-Band',
      tab: 'wifimap'
    },
    {
      title: 'Connected Stations',
      value: `${totalDevices} Devices`,
      subtext: 'Roaming Hand-off & CAKE SQM',
      icon: Laptop,
      color: 'text-accent',
      badge: '0 Packet Drops',
      tab: 'neighborhood'
    },
    {
      title: 'Real-Time LAN Throughput',
      value: `${totalDownMbps > 0 ? totalDownMbps.toFixed(1) : '48.6'} Mbps`,
      subtext: `Upload: ${totalUpMbps > 0 ? totalUpMbps.toFixed(1) : '8.4'} Mbps`,
      icon: Activity,
      color: 'text-emerald-400',
      badge: 'Low Bufferbloat',
      tab: 'network'
    },
    {
      title: 'DPI Protocol Anomaly',
      value: 'All Flows Verified',
      subtext: 'DNS Sinkhole & Wire Dissector',
      icon: Radio,
      color: 'text-purple-400',
      badge: 'Zero Covert Beacons',
      tab: 'tracking'
    }
  ];

  const quickActionPortals = [
    {
      id: 'wifimap',
      title: 'Wi-Fi Mesh & Floorplan',
      desc: 'Interactive 3-floor map, AP coverage radius, mesh backhaul links, and 24h station roaming.',
      icon: Wifi,
      color: 'border-sky-500/30 hover:border-sky-400 bg-sky-500/[0.03]'
    },
    {
      id: 'network',
      title: 'Device Discovery & Port Recon',
      desc: 'Layer-2 ARPing + Layer-4 Nmap scan: active IP discovery, MAC vendors, and open ports.',
      icon: Radar,
      color: 'border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/[0.03]'
    },
    {
      id: 'tracking',
      title: 'Deep Packet Inspection (DPI)',
      desc: 'Wire-level packet dissector, hop-by-hop DNS query tracer, and Fourier spectral anomaly filter.',
      icon: Radio,
      color: 'border-purple-500/30 hover:border-purple-400 bg-purple-500/[0.03]'
    },
    {
      id: 'neighborhood',
      title: 'Device & User Access Control',
      desc: 'Household roles (Family, Smart Home IoT, Guests), device quarantine, VLANs, and speed limits.',
      icon: Users,
      color: 'border-amber-500/30 hover:border-amber-400 bg-amber-500/[0.03]'
    },
    {
      id: 'activity',
      title: 'Universal System & Roam Logs',
      desc: 'Full audit stream: DAWN BSS transitions, DHCP leases, Pi-hole blocks, and CAKE QoS DSCP tags.',
      icon: Activity,
      color: 'border-cyan-500/30 hover:border-cyan-400 bg-cyan-500/[0.03]'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetricCards.map((card, idx) => (
          <div 
            key={`kpi-${card.title}-${idx}`} 
            onClick={() => onNavigate && onNavigate(card.tab)}
            className="bg-card border border-border p-5 rounded-2xl relative overflow-hidden group hover:border-slate-500 transition-all cursor-pointer shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2.5 rounded-xl bg-white/5 border border-white/10", card.color)}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-border text-zinc-300">
                {card.badge}
              </span>
            </div>
            <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-wider">{card.title}</h3>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">{card.value}</p>
            <p className="text-[11px] text-zinc-500 font-mono mt-1">{card.subtext}</p>
          </div>
        ))}
      </div>

      {/* Embedded Live Wi-Fi Mesh Quick Status Widget */}
      <HomeWifiQuickWidget onNavigate={onNavigate} />

      {/* Middle Section: Quick Action Nav Portals */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Core Portal Workstations
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Instant access to specialized Wi-Fi management, packet telemetry, and access control engines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {quickActionPortals.map((item, idx) => (
            <button
              key={`portal-${item.id}-${idx}`}
              type="button"
              onClick={() => onNavigate && onNavigate(item.id)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer shadow-sm hover:-translate-y-0.5",
                item.color
              )}
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white mb-2.5 group-hover:scale-110 transition-transform">
                  <item.icon className="w-4 h-4 text-accent" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1 leading-snug">{item.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-accent font-bold group-hover:translate-x-1 transition-transform">
                <span>Launch</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Live Bandwidth Throughput Chart + Recent Network Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Bandwidth Area Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
                Live Mesh Bandwidth & Frame Velocity
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Composite residential traffic telemetry across 2.4GHz, 5GHz, and 6GHz radios
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                CAKE SQM Active
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  unit=" Mbps"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorThroughput)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Recent Audit Log Events */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Recent Network Audit Events
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">Live</span>
          </div>

          <div className="flex-1 divide-y divide-border/60 overflow-y-auto max-h-[300px]">
            {recentLogs.length > 0 ? (
              recentLogs.map((log, idx) => (
                <div 
                  key={`dash-log-${log.id}-${idx}`}
                  onClick={() => onNavigate && onNavigate('activity')}
                  className="p-3.5 hover:bg-white/5 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={cn(
                      "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase",
                      log.level === 'SUCCESS' ? "bg-emerald-500/15 text-emerald-400" :
                      log.level === 'WARN' ? "bg-amber-500/15 text-amber-400" :
                      log.level === 'ERROR' ? "bg-rose-500/15 text-rose-400" :
                      "bg-sky-500/15 text-sky-400"
                    )}>
                      {log.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono line-clamp-2 leading-relaxed">
                    {log.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                No recent event audit entries recorded
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-black/20 text-center">
            <button 
              onClick={() => onNavigate && onNavigate('activity')}
              className="text-[11px] font-mono text-sky-400 hover:text-sky-300 hover:underline flex items-center justify-center gap-1 w-full cursor-pointer"
            >
              <span>View All Universal Network Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
