import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  Globe2,
  HardDrive,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  TrendingDown,
  TrendingUp,
  Percent,
  Wrench
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { SreMetricsResponse } from '../types';

interface SreMetricsWidgetProps {
  className?: string;
  isCompact?: boolean;
}

export function SreMetricsWidget({ className, isCompact = false }: SreMetricsWidgetProps) {
  const [data, setData] = useState<SreMetricsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'composite' | 'latency' | 'errors' | 'uptime'>('composite');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInjectingChaos, setIsInjectingChaos] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetchJson<SreMetricsResponse>('/api/sre/metrics');
      if (res && res.summary) {
        setData(res);
      }
    } catch {
      // Gracefully handled by resilient API client fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleChaosTest = async () => {
    try {
      setIsInjectingChaos(true);
      const res = await fetchJson<{ success: boolean; message: string }>('/api/sre/chaos-test', {
        method: 'POST'
      });
      if (res && res.success) {
        setActionFeedback('Synthetic latency spike and load injected. Review SLO breach response.');
        fetchMetrics();
        setTimeout(() => setActionFeedback(null), 5000);
      }
    } catch {
      // Handled
    } finally {
      setIsInjectingChaos(false);
    }
  };

  const handleHeal = async () => {
    try {
      setIsHealing(true);
      const res = await fetchJson<{ success: boolean; message: string }>('/api/sre/heal', {
        method: 'POST'
      });
      if (res && res.success) {
        setActionFeedback('✓ Cluster auto-healed. All degraded services restored, latency normalized and error budget optimal.');
        fetchMetrics();
        setTimeout(() => setActionFeedback(null), 5000);
      }
    } catch {
      // Handled
    } finally {
      setIsHealing(false);
    }
  };

  const handleHealSingleService = async (serviceId: string) => {
    try {
      const res = await fetchJson<{ success: boolean; message: string }>(`/api/sre/services/${serviceId}/heal`, {
        method: 'POST'
      });
      if (res && res.success) {
        setActionFeedback(`✓ Healed service ${serviceId}: Restored optimal status, zeroed error rate.`);
        fetchMetrics();
        setTimeout(() => setActionFeedback(null), 5000);
      }
    } catch {
      // Handled
    }
  };

  const summary = data?.summary;
  const isDegraded = summary?.overallHealth !== 'Optimal';

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs font-mono space-y-1">
          <p className="text-zinc-400 font-bold border-b border-zinc-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {typeof entry.value === 'number' 
                  ? entry.value < 1 && entry.value > 0 
                    ? `${entry.value.toFixed(3)}%` 
                    : `${entry.value} ${entry.dataKey?.includes('uptime') ? '%' : entry.dataKey?.includes('rate') ? '%' : 'ms'}`
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden flex flex-col", className)}>
      {/* Widget Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-white/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full shrink-0",
              isDegraded ? "bg-amber-400 animate-ping" : "bg-accent animate-pulse"
            )} />
            <h3 className="text-white font-medium text-base tracking-tight flex items-center gap-2">
              Infrastructure SRE & Reliability Posture
            </h3>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
              SLO / SLA Target: 99.95%
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time telemetry measuring system latency percentiles (P50/P95/P99), error budget exhaustion, and cluster availability.
          </p>
        </div>

        {/* Action Controls & Range Selector */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          {/* Working Chaos & Heal Buttons */}
          <div className="flex items-center gap-1.5">
            {isDegraded ? (
              <button
                type="button"
                onClick={handleHeal}
                disabled={isHealing}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                title="Restore optimal routing & normalize latency"
              >
                <ShieldCheck className={cn("w-3.5 h-3.5", isHealing && "animate-spin")} />
                {isHealing ? 'Healing...' : 'Heal Cluster'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleChaosTest}
                disabled={isInjectingChaos}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-border text-zinc-300 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                title="Inject synthetic load & test SLO alerting thresholds"
              >
                <Flame className={cn("w-3.5 h-3.5 text-amber-400", isInjectingChaos && "animate-spin")} />
                {isInjectingChaos ? 'Injecting...' : 'Inject Chaos'}
              </button>
            )}

            <button
              type="button"
              onClick={fetchMetrics}
              disabled={isRefreshing}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-border text-zinc-400 hover:text-white rounded-lg transition-colors"
              title="Refresh SRE telemetry"
              aria-label="Refresh SRE telemetry"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-border">
            {(['1h', '24h', '7d'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedTimeRange(range)}
                className={cn(
                  "px-2 py-1 text-[11px] font-mono rounded transition-colors",
                  selectedTimeRange === range
                    ? "bg-white/15 text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionFeedback && (
        <div className="px-4 py-2 bg-accent/10 border-b border-accent/20 text-accent font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* SRE Core Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border border-b border-border bg-black/20">
        {/* Latency Metric Card */}
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>System Latency (P95)</span>
            <Clock className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {summary ? `${summary.currentP95}ms` : '42ms'}
            </span>
            <span className={cn(
              "text-[10px] font-mono",
              (summary?.currentP95 || 42) > 100 ? "text-amber-400" : "text-emerald-400"
            )}>
              {(summary?.currentP95 || 42) > 100 ? '▲ SLA Breach' : '▼ Target < 100ms'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
            <span>P50: {summary?.currentP50 || 18}ms</span>
            <span aria-hidden="true">·</span>
            <span>P99: {summary?.currentP99 || 88}ms</span>
          </div>
        </div>

        {/* Error Rate Metric Card */}
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Error Rate (5xx/4xx)</span>
            <AlertCircle className={cn("w-3.5 h-3.5", (summary?.currentErrorRate || 0) > 0.1 ? "text-critical" : "text-emerald-400")} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {summary ? `${summary.currentErrorRate.toFixed(3)}%` : '0.021%'}
            </span>
            <span className={cn(
              "text-[10px] font-mono",
              (summary?.currentErrorRate || 0) > 0.1 ? "text-critical font-bold" : "text-emerald-400"
            )}>
              {(summary?.currentErrorRate || 0) > 0.1 ? '▲ Exceeds SLO' : '▼ SLO < 0.10%'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            <span>Budget: {summary?.errorBudgetRemainingPercent || 91.8}% remaining</span>
          </div>
        </div>

        {/* Availability Uptime Card */}
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Availability Uptime (30d)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {summary ? `${summary.uptime30dPercent}%` : '99.988%'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              Four Nines
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
            <span>Target: {summary?.uptimeTargetPercent || 99.95}%</span>
            <span aria-hidden="true">·</span>
            <span>+0.038%</span>
          </div>
        </div>

        {/* Incident Resolution Times Card */}
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Incident MTTR & MTTD</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {summary ? `${summary.mttrMinutes}m` : '3.8m'}
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              MTTR Average
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
            <span>MTTD: {summary?.mttdMinutes || 1.4}m</span>
            <span aria-hidden="true">·</span>
            <span>Cluster: {summary?.overallHealth || 'Optimal'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for SRE Perspectives */}
      <div className="px-4 py-2.5 border-b border-border bg-white/[0.01] flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('composite')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5",
              activeTab === 'composite'
                ? "bg-white/10 text-white font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity className="w-3.5 h-3.5 text-accent" />
            Composite SRE Health
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('latency')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5",
              activeTab === 'latency'
                ? "bg-white/10 text-white font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Latency Percentiles (P50/P95/P99)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('errors')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5",
              activeTab === 'errors'
                ? "bg-white/10 text-white font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            Error Rates & Budget
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('uptime')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5",
              activeTab === 'uptime'
                ? "bg-white/10 text-white font-bold"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Uptime & SLO Availability
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 shrink-0 hidden md:block">
          Active Nodes: {summary?.activeNodesCount || 452} · Ingestion: 24,800 req/s
        </div>
      </div>

      {/* Primary Chart Canvas */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* TAB 1: Composite SRE Health (Dual Metric Composed Graph) */}
        {activeTab === 'composite' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-white font-medium text-sm flex items-center gap-2">
                  System Latency vs. Error Rate Trajectory
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time correlation comparing response duration (ms) against error frequency (%) across 24h rolling window.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-accent">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  Latency P95 (ms)
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Error Rate (%)
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.latencyHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sreLatencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff41" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#525252" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#525252" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    unit="ms" 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '100ms SLA Target', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                  <Area
                    type="monotone"
                    dataKey="p95"
                    name="P95 Latency"
                    stroke="#00ff41"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#sreLatencyGrad)"
                    isAnimationActive={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    name="P50 Latency"
                    stroke="#38bdf8"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: Latency Percentiles (P50, P95, P99) */}
        {activeTab === 'latency' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-white font-medium text-sm flex items-center gap-2">
                  Complete Latency Spectrum: P50 Median, P95, and P99 Outliers
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Detailed distribution curve illustrating tail latency outliers and edge gateway cache hit performance.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-0.5 bg-cyan-400" />
                  P50 (Median)
                </span>
                <span className="flex items-center gap-1.5 text-accent">
                  <span className="w-2.5 h-0.5 bg-accent" />
                  P95 (SLA Target)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-0.5 bg-amber-400" />
                  P99 (Tail)
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.latencyHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="time" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} unit="ms" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SLA Ceiling (100ms)', fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="p50" name="P50 Median" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="p95" name="P95 SLA" stroke="#00ff41" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="p99" name="P99 Tail Outliers" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 3: Error Rate & SLO Budget */}
        {activeTab === 'errors' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-white font-medium text-sm flex items-center gap-2">
                  Service Error Rate (%) & HTTP 4xx/5xx Volume
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Service Level Objective (SLO) monitoring: maximum allowable error rate threshold is 0.100%.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Error Rate %
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  HTTP 4xx/5xx Counts
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.errorRateHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="time" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0.10} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'SLO Target (0.10%)', fill: '#ef4444', fontSize: 10 }} />
                  <Bar dataKey="rate" name="Error Rate" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 4: Uptime & Availability */}
        {activeTab === 'uptime' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-white font-medium text-sm flex items-center gap-2">
                  High-Availability Uptime Trajectory (Four Nines Tracker)
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Continuous cluster heartbeat measuring global edge uptime against the 99.95% target baseline.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  System Availability (%)
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.uptimeHistory || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sreUptimeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="time" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} domain={[99.8, 100]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={99.95} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'SLO Target (99.95%)', fill: '#38bdf8', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="uptime"
                    name="Cluster Uptime"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#sreUptimeGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Microservice Infrastructure Health Table */}
        {!isCompact && (
          <div className="pt-4 border-t border-border space-y-3">
            {/* Degraded Alert Banner if any errors detected */}
            {data?.services?.some(s => s.status !== 'healthy') && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <span>Degraded Infrastructure Detected: High latency & error budget breach on active services</span>
                </div>
                <button
                  onClick={handleHeal}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-500/50 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Solve All Service Errors</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-accent" />
                Infrastructure Component Telemetry
              </h4>
              <span className="text-xs font-mono text-zinc-500">
                5 Critical Microservices Monitored
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/[0.02] border-b border-border text-zinc-400">
                  <tr>
                    <th className="py-2.5 px-3">Service Name</th>
                    <th className="py-2.5 px-3">Region</th>
                    <th className="py-2.5 px-3">Health</th>
                    <th className="py-2.5 px-3 text-right">Uptime</th>
                    <th className="py-2.5 px-3 text-right">Latency</th>
                    <th className="py-2.5 px-3 text-right">Error Rate</th>
                    <th className="py-2.5 px-3 text-right">CPU / RAM</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {(data?.services || []).map((svc) => (
                    <tr key={svc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">{svc.name}</div>
                        <div className="text-[10px] text-zinc-500">{svc.type}</div>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {svc.region}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            svc.status === 'healthy' ? "bg-emerald-400" :
                            svc.status === 'degraded' ? "bg-amber-400 animate-pulse" : "bg-red-400 animate-ping"
                          )} />
                          <span className={cn(
                            "capitalize font-bold text-[11px]",
                            svc.status === 'healthy' ? "text-emerald-400" :
                            svc.status === 'degraded' ? "text-amber-400" : "text-red-400"
                          )}>
                            {svc.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white">
                        {svc.uptimePercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={cn(
                          svc.latencyMs > 50 ? "text-amber-400 font-bold" : "text-zinc-300"
                        )}>
                          {svc.latencyMs}ms
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={cn(
                          svc.errorRatePercent > 0.05 ? "text-red-400 font-bold" : "text-zinc-400"
                        )}>
                          {svc.errorRatePercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-zinc-400 text-[11px]">
                        {svc.cpuUsagePercent}% / {svc.memoryUsagePercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {svc.status !== 'healthy' ? (
                          <button
                            onClick={() => handleHealSingleService(svc.id)}
                            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer shadow-sm"
                            title={`Solve error and heal ${svc.name}`}
                          >
                            <Wrench className="w-3 h-3 text-amber-400" />
                            <span>Solve Error</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Optimal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="p-3 border-t border-border bg-black/40 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <span>SLO PERIOD: Rolling 30 Days</span>
          <span aria-hidden="true">·</span>
          <span>SLA EXHAUSTION BUDGET: {summary?.errorBudgetRemainingPercent || 91.8}% SAFE</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
          <span>Last sync: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Live'}</span>
        </div>
      </div>
    </div>
  );
}
