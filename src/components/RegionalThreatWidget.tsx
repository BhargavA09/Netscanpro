import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { Globe, AlertTriangle, Shield, Activity, RefreshCw, ChevronRight, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { RegionalThreatMetric } from '../types';

interface RegionalDensityResponse {
  timestamp: string;
  totalAttacks: number;
  avgAnomaly: number;
  regions: RegionalThreatMetric[];
  liveAttacksCount: number;
}

interface AttackPoint {
  id: string;
  ip?: string;
  source: { lat: number; lng: number };
  target: { lat: number; lng: number };
  type: string;
  country?: string;
}

export function RegionalThreatWidget() {
  const [densityData, setDensityData] = useState<RegionalDensityResponse | null>(null);
  const [liveAttacks, setLiveAttacks] = useState<AttackPoint[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeMetricView, setActiveMetricView] = useState<'density' | 'vectors' | 'anomaly'>('density');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [densityRes, attacksRes] = await Promise.all([
        fetchJson<RegionalDensityResponse>('/api/network/regional-density'),
        fetchJson<AttackPoint[]>('/api/attack-map')
      ]);
      setDensityData(densityRes);
      if (Array.isArray(attacksRes)) {
        setLiveAttacks(attacksRes);
      }
    } catch (err) {
      console.error('Error fetching regional threat density:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const regions = densityData?.regions || [];
  const selectedRegionData = regions.find(r => r.region === selectedRegion) || regions[0];

  // Correlate live attack points from LiveAttackMap for this region
  const correlatedAttacks = liveAttacks.filter(atk => {
    if (!selectedRegionData) return false;
    // Check if attack id matches or country correlates
    return selectedRegionData.activeThreatIds.includes(atk.id) || 
      (atk.country && selectedRegionData.topOriginCountry.toLowerCase().includes(atk.country.toLowerCase().slice(0, 2)));
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            <h3 className="text-white font-medium text-base tracking-tight">
              Global Regional Threat Density
            </h3>
            <span className="text-[10px] font-mono uppercase text-accent/80 bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              Live Map Correlated
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 font-mono">
            <span>Total Attacks: {densityData?.totalAttacks || 0}</span>
            <span aria-hidden="true">·</span>
            <span>Avg Anomaly Index: {densityData?.avgAnomaly || 0}/100</span>
            <span aria-hidden="true">·</span>
            <span>OSINT Streams: {densityData?.liveAttacksCount || 0} active</span>
          </div>
        </div>

        {/* View Segmented Controls */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveMetricView('density')}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded transition-colors",
              activeMetricView === 'density' 
                ? "bg-accent/20 text-accent font-semibold" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            Volume & Density
          </button>
          <button
            onClick={() => setActiveMetricView('vectors')}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded transition-colors",
              activeMetricView === 'vectors' 
                ? "bg-accent/20 text-accent font-semibold" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            Vector Breakdown
          </button>
          <button
            onClick={() => setActiveMetricView('anomaly')}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded transition-colors",
              activeMetricView === 'anomaly' 
                ? "bg-accent/20 text-accent font-semibold" 
                : "text-zinc-400 hover:text-white"
            )}
          >
            Anomaly vs Latency
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Recharts Visualization Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetricView === 'density' ? (
                <BarChart data={regions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="regionCode" 
                    stroke="#525252" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: '#262626' }}
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
                    labelStyle={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'activeAttacks') return [`${value} Attacks`, 'Attack Volume'];
                      if (name === 'threatDensity') return [`${value}%`, 'Global Density Share'];
                      return [value, name];
                    }}
                  />
                  <Bar 
                    dataKey="activeAttacks" 
                    name="Attack Volume" 
                    fill="#00ff41" 
                    radius={[4, 4, 0, 0]} 
                    cursor="pointer"
                    onClick={(entry: any) => setSelectedRegion(entry.region)}
                  />
                  <Bar 
                    dataKey="threatDensity" 
                    name="Density %" 
                    fill="#0ea5e9" 
                    radius={[4, 4, 0, 0]} 
                    cursor="pointer"
                    onClick={(entry: any) => setSelectedRegion(entry.region)}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingBottom: '10px' }}
                  />
                </BarChart>
              ) : activeMetricView === 'vectors' ? (
                <BarChart data={regions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="regionCode" 
                    stroke="#525252" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: '#262626' }}
                  />
                  <YAxis 
                    stroke="#525252" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingBottom: '10px' }}
                  />
                  <Bar dataKey="vectorBreakdown.ddos" name="DDoS" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="vectorBreakdown.malware" name="Malware" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="vectorBreakdown.botnet" name="Botnet" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="vectorBreakdown.exploit" name="Exploit" stackId="a" fill="#00ff41" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="vectorBreakdown.phishing" name="Phishing" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={regions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="regionCode" 
                    stroke="#525252" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#525252" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingBottom: '10px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="anomalyScore" 
                    name="Anomaly Index (0-100)" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#anomalyGradient)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgLatency" 
                    name="Avg Latency (ms)" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#latencyGradient)" 
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Region Quick Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase mr-1">Select Region:</span>
            {regions.map((r) => {
              const isSelected = selectedRegion === r.region || (!selectedRegion && r.region === regions[0]?.region);
              return (
                <button
                  key={r.region}
                  onClick={() => setSelectedRegion(r.region)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded border transition-all text-left",
                    isSelected
                      ? "bg-accent/15 border-accent text-accent font-semibold"
                      : "bg-white/5 border-border text-zinc-400 hover:text-white hover:border-zinc-700"
                  )}
                >
                  {r.region} ({r.activeAttacks})
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Region Threat Correlation Details */}
        <div className="lg:col-span-4 bg-white/[0.02] border border-border rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Region Analysis</p>
                <h4 className="text-white font-bold text-sm tracking-tight">{selectedRegionData?.region}</h4>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-xs font-mono font-bold px-2 py-0.5 rounded",
                  selectedRegionData?.anomalyScore > 60 
                    ? "bg-critical/20 text-critical" 
                    : "bg-accent/20 text-accent"
                )}>
                  Anomaly {selectedRegionData?.anomalyScore}/100
                </span>
              </div>
            </div>

            {/* Regional Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-white/5 p-2.5 rounded border border-border">
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Threat Density</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">{selectedRegionData?.threatDensity}%</p>
                <p className="text-[10px] text-zinc-400">Share of global attacks</p>
              </div>
              <div className="bg-white/5 p-2.5 rounded border border-border">
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Avg Response Latency</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">{selectedRegionData?.avgLatency} ms</p>
                <p className="text-[10px] text-zinc-400">Backbone edge probe</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-zinc-500">Top Origin Hub</span>
                <span className="text-white font-semibold">{selectedRegionData?.topOriginCountry}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-zinc-500">Target Sector</span>
                <span className="text-zinc-300">{selectedRegionData?.topTargetSector}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="text-zinc-500">Correlated Map Nodes</span>
                <span className="text-accent font-semibold">{selectedRegionData?.correlatedAttackCount || correlatedAttacks.length} Nodes</span>
              </div>
            </div>

            {/* Correlated Live Attack Feeds from LiveAttackMap */}
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-[10px] font-mono text-zinc-500 uppercase mb-2 flex items-center justify-between">
                <span>Live Attack Correlation</span>
                <span className="text-accent text-[9px] animate-pulse">● Active Feed</span>
              </p>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                {correlatedAttacks.length > 0 ? (
                  correlatedAttacks.slice(0, 3).map((atk) => (
                    <div key={atk.id} className="text-[11px] font-mono bg-white/5 p-1.5 rounded flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-critical">{atk.ip || `Node-${atk.id.slice(0, 6)}`}</span>
                        <span className="text-zinc-500 text-[10px] block truncate">{atk.type}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        [{atk.source.lat.toFixed(1)}, {atk.source.lng.toFixed(1)}]
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] font-mono text-zinc-500 italic py-2">
                    Correlating background threat streams...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Correlation Engine: ACTIVE</span>
            <span className="text-accent">Auto-synced with Live Map</span>
          </div>
        </div>
      </div>
    </div>
  );
}
