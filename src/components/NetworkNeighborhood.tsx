import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Laptop, 
  Server, 
  Smartphone, 
  Router, 
  Cpu, 
  Printer, 
  Radio, 
  Activity, 
  Globe, 
  Terminal, 
  Lock, 
  Unlock, 
  Play, 
  Eye, 
  KeyRound, 
  ArrowUpDown, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Layers,
  Sparkles,
  Wifi
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { NetworkDevice, NetworkNeighborhoodStats } from '../types';

interface NeighborhoodResponse {
  stats: NetworkNeighborhoodStats;
  devices: NetworkDevice[];
}

export function NetworkNeighborhood() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [stats, setStats] = useState<NetworkNeighborhoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'radar' | 'table'>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'workstation' | 'server' | 'gateway' | 'iot' | 'mobile'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'flagged' | 'isolated'>('all');

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Selected device for modal inspection
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Vault check result for selected device
  const [vaultCheckResult, setVaultCheckResult] = useState<any | null>(null);

  // Load network devices from API
  const loadNeighborhood = async () => {
    try {
      const data = await fetchJson<NeighborhoodResponse>('/api/network/neighborhood');
      if (data && data.devices) {
        setDevices(data.devices);
        setStats(data.stats);
      }
    } catch {
      // Silently handled by resilient API client fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNeighborhood();
    const interval = setInterval(loadNeighborhood, 6000);
    return () => clearInterval(interval);
  }, []);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        d.hostname.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.mac.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        (d.assignedUser?.name || '').toLowerCase().includes(q) ||
        (d.assignedUser?.role || '').toLowerCase().includes(q) ||
        d.os.toLowerCase().includes(q);

      const matchesType = typeFilter === 'all' || d.deviceType === typeFilter;
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [devices, searchQuery, typeFilter, statusFilter]);

  // Active Subnet Scan
  const handleScanSubnet = async () => {
    setIsScanning(true);
    setScanMessage(null);
    try {
      const res = await fetchJson<{ message: string }>('/api/network/neighborhood/scan', {
        method: 'POST'
      });
      setScanMessage(res.message);
      await loadNeighborhood();
      setTimeout(() => setScanMessage(null), 3500);
    } catch (err: any) {
      setScanMessage(`Scan error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Ping device
  const handlePingDevice = async (d: NetworkDevice) => {
    setActionLoading(true);
    try {
      const res = await fetchJson<{ message: string; latencyMs: number }>(`/api/network/neighborhood/ping/${d.id}`, {
        method: 'POST'
      });
      setActionLog(prev => [`[${new Date().toLocaleTimeString()}] PING ${d.ip}: ${res.message}`, ...prev]);
      setDevices(prev => prev.map(item => item.id === d.id ? { ...item, latencyMs: res.latencyMs } : item));
    } catch (err: any) {
      setActionLog(prev => [`[${new Date().toLocaleTimeString()}] PING ${d.ip} FAILED: ${err.message}`, ...prev]);
    } finally {
      setActionLoading(false);
    }
  };

  // Port scan device
  const handlePortScan = async (d: NetworkDevice) => {
    setActionLoading(true);
    try {
      const res = await fetchJson<{ openPorts: Array<{ port: number; status: string; service: string }> }>(`/api/network/neighborhood/portscan/${d.id}`, {
        method: 'POST'
      });
      const summary = res.openPorts.map(p => `Port ${p.port}: ${p.service}`).join(', ');
      setActionLog(prev => [
        `[${new Date().toLocaleTimeString()}] PORT SWEEP ${d.ip}: Found ${res.openPorts.length} open ports (${summary || 'None'})`,
        ...prev
      ]);
    } catch (err: any) {
      setActionLog(prev => [`[${new Date().toLocaleTimeString()}] PORT SWEEP ${d.ip} FAILED: ${err.message}`, ...prev]);
    } finally {
      setActionLoading(false);
    }
  };

  // Isolate device
  const handleIsolateDevice = async (d: NetworkDevice) => {
    setActionLoading(true);
    try {
      const res = await fetchJson<{ message: string; status: 'online' | 'flagged' | 'isolated' }>(`/api/network/neighborhood/isolate/${d.id}`, {
        method: 'POST'
      });
      setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ISOLATION TOGGLE: ${res.message}`, ...prev]);
      setDevices(prev => prev.map(item => item.id === d.id ? { ...item, status: res.status } : item));
      if (selectedDevice && selectedDevice.id === d.id) {
        setSelectedDevice(prev => prev ? { ...prev, status: res.status } : null);
      }
    } catch (err: any) {
      setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ISOLATION ERROR: ${err.message}`, ...prev]);
    } finally {
      setActionLoading(false);
    }
  };

  // Free API Vault cross-check for device
  const handleVaultCheck = async (d: NetworkDevice) => {
    setActionLoading(true);
    setVaultCheckResult(null);
    try {
      const res = await fetchJson<any>(`/api/network/neighborhood/vault-check/${d.id}`, {
        method: 'POST'
      });
      setVaultCheckResult(res);
      setActionLog(prev => [
        `[${new Date().toLocaleTimeString()}] VAULT INTEL CHECK (${d.ip}): Shodan InternetDB (${res.shodanInternetDb.verdict}), AbuseIPDB (${res.abuseIpDb.status})`,
        ...prev
      ]);
    } catch (err: any) {
      setActionLog(prev => [`[${new Date().toLocaleTimeString()}] VAULT CHECK FAILED: ${err.message}`, ...prev]);
    } finally {
      setActionLoading(false);
    }
  };

  // Device icon helper
  const getDeviceIcon = (type: NetworkDevice['deviceType']) => {
    switch (type) {
      case 'workstation': return Laptop;
      case 'server': return Server;
      case 'gateway': return Router;
      case 'mobile': return Smartphone;
      case 'iot': return Cpu;
      case 'printer': return Printer;
      default: return Laptop;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subnet Header & Real-time Discovery Telemetry */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Network Neighborhood & Subnet Radar
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 uppercase tracking-widest">
                    Omnipresent Mesh
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  Live asset discovery: monitor all connected users, peers, workstations, servers, and IoT nodes on your subnet.
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleScanSubnet}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-black text-xs font-bold font-mono hover:bg-accent/90 transition-all shadow-[0_0_15px_rgba(0,255,65,0.2)] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 fill-black", isScanning && "animate-spin")} />
              {isScanning ? 'Sweeping Subnet...' : 'Scan Subnet (ARP/mDNS)'}
            </button>
          </div>
        </div>

        {scanMessage && (
          <div className="mt-4 p-2.5 rounded-lg bg-accent/10 border border-accent/30 text-xs font-mono text-accent flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{scanMessage}</span>
          </div>
        )}

        {/* HUD Subnet Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-border">
          <div className="bg-black/30 border border-border/60 rounded-lg p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Local Subnet</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block truncate">
              {stats?.subnet.split(' ')[0] || '192.168.1.0/24'}
            </span>
          </div>

          <div className="bg-black/30 border border-border/60 rounded-lg p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Gateway Router</span>
            <span className="text-sm font-bold text-accent font-mono mt-0.5 block">{stats?.gatewayIp || '192.168.1.1'}</span>
          </div>

          <div className="bg-black/30 border border-border/60 rounded-lg p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Total Discovered</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">{stats?.totalDevices || devices.length} Nodes</span>
          </div>

          <div className="bg-black/30 border border-border/60 rounded-lg p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Identified Users</span>
            <span className="text-lg font-bold text-sky-400 font-mono mt-0.5 block">{stats?.activeUsers || 8} Peers</span>
          </div>

          <div className="bg-black/30 border border-border/60 rounded-lg p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Flagged / Rogue</span>
            <span className={cn(
              "text-lg font-bold font-mono mt-0.5 block",
              (stats?.flaggedDevices || 0) > 0 ? "text-critical" : "text-zinc-400"
            )}>
              {stats?.flaggedDevices || 1} Alert
            </span>
          </div>

          <div className="bg-black/30 border border-border/60 rounded-lg p-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Subnet Traffic</span>
            <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{stats?.totalBandwidthMb || 1080} Mb/s</span>
          </div>
        </div>
      </div>

      {/* Filter and View Modes Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/60 border border-border p-3.5 rounded-xl">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by user, IP, hostname, MAC, or OS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-between sm:justify-end">
          {/* Device Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-black/50 border border-border text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent font-mono"
          >
            <option value="all">All Device Types</option>
            <option value="workstation">Workstations</option>
            <option value="server">Servers & Daemons</option>
            <option value="gateway">Core Gateway</option>
            <option value="mobile">Mobile Devices</option>
            <option value="iot">IoT & Sensors</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black/50 border border-border text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="flagged">Flagged / Suspicious</option>
            <option value="isolated">Isolated</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border p-0.5 bg-black/40">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-colors",
                viewMode === 'grid' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Grid ({filteredDevices.length})
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-colors",
                viewMode === 'radar' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Topology Radar
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-colors",
                viewMode === 'table' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: RADAR & SUBNET CONCENTRIC TOPOLOGY */}
      {/* ======================================================== */}
      {viewMode === 'radar' && (
        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent animate-pulse" />
                Subnet Asset Mesh & Concentric Radar Sweep
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Gateway 192.168.1.1 at hub, surrounding workstations and servers synchronized in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> You (Bhargav)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Peers</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-critical" /> Rogue / Flagged</span>
            </div>
          </div>

          {/* Visual Canvas Layout */}
          <div className="relative h-[480px] w-full rounded-xl bg-black/60 border border-border/80 flex items-center justify-center overflow-hidden">
            {/* Concentric Radar Rings */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-accent/20" />
            <div className="absolute w-[320px] h-[320px] rounded-full border border-border" />
            <div className="absolute w-[440px] h-[440px] rounded-full border border-border/60" />
            <div className="absolute w-full h-[1px] bg-border/40" />
            <div className="absolute h-full w-[1px] bg-border/40" />

            {/* Radar Beam Sweep */}
            <div className="absolute inset-0 pointer-events-none origin-center animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,255,65,0.12)_0deg,transparent_60deg,transparent_360deg)]" />

            {/* Center: Core Gateway */}
            <div 
              onClick={() => setSelectedDevice(devices.find(d => d.deviceType === 'gateway') || devices[0])}
              className="absolute z-20 flex flex-col items-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.4)] group-hover:scale-110 transition-transform">
                <Router className="w-6 h-6 text-accent" />
              </div>
              <span className="text-[10px] font-mono font-bold text-white bg-black/80 px-2 py-0.5 rounded border border-border mt-1">
                Gateway (192.168.1.1)
              </span>
            </div>

            {/* Surrounding Nodes on Circles */}
            {devices.filter(d => d.deviceType !== 'gateway').map((node, i) => {
              const total = devices.length - 1;
              const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
              const radius = node.assignedUser?.isCurrentUser ? 90 : (i % 2 === 0 ? 160 : 210);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              const isUser = Boolean(node.assignedUser?.isCurrentUser);
              const isFlagged = node.status === 'flagged';
              const isIsolated = node.status === 'isolated';

              const Icon = getDeviceIcon(node.deviceType);

              return (
                <div
                  key={`neighborhood-node-${node.id}-${i}`}
                  onClick={() => setSelectedDevice(node)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute z-20 flex flex-col items-center cursor-pointer group"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all group-hover:scale-125 border",
                    isUser ? "bg-accent/30 border-accent shadow-[0_0_15px_rgba(0,255,65,0.5)]" :
                    isFlagged ? "bg-critical/30 border-critical shadow-[0_0_15px_rgba(255,0,51,0.5)] animate-bounce" :
                    isIsolated ? "bg-zinc-800 border-zinc-600 opacity-60" :
                    "bg-card/90 border-zinc-500 hover:border-white"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      isUser ? "text-accent" : isFlagged ? "text-critical" : "text-zinc-200"
                    )} />
                  </div>

                  <div className="bg-black/90 px-1.5 py-0.5 rounded border border-border/80 mt-1 text-center whitespace-nowrap shadow-md pointer-events-none">
                    <span className={cn(
                      "text-[9px] font-mono block font-bold",
                      isUser ? "text-accent" : isFlagged ? "text-critical" : "text-white"
                    )}>
                      {isUser ? 'Bhargav (You)' : node.assignedUser?.name || node.hostname}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 block">
                      {node.ip}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: DEVICE & USER CARDS GRID */}
      {/* ======================================================== */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((dev, idx) => {
            const Icon = getDeviceIcon(dev.deviceType);
            const isUser = Boolean(dev.assignedUser?.isCurrentUser);
            const isFlagged = dev.status === 'flagged';
            const isIsolated = dev.status === 'isolated';

            return (
              <div
                key={`neighborhood-dev-card-${dev.id}-${idx}`}
                className={cn(
                  "bg-card border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:border-zinc-500 relative overflow-hidden group",
                  isUser ? "border-accent/40 bg-accent/[0.02]" :
                  isFlagged ? "border-critical/40 bg-critical/[0.02]" :
                  "border-border"
                )}
              >
                <div>
                  {/* Top: Device Icon, User Name, and Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                        isUser ? "bg-accent/20 border-accent/40 text-accent" :
                        isFlagged ? "bg-critical/20 border-critical/40 text-critical" :
                        "bg-white/5 border-border text-zinc-300"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-bold text-white truncate">
                            {dev.assignedUser?.name || dev.hostname}
                          </h4>
                          {isUser && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent/20 text-accent border border-accent/40 font-bold uppercase">
                              YOU (Architect)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 truncate">
                          {dev.assignedUser?.role || dev.vendor}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 font-bold uppercase",
                      dev.status === 'online' ? "bg-accent/10 border-accent/30 text-accent" :
                      dev.status === 'flagged' ? "bg-critical/10 border-critical/30 text-critical animate-pulse" :
                      dev.status === 'isolated' ? "bg-zinc-800 border-zinc-600 text-zinc-400" :
                      "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    )}>
                      {dev.status}
                    </span>
                  </div>

                  {/* Hostname & Network Address Identifiers */}
                  <div className="bg-black/40 border border-border/80 rounded-lg p-2.5 mb-3 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Hostname:</span>
                      <span className="text-zinc-200 truncate max-w-[170px]">{dev.hostname}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">IP Address:</span>
                      <span className="text-accent font-bold">{dev.ip}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">MAC / OUI:</span>
                      <span className="text-zinc-400 truncate max-w-[170px]">{dev.mac} ({dev.vendor.split(' ')[0]})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">OS:</span>
                      <span className="text-zinc-300 truncate max-w-[170px]">{dev.os}</span>
                    </div>
                  </div>

                  {/* Open Ports & Latency */}
                  <div className="flex items-center justify-between text-[11px] font-mono mb-3">
                    <span className="text-zinc-500">
                      Ping: <strong className="text-zinc-200">{dev.latencyMs}ms</strong>
                    </span>
                    <span className="text-zinc-500">
                      Bandwidth: <strong className="text-emerald-400">{dev.bandwidthInMb} In / {dev.bandwidthOutMb} Out</strong>
                    </span>
                  </div>

                  {/* Open Ports Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    <span className="text-[10px] font-mono text-zinc-500">Open Ports:</span>
                    {dev.openPorts.length > 0 ? (
                      dev.openPorts.slice(0, 4).map((port, pIdx) => (
                        <span key={`nb-port-${port}-${pIdx}`} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-300">
                          {port}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-600">None detected</span>
                    )}
                    {dev.openPorts.length > 4 && (
                      <span className="text-[10px] font-mono text-zinc-500">+{dev.openPorts.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePingDevice(dev)}
                      title="Ping Host (ICMP)"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-border transition-colors cursor-pointer"
                    >
                      <Wifi className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePortScan(dev)}
                      title="Port Sweep"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-border transition-colors cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDevice(dev);
                        handleVaultCheck(dev);
                      }}
                      title="Free API Vault Threat Check (Shodan/AbuseIPDB)"
                      className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleIsolateDevice(dev)}
                      className={cn(
                        "text-[10px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer",
                        isIsolated
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-critical/10 border-critical/30 text-critical hover:bg-critical/20"
                      )}
                    >
                      {isIsolated ? 'Restore' : 'Isolate'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDevice(dev);
                        handleVaultCheck(dev);
                      }}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-border transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: TABULAR VIEW */}
      {/* ======================================================== */}
      {viewMode === 'table' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/50 text-zinc-400 border-b border-border uppercase text-[10px]">
              <tr>
                <th className="p-3">User & Node</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">MAC / Vendor</th>
                <th className="p-3">Device & OS</th>
                <th className="p-3">Status</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Open Ports</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDevices.map((dev, idx) => (
                <tr key={`nb-table-${dev.id}-${idx}`} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <span>{dev.assignedUser?.name || dev.hostname}</span>
                      {dev.assignedUser?.isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-accent/20 text-accent border border-accent/40">YOU</span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 block font-normal">{dev.assignedUser?.role}</span>
                  </td>
                  <td className="p-3 text-accent font-bold">{dev.ip}</td>
                  <td className="p-3 text-zinc-300">{dev.mac} <span className="text-zinc-500">({dev.vendor.split(' ')[0]})</span></td>
                  <td className="p-3 text-zinc-300">{dev.os}</td>
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                      dev.status === 'online' ? "bg-accent/10 text-accent" :
                      dev.status === 'flagged' ? "bg-critical/10 text-critical" : "bg-zinc-800 text-zinc-400"
                    )}>
                      {dev.status}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-300">{dev.latencyMs}ms</td>
                  <td className="p-3 text-zinc-400">{dev.openPorts.join(', ') || 'None'}</td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => handlePingDevice(dev)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px]"
                    >
                      Ping
                    </button>
                    <button
                      onClick={() => { setSelectedDevice(dev); handleVaultCheck(dev); }}
                      className="px-2 py-1 rounded bg-accent/20 text-accent text-[10px] font-bold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* INSPECTION DRAWER / MODAL WITH LIVE LOG & VAULT RESULTS */}
      {/* ======================================================== */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedDevice.assignedUser?.name || selectedDevice.hostname}
                    {selectedDevice.assignedUser?.isCurrentUser && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/40">YOU</span>
                    )}
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedDevice.ip} • {selectedDevice.mac} • {selectedDevice.vendor}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setSelectedDevice(null); setVaultCheckResult(null); }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePingDevice(selectedDevice)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-border cursor-pointer"
              >
                <Wifi className="w-3.5 h-3.5 text-accent" />
                ICMP Ping Test
              </button>

              <button
                onClick={() => handlePortScan(selectedDevice)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-border cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Port Sweep (1,000 Ports)
              </button>

              <button
                onClick={() => handleVaultCheck(selectedDevice)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-xs font-mono border border-accent/30 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Cross-Check Free API Vault
              </button>

              <button
                onClick={() => handleIsolateDevice(selectedDevice)}
                disabled={actionLoading}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border cursor-pointer ml-auto",
                  selectedDevice.status === 'isolated'
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-critical/10 border-critical/30 text-critical hover:bg-critical/20"
                )}
              >
                {selectedDevice.status === 'isolated' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {selectedDevice.status === 'isolated' ? 'Restore Subnet Access' : 'Quarantine Host'}
              </button>
            </div>

            {/* Free API Vault Cross-check Section */}
            {vaultCheckResult && (
              <div className="bg-black/50 border border-border rounded-lg p-4 space-y-3 font-mono text-xs">
                <span className="text-[10px] text-accent uppercase font-bold tracking-wider block">
                  Free API Vault Threat Intelligence Evaluation:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-black/40 border border-border/60 rounded p-2.5">
                    <span className="text-zinc-500 text-[10px] block">Shodan InternetDB Scan:</span>
                    <span className="text-white font-bold">{vaultCheckResult.shodanInternetDb.verdict}</span>
                    <span className="text-zinc-400 text-[10px] block mt-1">
                      CVEs: {vaultCheckResult.shodanInternetDb.cves.length > 0 ? vaultCheckResult.shodanInternetDb.cves.join(', ') : 'None detected'}
                    </span>
                  </div>

                  <div className="bg-black/40 border border-border/60 rounded p-2.5">
                    <span className="text-zinc-500 text-[10px] block">AbuseIPDB Verified Reports:</span>
                    <span className="text-white font-bold">{vaultCheckResult.abuseIpDb.status}</span>
                    <span className="text-zinc-400 text-[10px] block mt-1">
                      Abuse Confidence: {vaultCheckResult.abuseIpDb.abuseConfidenceScore}%
                    </span>
                  </div>
                </div>
                <p className="text-zinc-300 text-[11px] pt-1">
                  <strong>Recommendation:</strong> {vaultCheckResult.recommendation}
                </p>
              </div>
            )}

            {/* Live Terminal Diagnostics Log */}
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                Host Activity & Diagnostics Terminal:
              </span>
              <div className="bg-black/70 border border-border rounded-lg p-3 h-40 overflow-y-auto font-mono text-xs text-zinc-300 space-y-1">
                {actionLog.length === 0 ? (
                  <p className="text-zinc-500 italic">No actions executed yet. Click Ping, Port Sweep, or Vault Check above.</p>
                ) : (
                  actionLog.map((log, idx) => (
                    <p key={idx} className="leading-tight">{log}</p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
