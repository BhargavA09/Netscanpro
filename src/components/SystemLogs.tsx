import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Clock, Server, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
  source: string;
}

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await fetchJson<LogEntry[]>('/api/logs');
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  return (
    <div className="bg-black border border-border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-250px)]">
      <div className="p-4 border-b border-border bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-accent" />
          <h3 className="text-white font-mono text-sm uppercase tracking-widest">Real-time System Logs</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="autoscroll" 
              checked={autoScroll} 
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3 accent-accent"
            />
            <label htmlFor="autoscroll" className="text-[10px] font-mono text-zinc-500 uppercase">Auto-Scroll</label>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            <Server className="w-3 h-3" />
            NODE-01
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-4 py-0.5 group">
            <span className="text-zinc-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={cn(
              "shrink-0 w-16 font-bold",
              log.level === 'CRITICAL' ? "text-critical" :
              log.level === 'ERROR' ? "text-high" :
              log.level === 'WARN' ? "text-medium" : "text-zinc-500"
            )}>
              {log.level}
            </span>
            <span className="text-accent shrink-0 w-24">[{log.source}]</span>
            <span className={cn(
              "flex-1",
              log.level === 'CRITICAL' || log.level === 'ERROR' ? "text-white" : "text-zinc-400"
            )}>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
            <Cpu className="w-8 h-8 animate-pulse" />
            <p>Initializing log stream...</p>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border bg-zinc-900/30 flex items-center justify-between text-[10px] font-mono text-zinc-600">
        <span>LOG_BUFFER: {logs.length}/100</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" /> AUTH
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-medium" /> KERNEL
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-critical" /> NETWORK
          </span>
        </div>
      </div>
    </div>
  );
}
