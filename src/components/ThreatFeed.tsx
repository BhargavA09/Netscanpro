import React, { useState, useEffect } from 'react';
import { Threat } from '../types';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { ShieldAlert, Clock, ExternalLink, Filter, Globe, RefreshCw } from 'lucide-react';

export function ThreatFeed() {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreats = async () => {
    try {
      const data = await fetchJson<any[]>('/api/alerts');
      if (Array.isArray(data)) {
        setThreats(data);
      }
    } catch (error) {
      console.error('Error fetching threats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-white/5">
        <h3 className="text-white font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-accent" />
          Live Threat Feed
        </h3>
        <div className="flex items-center gap-4">
          {loading && <RefreshCw className="w-3 h-3 text-zinc-500 animate-spin" />}
          <button className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            <Filter className="w-3 h-3" />
            FILTER
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {threats.map((threat) => (
          <div key={threat.id} className="p-6 hover:bg-white/5 transition-colors group cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-accent">[{threat.id}]</span>
                  <h4 className="text-white font-medium">{threat.type}</h4>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider",
                    threat.severity === 'Critical' ? "bg-critical/20 text-critical border border-critical/30" :
                    threat.severity === 'High' ? "bg-high/20 text-high border border-high/30" :
                    threat.severity === 'Medium' ? "bg-medium/20 text-medium border border-medium/30" :
                    "bg-low/20 text-low border border-low/30"
                  )}>
                    {threat.severity}
                  </span>
                  {threat.source && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                      {threat.source}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {threat.message}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {new Date(threat.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {threats.length === 0 && !loading && (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
            No active threats detected in feed
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border text-center">
        <button className="text-xs font-mono text-accent hover:underline">
          VIEW ALL THREATS
        </button>
      </div>
    </div>
  );
}
