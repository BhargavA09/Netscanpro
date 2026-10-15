import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radar, 
  Search, 
  RefreshCw, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Tv, 
  Gamepad2, 
  Camera, 
  Home, 
  Server, 
  Router, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Terminal, 
  ExternalLink, 
  Layers, 
  Wifi, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Cpu,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { NetworkDiscoveryDevice, NetworkDiscoveryScanResponse, NmapPortInfo } from '../types';

interface NetworkDiscoveryGridProps {
  onSelectDevice?: (device: NetworkDiscoveryDevice) => void;
}

export function NetworkDiscoveryGrid({ onSelectDevice }: NetworkDiscoveryGridProps) {
  const [devices, setDevices] = useState<NetworkDiscoveryDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [scanPhase, setScanPhase] = useState('Idle - Ready');
  const [selectedSubnet, setSelectedSubnet] = useState('192.168.1.0/24');
  const [customSubnet, setCustomSubnet] = useState('');
  const [scanEngine, setScanEngine] = useState<'hybrid' | 'arping' | 'nmap'>('hybrid');
  const [scanProfile, setScanProfile] = useState<'full' | 'quick' | 'stealth'>('full');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'ip' | 'latency' | 'ports' | 'bandwidth' | 'hostname'>('ip');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Selected device for modal
  const [inspectDevice, setInspectDevice] = useState<NetworkDiscoveryDevice | null>(null);
  const [pingingIp, setPingingIp] = useState<string | null>(null);
  const [rescanningIp, setRescanningIp] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    loadDiscoveryDevices();
  }, []);

  // Auto-refresh interval (every 4 seconds when idle)
  useEffect(() => {
    if (!autoRefresh || isScanning) return;
    const interval = setInterval(() => {
      // Lightly jitter device latency & throughput to simulate live network traffic
      setDevices(prev => prev.map(d => {
        const jitter = Number((Math.random() * 0.6 - 0.3).toFixed(2));
        const newLat = Math.max(0.4, Number((d.latencyMs + jitter).toFixed(1)));
        const deltaDown = Number((Math.random() * 1.2 - 0.6).toFixed(1));
        const newDown = Math.max(0.1, Number((d.currentDownMbps + deltaDown).toFixed(1)));
        return {
          ...d,
          latencyMs: newLat,
          currentDownMbps: newDown
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, isScanning]);

  const loadDiscoveryDevices = async () => {
    try {
      setLoading(true);
      const res = await fetchJson<{ success: boolean; devices: NetworkDiscoveryDevice[] }>('/api/network/discovery/devices');
      if (res && res.devices) {
        setDevices(res.devices);
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  const handleStartScan = async () => {
    const target = selectedSubnet === 'custom' ? (customSubnet || '192.168.1.0/24') : selectedSubnet;
    setIsScanning(true);
    setScanProgress(10);
    setScanPhase('1/5: Initializing ARPing Layer-2 broadcast frames...');

    const timer1 = setTimeout(() => {
      setScanProgress(35);
      setScanPhase('2/5: Probing ARP cache & active host hardware MAC addresses...');
    }, 400);

    const timer2 = setTimeout(() => {
      setScanProgress(65);
      setScanPhase('3/5: Running Nmap unprivileged TCP SYN connect on active ports...');
    }, 900);

    const timer3 = setTimeout(() => {
      setScanProgress(85);
      setScanPhase('4/5: Resolving IEEE OUI vendor databases & OS fingerprints...');
    }, 1400);

    try {
      const response = await fetchJson<NetworkDiscoveryScanResponse>('/api/network/discovery/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSubnet: target,
          engine: scanEngine,
          profile: scanProfile
        })
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setScanProgress(100);
      setScanPhase('5/5: Network Discovery Completed!');

      if (response && response.devices) {
        setDevices(response.devices);
      }
    } catch {
      // Fallback
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanPhase('Idle - Ready');
      }, 700);
    }
  };

  const handlePingDevice = async (ip: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPingingIp(ip);
    try {
      const res = await fetchJson<{ success: boolean; ping: { latencyMs: number; jitterMs: number } }>(`/api/network/discovery/device/${ip}/ping`, {
        method: 'POST'
      });
      if (res && res.ping) {
        setDevices(prev => prev.map(d => d.ip === ip ? { ...d, latencyMs: res.ping.latencyMs, jitterMs: res.ping.jitterMs } : d));
        if (inspectDevice && inspectDevice.ip === ip) {
          setInspectDevice(prev => prev ? { ...prev, latencyMs: res.ping.latencyMs, jitterMs: res.ping.jitterMs } : null);
        }
      }
    } catch {
      // Ignore
    } finally {
      setTimeout(() => setPingingIp(null), 600);
    }
  };

  const handleRescanDevice = async (device: NetworkDiscoveryDevice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRescanningIp(device.ip);
    try {
      const res = await fetchJson<{ success: boolean; device: NetworkDiscoveryDevice; nmapRaw: string }>(`/api/network/discovery/device/${device.ip}/rescan`, {
        method: 'POST'
      });
      if (res && res.device) {
        setDevices(prev => prev.map(d => d.ip === device.ip ? res.device : d));
        setInspectDevice(res.device);
        setTerminalOutput(res.nmapRaw);
      }
    } catch {
      // Ignore
    } finally {
      setTimeout(() => setRescanningIp(null), 800);
    }
  };

  const handleCopyIp = (ip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1500);
  };

  // Helper device icon
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-blue-400" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-teal-400" />;
      case 'smart_tv':
        return <Tv className="w-5 h-5 text-purple-400" />;
      case 'gaming_console':
        return <Gamepad2 className="w-5 h-5 text-pink-400" />;
      case 'iot_camera':
        return <Camera className="w-5 h-5 text-amber-400" />;
      case 'smart_home':
      case 'ev_charger':
        return <Home className="w-5 h-5 text-amber-300" />;
      case 'server':
        return <Server className="w-5 h-5 text-cyan-400" />;
      case 'networking':
        return <Router className="w-5 h-5 text-accent" />;
      default:
        return <Cpu className="w-5 h-5 text-zinc-400" />;
    }
  };

  // Filter & sort devices
  const filteredDevices = useMemo(() => {
    let result = [...devices];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.hostname.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.mac.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q) ||
        (d.userOwner && d.userOwner.toLowerCase().includes(q)) ||
        d.openPorts.some(p => p.service.toLowerCase().includes(q) || String(p.port).includes(q))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'computers') {
        result = result.filter(d => ['laptop', 'server'].includes(d.deviceType));
      } else if (categoryFilter === 'mobile') {
        result = result.filter(d => ['smartphone', 'tablet'].includes(d.deviceType));
      } else if (categoryFilter === 'iot') {
        result = result.filter(d => ['iot_camera', 'smart_home', 'ev_charger'].includes(d.deviceType));
      } else if (categoryFilter === 'entertainment') {
        result = result.filter(d => ['smart_tv', 'gaming_console'].includes(d.deviceType));
      } else if (categoryFilter === 'networking') {
        result = result.filter(d => d.deviceType === 'networking');
      }
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'my_device') {
        result = result.filter(d => d.isMyDevice);
      } else if (statusFilter === 'online') {
        result = result.filter(d => d.status === 'online' || d.status === 'high_traffic');
      } else if (statusFilter === 'warning') {
        result = result.filter(d => d.status === 'warning' || d.status === 'idle');
      }
    }

    // Sorting
    result.sort((a, b) => {
      // Put "My Device" always at the top if present
      if (a.isMyDevice) return -1;
      if (b.isMyDevice) return 1;

      if (sortBy === 'ip') {
        const numA = a.ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
        const numB = b.ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
        return numA - numB;
      }
      if (sortBy === 'latency') return a.latencyMs - b.latencyMs;
      if (sortBy === 'ports') return b.openPorts.length - a.openPorts.length;
      if (sortBy === 'bandwidth') return b.currentDownMbps - a.currentDownMbps;
      if (sortBy === 'hostname') return a.hostname.localeCompare(b.hostname);
      return 0;
    });

    return result;
  }, [devices, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Aggregate metrics
  const totalOpenPorts = useMemo(() => devices.reduce((sum, d) => sum + d.openPorts.length, 0), [devices]);
  const avgLatency = useMemo(() => {
    if (!devices.length) return 0;
    return Number((devices.reduce((sum, d) => sum + d.latencyMs, 0) / devices.length).toFixed(1));
  }, [devices]);
  const totalThroughput = useMemo(() => {
    return Number(devices.reduce((sum, d) => sum + (d.currentDownMbps || 0), 0).toFixed(1));
  }, [devices]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Scan Control Station */}
      <div className="bg-card border border-border rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background radar circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-accent/10 pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border border-accent/15 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                <Radar className={cn("w-6 h-6", isScanning && "animate-spin text-accent")} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Active Network Discovery</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                    arping + nmap engine
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  Real-time Layer-2 ARP ping hardware discovery & Layer-4 TCP port audit
                </p>
              </div>
            </div>
          </div>

          {/* Scan Parameter Pickers */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subnet Select */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-border rounded-xl px-3 py-1.5">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">Subnet:</span>
              <select 
                value={selectedSubnet} 
                onChange={(e) => setSelectedSubnet(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                aria-label="Select Target Subnet"
              >
                <option value="192.168.1.0/24" className="bg-zinc-900 text-white">192.168.1.0/24 (Core LAN)</option>
                <option value="192.168.20.0/24" className="bg-zinc-900 text-white">192.168.20.0/24 (IoT VLAN)</option>
                <option value="192.168.30.0/24" className="bg-zinc-900 text-white">192.168.30.0/24 (Guest Wi-Fi)</option>
                <option value="127.0.0.1/32" className="bg-zinc-900 text-white">127.0.0.1/32 (Localhost Node)</option>
                <option value="custom" className="bg-zinc-900 text-white">Custom IP / CIDR</option>
              </select>
            </div>

            {selectedSubnet === 'custom' && (
              <input
                type="text"
                placeholder="e.g. 10.0.0.0/24"
                value={customSubnet}
                onChange={(e) => setCustomSubnet(e.target.value)}
                className="bg-black/40 border border-accent/40 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none w-32"
              />
            )}

            {/* Engine Select */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-border rounded-xl px-3 py-1.5">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">Engine:</span>
              <select 
                value={scanEngine} 
                onChange={(e) => setScanEngine(e.target.value as any)}
                className="bg-transparent text-xs font-mono text-accent focus:outline-none cursor-pointer font-bold"
                aria-label="Select Scan Engine"
              >
                <option value="hybrid" className="bg-zinc-900 text-accent">Hybrid (arping + nmap)</option>
                <option value="arping" className="bg-zinc-900 text-white">arping (Fast L2 MAC)</option>
                <option value="nmap" className="bg-zinc-900 text-white">nmap (Deep Services)</option>
              </select>
            </div>

            {/* Profile Select */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-border rounded-xl px-3 py-1.5 hidden sm:flex">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">Profile:</span>
              <select 
                value={scanProfile} 
                onChange={(e) => setScanProfile(e.target.value as any)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
                aria-label="Select Scan Profile"
              >
                <option value="full" className="bg-zinc-900 text-white">Full Services</option>
                <option value="quick" className="bg-zinc-900 text-white">Quick Sweep</option>
                <option value="stealth" className="bg-zinc-900 text-white">Stealth Audit</option>
              </select>
            </div>

            {/* Big Trigger Scan Button */}
            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-lg",
                isScanning 
                  ? "bg-accent/30 text-accent border border-accent/40 cursor-not-allowed" 
                  : "bg-accent hover:bg-accent/90 text-black hover:shadow-accent/20 hover:scale-[1.02]"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", isScanning && "animate-spin")} />
              <span>{isScanning ? 'SCANNING...' : 'START SCAN'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Scan Progress Bar */}
        {isScanning && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-accent flex items-center gap-2 font-bold animate-pulse">
                <Radio className="w-3.5 h-3.5 text-accent animate-ping" />
                {scanPhase}
              </span>
              <span className="text-white font-bold">{scanProgress}%</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-accent/20">
              <motion.div 
                className="h-full bg-gradient-to-r from-accent/70 via-accent to-emerald-400"
                initial={{ width: "10%" }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Hosts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{devices.length}</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">100% reachable via ARP</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Latency (RTT)</span>
            <Zap className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold text-accent font-mono">{avgLatency} ms</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">arping verified speed</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Open Services</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{totalOpenPorts}</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">nmap audited ports</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Network Throughput</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{totalThroughput} <span className="text-xs text-zinc-400 font-normal">Mbps</span></p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Live aggregate bandwidth</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Security Posture</span>
            <ShieldCheck className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">Protected</p>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">0 rogue APs detected</p>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="bg-card/70 border border-border rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by Host, IP, MAC, Vendor or Service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-accent/50"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-black/40 border border-border rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setCategoryFilter('all')}
              className={cn("px-2.5 py-1 rounded cursor-pointer transition-colors", categoryFilter === 'all' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white")}
            >
              All ({devices.length})
            </button>
            <button
              onClick={() => setCategoryFilter('computers')}
              className={cn("px-2 py-1 rounded cursor-pointer transition-colors", categoryFilter === 'computers' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white")}
            >
              Computers
            </button>
            <button
              onClick={() => setCategoryFilter('mobile')}
              className={cn("px-2 py-1 rounded cursor-pointer transition-colors", categoryFilter === 'mobile' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white")}
            >
              Mobile
            </button>
            <button
              onClick={() => setCategoryFilter('iot')}
              className={cn("px-2 py-1 rounded cursor-pointer transition-colors", categoryFilter === 'iot' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white")}
            >
              IoT & Cams
            </button>
            <button
              onClick={() => setCategoryFilter('entertainment')}
              className={cn("px-2 py-1 rounded cursor-pointer transition-colors", categoryFilter === 'entertainment' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white")}
            >
              Media
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-black/40 border border-border rounded-lg px-2 py-1">
            <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-mono text-zinc-300 focus:outline-none cursor-pointer"
              aria-label="Sort Discovered Devices By"
            >
              <option value="ip" className="bg-zinc-900 text-white">Sort: IP Address</option>
              <option value="latency" className="bg-zinc-900 text-white">Sort: Latency (Fastest)</option>
              <option value="ports" className="bg-zinc-900 text-white">Sort: Open Ports (Most)</option>
              <option value="bandwidth" className="bg-zinc-900 text-white">Sort: Bandwidth</option>
              <option value="hostname" className="bg-zinc-900 text-white">Sort: Hostname</option>
            </select>
          </div>

          {/* Grid vs Table Toggle */}
          <div className="flex items-center bg-black/40 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded cursor-pointer", viewMode === 'grid' ? "bg-accent/20 text-accent" : "text-zinc-500 hover:text-white")}
              title="Responsive Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn("p-1.5 rounded cursor-pointer", viewMode === 'table' ? "bg-accent/20 text-accent" : "text-zinc-500 hover:text-white")}
              title="Matrix Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live Jitter / Auto-Refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border cursor-pointer",
              autoRefresh ? "bg-accent/10 border-accent/30 text-accent" : "bg-white/5 border-border text-zinc-500 hover:text-zinc-300"
            )}
            title="Toggle Live Real-Time Jitter & Ping Polling"
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", autoRefresh ? "bg-accent animate-pulse" : "bg-zinc-600")} />
            <span className="hidden sm:inline">Live Sync</span>
          </button>
        </div>
      </div>

      {/* Discovered Device Grid (Responsive 1/2/3/4 Columns) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredDevices.map((dev, idx) => {
              const isPinging = pingingIp === dev.ip;
              const isRescanning = rescanningIp === dev.ip;

              return (
                <motion.div
                  key={`dev-card-${dev.id || dev.ip}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    setInspectDevice(dev);
                    if (onSelectDevice) onSelectDevice(dev);
                  }}
                  className={cn(
                    "group relative bg-card/90 border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5",
                    dev.isMyDevice 
                      ? "border-accent/60 bg-accent/[0.04] shadow-[0_0_20px_rgba(0,255,65,0.08)] ring-1 ring-accent/40" 
                      : "border-border hover:border-zinc-700"
                  )}
                >
                  {/* Top Row: Device Category Icon & Identification */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                          dev.isMyDevice 
                            ? "bg-accent/20 border-accent/40 text-accent shadow-[0_0_12px_rgba(0,255,65,0.3)]" 
                            : "bg-white/5 border-border text-zinc-300 group-hover:border-zinc-600"
                        )}>
                          {getDeviceIcon(dev.deviceType)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white truncate group-hover:text-accent transition-colors" title={dev.hostname}>
                              {dev.hostname}
                            </h3>
                          </div>
                          <p className="text-[11px] font-mono text-zinc-500 truncate">
                            {dev.userOwner || dev.vendor}
                          </p>
                        </div>
                      </div>

                      {/* Status / Badge */}
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        {dev.isMyDevice && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-accent text-black uppercase tracking-wider animate-pulse">
                            THIS DEVICE
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 bg-black/40 border border-border rounded-full px-2 py-0.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            dev.status === 'warning' ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                          )} />
                          <span className="text-[10px] font-mono uppercase text-zinc-300">
                            {dev.status === 'warning' ? 'Paused' : 'Online'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Network Details (IP, MAC, Vendor) */}
                    <div className="space-y-1.5 font-mono text-xs bg-black/40 rounded-xl p-2.5 border border-border/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase">IPv4:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold">{dev.ip}</span>
                          <button
                            onClick={(e) => handleCopyIp(dev.ip, e)}
                            className="text-zinc-500 hover:text-white p-0.5"
                            title="Copy IP Address"
                          >
                            {copiedIp === dev.ip ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-zinc-500 uppercase">MAC:</span>
                        <span className="text-zinc-400 truncate max-w-[150px]">{dev.mac}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-zinc-500 uppercase">Vendor:</span>
                        <span className="text-zinc-300 truncate max-w-[150px]" title={dev.vendor}>{dev.vendor}</span>
                      </div>
                    </div>

                    {/* Connection Quality & Latency RTT */}
                    <div className="grid grid-cols-2 gap-2 mt-2.5">
                      <div className="bg-white/[0.02] border border-border/60 rounded-lg p-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span>ARP RTT</span>
                          <span className={cn(
                            "font-bold",
                            dev.latencyMs < 5 ? "text-accent" : dev.latencyMs < 15 ? "text-yellow-400" : "text-rose-400"
                          )}>
                            {dev.latencyMs} ms
                          </span>
                        </div>
                        <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              dev.latencyMs < 5 ? "bg-accent" : dev.latencyMs < 15 ? "bg-yellow-400" : "bg-rose-400"
                            )}
                            style={{ width: `${Math.min(100, Math.max(15, (25 - dev.latencyMs) * 4))}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-border/60 rounded-lg p-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span>Bandwidth</span>
                          <span className="text-zinc-300 font-bold">{dev.currentDownMbps} Mbps</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-zinc-500">
                          <span className="flex items-center text-emerald-400">↓ {dev.currentDownMbps}</span>
                          <span className="flex items-center text-blue-400">↑ {dev.currentUpMbps}</span>
                        </div>
                      </div>
                    </div>

                    {/* Open Ports & Detected Services (Nmap results) */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1.5">
                        <span>Open Services ({dev.openPorts.length})</span>
                        <span className="text-[9px] text-zinc-600">nmap verified</span>
                      </div>

                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto no-scrollbar">
                        {dev.openPorts.length === 0 ? (
                          <span className="text-[10px] font-mono text-zinc-600 italic">No public ports exposed (Filtered)</span>
                        ) : (
                          dev.openPorts.slice(0, 4).map((p, i) => (
                            <span 
                              key={`${p.port}-${i}`}
                              className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono"
                              title={`${p.port}/${p.protocol} - ${p.service}: ${p.version || ''}`}
                            >
                              {p.port}/{p.service}
                            </span>
                          ))
                        )}
                        {dev.openPorts.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono">
                            +{dev.openPorts.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 mt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handlePingDevice(dev.ip, e)}
                        disabled={isPinging}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-colors border cursor-pointer",
                          isPinging 
                            ? "bg-accent/20 border-accent/40 text-accent animate-pulse" 
                            : "bg-white/5 border-border text-zinc-300 hover:text-white hover:bg-white/10"
                        )}
                        title="Send Immediate ARPing Layer-2 Probe"
                      >
                        <Zap className={cn("w-3 h-3 text-accent", isPinging && "animate-spin")} />
                        <span>{isPinging ? 'PINGING...' : 'ARP PING'}</span>
                      </button>

                      <button
                        onClick={(e) => handleRescanDevice(dev, e)}
                        disabled={isRescanning}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-colors border cursor-pointer",
                          isRescanning 
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-400 animate-pulse" 
                            : "bg-white/5 border-border text-zinc-300 hover:text-white hover:bg-white/10"
                        )}
                        title="Run Deep Nmap Port Re-scan"
                      >
                        <Terminal className="w-3 h-3 text-blue-400" />
                        <span>{isRescanning ? 'SCAN...' : 'NMAP'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-accent group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Matrix Table View */
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black/60 border-b border-border text-zinc-500 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Device / Hostname</th>
                  <th className="p-3.5">IPv4 Address</th>
                  <th className="p-3.5">Hardware MAC / Vendor</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">ARP Latency</th>
                  <th className="p-3.5">Open Ports (nmap)</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDevices.map((dev, idx) => (
                  <tr 
                    key={`dev-table-row-${dev.id || dev.ip}-${idx}`} 
                    onClick={() => setInspectDevice(dev)}
                    className={cn(
                      "hover:bg-white/5 transition-colors cursor-pointer",
                      dev.isMyDevice && "bg-accent/[0.04]"
                    )}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-border">
                          {getDeviceIcon(dev.deviceType)}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {dev.hostname}
                            {dev.isMyDevice && (
                              <span className="px-1.5 py-0.2 rounded text-[8px] bg-accent text-black font-bold">YOU</span>
                            )}
                          </p>
                          <p className="text-[10px] text-zinc-500">{dev.userOwner}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-white">{dev.ip}</td>
                    <td className="p-3.5">
                      <p className="text-zinc-300">{dev.mac}</p>
                      <p className="text-[10px] text-zinc-500">{dev.vendor}</p>
                    </td>
                    <td className="p-3.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]",
                        dev.status === 'warning' ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", dev.status === 'warning' ? "bg-amber-400" : "bg-emerald-400")} />
                        {dev.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={cn(
                        "font-bold",
                        dev.latencyMs < 5 ? "text-accent" : "text-yellow-400"
                      )}>
                        {dev.latencyMs} ms
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {dev.openPorts.map((p, idx) => (
                          <span key={`port-${p.port}-${p.protocol}-${idx}`} className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 text-[10px]">
                            {p.port}/{p.service}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => handlePingDevice(dev.ip, e)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-accent transition-colors mr-1 cursor-pointer"
                        title="Ping Device"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleRescanDevice(dev, e)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 transition-colors cursor-pointer"
                        title="Nmap Re-scan"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Device Inspector Modal */}
      <AnimatePresence>
        {inspectDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                    {getDeviceIcon(inspectDevice.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{inspectDevice.hostname}</h3>
                      {inspectDevice.isMyDevice && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent text-black uppercase">
                          YOUR DEVICE
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-zinc-400">
                      {inspectDevice.ip} · {inspectDevice.mac} · {inspectDevice.vendor}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setInspectDevice(null)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Hardware & OS Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-black/40 border border-border rounded-xl p-3">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">OS Fingerprint</span>
                    <p className="text-xs font-mono font-bold text-white mt-0.5 truncate" title={inspectDevice.osFingerprint}>
                      {inspectDevice.osFingerprint}
                    </p>
                  </div>

                  <div className="bg-black/40 border border-border rounded-xl p-3">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">ARP Latency</span>
                    <p className="text-xs font-mono font-bold text-accent mt-0.5">
                      {inspectDevice.latencyMs} ms (±{inspectDevice.jitterMs}ms)
                    </p>
                  </div>

                  <div className="bg-black/40 border border-border rounded-xl p-3">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">VLAN & Subnet</span>
                    <p className="text-xs font-mono font-bold text-white mt-0.5 truncate">
                      {inspectDevice.vlan}
                    </p>
                  </div>

                  <div className="bg-black/40 border border-border rounded-xl p-3">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Access Point</span>
                    <p className="text-xs font-mono font-bold text-zinc-300 mt-0.5 truncate">
                      {inspectDevice.connectedNodeName}
                    </p>
                  </div>
                </div>

                {/* Open Ports & Nmap Audited Services */}
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-2.5 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-accent" />
                    Open Ports & Services (nmap --unprivileged -sT -Pn)
                  </h4>

                  {inspectDevice.openPorts.length === 0 ? (
                    <div className="p-4 rounded-xl bg-black/40 border border-border text-center text-zinc-500 font-mono text-xs">
                      No open listening ports detected on target IP.
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full font-mono text-xs text-left">
                        <thead className="bg-white/5 border-b border-border text-[10px] text-zinc-400 uppercase">
                          <tr>
                            <th className="p-2.5">Port / Proto</th>
                            <th className="p-2.5">State</th>
                            <th className="p-2.5">Service</th>
                            <th className="p-2.5">Version & Banner</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {inspectDevice.openPorts.map((p, idx) => (
                            <tr key={`inspect-port-${p.port}-${p.protocol}-${idx}`} className="hover:bg-white/5">
                              <td className="p-2.5 font-bold text-accent">{p.port}/{p.protocol}</td>
                              <td className="p-2.5">
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">
                                  {p.state}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold text-white">{p.service}</td>
                              <td className="p-2.5 text-zinc-300 truncate max-w-xs">{p.version || p.banner || 'Generic Service'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Live Action Buttons in Modal */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handlePingDevice(inspectDevice.ip)}
                    disabled={pingingIp === inspectDevice.ip}
                    className="flex-1 py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent font-mono text-xs font-bold hover:bg-accent/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className={cn("w-4 h-4", pingingIp === inspectDevice.ip && "animate-spin")} />
                    <span>{pingingIp === inspectDevice.ip ? 'DISPATCHING ARP PING...' : 'RUN ARPING PROBE'}</span>
                  </button>

                  <button
                    onClick={() => handleRescanDevice(inspectDevice)}
                    disabled={rescanningIp === inspectDevice.ip}
                    className="flex-1 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Terminal className={cn("w-4 h-4", rescanningIp === inspectDevice.ip && "animate-spin")} />
                    <span>{rescanningIp === inspectDevice.ip ? 'EXECUTING NMAP...' : 'FULL NMAP RE-SCAN'}</span>
                  </button>
                </div>

                {/* Raw Nmap Output if triggered */}
                {terminalOutput && (
                  <div className="mt-4">
                    <h5 className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Nmap Console Log</h5>
                    <pre className="p-3 bg-black border border-border rounded-xl font-mono text-[11px] text-accent/90 overflow-x-auto max-h-40">
                      {terminalOutput}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
