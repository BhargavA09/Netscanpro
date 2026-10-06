import React, { useEffect, useState } from 'react';
import { ShieldAlert, Activity, Link as LinkIcon, AlertTriangle, Clock, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

interface Correlation {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
  relatedIds: string[];
  pattern: string;
}

export function ThreatCorrelation() {
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCorrelations = async () => {
      try {
        const data = await fetchJson<Correlation[]>('/api/correlations');
        if (Array.isArray(data)) {
          setCorrelations(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching correlations:', error);
      }
    };

    fetchCorrelations();
    const interval = setInterval(fetchCorrelations, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500">
        <Activity className="w-8 h-8 mb-4 animate-spin opacity-20" />
        <p className="font-mono text-xs uppercase tracking-widest">Running Correlation Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {correlations.length > 0 ? (
            correlations.map((correlation) => (
              <motion.div
                key={correlation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-xl overflow-hidden group hover:border-accent/30 transition-all"
              >
                <div className="flex items-stretch">
                  <div className={cn(
                    "w-1.5 shrink-0",
                    correlation.severity === 'Critical' ? "bg-critical" : 
                    correlation.severity === 'High' ? "bg-orange-500" : "bg-yellow-500"
                  )} />
                  
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider",
                            correlation.severity === 'Critical' ? "bg-critical/10 text-critical" : 
                            correlation.severity === 'High' ? "bg-orange-500/10 text-orange-500" : "bg-yellow-500/10 text-yellow-500"
                          )}>
                            {correlation.severity}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            ID: {correlation.id}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                          {correlation.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-mono">
                          {new Date(correlation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                      {correlation.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Related Events:</span>
                        <div className="flex -space-x-2">
                          {correlation.relatedIds.slice(0, 5).map((id, i) => (
                            <div 
                              key={id} 
                              className="w-5 h-5 rounded-full bg-white/5 border border-border flex items-center justify-center text-[8px] font-mono text-zinc-400"
                              title={id}
                            >
                              {i + 1}
                            </div>
                          ))}
                          {correlation.relatedIds.length > 5 && (
                            <div className="w-5 h-5 rounded-full bg-white/5 border border-border flex items-center justify-center text-[8px] font-mono text-zinc-400">
                              +{correlation.relatedIds.length - 5}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Pattern:</span>
                        <span className="text-[10px] font-mono text-accent bg-accent/5 px-2 py-0.5 rounded">
                          {correlation.pattern}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 flex items-center border-l border-white/5">
                    <button className="p-2 rounded-lg bg-white/5 border border-border text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                      <Activity className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center">
              <ShieldAlert className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No Complex Patterns Detected</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                The correlation engine is monitoring system logs and threat feeds. Currently, no multi-stage attack patterns have been identified.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-accent/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Correlation Engine Active</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Our L3 correlation engine uses heuristic analysis to link disparate events across the network. 
              By matching known Indicators of Compromise (IoCs) with system telemetry, we can identify 
              sophisticated attack chains that might otherwise go unnoticed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
