import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal, 
  Server, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Wrench, 
  Search, 
  Filter, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  Info, 
  X, 
  Check, 
  Cpu, 
  Activity, 
  FileCheck,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { LogEntry } from '../types';

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'ACTIVE_ERRORS' | 'CRITICAL' | 'ERROR' | 'WARN' | 'INFO' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [isResolvingAll, setIsResolvingAll] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<string>('null_route');
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const data = await fetchJson<LogEntry[]>('/api/logs');
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch {
      // Handled silently
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  // Compute stats
  const stats = useMemo(() => {
    const total = logs.length;
    const activeErrors = logs.filter(l => (l.level === 'CRITICAL' || l.level === 'ERROR') && l.status !== 'RESOLVED').length;
    const resolved = logs.filter(l => l.status === 'RESOLVED').length;
    const warnings = logs.filter(l => l.level === 'WARN').length;
    return { total, activeErrors, resolved, warnings };
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by category/level
      if (filterLevel === 'ACTIVE_ERRORS') {
        if (!((log.level === 'CRITICAL' || log.level === 'ERROR') && log.status !== 'RESOLVED')) return false;
      } else if (filterLevel === 'RESOLVED') {
        if (log.status !== 'RESOLVED') return false;
      } else if (filterLevel !== 'ALL') {
        if (log.level !== filterLevel) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMsg = log.message.toLowerCase().includes(q);
        const matchesSrc = log.source.toLowerCase().includes(q);
        const matchesLvl = log.level.toLowerCase().includes(q);
        const matchesId = log.id.toLowerCase().includes(q);
        return matchesMsg || matchesSrc || matchesLvl || matchesId;
      }

      return true;
    });
  }, [logs, filterLevel, searchQuery]);

  // Solve a single error log
  const handleResolveSingle = async (log: LogEntry, actionNote?: string) => {
    try {
      setResolvingId(log.id);
      const res = await fetchJson<{ success: boolean; log: LogEntry; activeErrorsCount: number; isUnderAttack: boolean }>(
        `/api/logs/resolve/${log.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionNote: actionNote || log.suggestedAction || `Remediated ${log.source} fault with zero-trust ACL rule.`
          })
        }
      );

      if (res && res.success) {
        setLogs(prev => prev.map(l => l.id === log.id ? { ...l, status: 'RESOLVED', remediation: res.log.remediation, resolvedAt: res.log.resolvedAt } : l));
        setSuccessBanner(`✓ Solved error in ${log.source}: ${res.log.remediation || 'Remediation rule applied'}`);
        setTimeout(() => setSuccessBanner(null), 4000);
        if (selectedLog && selectedLog.id === log.id) {
          setSelectedLog({ ...selectedLog, status: 'RESOLVED', remediation: res.log.remediation, resolvedAt: res.log.resolvedAt });
        }
      }
    } catch {
      // Optimistic client-side resolution fallback
      setLogs(prev => prev.map(l => l.id === log.id ? { ...l, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : l));
    } finally {
      setResolvingId(null);
    }
  };

  // Solve all active errors in the system
  const handleResolveAll = async () => {
    try {
      setIsResolvingAll(true);
      const res = await fetchJson<{ success: boolean; resolvedCount: number; isUnderAttack: boolean; message: string }>(
        '/api/logs/resolve-all',
        { method: 'POST' }
      );

      if (res && res.success) {
        setLogs(prev => prev.map(l => {
          if ((l.level === 'CRITICAL' || l.level === 'ERROR') && l.status !== 'RESOLVED') {
            return {
              ...l,
              status: 'RESOLVED',
              resolvedAt: new Date().toISOString(),
              remediation: `SOC Auto-Remediation: Isolated threat vector on ${l.source}.`
            };
          }
          return l;
        }));
        setSuccessBanner(`✓ Successfully solved all ${res.resolvedCount || stats.activeErrors} active system errors! Threat posture normalized.`);
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch {
      // Fallback
      setLogs(prev => prev.map(l => (l.level === 'CRITICAL' || l.level === 'ERROR') ? { ...l, status: 'RESOLVED' } : l));
    } finally {
      setIsResolvingAll(false);
    }
  };

  // Clear resolved logs
  const handleClearResolved = async () => {
    try {
      await fetchJson('/api/logs/clear-resolved', { method: 'POST' });
      setLogs(prev => prev.filter(l => l.status !== 'RESOLVED'));
      setSuccessBanner('✓ Cleared resolved log history from local buffer.');
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch {
      setLogs(prev => prev.filter(l => l.status !== 'RESOLVED'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Remediation & Telemetry HUD */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-black/40 border border-border rounded-lg flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-zinc-400">Total Buffer:</span>
            <span className="text-xs font-mono font-bold text-white">{stats.total}</span>
          </div>

          <div className={cn(
            "px-3 py-1.5 border rounded-lg flex items-center gap-2 transition-all",
            stats.activeErrors > 0 
              ? "bg-critical/10 border-critical/30 text-critical animate-pulse" 
              : "bg-black/40 border-border text-zinc-400"
          )}>
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs font-mono">Active Errors:</span>
            <span className="text-xs font-mono font-bold text-white">{stats.activeErrors}</span>
          </div>

          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-mono">Solved Errors:</span>
            <span className="text-xs font-mono font-bold text-white">{stats.resolved}</span>
          </div>

          <div className="px-3 py-1.5 bg-black/40 border border-border rounded-lg flex items-center gap-2 text-zinc-400">
            <AlertTriangle className="w-4 h-4 text-medium" />
            <span className="text-xs font-mono">Warnings:</span>
            <span className="text-xs font-mono font-bold text-white">{stats.warnings}</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {stats.activeErrors > 0 ? (
            <button
              onClick={handleResolveAll}
              disabled={isResolvingAll}
              className="px-3 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
            >
              {isResolvingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Resolving System Errors...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Solve All Active Errors ({stats.activeErrors})
                </>
              )}
            </button>
          ) : (
            <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              All Errors Mitigated
            </div>
          )}

          {stats.resolved > 0 && (
            <button
              onClick={handleClearResolved}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-border text-zinc-300 font-mono text-xs rounded-lg transition-all flex items-center gap-1.5"
              title="Clear resolved records from display"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              Flush Resolved ({stats.resolved})
            </button>
          )}
        </div>
      </div>

      {/* Success / Notification Banner */}
      {successBanner && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-300 font-mono text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Terminal Window */}
      <div className="bg-black border border-border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-270px)] min-h-[500px]">
        {/* Terminal Header & Filter Bar */}
        <div className="p-3 border-b border-border bg-zinc-900/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterLevel('ALL')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all shrink-0",
                filterLevel === 'ALL' ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilterLevel('ACTIVE_ERRORS')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all shrink-0 flex items-center gap-1.5",
                filterLevel === 'ACTIVE_ERRORS' 
                  ? "bg-critical/20 text-critical font-bold border border-critical/30" 
                  : "text-red-400/70 hover:text-red-400"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-critical animate-ping" />
              Active Errors ({stats.activeErrors})
            </button>
            <button
              onClick={() => setFilterLevel('CRITICAL')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all shrink-0",
                filterLevel === 'CRITICAL' ? "bg-critical/20 text-critical font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterLevel('ERROR')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all shrink-0",
                filterLevel === 'ERROR' ? "bg-amber-500/20 text-amber-400 font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Error
            </button>
            <button
              onClick={() => setFilterLevel('WARN')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all shrink-0",
                filterLevel === 'WARN' ? "bg-yellow-500/20 text-yellow-400 font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Warn
            </button>
            <button
              onClick={() => setFilterLevel('INFO')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all shrink-0",
                filterLevel === 'INFO' ? "bg-blue-500/20 text-blue-400 font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Info
            </button>
            <button
              onClick={() => setFilterLevel('RESOLVED')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono transition-all shrink-0",
                filterLevel === 'RESOLVED' ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Solved ({stats.resolved})
            </button>
          </div>

          {/* Search & Auto-Scroll */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter logs or source..."
                className="w-full pl-8 pr-3 py-1 bg-black/60 border border-border rounded text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input 
                type="checkbox" 
                id="autoscroll" 
                checked={autoScroll} 
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-3 h-3 accent-accent cursor-pointer"
              />
              <label htmlFor="autoscroll" className="text-[10px] font-mono text-zinc-500 uppercase cursor-pointer select-none">Auto-Scroll</label>
            </div>
          </div>
        </div>

        {/* Log Entries Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {filteredLogs.map((log) => {
            const isErrorOrCrit = log.level === 'CRITICAL' || log.level === 'ERROR';
            const isActive = isErrorOrCrit && log.status !== 'RESOLVED';
            const isSolved = log.status === 'RESOLVED';

            return (
              <div 
                key={log.id} 
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg border transition-all cursor-pointer group",
                  isActive 
                    ? "bg-red-950/20 hover:bg-red-950/30 border-red-900/40" 
                    : isSolved
                    ? "bg-emerald-950/10 hover:bg-emerald-950/20 border-emerald-900/30"
                    : "hover:bg-white/[0.02] border-transparent"
                )}
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <span className="text-zinc-600 shrink-0 text-[11px]">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>

                  <span className={cn(
                    "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider",
                    log.level === 'CRITICAL' ? "bg-critical/20 text-critical border border-critical/30" :
                    log.level === 'ERROR' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    log.level === 'WARN' ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {log.level}
                  </span>

                  <span className="text-accent shrink-0 font-bold">[{log.source}]</span>

                  <span className={cn(
                    "truncate flex-1 text-xs",
                    isActive ? "text-white font-medium" : 
                    isSolved ? "text-zinc-400 line-through decoration-emerald-500/50" : "text-zinc-300"
                  )}>
                    {log.message}
                  </span>
                </div>

                {/* Status Badges & Quick Action */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  {isActive && (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-critical/20 border border-critical/40 text-[10px] font-mono text-critical font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-critical animate-ping" />
                        ACTIVE ERROR
                      </span>

                      <button
                        onClick={() => handleResolveSingle(log)}
                        disabled={resolvingId === log.id}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold rounded flex items-center gap-1 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        title="Solve and remediate this error now"
                      >
                        {resolvingId === log.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wrench className="w-3 h-3" />
                        )}
                        Solve Error
                      </button>
                    </div>
                  )}

                  {isSolved && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                      <Check className="w-3 h-3" />
                      SOLVED
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-600 space-y-3">
              <Cpu className="w-8 h-8 animate-pulse text-zinc-500" />
              <p className="font-mono text-xs">No logs matching active filter criteria</p>
              {filterLevel !== 'ALL' && (
                <button
                  onClick={() => setFilterLevel('ALL')}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs rounded border border-border"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="p-2 border-t border-border bg-zinc-900/40 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span>BUFFER: {logs.length}/100</span>
            <span>DISPLAYED: {filteredLogs.length}</span>
            <span>NODE: SOC-GATEWAY-01</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" /> AUTH
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> FIREWALL
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-critical" /> CRITICAL
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> RESOLVED
            </span>
          </div>
        </div>
      </div>

      {/* Error Remediation & Detailed Investigation Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent" />
                <h4 className="text-white font-mono text-sm font-bold">
                  Error Investigation & Playbook Remediation
                </h4>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Incident Details Card */}
            <div className="space-y-2 bg-black/40 border border-border p-3.5 rounded-lg font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Incident ID:</span>
                <span className="text-white font-bold">{selectedLog.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Timestamp:</span>
                <span className="text-zinc-300">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Severity:</span>
                <span className={cn(
                  "px-2 py-0.5 rounded font-bold text-[10px]",
                  selectedLog.level === 'CRITICAL' ? "bg-critical/20 text-critical" :
                  selectedLog.level === 'ERROR' ? "bg-red-500/20 text-red-400" :
                  selectedLog.level === 'WARN' ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-300"
                )}>
                  {selectedLog.level}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Source Component:</span>
                <span className="text-accent font-bold">{selectedLog.source}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-zinc-500 block mb-1">Raw Error Message:</span>
                <p className="text-white bg-zinc-900/80 p-2 rounded border border-zinc-800 font-mono text-xs break-words">
                  {selectedLog.message}
                </p>
              </div>
            </div>

            {/* Status & Remediation History */}
            {selectedLog.status === 'RESOLVED' ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Status: Incident Resolved & Mitigated
                </div>
                {selectedLog.remediation && (
                  <p className="text-zinc-300 font-mono text-xs pl-6">
                    {selectedLog.remediation}
                  </p>
                )}
                {selectedLog.resolvedAt && (
                  <p className="text-zinc-500 font-mono text-[10px] pl-6">
                    Resolved at: {new Date(selectedLog.resolvedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Select Automated Remediation Playbook:
                </div>

                <div className="space-y-2">
                  <label 
                    onClick={() => setSelectedPlaybook('null_route')}
                    className={cn(
                      "flex items-start gap-2.5 p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all",
                      selectedPlaybook === 'null_route' 
                        ? "bg-accent/10 border-accent text-white" 
                        : "bg-black/30 border-border text-zinc-400 hover:text-white"
                    )}
                  >
                    <input 
                      type="radio" 
                      name="playbook" 
                      checked={selectedPlaybook === 'null_route'} 
                      onChange={() => setSelectedPlaybook('null_route')}
                      className="mt-0.5 accent-accent"
                    />
                    <div>
                      <div className="font-bold text-white">Deploy Ingress ACL Drop / Null-Route</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Bans offending IP at the edge firewall and rejects suspicious TCP syn-floods.</div>
                    </div>
                  </label>

                  <label 
                    onClick={() => setSelectedPlaybook('revoke_session')}
                    className={cn(
                      "flex items-start gap-2.5 p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all",
                      selectedPlaybook === 'revoke_session' 
                        ? "bg-accent/10 border-accent text-white" 
                        : "bg-black/30 border-border text-zinc-400 hover:text-white"
                    )}
                  >
                    <input 
                      type="radio" 
                      name="playbook" 
                      checked={selectedPlaybook === 'revoke_session'} 
                      onChange={() => setSelectedPlaybook('revoke_session')}
                      className="mt-0.5 accent-accent"
                    />
                    <div>
                      <div className="font-bold text-white">Revoke Auth Token & Enforce MFA Challenge</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Terminates invalid session identifiers and quarantines the user profile.</div>
                    </div>
                  </label>

                  <label 
                    onClick={() => setSelectedPlaybook('cycle_service')}
                    className={cn(
                      "flex items-start gap-2.5 p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all",
                      selectedPlaybook === 'cycle_service' 
                        ? "bg-accent/10 border-accent text-white" 
                        : "bg-black/30 border-border text-zinc-400 hover:text-white"
                    )}
                  >
                    <input 
                      type="radio" 
                      name="playbook" 
                      checked={selectedPlaybook === 'cycle_service'} 
                      onChange={() => setSelectedPlaybook('cycle_service')}
                      className="mt-0.5 accent-accent"
                    />
                    <div>
                      <div className="font-bold text-white">Restart Worker & Reconcile Ingress Buffer</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Flushes corrupt connection state and validates kernel socket memory.</div>
                    </div>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 font-mono text-xs rounded-lg border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const note = selectedPlaybook === 'null_route' 
                        ? 'Enforced Edge ACL rule and null-routed malicious source subnet.'
                        : selectedPlaybook === 'revoke_session'
                        ? 'Revoked invalid auth tokens and enforced biometric re-auth.'
                        : 'Restarted connection worker and validated kernel buffer integrity.';
                      handleResolveSingle(selectedLog, note);
                    }}
                    disabled={resolvingId === selectedLog.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {resolvingId === selectedLog.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Executing Remediation...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        Execute Remediation & Solve Error
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
