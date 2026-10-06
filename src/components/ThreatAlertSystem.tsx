import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, AlertCircle, Zap, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

interface Alert {
  id: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium';
  message: string;
  type: string;
}

export function ThreatAlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await fetchJson<Alert[]>('/api/alerts');
        
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0];
          // Only show if it's a new alert and it's Critical or High
          if (latest.id !== lastAlertId && (latest.severity === 'Critical' || latest.severity === 'High')) {
            setAlerts(prev => [latest, ...prev].slice(0, 3));
            setLastAlertId(latest.id);
            
            // Auto-remove after 8 seconds
            setTimeout(() => {
              setAlerts(prev => prev.filter(a => a.id !== latest.id));
            }, 8000);
          }
        }
      } catch (error) {
        console.error('Error fetching alerts for notification system:', error);
      }
    };

    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, [lastAlertId]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="pointer-events-auto"
          >
            <div className={cn(
              "relative overflow-hidden bg-black/90 backdrop-blur-xl border rounded-xl p-4 shadow-2xl",
              alert.severity === 'Critical' ? "border-critical/50 shadow-critical/10" : "border-orange-500/50 shadow-orange-500/10"
            )}>
              {/* Progress Bar */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className={cn(
                  "absolute bottom-0 left-0 h-0.5",
                  alert.severity === 'Critical' ? "bg-critical" : "bg-orange-500"
                )}
              />

              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  alert.severity === 'Critical' ? "bg-critical/20 text-critical" : "bg-orange-500/20 text-orange-500"
                )}>
                  {alert.severity === 'Critical' ? <ShieldAlert className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[10px] font-mono uppercase tracking-widest font-bold",
                      alert.severity === 'Critical' ? "text-critical" : "text-orange-500"
                    )}>
                      {alert.type} DETECTED
                    </span>
                    <button 
                      onClick={() => removeAlert(alert.id)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-white font-medium leading-relaxed mb-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-zinc-500" />
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">
                      {new Date(alert.timestamp).toLocaleTimeString()} · Sentinel L3
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-[200%] animate-scanline" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
