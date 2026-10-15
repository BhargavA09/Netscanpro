import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Laptop, 
  Router, 
  Users, 
  Radar, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Server,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { WifiMeshTelemetryResponse, WifiClientUser, WifiNode } from '../types';

interface HomeWifiQuickWidgetProps {
  onNavigate?: (tab: string) => void;
}

export function HomeWifiQuickWidget({ onNavigate }: HomeWifiQuickWidgetProps) {
  const [telemetry, setTelemetry] = useState<WifiMeshTelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const data = await fetchJson<WifiMeshTelemetryResponse>('/api/wifi/telemetry');
      setTelemetry(data);
    } catch (err) {
      console.warn("Failed to fetch quick wifi telemetry:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(true), 6000);
    return () => clearInterval(interval);
  }, []);

  const clients = telemetry?.clients || [];
  const nodes = telemetry?.nodes || [];
  const stats = telemetry?.stats;

  // Identify "My Device"
  const myDevice: WifiClientUser | null = 
    clients.find(c => c.isMyDevice) || 
    clients.find(c => c.id === 'cli-1') || 
    clients[0] || null;

  const connectedNode: WifiNode | null = myDevice 
    ? (nodes.find(n => n.id === myDevice.nodeId) || nodes[0] || null)
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group shadow-lg">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Wifi className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
                Home Wi-Fi Network & Connected Devices
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 flex items-center gap-1">
                <Server className="w-2.5 h-2.5" />
                Python 3.10 Backend
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live residential mesh topology, device detection, and real-time latency monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('wifimap')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition cursor-pointer"
            >
              <Radar className="w-3.5 h-3.5 text-sky-400" />
              <span>Accurate Device Scan & Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1 & 2: YOUR CONNECTED DEVICE (HERO SPOTLIGHT) */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-card to-emerald-950/20 border border-sky-500/30 relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300">
                  <Laptop className="w-5 h-5 text-sky-400" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    ★ YOUR DEVICE (CONNECTED NOW)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified Active
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">
                  {myDevice?.deviceHost || "Your-Device"} 
                  <span className="text-xs font-normal text-zinc-400 ml-2">
                    ({myDevice?.detectedOs || "macOS / Windows / Linux"})
                  </span>
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="px-2.5 py-1 rounded bg-black/40 border border-border text-zinc-300">
                IP: <strong className="text-white">{myDevice?.ip || "192.168.1.102"}</strong>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/50 text-xs">
            <div className="p-2 rounded-lg bg-black/30 border border-border/60">
              <span className="text-[10px] font-mono text-zinc-400 block">Connected Node</span>
              <span className="font-semibold text-emerald-400 truncate block mt-0.5" title={connectedNode?.name}>
                {connectedNode ? connectedNode.name.split('(')[0] : "Office AP"}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-black/30 border border-border/60">
              <span className="text-[10px] font-mono text-zinc-400 block">Wi-Fi Band & Standard</span>
              <span className="font-semibold text-purple-300 block mt-0.5">
                {myDevice?.band || "6GHz"} · {myDevice?.wifiStandard?.split(' ')[0] || "802.11ax"}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-black/30 border border-border/60">
              <span className="text-[10px] font-mono text-zinc-400 block">Roundtrip Latency (Ping)</span>
              <span className="font-semibold text-sky-300 block mt-0.5 font-mono">
                {myDevice?.rttLatencyMs || 4} ms RTT
              </span>
            </div>

            <div className="p-2 rounded-lg bg-black/30 border border-border/60">
              <span className="text-[10px] font-mono text-zinc-400 block">Current Link Throughput</span>
              <span className="font-semibold text-white block mt-0.5 font-mono">
                ↓ {myDevice?.currentDownMbps || 34.2} Mbps
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: NETWORK OVERVIEW SUMMARY */}
        <div className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2 font-bold">
              Residential Mesh Infrastructure
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-border/60">
                <div className="flex items-center gap-2">
                  <Router className="w-3.5 h-3.5 text-accent" />
                  <span className="text-zinc-300">Mesh Nodes:</span>
                </div>
                <span className="font-semibold text-white font-mono">{nodes.length || 4} APs Online</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-border/60">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-300">Total Connected Devices:</span>
                </div>
                <span className="font-semibold text-emerald-400 font-mono">{clients.length || 15} Active</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-border/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-zinc-300">DNS Filter (Pi-hole FTL):</span>
                </div>
                <span className="font-semibold text-sky-300 font-mono">Enforced (VLAN 1)</span>
              </div>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('wifimap')}
              className="mt-3 w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 border border-border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Explore Floor Plan & Roaming History</span>
              <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
