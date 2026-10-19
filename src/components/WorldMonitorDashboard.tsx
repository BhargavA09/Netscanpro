import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Globe,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Clock,
  Search,
  Filter,
  Activity,
  AlertTriangle,
  Radio,
  Sliders,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  Info,
  Terminal,
  Zap,
  Crosshair,
  Skull,
  Server,
  Lock,
  Wifi,
  Copy,
  CheckCircle2,
  Shield,
  FileCode,
  Download
} from 'lucide-react';
import {
  WorldMonitorLayer,
  GeoCoordinate,
  SubseaCable,
  C2BotnetCluster,
  DdosAttackStream,
  BgpHijackIncident,
  AptActorCampaign,
  ZeroDayExploit,
  RansomwareCartel,
  GnssJammingZone,
  HoneypotHit,
  InfrastructureOutage,
  GlobalCyberEvent
} from '../types/worldmonitor';
import {
  CYBER_THREAT_TICKER,
  SUBSEA_CABLES,
  C2_BOTNET_CLUSTERS,
  DDOS_ATTACKS,
  BGP_HIJACKS,
  APT_CAMPAIGNS,
  ZERO_DAY_EXPLOITS,
  RANSOMWARE_CARTELS,
  GNSS_JAMMING_ZONES,
  HONEYPOT_HITS,
  INFRASTRUCTURE_OUTAGES,
  GLOBAL_CYBER_EVENTS
} from '../services/worldMonitorData';
import { cn } from '../lib/utils';

// World Coastline Vector Paths (High-Density Simplified Low-Poly Landmasses for Tactical HUD)
const WORLD_LANDMASS_PATHS = [
  // North America
  "M 140 85 L 180 80 L 220 95 L 260 90 L 310 110 L 330 140 L 300 170 L 280 230 L 240 260 L 210 240 L 170 210 L 140 160 Z",
  // Greenland
  "M 330 60 L 375 55 L 390 85 L 360 110 L 330 90 Z",
  // South America
  "M 255 270 L 310 290 L 335 340 L 310 440 L 275 480 L 260 440 L 245 350 L 240 290 Z",
  // Europe
  "M 470 120 L 520 110 L 550 140 L 540 180 L 490 200 L 460 170 L 450 140 Z",
  // Scandinavia & UK
  "M 450 115 L 470 100 L 485 130 L 460 140 Z M 435 130 L 450 125 L 445 155 L 430 150 Z",
  // Africa
  "M 460 210 L 540 215 L 575 280 L 550 380 L 510 440 L 460 380 L 430 280 Z",
  // Asia
  "M 550 110 L 680 90 L 810 110 L 860 160 L 820 230 L 760 270 L 690 250 L 610 210 L 560 170 Z",
  // India
  "M 670 240 L 715 250 L 700 310 L 665 290 Z",
  // Australia
  "M 790 350 L 865 340 L 880 410 L 830 440 L 780 400 Z",
  // Japan & Archipelagos
  "M 845 180 L 860 170 L 855 210 L 840 215 Z M 760 310 L 810 320 L 830 350 L 770 340 Z"
];

const ALL_CYBER_LAYERS_CONFIG: { id: WorldMonitorLayer; label: string; icon: any; count: number; color: string; badgeColor: string }[] = [
  { id: 'botnets', label: 'C2 Servers & Botnets', icon: Skull, count: C2_BOTNET_CLUSTERS.length, color: 'text-rose-400', badgeColor: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
  { id: 'aptActors', label: 'Nation-State APTs', icon: Crosshair, count: APT_CAMPAIGNS.length, color: 'text-purple-400', badgeColor: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
  { id: 'ddos', label: 'Volumetric DDoS', icon: Zap, count: DDOS_ATTACKS.length, color: 'text-amber-400', badgeColor: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { id: 'zeroDays', label: 'Active Zero-Days (KEV)', icon: AlertTriangle, count: ZERO_DAY_EXPLOITS.length, color: 'text-orange-400', badgeColor: 'bg-orange-500/20 border-orange-500/40 text-orange-300' },
  { id: 'ransomware', label: 'Ransomware Extortion', icon: Lock, count: RANSOMWARE_CARTELS.length, color: 'text-red-400', badgeColor: 'bg-red-500/20 border-red-500/40 text-red-300' },
  { id: 'cables', label: 'Subsea Fiber Cables', icon: Radio, count: SUBSEA_CABLES.length, color: 'text-cyan-400', badgeColor: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' },
  { id: 'bgpHijacks', label: 'BGP Route Hijacks', icon: Activity, count: BGP_HIJACKS.length, color: 'text-yellow-400', badgeColor: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' },
  { id: 'gnssJamming', label: 'Electronic Warfare (GNSS)', icon: Wifi, count: GNSS_JAMMING_ZONES.length, color: 'text-emerald-400', badgeColor: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
  { id: 'honeypots', label: 'Honeypot Grid Hits', icon: Server, count: HONEYPOT_HITS.length, color: 'text-teal-400', badgeColor: 'bg-teal-500/20 border-teal-500/40 text-teal-300' },
  { id: 'cloudOutages', label: 'Cloud & Backbone Outages', icon: ShieldAlert, count: INFRASTRUCTURE_OUTAGES.length, color: 'text-blue-400', badgeColor: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
];

export function WorldMonitorDashboard() {
  // Synchronized Coordinate & Navigation HUD State
  const [lat, setLat] = useState<number>(18.6552);
  const [lon, setLon] = useState<number>(63.0564);
  const [zoom, setZoom] = useState<number>(4.84);
  const [viewMode, setViewMode] = useState<'global' | 'regional' | 'tactical'>('global');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  
  // Enabled Cyber Layers
  const [enabledLayers, setEnabledLayers] = useState<Record<WorldMonitorLayer, boolean>>({
    botnets: true,
    aptActors: true,
    ddos: true,
    zeroDays: true,
    ransomware: true,
    cables: true,
    bgpHijacks: true,
    gnssJamming: true,
    honeypots: true,
    cloudOutages: true
  });

  // UI state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [eventsDrawerOpen, setEventsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [selectedLayerType, setSelectedLayerType] = useState<WorldMonitorLayer | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [remediationFeedback, setRemediationFeedback] = useState<string | null>(null);

  // Map dragging state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Read URL parameters on initial mount to support deep links
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlLat = searchParams.get('lat');
      const urlLon = searchParams.get('lon');
      const urlZoom = searchParams.get('zoom');
      const urlView = searchParams.get('view');
      const urlTime = searchParams.get('timeRange');
      const urlLayers = searchParams.get('layers');

      if (urlLat && !isNaN(parseFloat(urlLat))) setLat(parseFloat(urlLat));
      if (urlLon && !isNaN(parseFloat(urlLon))) setLon(parseFloat(urlLon));
      if (urlZoom && !isNaN(parseFloat(urlZoom))) setZoom(parseFloat(urlZoom));
      if (urlView === 'global' || urlView === 'regional' || urlView === 'tactical') setViewMode(urlView);
      if (urlTime && ['1h', '6h', '24h', '7d'].includes(urlTime)) setTimeRange(urlTime as any);

      if (urlLayers) {
        const layerList = urlLayers.split(',');
        const newLayers = { ...enabledLayers };
        (Object.keys(newLayers) as WorldMonitorLayer[]).forEach(k => {
          newLayers[k] = layerList.includes(k);
        });
        setEnabledLayers(newLayers);
      }
    } catch (e) {
      // Graceful fallback if window.location isn't available
    }
  }, []);

  // Update browser URL query params dynamically to keep shareable URL fresh
  const updateUrlParams = (newLat: number, newLon: number, newZoom: number) => {
    try {
      const activeKeys = Object.entries(enabledLayers)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(',');
      
      const params = new URLSearchParams({
        lat: newLat.toFixed(4),
        lon: newLon.toFixed(4),
        zoom: newZoom.toFixed(2),
        view: viewMode,
        timeRange: timeRange,
        layers: activeKeys
      });
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    } catch (e) {
      // Ignore if iframe restricts history
    }
  };

  // Convert GPS Coordinates (Lat/Lon) to SVG projection coordinates
  // Equirectangular projection into 1000 x 500 space
  const projectGeo = (point: GeoCoordinate) => {
    const x = ((point.lon + 180) / 360) * 1000;
    const y = ((90 - point.lat) / 180) * 500;
    return { x, y };
  };

  const handleZoom = (delta: number) => {
    const nextZoom = Math.max(1, Math.min(16, Number((zoom + delta).toFixed(2))));
    setZoom(nextZoom);
    updateUrlParams(lat, lon, nextZoom);
  };

  const handleResetView = () => {
    setLat(18.6552);
    setLon(63.0564);
    setZoom(4.84);
    setPanOffset({ x: 0, y: 0 });
    updateUrlParams(18.6552, 63.0564, 4.84);
  };

  const toggleLayer = (layer: WorldMonitorLayer) => {
    setEnabledLayers(prev => {
      const updated = { ...prev, [layer]: !prev[layer] };
      return updated;
    });
  };

  const enableAllLayers = () => {
    const allOn = { ...enabledLayers };
    (Object.keys(allOn) as WorldMonitorLayer[]).forEach(k => { allOn[k] = true; });
    setEnabledLayers(allOn);
  };

  const disableAllLayers = () => {
    const allOff = { ...enabledLayers };
    (Object.keys(allOff) as WorldMonitorLayer[]).forEach(k => { allOff[k] = false; });
    setEnabledLayers(allOff);
  };

  // Map panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStart) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setPanStart({ x: e.clientX, y: e.clientY });

    // Derive approximate coordinate shift
    const nextLon = Number((lon - (dx / (zoom * 2))).toFixed(4));
    const nextLat = Number((lat + (dy / (zoom * 2))).toFixed(4));
    setLon(Math.max(-180, Math.min(180, nextLon)));
    setLat(Math.max(-85, Math.min(85, nextLat)));
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      updateUrlParams(lat, lon, zoom);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const executeContainmentRule = (cmd: string) => {
    setRemediationFeedback(`Executed containment rule on local firewall: "${cmd}"`);
    setTimeout(() => setRemediationFeedback(null), 4000);
  };

  // Filtered Assets based on Search Query
  const filteredC2 = useMemo(() => {
    if (!searchQuery) return C2_BOTNET_CLUSTERS;
    const q = searchQuery.toLowerCase();
    return C2_BOTNET_CLUSTERS.filter(c => c.name.toLowerCase().includes(q) || c.c2Ip.includes(q) || c.malwareFamily.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredApt = useMemo(() => {
    if (!searchQuery) return APT_CAMPAIGNS;
    const q = searchQuery.toLowerCase();
    return APT_CAMPAIGNS.filter(a => a.name.toLowerCase().includes(q) || a.alias.toLowerCase().includes(q) || a.activeCampaignName.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredDdos = useMemo(() => {
    if (!searchQuery) return DDOS_ATTACKS;
    const q = searchQuery.toLowerCase();
    return DDOS_ATTACKS.filter(d => d.targetName.toLowerCase().includes(q) || d.attackType.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredZeroDays = useMemo(() => {
    if (!searchQuery) return ZERO_DAY_EXPLOITS;
    const q = searchQuery.toLowerCase();
    return ZERO_DAY_EXPLOITS.filter(z => z.cveId.toLowerCase().includes(q) || z.softwareName.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-[#070b12] text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      
      {/* 1. TOP LIVE CYBER THREAT TELEMETRY HUD (Replacing non-cyber stock tickers) */}
      <div className="h-10 bg-[#0a0f18] border-b border-border/80 flex items-center px-4 overflow-hidden shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-2 pr-4 border-r border-border/60 text-xs font-mono font-bold tracking-wider text-rose-400 whitespace-nowrap">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          GLOBAL CTI TELEMETRY
        </div>

        <div className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar py-1 px-4 text-xs font-mono">
          {CYBER_THREAT_TICKER.map((item) => (
            <div key={item.indicator} className="flex items-center gap-2 whitespace-nowrap shrink-0 group cursor-default">
              <span className="text-muted-foreground group-hover:text-slate-300 transition-colors text-[11px] font-semibold">
                {item.label}:
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[11px] font-bold border",
                item.status === 'CRITICAL' && "bg-rose-500/15 text-rose-300 border-rose-500/40",
                item.status === 'WARNING' && "bg-amber-500/15 text-amber-300 border-amber-500/40",
                item.status === 'HEALTHY' && "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
                item.status === 'ACTIVE' && "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
              )}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-border/60 text-xs font-mono text-muted-foreground whitespace-nowrap">
          <span className="text-emerald-400 font-bold">SENTINEL-DEFENSE-ONLINE</span>
          <span>·</span>
          <span>LAT {lat.toFixed(4)}° N</span>
          <span>LON {lon.toFixed(4)}° E</span>
          <span>ZOOM {zoom}x</span>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE / MAP VIEWPORT */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#05080e]">
        
        {/* TOP LEFT COMMAND & LAYER CONTROLS */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-sm">
          
          {/* Header Card */}
          <div className="bg-[#0b121e]/90 backdrop-blur-md border border-border/70 p-3.5 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    Cyber Threat Intelligence Monitor
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-normal">
                      LIVE HUD
                    </span>
                  </h1>
                  <p className="text-[11px] text-muted-foreground">
                    Global Attack Surface · Active C2 · Undersea Fiber · Volumetric Floods
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className={cn(
                  "p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5",
                  filterDrawerOpen ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/60 hover:bg-secondary border-border text-foreground"
                )}
                title="Toggle Threat Layers"
              >
                <Layers className="h-4 w-4" />
                <span className="text-xs font-semibold">Layers</span>
              </button>
            </div>

            {/* Quick Search Bar */}
            <div className="mt-3 relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search C2 IPs, APTs, CVE-2024-*, ASNs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070b12] border border-border/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Active Threat Pills */}
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {ALL_CYBER_LAYERS_CONFIG.slice(0, 5).map(layer => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all flex items-center gap-1.5 backdrop-blur-md shadow-sm",
                  enabledLayers[layer.id]
                    ? `${layer.badgeColor} shadow-rose-950/20`
                    : "bg-[#0b121e]/80 border-border/40 text-muted-foreground opacity-60 hover:opacity-100"
                )}
              >
                <layer.icon className="h-3 w-3" />
                <span>{layer.label}</span>
                <span className="text-[10px] opacity-75 font-bold">({layer.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* TOP RIGHT TIME & EVENT DRAWER TOGGLE */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="bg-[#0b121e]/90 backdrop-blur-md border border-border/70 rounded-xl p-1 flex items-center shadow-lg">
            {(['1h', '6h', '24h', '7d'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => {
                  setTimeRange(tr);
                  updateUrlParams(lat, lon, zoom);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all",
                  timeRange === tr ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tr.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Situation Log Toggle */}
          <button
            onClick={() => setEventsDrawerOpen(!eventsDrawerOpen)}
            className="bg-[#0b121e]/90 backdrop-blur-md border border-border/70 hover:border-rose-500/50 p-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg"
          >
            <Activity className="h-4 w-4 text-rose-400 animate-pulse" />
            <span className="hidden sm:inline">CTI Alerts</span>
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {GLOBAL_CYBER_EVENTS.length}
            </span>
          </button>
        </div>

        {/* BOTTOM RIGHT COORDINATE & VIEW HUD CONTROLS */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-2">
          {/* Coordinate HUD */}
          <div className="bg-[#0b121e]/90 backdrop-blur-md border border-border/70 rounded-xl px-3 py-2 text-xs font-mono shadow-2xl flex items-center gap-4 text-muted-foreground">
            <div>
              <span className="text-slate-400 font-bold">LAT: </span>
              <span className="text-foreground">{lat.toFixed(4)}°</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold">LON: </span>
              <span className="text-foreground">{lon.toFixed(4)}°</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold">ZOOM: </span>
              <span className="text-rose-400 font-bold">{zoom.toFixed(2)}x</span>
            </div>
          </div>

          {/* Navigation & Zoom Bar */}
          <div className="bg-[#0b121e]/90 backdrop-blur-md border border-border/70 rounded-xl p-1.5 flex items-center gap-1 shadow-2xl">
            <button
              onClick={() => handleZoom(1.0)}
              className="p-2 hover:bg-secondary rounded-lg text-foreground transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleZoom(-1.0)}
              className="p-2 hover:bg-secondary rounded-lg text-foreground transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-border/60 mx-1" />
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-secondary rounded-lg text-foreground transition-colors"
              title="Reset Tactical View"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3. INTERACTIVE SVG VECTOR TACTICAL MAP */}
        <div
          className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `scale(${zoom / 2.5}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: '50% 50%',
              transition: isPanning ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            <defs>
              {/* Tactical Grids */}
              <pattern id="cyber-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" />
              </pattern>
              
              {/* Radial Gradients for Cyber Events */}
              <radialGradient id="c2-pulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#e11d48" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="jamming-radial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#059669" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="cable-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Ocean Background & Grid */}
            <rect width="1000" height="500" fill="#05080e" />
            <rect width="1000" height="500" fill="url(#cyber-grid)" />

            {/* World Landmasses */}
            <g className="landmasses" fill="#0d1524" stroke="#1e293b" strokeWidth="0.8">
              {WORLD_LANDMASS_PATHS.map((pathStr, i) => (
                <path key={i} d={pathStr} className="hover:fill-[#131e33] transition-colors" />
              ))}
            </g>

            {/* LAYER: GNSS / GPS JAMMING ZONES (CONCENTRIC PULSES) */}
            {enabledLayers.gnssJamming && GNSS_JAMMING_ZONES.map((zone) => {
              const { x, y } = projectGeo(zone.coordinates);
              const radiusSvg = zone.radiusKm / 20;
              return (
                <g
                  key={zone.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(zone); setSelectedLayerType('gnssJamming'); }}
                >
                  <circle cx={x} cy={y} r={radiusSvg} fill="url(#jamming-radial)" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3">
                    <animate attributeName="r" values={`${radiusSvg * 0.8};${radiusSvg * 1.2};${radiusSvg * 0.8}`} dur="4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="3" fill="#10b981" />
                  <text x={x} y={y - radiusSvg - 3} fill="#34d399" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    [EW: {zone.regionName.split(' ')[0]}]
                  </text>
                </g>
              );
            })}

            {/* LAYER: SUBSEA TELECOM FIBER CABLES */}
            {enabledLayers.cables && SUBSEA_CABLES.map((cable) => {
              const points = cable.pathCoordinates.map(projectGeo);
              const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
              const isCut = cable.status === 'cut';

              return (
                <g
                  key={cable.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(cable); setSelectedLayerType('cables'); }}
                >
                  {/* Outer Glow */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isCut ? "#f43f5e" : "#06b6d4"}
                    strokeWidth="3"
                    strokeOpacity={isCut ? "0.6" : "0.25"}
                  />
                  {/* Core Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isCut ? "#f43f5e" : "url(#cable-gradient)"}
                    strokeWidth="1.2"
                    strokeDasharray={isCut ? "4 3" : "none"}
                  />
                  {/* Landing points */}
                  {cable.landingPoints.map((lp, idx) => {
                    const lpos = projectGeo(lp.coordinates);
                    return (
                      <circle
                        key={idx}
                        cx={lpos.x}
                        cy={lpos.y}
                        r="2.2"
                        fill={isCut ? "#f43f5e" : "#38bdf8"}
                        stroke="#0a0f18"
                        strokeWidth="0.8"
                      />
                    );
                  })}
                  {/* Severed Badge if cut */}
                  {isCut && (
                    <g transform={`translate(${points[Math.floor(points.length / 2)].x}, ${points[Math.floor(points.length / 2)].y})`}>
                      <rect x="-24" y="-8" width="48" height="12" rx="3" fill="#881337" stroke="#f43f5e" strokeWidth="0.8" />
                      <text x="0" y="1" fill="#fff" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        ⚡ FIBER SEVER
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* LAYER: VOLUMETRIC DDOS ATTACK ARCS */}
            {enabledLayers.ddos && filteredDdos.map((ddos) => {
              const origin = projectGeo(ddos.originCoordinates);
              const target = projectGeo(ddos.coordinates);
              const midX = (origin.x + target.x) / 2;
              const midY = Math.min(origin.y, target.y) - 40;
              const arcPath = `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${target.x} ${target.y}`;

              return (
                <g
                  key={ddos.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(ddos); setSelectedLayerType('ddos'); }}
                >
                  {/* Attack Trajectory Arc */}
                  <path
                    d={arcPath}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    strokeOpacity="0.85"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
                  </path>
                  {/* Target Impact Marker */}
                  <circle cx={target.x} cy={target.y} r="10" fill="none" stroke="#f59e0b" strokeWidth="1">
                    <animate attributeName="r" values="3;14;3" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={target.x} cy={target.y} r="3.5" fill="#f59e0b" />
                  <text x={target.x} y={target.y - 12} fill="#fbbf24" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    ⚔️ {ddos.peakBandwidthTbps} Tbps [{ddos.attackType.split(' ')[0]}]
                  </text>
                </g>
              );
            })}

            {/* LAYER: C2 BOTNET SERVERS & CLUSTERS */}
            {enabledLayers.botnets && filteredC2.map((c2) => {
              const { x, y } = projectGeo(c2.coordinates);
              return (
                <g
                  key={c2.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(c2); setSelectedLayerType('botnets'); }}
                >
                  <circle cx={x} cy={y} r="12" fill="url(#c2-pulse)">
                    <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="3.5" fill="#e11d48" stroke="#fff" strokeWidth="0.8" />
                  <text x={x} y={y - 8} fill="#f43f5e" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    ☠️ {c2.malwareFamily} ({c2.activeBeaconsCount})
                  </text>
                </g>
              );
            })}

            {/* LAYER: NATION-STATE APT CAMPAIGNS */}
            {enabledLayers.aptActors && filteredApt.map((apt) => {
              const { x, y } = projectGeo(apt.coordinates);
              return (
                <g
                  key={apt.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(apt); setSelectedLayerType('aptActors'); }}
                >
                  <circle cx={x} cy={y} r="7" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2">
                    <animate attributeName="stroke-dashoffset" values="0;20" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="3" fill="#9333ea" />
                  <text x={x} y={y + 10} fill="#c084fc" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    🎯 {apt.name}
                  </text>
                </g>
              );
            })}

            {/* LAYER: ZERO-DAY & CISA KEV EXPLOITS */}
            {enabledLayers.zeroDays && filteredZeroDays.map((zd) => {
              const { x, y } = projectGeo(zd.coordinates);
              return (
                <g
                  key={zd.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(zd); setSelectedLayerType('zeroDays'); }}
                >
                  <rect x={x - 4} y={y - 4} width="8" height="8" fill="#f97316" transform={`rotate(45 ${x} ${y})`} stroke="#fff" strokeWidth="0.8" />
                  <text x={x} y={y - 8} fill="#fb923c" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    🔥 {zd.cveId.split(' ')[0]} (CVSS {zd.cvssScore})
                  </text>
                </g>
              );
            })}

            {/* LAYER: RANSOMWARE CARTELS */}
            {enabledLayers.ransomware && RANSOMWARE_CARTELS.map((rc) => {
              const { x, y } = projectGeo(rc.coordinates);
              return (
                <g
                  key={rc.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(rc); setSelectedLayerType('ransomware'); }}
                >
                  <polygon
                    points={`${x},${y-5} ${x+4},${y+4} ${x-4},${y+4}`}
                    fill="#dc2626"
                    stroke="#fee2e2"
                    strokeWidth="0.8"
                  />
                  <text x={x} y={y + 11} fill="#ef4444" fontSize="5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    🔒 {rc.gangName.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* LAYER: BGP ROUTE HIJACKS */}
            {enabledLayers.bgpHijacks && BGP_HIJACKS.map((bgp) => {
              const { x, y } = projectGeo(bgp.coordinates);
              return (
                <g
                  key={bgp.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(bgp); setSelectedLayerType('bgpHijacks'); }}
                >
                  <circle cx={x} cy={y} r="8" fill="none" stroke="#eab308" strokeWidth="1.2">
                    <animate attributeName="r" values="3;10;3" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="2.5" fill="#ca8a04" />
                  <text x={x} y={y - 9} fill="#facc15" fontSize="4.8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    ⚠️ BGP RPKI INVALID
                  </text>
                </g>
              );
            })}

            {/* LAYER: HONEYPOT SENSOR GRID */}
            {enabledLayers.honeypots && HONEYPOT_HITS.map((honey) => {
              const { x, y } = projectGeo(honey.coordinates);
              return (
                <g
                  key={honey.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(honey); setSelectedLayerType('honeypots'); }}
                >
                  <circle cx={x} cy={y} r="3" fill="#14b8a6" stroke="#ccfbf1" strokeWidth="0.8" />
                  <text x={x} y={y + 8} fill="#2dd4bf" fontSize="4.5" fontFamily="monospace" textAnchor="middle">
                    📡 {honey.sensorType.split('/')[0]} ({honey.hitsLastHour}/h)
                  </text>
                </g>
              );
            })}

            {/* LAYER: CLOUD & INFRASTRUCTURE OUTAGES */}
            {enabledLayers.cloudOutages && INFRASTRUCTURE_OUTAGES.map((outage) => {
              const { x, y } = projectGeo(outage.coordinates);
              return (
                <g
                  key={outage.id}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedAsset(outage); setSelectedLayerType('cloudOutages'); }}
                >
                  <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="#93c5fd" strokeWidth="0.8" />
                  <text x={x} y={y - 6} fill="#60a5fa" fontSize="4.8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    ⚡ OUTAGE ({outage.impactedTrafficPct}%)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 4. LAYER TOGGLE SIDEBAR DRAWER (When User clicks 'Layers') */}
        {filterDrawerOpen && (
          <div className="absolute top-16 left-4 z-30 w-80 bg-[#0b121e]/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-4 flex flex-col gap-3 max-h-[calc(100%-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Threat Intelligence Layers</h3>
              </div>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="text-muted-foreground hover:text-white p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={enableAllLayers}
                className="flex-1 py-1 px-2 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/80 text-foreground"
              >
                Enable All
              </button>
              <button
                onClick={disableAllLayers}
                className="flex-1 py-1 px-2 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/80 text-foreground"
              >
                Disable All
              </button>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              {ALL_CYBER_LAYERS_CONFIG.map((layer) => {
                const isEnabled = enabledLayers[layer.id];
                const Icon = layer.icon;

                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg border text-left transition-all flex items-center justify-between",
                      isEnabled
                        ? "bg-[#111c2e] border-rose-500/40 text-white"
                        : "bg-[#080d16] border-border/40 text-muted-foreground hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn("p-1.5 rounded-md", isEnabled ? "bg-rose-500/20" : "bg-muted")}>
                        <Icon className={cn("h-4 w-4", layer.color)} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{layer.label}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{layer.count} Active Signatures</div>
                      </div>
                    </div>

                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold",
                      isEnabled ? "bg-rose-500 border-rose-400 text-white" : "border-border text-transparent"
                    )}>
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. LIVE CTI SITUATION LOG DRAWER */}
        {eventsDrawerOpen && (
          <div className="absolute top-16 right-4 z-30 w-96 bg-[#0b121e]/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-4 flex flex-col gap-3 max-h-[calc(100%-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Live CTI Flash Alerts</h3>
              </div>
              <button
                onClick={() => setEventsDrawerOpen(false)}
                className="text-muted-foreground hover:text-white p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {GLOBAL_CYBER_EVENTS.map(evt => (
                <div
                  key={evt.id}
                  onClick={() => {
                    setLat(evt.coordinates.lat);
                    setLon(evt.coordinates.lon);
                    setZoom(6.5);
                    updateUrlParams(evt.coordinates.lat, evt.coordinates.lon, 6.5);
                  }}
                  className="p-3 bg-[#080d16] hover:bg-[#111c2e] border border-border/60 hover:border-rose-500/50 rounded-lg cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {evt.threatType}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{evt.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white leading-snug mb-1">{evt.headline}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{evt.description}</p>
                  <div className="mt-2 text-[10px] text-rose-400 font-mono font-bold flex items-center gap-1">
                    <span>Source: {evt.source}</span>
                    <span>· Click to Focus Map →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. DEEP CYBER THREAT INSPECTOR & INCIDENT RESPONSE DRAWER */}
        {selectedAsset && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 sm:w-[480px] bg-[#0b121e]/98 backdrop-blur-2xl border border-rose-500/40 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            
            {/* Remediation toast feedback */}
            {remediationFeedback && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono rounded-lg flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{remediationFeedback}</span>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {selectedLayerType?.toUpperCase() || 'CTI TARGET'}
                  </span>
                  {selectedAsset.severity && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {selectedAsset.severity}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {selectedAsset.name || selectedAsset.targetName || selectedAsset.headline || selectedAsset.title || selectedAsset.cveId || selectedAsset.regionName}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {selectedAsset.city ? `${selectedAsset.city}, ${selectedAsset.country}` : selectedAsset.victimSector || selectedAsset.vendor || selectedAsset.alias || ''}
                </p>
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 text-muted-foreground hover:text-white rounded-lg bg-secondary/50 hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {selectedAsset.c2Ip && (
                <div className="bg-[#070b12] p-2 rounded-lg border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">C2 HOST IP</span>
                  <span className="font-bold text-rose-400">{selectedAsset.c2Ip}</span>
                </div>
              )}
              {selectedAsset.primaryC2Port && (
                <div className="bg-[#070b12] p-2 rounded-lg border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">C2 BEACON PORT</span>
                  <span className="font-bold text-foreground">{selectedAsset.primaryC2Port} / {selectedAsset.protocol}</span>
                </div>
              )}
              {selectedAsset.peakBandwidthTbps && (
                <div className="bg-[#070b12] p-2 rounded-lg border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">ATTACK PEAK</span>
                  <span className="font-bold text-amber-400">{selectedAsset.peakBandwidthTbps} Tbps</span>
                </div>
              )}
              {selectedAsset.cvssScore && (
                <div className="bg-[#070b12] p-2 rounded-lg border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">CVSS RATING</span>
                  <span className="font-bold text-rose-400">{selectedAsset.cvssScore} / 10.0</span>
                </div>
              )}
              {selectedAsset.capacityTbps && (
                <div className="bg-[#070b12] p-2 rounded-lg border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">CABLE CAPACITY</span>
                  <span className="font-bold text-cyan-400">{selectedAsset.capacityTbps} Tbps</span>
                </div>
              )}
              {selectedAsset.latencyMs && (
                <div className="bg-[#070b12] p-2 rounded-lg border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">TRANSIT LATENCY</span>
                  <span className="font-bold text-foreground">{selectedAsset.latencyMs} ms RTT</span>
                </div>
              )}
              {selectedAsset.totalVictimsYtd && (
                <div className="bg-[#070b12] p-2 rounded-lg border border-border/60">
                  <span className="text-muted-foreground text-[10px] block">EXTORTION VICTIMS</span>
                  <span className="font-bold text-rose-400">{selectedAsset.totalVictimsYtd} Orgs</span>
                </div>
              )}
              {selectedAsset.asn && (
                <div className="bg-[#070b12] p-2 rounded-lg border border-border/60 col-span-2">
                  <span className="text-muted-foreground text-[10px] block">AUTONOMOUS SYSTEM</span>
                  <span className="font-bold text-foreground truncate block">{selectedAsset.asn}</span>
                </div>
              )}
            </div>

            {/* MITRE ATT&CK TTPs if available */}
            {(selectedAsset.mitreTechnique || selectedAsset.mitreAttAndCkGroup) && (
              <div className="bg-[#070b12] p-3 rounded-xl border border-purple-500/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Crosshair className="h-4 w-4" />
                  <span>MITRE ATT&CK Mapping</span>
                </div>
                {selectedAsset.mitreTechnique && (
                  <div className="text-xs text-muted-foreground font-mono">
                    <span className="text-purple-400 font-bold">Technique: </span>
                    {selectedAsset.mitreTechnique}
                  </div>
                )}
                {selectedAsset.mitreTactic && (
                  <div className="text-xs text-muted-foreground font-mono">
                    <span className="text-purple-400 font-bold">Tactic: </span>
                    {selectedAsset.mitreTactic}
                  </div>
                )}
                {selectedAsset.ttps && (
                  <div className="mt-1 flex flex-col gap-1">
                    {selectedAsset.ttps.map((ttp: string, i: number) => (
                      <span key={i} className="text-[11px] font-mono bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded text-purple-200">
                        • {ttp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description or Incident Narrative */}
            <div className="text-xs text-slate-300 leading-relaxed bg-[#070b12] p-3 rounded-xl border border-border/60">
              <span className="text-[10px] font-mono text-muted-foreground block mb-1">INTEL DISPATCH</span>
              {selectedAsset.description || selectedAsset.cause || selectedAsset.remediationGuidance || selectedAsset.securityNotice}
            </div>

            {/* AUTOMATED INCIDENT RESPONSE / CONTAINMENT ACTIONS */}
            <div className="bg-[#070b12] p-3.5 rounded-xl border border-rose-500/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <Terminal className="h-4 w-4" />
                  <span>Automated Incident Response</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">ONE-CLICK COUNTERMEASURE</span>
              </div>

              {selectedAsset.remediationCommand ? (
                <div className="flex flex-col gap-2">
                  <div className="p-2 bg-[#04060a] rounded font-mono text-[11px] text-emerald-400 border border-border/80 break-all select-all">
                    {selectedAsset.remediationCommand}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => executeContainmentRule(selectedAsset.remediationCommand)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Deploy Firewall Drop Rule</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(selectedAsset.remediationCommand, 'cmd')}
                      className="py-1.5 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono transition-colors flex items-center gap-1"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedText === 'cmd' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const sampleRule = `iptables -A INPUT -s ${selectedAsset.c2Ip || '0.0.0.0/0'} -j DROP`;
                      executeContainmentRule(sampleRule);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Apply Defense Rule</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedAsset, null, 2), 'stix')}
                    className="py-1.5 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono transition-colors flex items-center gap-1"
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>{copiedText === 'stix' ? 'Copied STIX!' : 'Export STIX'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
