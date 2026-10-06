import React, { useState, useEffect, useCallback } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Info, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { IoC } from '../types';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

export function IoCLookup() {
  const [query, setQuery] = useState('');
  const [allIocs, setAllIocs] = useState<IoC[]>([]);
  const [results, setResults] = useState<IoC[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const fetchIocs = useCallback(async () => {
    try {
      const data = await fetchJson<IoC[]>('/api/iocs');
      if (Array.isArray(data)) {
        setAllIocs(data);
        setLastUpdated(new Date());
        setIsOnline(true);
      }
    } catch (error) {
      console.error('Error fetching IoCs:', error);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIocs();
    const interval = setInterval(fetchIocs, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchIocs]);

  useEffect(() => {
    if (searched && query.trim()) {
      const filtered = allIocs.filter(ioc => 
        ioc.value.toLowerCase().includes(query.toLowerCase()) ||
        ioc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [allIocs, query, searched]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearched(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-8 rounded-xl text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-2">Indicator Lookup</h3>
        <p className="text-zinc-500 mb-8">Search our global database for malicious IPs, domains, and file hashes</p>
        
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-border">
            {isOnline ? (
              <Wifi className="w-3 h-3 text-accent" />
            ) : (
              <WifiOff className="w-3 h-3 text-critical" />
            )}
            <span className={cn(
              "text-[10px] font-mono uppercase tracking-widest",
              isOnline ? "text-accent" : "text-critical"
            )}>
              {isOnline ? 'Intelligence Feed: Live' : 'Intelligence Feed: Offline'}
            </span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
              Last Sync: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter IP, Domain, or Hash..."
            className="w-full bg-black/40 border border-border rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent/50 transition-all shadow-2xl"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-accent/90 transition-all"
          >
            SEARCH
          </button>
        </form>
      </div>

      {searched && (
        <div className="space-y-4">
          <h4 className="text-zinc-400 text-xs font-mono uppercase tracking-widest px-2">
            Results for "{query}" ({results.length})
          </h4>
          
          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((ioc) => (
                <div key={ioc.id || ioc.value} className="bg-card border border-border p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      ioc.reputation === 'Malicious' ? "bg-critical/10 text-critical" :
                      ioc.reputation === 'Suspicious' ? "bg-high/10 text-high" : "bg-low/10 text-low"
                    )}>
                      {ioc.reputation === 'Malicious' ? <AlertTriangle className="w-6 h-6" /> :
                       ioc.reputation === 'Suspicious' ? <Info className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono text-zinc-500 px-2 py-0.5 rounded bg-white/5 border border-border">
                          {ioc.type}
                        </span>
                        {ioc.source && (
                          <span className="text-xs font-mono text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                            {ioc.source}
                          </span>
                        )}
                        <h5 className="text-white font-mono break-all">{ioc.value}</h5>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ioc.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-mono text-zinc-400">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                      ioc.reputation === 'Malicious' ? "text-critical border border-critical/30" :
                      ioc.reputation === 'Suspicious' ? "text-high border border-high/30" : "text-low border border-low/30"
                    )}>
                      {ioc.reputation}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Last Seen: {ioc.lastSeen}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border p-12 rounded-xl text-center">
              <Shield className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No malicious indicators found for this query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
