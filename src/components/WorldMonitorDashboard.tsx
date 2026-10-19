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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Anchor,
  Flame,
  Wind,
  Zap,
  Building2,
  Landmark,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  WorldMonitorLayer,
  GeoCoordinate,
  SubseaCable,
  EnergyPipeline,
  TradeRouteChokepoint,
  StockExchange,
  CentralBank,
  FinancialCenter,
  WeatherSystem,
  InfrastructureOutage,
  NaturalHazard,
  StrategicWaterway,
  SanctionRegime,
  MacroEconomicMetric
} from '../types/worldmonitor';
import {
  TICKER_ITEMS,
  STOCK_EXCHANGES,
  SUBSEA_CABLES,
  ENERGY_PIPELINES,
  TRADE_ROUTE_CHOKEPOINTS,
  CENTRAL_BANKS,
  FINANCIAL_CENTERS,
  WEATHER_SYSTEMS,
  INFRASTRUCTURE_OUTAGES,
  NATURAL_HAZARDS,
  STRATEGIC_WATERWAYS,
  SANCTION_REGIMES,
  MACRO_METRICS,
  SITUATION_EVENTS
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

const ALL_LAYERS_CONFIG: { id: WorldMonitorLayer; label: string; icon: any; count: number; color: string }[] = [
  { id: 'stockExchanges', label: 'Stock Exchanges', icon: Building2, count: STOCK_EXCHANGES.length, color: 'text-emerald-400' },
  { id: 'centralBanks', label: 'Central Banks', icon: Landmark, count: CENTRAL_BANKS.length, color: 'text-sky-400' },
  { id: 'financialCenters', label: 'Financial Centers', icon: DollarSign, count: FINANCIAL_CENTERS.length, color: 'text-purple-400' },
  { id: 'cables', label: 'Subsea Cables', icon: Radio, count: SUBSEA_CABLES.length, color: 'text-cyan-400' },
  { id: 'pipelines', label: 'Energy Pipelines', icon: Flame, count: ENERGY_PIPELINES.length, color: 'text-amber-400' },
  { id: 'tradeRoutes', label: 'Trade Chokepoints', icon: Anchor, count: TRADE_ROUTE_CHOKEPOINTS.length, color: 'text-rose-400' },
  { id: 'waterways', label: 'Waterways & Canals', icon: Compass, count: STRATEGIC_WATERWAYS.length, color: 'text-blue-400' },
  { id: 'outages', label: 'Infrastructure Outages', icon: Zap, count: INFRASTRUCTURE_OUTAGES.length, color: 'text-red-400' },
  { id: 'weather', label: 'Extreme Weather', icon: Wind, count: WEATHER_SYSTEMS.length, color: 'text-teal-400' },
  { id: 'natural', label: 'Natural Hazards', icon: AlertTriangle, count: NATURAL_HAZARDS.length, color: 'text-orange-400' },
  { id: 'sanctions', label: 'Sanction Regimes', icon: ShieldAlert, count: SANCTION_REGIMES.length, color: 'text-fuchsia-400' },
  { id: 'economic', label: 'Macro Indicators', icon: TrendingUp, count: MACRO_METRICS.length, color: 'text-lime-400' }
];

export function WorldMonitorDashboard() {
  // Map viewport state: default coordinates from user's URL: lat=18.6552, lon=-63.0564, zoom=4.84
  const [viewport, setViewport] = useState<{ lat: number; lon: number; zoom: number }>({
    lat: 18.6552,
    lon: -63.0564,
    zoom: 4.84
  });

  const [activeLayers, setActiveLayers] = useState<Set<WorldMonitorLayer>>(
    new Set([
      'cables',
      'pipelines',
      'tradeRoutes',
      'weather',
      'outages',
      'natural',
      'waterways',
      'economic',
      'sanctions',
      'stockExchanges',
      'financialCenters',
      'centralBanks'
    ])
  );

  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | '1y'>('1h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<WorldMonitorLayer | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tickerOffset, setTickerOffset] = useState(0);

  const mapSvgRef = useRef<SVGSVGElement | null>(null);

  // Parse URL parameters on initial mount if available in browser
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        const params = new URLSearchParams(window.location.search);
        const latParam = parseFloat(params.get('lat') || '');
        const lonParam = parseFloat(params.get('lon') || '');
        const zoomParam = parseFloat(params.get('zoom') || '');
        const timeRangeParam = params.get('timeRange') as any;
        const layersParam = params.get('layers');

        if (!isNaN(latParam) && !isNaN(lonParam)) {
          setViewport(prev => ({
            lat: latParam,
            lon: lonParam,
            zoom: !isNaN(zoomParam) ? zoomParam : prev.zoom
          }));
        }

        if (['1h', '24h', '7d', '30d', '1y'].includes(timeRangeParam)) {
          setTimeRange(timeRangeParam);
        }

        if (layersParam) {
          const split = layersParam.split(',') as WorldMonitorLayer[];
          const valid = split.filter(l => ALL_LAYERS_CONFIG.some(c => c.id === l));
          if (valid.length > 0) {
            setActiveLayers(new Set(valid));
          }
        }
      } catch {
        // Fallback to default
      }
    }
  }, []);

  // Update URL parameters dynamically when state changes without page reload
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.replaceState) {
      try {
        const params = new URLSearchParams();
        params.set('lat', viewport.lat.toFixed(4));
        params.set('lon', viewport.lon.toFixed(4));
        params.set('zoom', viewport.zoom.toFixed(2));
        params.set('view', 'global');
        params.set('timeRange', timeRange);
        params.set('layers', Array.from(activeLayers).join(','));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);
      } catch {
        // Ignored
      }
    }
  }, [viewport, timeRange, activeLayers]);

  // Coordinate projection math: Convert lat/lon into SVG canvas coordinates [0..1000, 0..500]
  // applying current viewport center (lat, lon) and zoom level
  const projectGeo = (coord: GeoCoordinate) => {
    const baseWidth = 1000;
    const baseHeight = 500;

    // Standard equirectangular projection
    const xBase = ((coord.lon + 180) / 360) * baseWidth;
    const yBase = ((90 - coord.lat) / 180) * baseHeight;

    const centerX = ((viewport.lon + 180) / 360) * baseWidth;
    const centerY = ((90 - viewport.lat) / 180) * baseHeight;

    // Apply zoom relative to center
    const x = (xBase - centerX) * (viewport.zoom / 2.5) + baseWidth / 2;
    const y = (yBase - centerY) * (viewport.zoom / 2.5) + baseHeight / 2;

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    // Invert delta to pan smoothly
    const sensitivity = 0.15 / (viewport.zoom / 2);
    setViewport(prev => {
      let newLon = prev.lon - dx * sensitivity;
      if (newLon > 180) newLon -= 360;
      if (newLon < -180) newLon += 360;

      let newLat = prev.lat + dy * sensitivity;
      newLat = Math.max(-85, Math.min(85, newLat));

      return { ...prev, lat: newLat, lon: newLon };
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(1.0, Math.min(16.0, Math.round((prev.zoom + delta) * 100) / 100))
    }));
  };

  const resetToTargetLocation = (lat: number, lon: number, zoom: number) => {
    setViewport({ lat, lon, zoom });
  };

  const toggleLayer = (layer: WorldMonitorLayer) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  };

  const selectAllLayers = () => {
    setActiveLayers(new Set(ALL_LAYERS_CONFIG.map(l => l.id)));
  };

  const clearAllLayers = () => {
    setActiveLayers(new Set());
  };

  // Filtered lists
  const filteredExchanges = useMemo(() => {
    if (!activeLayers.has('stockExchanges')) return [];
    if (!searchQuery) return STOCK_EXCHANGES;
    const q = searchQuery.toLowerCase();
    return STOCK_EXCHANGES.filter(
      e => e.name.toLowerCase().includes(q) || e.city.toLowerCase().includes(q) || e.primaryIndexName.toLowerCase().includes(q)
    );
  }, [activeLayers, searchQuery]);

  const filteredCentralBanks = useMemo(() => {
    if (!activeLayers.has('centralBanks')) return [];
    if (!searchQuery) return CENTRAL_BANKS;
    const q = searchQuery.toLowerCase();
    return CENTRAL_BANKS.filter(b => b.name.toLowerCase().includes(q) || b.country.toLowerCase().includes(q));
  }, [activeLayers, searchQuery]);

  const filteredChokepoints = useMemo(() => {
    if (!activeLayers.has('tradeRoutes')) return [];
    if (!searchQuery) return TRADE_ROUTE_CHOKEPOINTS;
    const q = searchQuery.toLowerCase();
    return TRADE_ROUTE_CHOKEPOINTS.filter(c => c.name.toLowerCase().includes(q));
  }, [activeLayers, searchQuery]);

  const filteredCables = useMemo(() => {
    if (!activeLayers.has('cables')) return [];
    if (!searchQuery) return SUBSEA_CABLES;
    const q = searchQuery.toLowerCase();
    return SUBSEA_CABLES.filter(c => c.name.toLowerCase().includes(q));
  }, [activeLayers, searchQuery]);

  const filteredPipelines = useMemo(() => {
    if (!activeLayers.has('pipelines')) return [];
    if (!searchQuery) return ENERGY_PIPELINES;
    const q = searchQuery.toLowerCase();
    return ENERGY_PIPELINES.filter(p => p.name.toLowerCase().includes(q));
  }, [activeLayers, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none overflow-hidden relative font-sans">
      {/* ============================================================== */}
      {/* 1. TOP TICKER: LIVE GLOBAL FINANCIAL & COMMODITY TICKER        */}
      {/* ============================================================== */}
      <div className="h-9 border-b border-zinc-800/80 bg-zinc-950/95 flex items-center px-4 shrink-0 overflow-x-auto no-scrollbar gap-6 text-[11px] font-mono tabular-nums shadow-inner z-20">
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-zinc-800 text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white text-[10px] tracking-widest uppercase">WORLD MONITOR FINANCE</span>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          {TICKER_ITEMS.map(t => (
            <div key={t.symbol} className="flex items-center gap-2 shrink-0">
              <span className="text-zinc-400 font-semibold">{t.symbol}</span>
              <span className="text-zinc-200 font-bold">{t.price}</span>
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[10px] font-medium",
                  t.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {t.changePercent >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. COMMAND HEADER & COORDINATE HUD BAR                         */}
      {/* ============================================================== */}
      <div className="p-3 px-4 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Tactical Coordinates & Location Quick Jumps */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '16s' }} />
            <span className="text-zinc-400">LAT:</span>
            <span className="text-white font-bold">{viewport.lat >= 0 ? `${viewport.lat.toFixed(4)}°N` : `${Math.abs(viewport.lat).toFixed(4)}°S`}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">LON:</span>
            <span className="text-white font-bold">{viewport.lon >= 0 ? `${viewport.lon.toFixed(4)}°E` : `${Math.abs(viewport.lon).toFixed(4)}°W`}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">ZOOM:</span>
            <span className="text-cyan-300 font-bold">{viewport.zoom.toFixed(2)}x</span>
          </div>

          {/* Quick Location Presets */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono">
            <span className="text-zinc-500 mr-1">PRESET:</span>
            <button
              onClick={() => resetToTargetLocation(18.6552, -63.0564, 4.84)}
              className={cn(
                "px-2.5 py-1 rounded transition cursor-pointer border",
                Math.abs(viewport.lat - 18.6552) < 0.1 && Math.abs(viewport.lon - -63.0564) < 0.1
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold"
                  : "bg-black/30 text-zinc-400 hover:text-white border-zinc-800"
              )}
            >
              Caribbean & Atlantic (URL)
            </button>
            <button
              onClick={() => resetToTargetLocation(26.5, 56.2, 5.2)}
              className="px-2 py-1 rounded bg-black/30 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            >
              Hormuz & Gulf
            </button>
            <button
              onClick={() => resetToTargetLocation(14.0, 42.5, 4.8)}
              className="px-2 py-1 rounded bg-black/30 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            >
              Red Sea / Suez
            </button>
            <button
              onClick={() => resetToTargetLocation(2.5, 101.5, 5.0)}
              className="px-2 py-1 rounded bg-black/30 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            >
              Malacca Strait
            </button>
            <button
              onClick={() => resetToTargetLocation(20.0, 10.0, 1.8)}
              className="px-2 py-1 rounded bg-black/30 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
            >
              Global 360°
            </button>
          </div>
        </div>

        {/* Center / Right: TimeRange Selector & Search Filter */}
        <div className="flex items-center gap-2">
          {/* TimeRange Slider / Segmented Control */}
          <div className="flex items-center bg-black/60 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
            <span className="text-zinc-500 px-2 flex items-center gap-1 text-[10px]">
              <Clock className="w-3 h-3 text-zinc-400" />
              RANGE:
            </span>
            {(['1h', '24h', '7d', '30d', '1y'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={cn(
                  "px-2.5 py-1 rounded transition cursor-pointer",
                  timeRange === tr
                    ? "bg-white/20 text-white font-bold shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {tr}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search global assets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-black/60 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MULTI-LAYER CONTROLS BAR (12 REQUESTED URL LAYERS)          */}
      {/* ============================================================== */}
      <div className="p-2 px-4 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 z-20">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 pr-2 border-r border-zinc-800 text-[10px] font-mono text-zinc-500">
            <Layers className="w-3 h-3 text-zinc-400" />
            <span>LAYERS ({activeLayers.size}/12):</span>
            <button
              onClick={selectAllLayers}
              className="text-cyan-400 hover:underline cursor-pointer ml-1"
            >
              All
            </button>
            <span>·</span>
            <button
              onClick={clearAllLayers}
              className="text-zinc-400 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>

          {ALL_LAYERS_CONFIG.map(layer => {
            const isActive = activeLayers.has(layer.id);
            const Icon = layer.icon;

            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 border",
                  isActive
                    ? "bg-white/10 border-zinc-600 text-white font-semibold shadow-xs"
                    : "bg-black/30 border-zinc-800/80 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                )}
              >
                <Icon className={cn("w-3 h-3", isActive ? layer.color : "text-zinc-600")} />
                <span>{layer.label}</span>
                <span className={cn(
                  "text-[9px] px-1 rounded",
                  isActive ? "bg-white/10 text-zinc-300" : "text-zinc-600"
                )}>
                  {layer.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MAIN MAP CANVAS & SITUATION TELEMETRY VIEWPORT              */}
      {/* ============================================================== */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* The Interactive Global Vector Map Canvas */}
        <div
          className="flex-1 h-full relative cursor-grab active:cursor-grabbing bg-[#030712]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Radial Vignette & Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.15) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          />

          <svg
            ref={mapSvgRef}
            className="w-full h-full select-none"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Gradients for subsea cables and energy pipelines */}
              <linearGradient id="cableGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="pipelineGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Latitude / Longitude Tactical Graticules */}
            <g className="opacity-15 stroke-zinc-700 stroke-[0.5]" strokeDasharray="3 3">
              {/* Parallels (Equator, Tropics, Arctic) */}
              {[-60, -30, 0, 30, 60].map(lat => {
                const p1 = projectGeo({ lat, lon: -180 });
                const p2 = projectGeo({ lat, lon: 180 });
                return <line key={`lat-${lat}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
              })}
              {/* Meridians (Prime meridian, international date line) */}
              {[-120, -60, 0, 60, 120].map(lon => {
                const p1 = projectGeo({ lat: 85, lon });
                const p2 = projectGeo({ lat: -85, lon });
                return <line key={`lon-${lon}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
              })}
            </g>

            {/* Simplified Global Continental Landmasses */}
            <g className="fill-zinc-900/90 stroke-zinc-700/60 stroke-[0.8] transition-all duration-300">
              {WORLD_LANDMASS_PATHS.map((pathD, idx) => {
                return (
                  <path
                    key={`landmass-${idx}`}
                    d={pathD}
                    transform={`translate(${500 - (viewport.lon + 180) * (viewport.zoom / 2.5) * (1000 / 360) + (1000 / 2) * (viewport.zoom / 2.5 - 1)}, ${250 - (90 - viewport.lat) * (viewport.zoom / 2.5) * (500 / 180) + (500 / 2) * (viewport.zoom / 2.5 - 1)}) scale(${viewport.zoom / 2.5})`}
                    className="opacity-95 hover:fill-zinc-800 transition-colors"
                  />
                );
              })}
            </g>

            {/* LAYER 1: SUBSEA FIBER OPTIC CABLES */}
            {activeLayers.has('cables') && filteredCables.map(cable => {
              const pts = cable.pathCoordinates.map(projectGeo);
              if (pts.length < 2) return null;
              const pathStr = pts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

              return (
                <g
                  key={`cable-${cable.id}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(cable);
                    setSelectedEntityType('cables');
                  }}
                >
                  {/* Outer glow line */}
                  <path
                    d={pathStr}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3.5"
                    strokeOpacity="0.3"
                    className="group-hover:stroke-opacity-70 transition-all"
                  />
                  {/* Core fiber optic line */}
                  <path
                    d={pathStr}
                    fill="none"
                    stroke="url(#cableGlow)"
                    strokeWidth={cable.status === 'degraded' ? "1.5" : "2"}
                    strokeDasharray={cable.status === 'degraded' ? "6 3" : "none"}
                    className={cable.status === 'degraded' ? "animate-pulse" : ""}
                  />
                  {/* Landing point beacons */}
                  {cable.landingPoints.map(lp => {
                    const pos = projectGeo(lp.coordinates);
                    return (
                      <circle
                        key={`lp-${cable.id}-${lp.name}`}
                        cx={pos.x}
                        cy={pos.y}
                        r="3"
                        fill="#38bdf8"
                        stroke="#030712"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* LAYER 2: ENERGY PIPELINES */}
            {activeLayers.has('pipelines') && filteredPipelines.map(pipe => {
              const pts = pipe.pathCoordinates.map(projectGeo);
              if (pts.length < 2) return null;
              const pathStr = pts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

              return (
                <g
                  key={`pipe-${pipe.id}`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(pipe);
                    setSelectedEntityType('pipelines');
                  }}
                >
                  <path
                    d={pathStr}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeOpacity="0.25"
                    className="group-hover:stroke-opacity-60 transition-all"
                  />
                  <path
                    d={pathStr}
                    fill="none"
                    stroke={pipe.status === 'sabotage_offline' ? '#ef4444' : 'url(#pipelineGlow)'}
                    strokeWidth="2.2"
                    strokeDasharray={pipe.status === 'sabotage_offline' ? "4 4" : "none"}
                  />
                </g>
              );
            })}

            {/* LAYER 3: MARITIME CHOKEPOINTS & TRADE ROUTES */}
            {activeLayers.has('tradeRoutes') && filteredChokepoints.map(cp => {
              const pos = projectGeo(cp.coordinates);
              const isHighRisk = cp.status === 'high_risk';

              return (
                <g
                  key={`cp-${cp.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(cp);
                    setSelectedEntityType('tradeRoutes');
                  }}
                >
                  {/* Radar pulse beacon */}
                  <circle
                    r="8"
                    fill="none"
                    stroke={isHighRisk ? '#f43f5e' : '#fbbf24'}
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                  <polygon
                    points="0,-6 6,0 0,6 -6,0"
                    fill={isHighRisk ? '#f43f5e' : '#fbbf24'}
                    stroke="#030712"
                    strokeWidth="1.5"
                  />
                  {/* Label */}
                  <text
                    y="-9"
                    textAnchor="middle"
                    className="fill-zinc-300 text-[8px] font-mono font-bold tracking-tight pointer-events-none group-hover:fill-white"
                  >
                    {cp.name}
                  </text>
                </g>
              );
            })}

            {/* LAYER 4: STOCK EXCHANGES (29 Major Global Bourses) */}
            {activeLayers.has('stockExchanges') && filteredExchanges.map(ex => {
              const pos = projectGeo(ex.coordinates);
              const isOpen = ex.status === 'OPEN';

              return (
                <g
                  key={`ex-${ex.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(ex);
                    setSelectedEntityType('stockExchanges');
                  }}
                >
                  <circle
                    r="5"
                    fill={isOpen ? '#10b981' : '#64748b'}
                    stroke="#030712"
                    strokeWidth="1.5"
                    className={isOpen ? "ring-2 ring-emerald-400" : ""}
                  />
                  {isOpen && (
                    <circle
                      r="9"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1"
                      className="animate-ping opacity-50"
                    />
                  )}
                  {/* Mini bourses tag */}
                  <text
                    y="12"
                    textAnchor="middle"
                    className={cn(
                      "text-[8px] font-mono font-bold pointer-events-none transition-colors",
                      isOpen ? "fill-emerald-300" : "fill-zinc-400"
                    )}
                  >
                    {ex.mic} (${ex.marketCapTrillion}T)
                  </text>
                </g>
              );
            })}

            {/* LAYER 5: CENTRAL BANKS & POLICY BENCHMARKS */}
            {activeLayers.has('centralBanks') && filteredCentralBanks.map(cb => {
              const pos = projectGeo(cb.coordinates);

              return (
                <g
                  key={`cb-${cb.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(cb);
                    setSelectedEntityType('centralBanks');
                  }}
                >
                  <rect
                    x="-6"
                    y="-6"
                    width="12"
                    height="12"
                    rx="2"
                    fill="#0284c7"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  <text
                    y="-9"
                    textAnchor="middle"
                    className="fill-sky-300 text-[8px] font-mono font-bold pointer-events-none"
                  >
                    {cb.country.split(' ')[0]} ({cb.benchmarkRatePercent}%)
                  </text>
                </g>
              );
            })}

            {/* LAYER 6: FINANCIAL CENTERS */}
            {activeLayers.has('financialCenters') && FINANCIAL_CENTERS.map(fc => {
              const pos = projectGeo(fc.coordinates);

              return (
                <g
                  key={`fc-${fc.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(fc);
                    setSelectedEntityType('financialCenters');
                  }}
                >
                  <circle
                    r="6"
                    fill="#a855f7"
                    fillOpacity="0.8"
                    stroke="#d8b4fe"
                    strokeWidth="1.5"
                  />
                  <text
                    y="14"
                    textAnchor="middle"
                    className="fill-purple-300 text-[8px] font-mono font-medium pointer-events-none"
                  >
                    #{fc.globalRank} {fc.city}
                  </text>
                </g>
              );
            })}

            {/* LAYER 7: INFRASTRUCTURE OUTAGES & CUTS */}
            {activeLayers.has('outages') && INFRASTRUCTURE_OUTAGES.map(out => {
              const pos = projectGeo(out.coordinates);

              return (
                <g
                  key={`outage-${out.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(out);
                    setSelectedEntityType('outages');
                  }}
                >
                  <circle r="12" fill="#ef4444" fillOpacity="0.25" className="animate-ping" />
                  <circle r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <text y="-8" textAnchor="middle" className="fill-red-400 text-[8px] font-mono font-bold">
                    ⚡ OUTAGE
                  </text>
                </g>
              );
            })}

            {/* LAYER 8: EXTREME WEATHER & STORMS */}
            {activeLayers.has('weather') && WEATHER_SYSTEMS.map(ws => {
              const pos = projectGeo(ws.coordinates);

              return (
                <g
                  key={`ws-${ws.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(ws);
                    setSelectedEntityType('weather');
                  }}
                >
                  <circle
                    r="14"
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px`, animationDuration: '6s' }}
                  />
                  <circle r="4" fill="#14b8a6" stroke="#042f2e" strokeWidth="1.5" />
                  <text y="15" textAnchor="middle" className="fill-teal-300 text-[8px] font-mono">
                    {ws.name} ({ws.windSpeedKnots}kt)
                  </text>
                </g>
              );
            })}

            {/* LAYER 9: NATURAL HAZARDS (Quakes & Volcanoes) */}
            {activeLayers.has('natural') && NATURAL_HAZARDS.map(nh => {
              const pos = projectGeo(nh.coordinates);

              return (
                <g
                  key={`nh-${nh.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(nh);
                    setSelectedEntityType('natural');
                  }}
                >
                  <circle r="8" fill="none" stroke="#f97316" strokeWidth="1.5" className="animate-ping" />
                  <polygon points="0,-5 5,4 -5,4" fill="#f97316" stroke="#431407" strokeWidth="1" />
                  <text y="14" textAnchor="middle" className="fill-orange-300 text-[8px] font-mono">
                    {nh.name}
                  </text>
                </g>
              );
            })}

            {/* LAYER 10: WATERWAYS */}
            {activeLayers.has('waterways') && STRATEGIC_WATERWAYS.map(sw => {
              const pos = projectGeo(sw.coordinates);

              return (
                <g
                  key={`sw-${sw.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(sw);
                    setSelectedEntityType('waterways');
                  }}
                >
                  <circle r="4" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
                  <text y="-7" textAnchor="middle" className="fill-blue-300 text-[8px] font-mono">
                    {sw.name}
                  </text>
                </g>
              );
            })}

            {/* LAYER 11: SANCTIONS & MARITIME WATCHLISTS */}
            {activeLayers.has('sanctions') && SANCTION_REGIMES.map(sr => {
              const pos = projectGeo(sr.coordinates);

              return (
                <g
                  key={`sr-${sr.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(sr);
                    setSelectedEntityType('sanctions');
                  }}
                >
                  <circle r="5" fill="#d946ef" stroke="#701a75" strokeWidth="1.5" />
                  <text y="12" textAnchor="middle" className="fill-fuchsia-300 text-[8px] font-mono">
                    {sr.authority} ({sr.shadowFleetTankersTracked} tankers)
                  </text>
                </g>
              );
            })}

            {/* LAYER 12: MACROECONOMIC SOVEREIGN TAGS */}
            {activeLayers.has('economic') && MACRO_METRICS.map(mm => {
              const pos = projectGeo(mm.coordinates);

              return (
                <g
                  key={`mm-${mm.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    setSelectedEntity(mm);
                    setSelectedEntityType('economic');
                  }}
                >
                  <text
                    textAnchor="middle"
                    className="fill-lime-400 text-[9px] font-mono font-bold bg-black/60"
                  >
                    {mm.code}: ${mm.gdpTrillion}T ({mm.gdpGrowthPercent > 0 ? '+' : ''}{mm.gdpGrowthPercent}%)
                  </text>
                </g>
              );
            })}

            {/* User Target Pin Marker at lat=18.6552, lon=-63.0564 */}
            {(() => {
              const targetPos = projectGeo({ lat: 18.6552, lon: -63.0564 });
              return (
                <g transform={`translate(${targetPos.x}, ${targetPos.y})`} className="pointer-events-none">
                  <circle r="16" fill="none" stroke="#22d3ee" strokeWidth="1" className="animate-ping opacity-75" />
                  <circle r="7" fill="#0891b2" stroke="#ffffff" strokeWidth="2" />
                  <line x1="-12" y1="0" x2="12" y2="0" stroke="#22d3ee" strokeWidth="1.5" />
                  <line x1="0" y1="-12" x2="0" y2="12" stroke="#22d3ee" strokeWidth="1.5" />
                  <text y="-14" textAnchor="middle" className="fill-cyan-300 text-[9px] font-mono font-bold">
                    ★ 18.6552°N, 63.0564°W
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Map Controls Float Overlay (Zoom + / -, Reset, Center) */}
          <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-20">
            <button
              onClick={() => handleZoom(0.8)}
              className="w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shadow-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.8)}
              className="w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shadow-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => resetToTargetLocation(18.6552, -63.0564, 4.84)}
              className="w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-cyan-400 hover:text-cyan-300 flex items-center justify-center transition cursor-pointer shadow-lg"
              title="Center on URL Target (18.6552°N, 63.0564°W)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Tactical Map Footnote HUD */}
          <div className="absolute left-4 bottom-4 bg-zinc-950/90 border border-zinc-800/90 px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-400 flex items-center gap-2 backdrop-blur-md shadow-xl z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Interactive World Monitor Canvas · Pan & Zoom enabled · Click any infrastructure node to inspect</span>
          </div>
        </div>

        {/* Right Drawer: Situation Events Feed & Asset Inspector */}
        <div className="w-80 lg:w-96 border-l border-zinc-800 bg-zinc-950/95 flex flex-col shrink-0 z-30 shadow-2xl">
          {/* Header */}
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{selectedEntity ? 'Asset Intelligence Dossier' : 'Global Situation Feed'}</span>
            </div>
            {selectedEntity && (
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Body: Deep Asset Inspector or Real-time Events Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {selectedEntity ? (
              /* Deep Dossier Inspector */
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
                    {selectedEntityType?.toUpperCase()}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {selectedEntity.name || selectedEntity.title}
                  </h3>
                  {selectedEntity.city && selectedEntity.country && (
                    <p className="text-zinc-400 text-[11px] mt-0.5">
                      {selectedEntity.city}, {selectedEntity.country}
                    </p>
                  )}
                  {selectedEntity.status && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{selectedEntity.status}</span>
                    </div>
                  )}
                </div>

                {/* Stock Exchange Specifics */}
                {selectedEntityType === 'stockExchanges' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/80 space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Market Capitalization:</span>
                        <span className="text-white font-bold">${selectedEntity.marketCapTrillion} Trillion</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Primary Benchmark Index:</span>
                        <span className="text-emerald-400 font-bold">{selectedEntity.primaryIndexName}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Index Value & 24h:</span>
                        <span className="text-white font-bold">
                          {selectedEntity.indexValue} ({selectedEntity.change24hPercent >= 0 ? '+' : ''}{selectedEntity.change24hPercent}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Daily Turnover Volume:</span>
                        <span className="text-white font-bold">${selectedEntity.volumeTodayBillion}B</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Trading Hours (UTC):</span>
                        <span className="text-zinc-300">{selectedEntity.tradingHoursUtc}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Central Bank Specifics */}
                {selectedEntityType === 'centralBanks' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/80 space-y-1.5">
                      <div className="flex justify-between text-zinc-400">
                        <span>Governor / Chair:</span>
                        <span className="text-white font-bold">{selectedEntity.governor}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Target Benchmark Rate:</span>
                        <span className="text-sky-300 font-bold text-sm">{selectedEntity.benchmarkRatePercent}%</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Monetary Policy Stance:</span>
                        <span className="text-emerald-400 font-bold">{selectedEntity.stance}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Balance Sheet Size:</span>
                        <span className="text-white font-bold">${selectedEntity.balanceSheetTrillion} Trillion</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Next Rate Decision:</span>
                        <span className="text-amber-300 font-bold">{selectedEntity.nextMeetingDate}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      {selectedEntity.policySummary}
                    </p>
                  </div>
                )}

                {/* Subsea Cable Specifics */}
                {selectedEntityType === 'cables' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/80 space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Design Capacity:</span>
                        <span className="text-cyan-400 font-bold">{selectedEntity.capacityTbps} Tbps</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Cable Length:</span>
                        <span className="text-white font-bold">{selectedEntity.lengthKm.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Transoceanic Latency:</span>
                        <span className="text-emerald-400 font-bold">{selectedEntity.latencyMs} ms RTT</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Ready For Service (RFS):</span>
                        <span className="text-white font-bold">{selectedEntity.rfsYear}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      {selectedEntity.description}
                    </p>
                  </div>
                )}

                {/* Pipeline Specifics */}
                {selectedEntityType === 'pipelines' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/80 space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Commodity Transferred:</span>
                        <span className="text-amber-400 font-bold uppercase">{selectedEntity.commodityType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Throughput Capacity:</span>
                        <span className="text-white font-bold">{selectedEntity.capacityThroughput}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Pipeline Length:</span>
                        <span className="text-white font-bold">{selectedEntity.lengthKm.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Origin & Terminus:</span>
                        <span className="text-zinc-300 truncate max-w-[170px]">{selectedEntity.origin} → {selectedEntity.destination}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      {selectedEntity.description}
                    </p>
                  </div>
                )}

                {/* Trade Chokepoint Specifics */}
                {selectedEntityType === 'tradeRoutes' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/80 space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Daily Transit Traffic:</span>
                        <span className="text-white font-bold">{selectedEntity.dailyVessels} vessels / day</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Average Transit Delay:</span>
                        <span className="text-rose-400 font-bold">{selectedEntity.transitDelayHours} hours</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Daily Volume:</span>
                        <span className="text-amber-300 font-bold">{selectedEntity.dailyVolume}</span>
                      </div>
                    </div>
                    {selectedEntity.securityNotice && (
                      <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/40 text-rose-300 text-[11px]">
                        <strong>Maritime Alert:</strong> {selectedEntity.securityNotice}
                      </div>
                    )}
                    <p className="text-[11px] text-zinc-400 p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      {selectedEntity.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Global Live Situation Feed */
              <div className="space-y-3 font-mono">
                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-300">
                  <span className="font-bold block">WORLD MONITOR TELEMETRY</span>
                  Live synchronization across 29 stock exchanges, 12 central banks, subsea fiber trunks, and global maritime corridors.
                </div>

                <div className="space-y-2">
                  {SITUATION_EVENTS.map(evt => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-500">
                        <span className={cn(
                          "font-bold",
                          evt.level === 'WARNING' ? "text-amber-400" : "text-cyan-400"
                        )}>
                          [{evt.category}]
                        </span>
                        <span>{evt.timestamp}</span>
                      </div>
                      <p className="text-xs text-zinc-200 mt-1 leading-snug">
                        {evt.title}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Key Macro Risk Summary */}
                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                    GLOBAL CHOKEPOINT STRESS INDEX
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Bab-el-Mandeb & Red Sea:</span>
                      <span className="text-rose-400 font-bold">88/100 (HIGH RISK)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Strait of Hormuz:</span>
                      <span className="text-amber-400 font-bold">72/100 (ELEVATED)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Panama Neo-Panamax Locks:</span>
                      <span className="text-emerald-400 font-bold">24/100 (NORMAL)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Strait of Malacca:</span>
                      <span className="text-emerald-400 font-bold">18/100 (NOMINAL)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
