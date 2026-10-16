import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Users, 
  Wifi, 
  Router, 
  Radio, 
  Activity, 
  Laptop, 
  SlidersHorizontal,
  Command,
  ArrowRight,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { DnsRecord, WifiMeshTelemetryResponse, WifiEventLogEntry, NetworkDiscoveryDevice } from '../types';

interface GlobalSearchProps {
  onNavigate: (tab: string, context?: any) => void;
}

interface SearchItem {
  id: string;
  category: 'device' | 'mesh' | 'dpi' | 'user' | 'log';
  title: string;
  subtitle: string;
  meta: string;
  tab: string;
  tags?: string[];
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cached data sets for searching
  const [discoveryDevices, setDiscoveryDevices] = useState<NetworkDiscoveryDevice[]>([]);
  const [telemetry, setTelemetry] = useState<WifiMeshTelemetryResponse | null>(null);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [logs, setLogs] = useState<WifiEventLogEntry[]>([]);

  // Fetch search corpus from backend
  useEffect(() => {
    const loadSearchCorpus = async () => {
      try {
        const [devsRes, telRes, dnsRes, logsRes] = await Promise.allSettled([
          fetchJson<{ devices: NetworkDiscoveryDevice[] }>('/api/network/discovery/devices'),
          fetchJson<WifiMeshTelemetryResponse>('/api/wifi/telemetry'),
          fetchJson<DnsRecord[]>('/api/network/dns-queries'),
          fetchJson<{ logs: WifiEventLogEntry[] }>('/api/wifi/logs?limit=40')
        ]);

        if (devsRes.status === 'fulfilled' && devsRes.value?.devices) {
          setDiscoveryDevices(devsRes.value.devices);
        }
        if (telRes.status === 'fulfilled' && telRes.value) {
          setTelemetry(telRes.value);
        }
        if (dnsRes.status === 'fulfilled' && Array.isArray(dnsRes.value)) {
          setDnsRecords(dnsRes.value);
        }
        if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value?.logs)) {
          setLogs(logsRes.value.logs);
        }
      } catch (err) {
        console.warn("Search corpus load failed:", err);
      }
    };

    loadSearchCorpus();
  }, []);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse filter category syntax
  const { categoryFilter, cleanSearchTerm } = useMemo(() => {
    const lower = query.trim().toLowerCase();
    let catFilter: string | null = null;
    let clean = query.trim();

    const prefixMap: Record<string, 'device' | 'mesh' | 'dpi' | 'user' | 'log'> = {
      'type:device': 'device',
      'device:': 'device',
      'type:mesh': 'mesh',
      'mesh:': 'mesh',
      'type:dpi': 'dpi',
      'dpi:': 'dpi',
      'type:dns': 'dpi',
      'dns:': 'dpi',
      'type:user': 'user',
      'user:': 'user',
      'type:log': 'log',
      'log:': 'log'
    };

    for (const [prefix, cat] of Object.entries(prefixMap)) {
      if (lower.startsWith(prefix)) {
        catFilter = cat;
        clean = query.slice(prefix.length).trim();
        break;
      }
    }

    return { categoryFilter: catFilter, cleanSearchTerm: clean };
  }, [query]);

  // Aggregate and filter search items
  const filteredItems = useMemo(() => {
    const allItems: SearchItem[] = [];

    // 1. Discovered Devices (ARPing + Nmap)
    discoveryDevices.forEach(d => {
      allItems.push({
        id: d.id || d.ip,
        category: 'device',
        title: `${d.hostname} (${d.ip})`,
        subtitle: `MAC: ${d.mac} · Vendor: ${d.vendor} · Ports: ${d.openPorts.map(p => p.port).join(', ')}`,
        meta: `DISCOVERY SCAN · Latency: ${d.latencyMs}ms · OS: ${d.osFingerprint}`,
        tab: 'network',
        tags: [d.ip, d.mac, d.vendor, d.hostname, d.userOwner]
      });
    });

    // 2. Wi-Fi Mesh AP Nodes
    if (telemetry?.nodes) {
      telemetry.nodes.forEach(n => {
        allItems.push({
          id: n.id,
          category: 'mesh',
          title: `${n.name} (${n.room})`,
          subtitle: `Model: ${n.model} · IP: ${n.ip} · Backhaul: ${n.backhaulType}`,
          meta: `WI-FI MESH NODE · Radios: ${n.radios.map(r => r.band).join(', ')} · Floor: ${n.floor}`,
          tab: 'wifimap',
          tags: [n.name, n.ip, n.model, n.room, n.floor]
        });
      });
    }

    // 3. Connected Stations & Household Users
    if (telemetry?.clients) {
      telemetry.clients.forEach(c => {
        allItems.push({
          id: c.id,
          category: 'user',
          title: `${c.userName} - ${c.deviceHost}`,
          subtitle: `IP: ${c.ip} · RSSI: ${c.rssiDbm} dBm · VLAN: ${c.vlan} · Role: ${c.userRole}`,
          meta: `HOUSEHOLD ACCESS · CAKE SQM: ${c.qosPriority}`,
          tab: 'neighborhood',
          tags: [c.userName, c.deviceHost, c.ip, c.userRole]
        });
      });
    }

    // 4. DNS Queries & DPI Wire Frames
    dnsRecords.forEach(dns => {
      allItems.push({
        id: dns.id,
        category: 'dpi',
        title: dns.query,
        subtitle: `Type: ${dns.recordType} · Latency: ${dns.responseTimeMs}ms · Threat: ${dns.threatLevel}`,
        meta: `DNS DPI TRACER · Resolver: ${dns.resolver}`,
        tab: 'tracking',
        tags: [dns.query, dns.recordType, dns.threatLevel]
      });
    });

    // 5. Universal System & Roaming Audit Logs
    logs.forEach(l => {
      allItems.push({
        id: l.id,
        category: 'log',
        title: l.message,
        subtitle: `Level: ${l.level} · Source: ${l.source} · Time: ${new Date(l.timestamp).toLocaleTimeString()}`,
        meta: `EVENT LOG · Category: ${l.category.replace('_', ' ')}`,
        tab: 'activity',
        tags: [l.message, l.level, l.category, l.source]
      });
    });

    // Apply category filter if specified
    let filtered = allItems;
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Apply text matching
    if (cleanSearchTerm) {
      const term = cleanSearchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term) ||
        item.meta.toLowerCase().includes(term) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(term)))
      );
    }

    return filtered.slice(0, 15);
  }, [discoveryDevices, telemetry, dnsRecords, logs, categoryFilter, cleanSearchTerm]);

  const handleSelect = (item: SearchItem) => {
    onNavigate(item.tab, { searchTargetId: item.id });
    setIsOpen(false);
    setQuery('');
  };

  const applyCategoryFilter = (cat: string) => {
    setQuery(`type:${cat} `);
    inputRef.current?.focus();
  };

  const clearFilter = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'device': return <Laptop className="w-3.5 h-3.5 text-sky-400" />;
      case 'mesh': return <Router className="w-3.5 h-3.5 text-accent" />;
      case 'user': return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      case 'dpi': return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      case 'log': return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <Search className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input Trigger Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
              e.preventDefault();
              handleSelect(filteredItems[selectedIndex]);
            }
          }}
          placeholder="Search devices, mesh APs, DNS, packets..." 
          className="bg-white/5 border border-border rounded-lg py-1.5 pl-8 sm:pl-9 pr-6 sm:pr-12 text-xs text-white focus:outline-none focus:border-accent/60 w-36 sm:w-64 md:w-80 lg:w-96 transition-all font-mono"
        />
        
        {query ? (
          <button 
            type="button" 
            onClick={() => setQuery('')}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 text-[9px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded border border-border">
            <span>⌘K</span>
          </div>
        )}
      </div>

      {/* Dropdown Results & Filter Palette */}
      {isOpen && (
        <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:left-0 top-16 sm:top-auto sm:mt-2 max-w-full sm:w-[500px] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden font-mono">
          {/* Category Filter Chips Ribbon */}
          <div className="p-2.5 bg-white/[0.02] border-b border-border flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-zinc-500 text-[10px] uppercase mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Filter:
            </span>
            <button
              onClick={clearFilter}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer",
                !categoryFilter ? "bg-accent/20 text-accent font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              All
            </button>
            <button
              onClick={() => applyCategoryFilter('device')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer",
                categoryFilter === 'device' ? "bg-sky-500/20 text-sky-400 font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:device
            </button>
            <button
              onClick={() => applyCategoryFilter('mesh')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer",
                categoryFilter === 'mesh' ? "bg-accent/20 text-accent font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:mesh
            </button>
            <button
              onClick={() => applyCategoryFilter('dpi')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer",
                categoryFilter === 'dpi' ? "bg-purple-500/20 text-purple-400 font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:dpi
            </button>
            <button
              onClick={() => applyCategoryFilter('user')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer",
                categoryFilter === 'user' ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:user
            </button>
            <button
              onClick={() => applyCategoryFilter('log')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px] cursor-pointer",
                categoryFilter === 'log' ? "bg-cyan-500/20 text-cyan-400 font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:log
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={`search-${item.category}-${item.id}-${index}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "p-3 cursor-pointer transition-colors flex items-start justify-between gap-3 text-left",
                      isSelected ? "bg-accent/15" : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 p-1 rounded bg-white/5 border border-border shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.subtitle}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tight">{item.meta}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-zinc-500 text-[10px]">
                      <span className="capitalize">{item.tab}</span>
                      <ArrowRight className="w-3 h-3 text-accent" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                No matching network assets or telemetry found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
