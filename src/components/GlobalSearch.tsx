import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  Users, 
  ShieldAlert, 
  FileText, 
  Globe, 
  Terminal, 
  ArrowRight, 
  CornerDownLeft, 
  SlidersHorizontal,
  Command,
  Tag
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { IoC, ThreatActor, CmsItem, DnsRecord, Threat } from '../types';

interface GlobalSearchProps {
  onNavigate: (tab: string, context?: any) => void;
}

interface SearchItem {
  id: string;
  category: 'actor' | 'ioc' | 'article' | 'dns' | 'threat';
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
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [iocs, setIocs] = useState<IoC[]>([]);
  const [cmsItems, setCmsItems] = useState<CmsItem[]>([]);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [alerts, setAlerts] = useState<Threat[]>([]);

  // Fetch search corpus
  useEffect(() => {
    const loadSearchCorpus = async () => {
      try {
        const [actorsData, iocsData, cmsData, dnsData, alertsData] = await Promise.allSettled([
          fetchJson<ThreatActor[]>('/api/threat-actors'),
          fetchJson<IoC[]>('/api/iocs'),
          fetchJson<CmsItem[]>('/api/cms/items'),
          fetchJson<DnsRecord[]>('/api/network/dns-queries'),
          fetchJson<Threat[]>('/api/alerts')
        ]);

        if (actorsData.status === 'fulfilled' && Array.isArray(actorsData.value)) setActors(actorsData.value);
        if (iocsData.status === 'fulfilled' && Array.isArray(iocsData.value)) setIocs(iocsData.value);
        if (cmsData.status === 'fulfilled' && Array.isArray(cmsData.value)) setCmsItems(cmsData.value);
        if (dnsData.status === 'fulfilled' && Array.isArray(dnsData.value)) setDnsRecords(dnsData.value);
        if (alertsData.status === 'fulfilled' && Array.isArray(alertsData.value)) setAlerts(alertsData.value);
      } catch (err) {
        // Silently tolerate
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

  // Parse filter category syntax: 'type:actor', 'type:ioc', 'type:article', 'type:dns', 'type:threat'
  const { categoryFilter, cleanSearchTerm } = useMemo(() => {
    const lower = query.trim().toLowerCase();
    let catFilter: string | null = null;
    let clean = query;

    const prefixMap: Record<string, string> = {
      'type:actor': 'actor',
      'actor:': 'actor',
      'type:ioc': 'ioc',
      'ioc:': 'ioc',
      'type:article': 'article',
      'type:cms': 'article',
      'type:doc': 'article',
      'article:': 'article',
      'type:dns': 'dns',
      'dns:': 'dns',
      'type:threat': 'threat',
      'type:alert': 'threat',
      'threat:': 'threat'
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

    // Actors
    actors.forEach(actor => {
      allItems.push({
        id: actor.id,
        category: 'actor',
        title: `${actor.name} (${actor.id})`,
        subtitle: actor.origin ? `Origin: ${actor.origin} · Targets: ${actor.targetSectors.slice(0, 2).join(', ')}` : actor.description.slice(0, 70),
        meta: `APT Group · ${actor.aliases.join(', ')}`,
        tab: 'actors',
        tags: actor.aliases
      });
    });

    // IoCs
    iocs.forEach(ioc => {
      allItems.push({
        id: ioc.id || ioc.value,
        category: 'ioc',
        title: ioc.value,
        subtitle: `Type: ${ioc.type} · Reputation: ${ioc.reputation} · Source: ${ioc.source || 'Intel Feed'}`,
        meta: ioc.tags.join(', '),
        tab: 'lookup',
        tags: ioc.tags
      });
    });

    // CMS Articles & Documents
    cmsItems.forEach(item => {
      allItems.push({
        id: item.id,
        category: 'article',
        title: item.title,
        subtitle: item.summary || item.content.slice(0, 80),
        meta: `${item.type.toUpperCase()} · ${item.category} · Status: ${item.status}`,
        tab: 'cms',
        tags: item.tags
      });
    });

    // DNS Records
    dnsRecords.forEach(dns => {
      allItems.push({
        id: dns.id,
        category: 'dns',
        title: dns.query,
        subtitle: `Type: ${dns.recordType} · Latency: ${dns.responseTimeMs}ms · DNSSEC: ${dns.dnssec}`,
        meta: `Threat: ${dns.threatLevel} · Resolver: ${dns.resolver}`,
        tab: 'tracking'
      });
    });

    // Threats / Alerts
    alerts.forEach(alert => {
      allItems.push({
        id: alert.id,
        category: 'threat',
        title: alert.message,
        subtitle: `Severity: ${alert.severity} · Source: ${alert.source || 'Engine'}`,
        meta: alert.type,
        tab: 'feed'
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
  }, [actors, iocs, cmsItems, dnsRecords, alerts, categoryFilter, cleanSearchTerm]);

  // Handle item selection / navigation
  const handleSelect = (item: SearchItem) => {
    onNavigate(item.tab, { searchTargetId: item.id });
    setIsOpen(false);
    setQuery('');
  };

  // Quick category prefix applicator
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
      case 'actor': return <Users className="w-3.5 h-3.5 text-orange-400" />;
      case 'ioc': return <ShieldAlert className="w-3.5 h-3.5 text-critical" />;
      case 'article': return <FileText className="w-3.5 h-3.5 text-accent" />;
      case 'dns': return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case 'threat': return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Tag className="w-3.5 h-3.5 text-zinc-400" />;
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
          placeholder="Global Search (e.g. type:actor, type:ioc)..." 
          className="bg-white/5 border border-border rounded-lg py-1.5 pl-10 pr-16 text-xs text-white focus:outline-none focus:border-accent/60 w-72 lg:w-96 transition-all font-mono"
        />
        
        {query ? (
          <button 
            type="button" 
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[9px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded border border-border">
            <span>⌘K</span>
          </div>
        )}
      </div>

      {/* Dropdown Results & Filter Palette */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-[480px] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden font-mono">
          {/* Category Filter Chips Ribbon */}
          <div className="p-2.5 bg-white/[0.02] border-b border-border flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-zinc-500 text-[10px] uppercase mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Filter:
            </span>
            <button
              onClick={clearFilter}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px]",
                !categoryFilter ? "bg-accent/20 text-accent font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              All
            </button>
            <button
              onClick={() => applyCategoryFilter('actor')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px]",
                categoryFilter === 'actor' ? "bg-orange-500/20 text-orange-400 font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:actor
            </button>
            <button
              onClick={() => applyCategoryFilter('ioc')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px]",
                categoryFilter === 'ioc' ? "bg-critical/20 text-critical font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:ioc
            </button>
            <button
              onClick={() => applyCategoryFilter('article')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px]",
                categoryFilter === 'article' ? "bg-accent/20 text-accent font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:article
            </button>
            <button
              onClick={() => applyCategoryFilter('dns')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px]",
                categoryFilter === 'dns' ? "bg-blue-500/20 text-blue-400 font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:dns
            </button>
            <button
              onClick={() => applyCategoryFilter('threat')}
              className={cn(
                "px-2 py-0.5 rounded transition-colors text-[10px]",
                categoryFilter === 'threat' ? "bg-amber-500/20 text-amber-400 font-semibold" : "text-zinc-400 hover:text-white"
              )}
            >
              type:threat
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={`${item.category}-${item.id}-${index}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "p-3 cursor-pointer transition-colors flex items-start justify-between gap-3 text-left",
                      isSelected ? "bg-accent/15" : "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 text-zinc-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.subtitle}</p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">{item.meta}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-[10px] text-zinc-500">
                      <span className="capitalize">{item.tab}</span>
                      <ArrowRight className="w-3 h-3 text-accent" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No results found for <span className="text-white">"{query}"</span>.
                <p className="text-[10px] text-zinc-600 mt-1">
                  Try syntax like <code className="text-accent">type:actor</code>, <code className="text-accent">type:ioc</code>, or <code className="text-accent">type:article</code>.
                </p>
              </div>
            )}
          </div>

          {/* Footer Guide */}
          <div className="p-2 border-t border-border bg-white/[0.02] flex items-center justify-between text-[10px] text-zinc-500 px-3">
            <span>Use ↑↓ to navigate &middot; Enter to jump &middot; Esc to close</span>
            <span className="text-accent">{filteredItems.length} items matched</span>
          </div>
        </div>
      )}
    </div>
  );
}
