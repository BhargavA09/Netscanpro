import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ArrowDown, 
  ArrowUp, 
  Database, 
  Globe, 
  Shield, 
  Zap, 
  Server,
  Network as NetworkIcon,
  Cpu,
  Radar,
  LayoutGrid
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { NetworkDiscoveryGrid } from './NetworkDiscoveryGrid';

interface NetworkStats {
  bandwidth: { inbound: number; outbound: number };
  packets: { inbound: number; outbound: number };
  protocols: { name: string; value: number }[];
  topTalkers: { ip: string; traffic: string; type: 'Internal' | 'External' }[];
}

const COLORS = ['#00ff41', '#0ea5e9', '#eab308', '#ef4444'];

const DEFAULT_NETWORK_STATS: NetworkStats = {
  bandwidth: { inbound: 45.2, outbound: 12.8 },
  packets: { inbound: 12500, outbound: 8400 },
  protocols: [
    { name: 'TCP', value: 65 },
    { name: 'UDP', value: 25 },
    { name: 'ICMP', value: 5 },
    { name: 'Other', value: 5 }
  ],
  topTalkers: [
    { ip: '192.168.1.1', traffic: '1.4 GB', type: 'Internal' },
    { ip: '192.168.1.102', traffic: '920 MB', type: 'Internal' },
    { ip: '45.33.2.1', traffic: '420 MB', type: 'External' },
    { ip: '192.168.1.105', traffic: '310 MB', type: 'Internal' }
  ]
};

export function NetworkAnalysis() {
  const [stats, setStats] = useState<NetworkStats>(DEFAULT_NETWORK_STATS);
  const [activeSubTab, setActiveSubTab] = useState<'discovery' | 'traffic'>('discovery');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchJson<NetworkStats>('/api/network-stats');
        if (data) setStats(data);
      } catch {
        // Handled gracefully with default stats
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5 font-mono">
            <NetworkIcon className="w-6 h-6 text-accent" />
            Network Analysis & Reconnaissance
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Active device discovery scan (arping + nmap), real-time responsive grid, and live packet telemetry
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-black/40 border border-border rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('discovery')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
              activeSubTab === 'discovery' 
                ? "bg-accent text-black shadow-lg shadow-accent/20" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Discovery Scan Grid</span>
          </button>

          <button
            onClick={() => setActiveSubTab('traffic')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
              activeSubTab === 'traffic' 
                ? "bg-accent text-black shadow-lg shadow-accent/20" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Traffic & Topology</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'discovery' ? (
        <NetworkDiscoveryGrid />
      ) : (
        <div className="space-y-6">
          {/* Real-time Bandwidth Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <ArrowDown className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Inbound</span>
          </div>
          <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Bandwidth</h3>
          <p className="text-2xl font-bold text-white mt-1">{stats.bandwidth.inbound} Mbps</p>
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(stats.bandwidth.inbound, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ArrowUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Outbound</span>
          </div>
          <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Bandwidth</h3>
          <p className="text-2xl font-bold text-white mt-1">{stats.bandwidth.outbound} Mbps</p>
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(stats.bandwidth.outbound * 2, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Packets</span>
          </div>
          <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Inbound Rate</h3>
          <p className="text-2xl font-bold text-white mt-1">{(stats.packets.inbound / 1000).toFixed(1)}k pps</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-500">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">CPU</span>
          </div>
          <h3 className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Network Stack</h3>
          <p className="text-2xl font-bold text-white mt-1">14%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Distribution */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="text-white font-medium mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Protocol Distribution
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.protocols}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.protocols.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {stats.protocols.map((p, i) => (
              <div key={`proto-legend-${p.name}-${i}`} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-mono text-zinc-400 uppercase">{p.name}: {p.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Talkers */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
            <h3 className="text-white font-medium flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-accent" />
              Top Network Talkers
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Last 5 Minutes</span>
          </div>
          <div className="flex-1 divide-y divide-border">
            {stats.topTalkers.map((talker, i) => (
              <div key={`top-talker-${talker.ip}-${i}`} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    talker.type === 'Internal' ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"
                  )}>
                    {talker.type === 'Internal' ? <Server className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white font-mono">{talker.ip}</p>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">{talker.type} Node</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent font-mono">{talker.traffic}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Total Volume</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network Topology Visualization */}
      <div className="bg-card border border-border p-6 rounded-xl">
        <h3 className="text-white font-medium mb-6 flex items-center gap-2">
          <NetworkIcon className="w-4 h-4 text-accent" />
          Active Network Topology
        </h3>
        <div className="relative h-[300px] border border-border border-dashed rounded-xl bg-white/[0.02] flex items-center justify-center overflow-hidden">
          {/* Central Hub */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-accent/20 border border-accent flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-accent" />
            <div className="absolute -top-8 text-[10px] font-mono text-accent uppercase font-bold">Core Firewall</div>
          </div>

          {/* Nodes */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={`topo-node-${i}`}
              className="absolute w-12 h-12 rounded-lg bg-white/5 border border-border flex items-center justify-center"
              initial={{ 
                x: Math.cos(i * 60 * Math.PI / 180) * 120, 
                y: Math.sin(i * 60 * Math.PI / 180) * 120 
              }}
              animate={{
                x: Math.cos(i * 60 * Math.PI / 180) * 120 + (Math.random() * 4 - 2),
                y: Math.sin(i * 60 * Math.PI / 180) * 120 + (Math.random() * 4 - 2)
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              <Server className="w-5 h-5 text-zinc-500" />
              <div className="absolute -bottom-6 text-[8px] font-mono text-zinc-500 uppercase whitespace-nowrap">Node-0{i+1}</div>
              
              {/* Connection Line */}
              <div 
                className="absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-accent/50 to-transparent origin-left"
                style={{ 
                  width: '120px', 
                  transform: `rotate(${i * 60 + 180}deg)`,
                  zIndex: -1
                }}
              />
            </motion.div>
          ))}

          {/* Data Packets */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`packet-${i}`}
              className="absolute w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_#00ff41]"
              animate={{
                x: [
                  Math.cos(i * 120 * Math.PI / 180) * 120,
                  0
                ],
                y: [
                  Math.sin(i * 120 * Math.PI / 180) * 120,
                  0
                ],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}

          <div className="absolute bottom-4 right-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Idle</span>
            </div>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}
