import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network as NetworkIcon, 
  Search, 
  Play, 
  Pause, 
  Trash2, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Cpu, 
  Server, 
  Globe, 
  FileCode, 
  CheckCircle2, 
  XCircle, 
  CornerDownRight, 
  Filter,
  Eye,
  RefreshCw,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { DnsRecord, PacketRecord, DnsTraceHop } from '../types';

export function CentralNetworkTracking() {
  const [activeTab, setActiveTab] = useState<'dns' | 'packets'>('dns');
  
  // DNS tracking state
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [selectedDnsRecord, setSelectedDnsRecord] = useState<DnsRecord | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [customRecordType, setCustomRecordType] = useState<'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX'>('A');
  const [isTracingDns, setIsTracingDns] = useState(false);
  const [dnsSearchQuery, setDnsSearchQuery] = useState('');
  const [dnsThreatFilter, setDnsThreatFilter] = useState<'all' | 'safe' | 'suspicious' | 'malicious'>('all');

  // Packet stream state
  const [packetRecords, setPacketRecords] = useState<PacketRecord[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<PacketRecord | null>(null);
  const [isPacketStreamPaused, setIsPacketStreamPaused] = useState(false);
  const [packetProtoFilter, setPacketProtoFilter] = useState<string>('ALL');
  const [packetSearchQuery, setPacketSearchQuery] = useState('');

  // Fetch initial and real-time DNS queries
  useEffect(() => {
    const fetchDns = async () => {
      try {
        const data = await fetchJson<DnsRecord[]>('/api/network/dns-queries');
        if (Array.isArray(data)) {
          setDnsRecords(data);
          if (!selectedDnsRecord && data.length > 0) {
            setSelectedDnsRecord(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching DNS queries:', err);
      }
    };

    fetchDns();
    const interval = setInterval(fetchDns, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time packet stream
  useEffect(() => {
    if (isPacketStreamPaused) return;

    const fetchPackets = async () => {
      try {
        const data = await fetchJson<PacketRecord[]>('/api/network/packets');
        if (Array.isArray(data)) {
          setPacketRecords(data);
          if (!selectedPacket && data.length > 0) {
            setSelectedPacket(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching network packets:', err);
      }
    };

    fetchPackets();
    const interval = setInterval(fetchPackets, 2500);
    return () => clearInterval(interval);
  }, [isPacketStreamPaused]);

  // Handle custom DNS trace trigger
  const handleTraceCustomDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomainInput.trim()) return;

    setIsTracingDns(true);
    try {
      const response = await fetch('/api/network/trace-dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: customDomainInput.trim(),
          recordType: customRecordType,
          clientIp: '10.0.0.45'
        })
      });
      if (response.ok) {
        const result: DnsRecord = await response.json();
        setDnsRecords(prev => [result, ...prev]);
        setSelectedDnsRecord(result);
        setCustomDomainInput('');
      }
    } catch (err) {
      console.error('Error tracing domain:', err);
    } finally {
      setIsTracingDns(false);
    }
  };

  // Filtered DNS records
  const filteredDnsRecords = useMemo(() => {
    return dnsRecords.filter(record => {
      const matchesSearch = record.query.toLowerCase().includes(dnsSearchQuery.toLowerCase()) ||
        record.resolver.toLowerCase().includes(dnsSearchQuery.toLowerCase()) ||
        record.clientIp.includes(dnsSearchQuery);
      
      const matchesThreat = dnsThreatFilter === 'all' || record.threatLevel.toLowerCase() === dnsThreatFilter;
      return matchesSearch && matchesThreat;
    });
  }, [dnsRecords, dnsSearchQuery, dnsThreatFilter]);

  // Filtered packet records
  const filteredPackets = useMemo(() => {
    return packetRecords.filter(pkt => {
      const matchesProto = packetProtoFilter === 'ALL' || pkt.protocol.toUpperCase() === packetProtoFilter;
      const matchesSearch = pkt.sourceIp.includes(packetSearchQuery) ||
        pkt.destIp.includes(packetSearchQuery) ||
        pkt.summary.toLowerCase().includes(packetSearchQuery.toLowerCase());
      return matchesProto && matchesSearch;
    });
  }, [packetRecords, packetProtoFilter, packetSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Central Telemetry Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-card border border-border p-4 rounded-xl">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Monitored Stack</span>
          <div className="flex items-center gap-2 mt-1">
            <Radio className="w-4 h-4 text-accent animate-pulse" />
            <p className="text-sm font-bold text-white font-mono">Browser & Kernel</p>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Sockets: DoH / TLS / Raw</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">DNS Query Velocity</span>
          <div className="flex items-center gap-2 mt-1">
            <Globe className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-bold text-white font-mono">{dnsRecords.length * 3 + 12} QPS</p>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Avg Latency: 21.4 ms</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Packet Flow Rate</span>
          <div className="flex items-center gap-2 mt-1">
            <Cpu className="w-4 h-4 text-accent" />
            <p className="text-sm font-bold text-white font-mono">1.94k pps</p>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Interface: eth0 WAN</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">DNSSEC Enforcement</span>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <p className="text-sm font-bold text-white font-mono">Strict Validation</p>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">RRSIG Authenticated</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Inspection Status</span>
          <div className="flex items-center gap-2 mt-1">
            <Server className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-bold text-white font-mono">DPI Engine Active</p>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">L3-L7 Heuristics ON</span>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dns')}
            className={cn(
              "px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2",
              activeTab === 'dns'
                ? "bg-accent/20 text-accent border border-accent/30 font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <Globe className="w-4 h-4" />
            DNS to Browser Tracer
          </button>
          <button
            onClick={() => setActiveTab('packets')}
            className={cn(
              "px-4 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2",
              activeTab === 'packets'
                ? "bg-accent/20 text-accent border border-accent/30 font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <Terminal className="w-4 h-4" />
            Deep Packet Inspector (DPI)
          </button>
        </div>

        <div className="text-xs font-mono text-zinc-500 hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <span>Central Network Telemetry Hooked</span>
        </div>
      </div>

      {/* ======================= TAB 1: DNS TO BROWSER TRACER ======================= */}
      {activeTab === 'dns' && (
        <div className="space-y-6">
          {/* Interactive Custom Trace Form */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-accent" />
              Live DNS Resolution Hop Tracer & Sandboxed Query Inspector
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Trace the exact hop-by-hop journey of any domain requested from browser sockets through stub resolvers, security gateways, root nameservers, and authoritative registers.
            </p>

            <form onSubmit={handleTraceCustomDomain} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="Enter domain (e.g., hr-portal-secure.com, v1-beacon.update-synctool.top, api.github.com)..."
                  className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={customRecordType}
                  onChange={(e) => setCustomRecordType(e.target.value as any)}
                  className="bg-white/5 border border-border rounded-lg px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-accent"
                >
                  <option value="A">Type A (IPv4)</option>
                  <option value="AAAA">Type AAAA (IPv6)</option>
                  <option value="CNAME">Type CNAME</option>
                  <option value="TXT">Type TXT (Tunneling Check)</option>
                  <option value="MX">Type MX</option>
                </select>

                <button
                  type="submit"
                  disabled={isTracingDns || !customDomainInput.trim()}
                  className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-black font-semibold text-xs font-mono rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  {isTracingDns ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Tracing Route...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" />
                      Trace DNS Journey
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Preset Queries */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50 text-[11px] font-mono text-zinc-500">
              <span>Quick Presets:</span>
              {[
                { label: 'C2 Phishing Domain', domain: 'hr-portal-secure.com' },
                { label: 'DNS Tunneling TXT', domain: 'v1-beacon.update-synctool.top' },
                { label: 'Threat Intelligence API', domain: 'api.threatfox.abuse.ch' },
                { label: 'Corporate Internal Gateway', domain: 'gateway.internal-corp.net' }
              ].map((p) => (
                <button
                  key={p.domain}
                  type="button"
                  onClick={() => {
                    setCustomDomainInput(p.domain);
                  }}
                  className="text-zinc-400 hover:text-accent hover:underline cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: DNS Query List & Hop Trace Dissection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Traced Queries Log */}
            <div className="lg:col-span-5 bg-card border border-border rounded-xl flex flex-col h-[650px] overflow-hidden">
              <div className="p-4 border-b border-border bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-xs font-semibold uppercase tracking-wider font-mono">
                    Browser DNS Resolution Log
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {filteredDnsRecords.length} queries logged
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={dnsSearchQuery}
                      onChange={(e) => setDnsSearchQuery(e.target.value)}
                      placeholder="Search domain, IP, resolver..."
                      className="w-full bg-white/5 border border-border rounded pl-8 pr-3 py-1 text-xs text-white font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <select
                    value={dnsThreatFilter}
                    onChange={(e) => setDnsThreatFilter(e.target.value as any)}
                    className="bg-white/5 border border-border rounded px-2 py-1 text-[11px] text-zinc-300 font-mono focus:outline-none"
                  >
                    <option value="all">All Verdicts</option>
                    <option value="safe">Safe Only</option>
                    <option value="suspicious">Suspicious</option>
                    <option value="malicious">Malicious</option>
                  </select>
                </div>
              </div>

              {/* Records Scroll List */}
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {filteredDnsRecords.map((record) => {
                  const isSelected = selectedDnsRecord?.id === record.id;
                  return (
                    <div
                      key={record.id}
                      onClick={() => setSelectedDnsRecord(record)}
                      className={cn(
                        "p-3.5 transition-colors cursor-pointer text-left",
                        isSelected 
                          ? "bg-accent/10 border-l-2 border-accent" 
                          : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <p className="text-xs font-bold text-white font-mono truncate">{record.query}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-500">
                            <span className="text-zinc-300 font-semibold">{record.recordType}</span>
                            <span aria-hidden="true">·</span>
                            <span>{record.responseTimeMs}ms</span>
                            <span aria-hidden="true">·</span>
                            <span>{record.responseCode}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={cn(
                            "text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold",
                            record.threatLevel === 'Malicious' ? "bg-critical/20 text-critical" :
                            record.threatLevel === 'Suspicious' ? "bg-amber-500/20 text-amber-400" :
                            "bg-emerald-500/20 text-emerald-400"
                          )}>
                            {record.threatLevel}
                          </span>
                          <span className="block text-[9px] font-mono text-zinc-500 mt-1">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] font-mono text-zinc-400 truncate flex items-center justify-between">
                        <span>Resolver: {record.resolver.split(' ')[0]}</span>
                        <span className="text-zinc-500">{record.browserContext.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredDnsRecords.length === 0 && (
                  <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                    No matching DNS queries found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Detailed Hop-by-Hop Resolution Journey */}
            <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 flex flex-col h-[650px] overflow-y-auto">
              {selectedDnsRecord ? (
                <div className="space-y-6">
                  {/* Query Header Card */}
                  <div className="pb-4 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          Target Resolution Path
                        </span>
                        <h3 className="text-lg font-bold text-white font-mono mt-0.5 break-all">
                          {selectedDnsRecord.query}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn(
                          "text-xs font-mono px-2 py-1 rounded font-bold uppercase",
                          selectedDnsRecord.threatLevel === 'Malicious' ? "bg-critical/20 text-critical border border-critical/30" :
                          selectedDnsRecord.threatLevel === 'Suspicious' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                          "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        )}>
                          {selectedDnsRecord.threatLevel}
                        </span>
                      </div>
                    </div>

                    {/* Threat warning banner if malicious */}
                    {selectedDnsRecord.threatReason && (
                      <div className="mt-3 p-3 bg-critical/10 border border-critical/30 rounded-lg flex items-start gap-2 text-critical text-xs font-mono">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Security Anomaly Detected: </strong>
                          {selectedDnsRecord.threatReason}
                        </div>
                      </div>
                    )}

                    {/* Query Details Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Record Type</span>
                        <span className="text-white font-semibold">{selectedDnsRecord.recordType}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">Round-Trip Time</span>
                        <span className="text-white font-semibold">{selectedDnsRecord.responseTimeMs} ms</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">DNSSEC</span>
                        <span className={cn(
                          "font-semibold",
                          selectedDnsRecord.dnssec === 'Secure' ? "text-emerald-400" :
                          selectedDnsRecord.dnssec === 'Bogus' ? "text-critical" : "text-amber-400"
                        )}>
                          {selectedDnsRecord.dnssec}
                        </span>
                      </div>
                      <div className="bg-white/5 p-2 rounded">
                        <span className="text-[10px] text-zinc-500 block">TTL Countdown</span>
                        <span className="text-white font-semibold">{selectedDnsRecord.ttl}s</span>
                      </div>
                    </div>

                    {/* Resolved IP destinations */}
                    <div className="mt-3 bg-white/5 p-3 rounded text-xs font-mono flex flex-wrap items-center gap-2">
                      <span className="text-zinc-500">Resolved Endpoint(s):</span>
                      {selectedDnsRecord.resolvedIps && selectedDnsRecord.resolvedIps.length > 0 ? (
                        selectedDnsRecord.resolvedIps.map(ip => (
                          <span key={ip} className="bg-white/10 text-accent px-2 py-0.5 rounded font-bold">
                            {ip}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-400 italic">No A/AAAA addresses returned (TXT/NXDOMAIN payload)</span>
                      )}
                    </div>
                  </div>

                  {/* Hop-by-Hop Trace Visualization */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold mb-4 flex items-center gap-2">
                      <CornerDownRight className="w-4 h-4 text-accent" />
                      Trace Journey: From Browser Socket to Authoritative Registration
                    </h4>

                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
                      {selectedDnsRecord.hops.map((hop, index) => (
                        <div key={hop.hopNumber} className="relative flex items-start gap-3.5 group">
                          {/* Hop Number Indicator */}
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 z-10",
                            hop.status === 'BLOCKED' ? "bg-critical text-white shadow-[0_0_10px_#ef4444]" :
                            hop.status === 'RESOLVED' ? "bg-accent text-black shadow-[0_0_10px_#00ff41]" :
                            hop.status === 'HIT' ? "bg-blue-500 text-white" :
                            "bg-white/10 text-zinc-300 border border-border"
                          )}>
                            {hop.hopNumber}
                          </div>

                          {/* Hop Content Card */}
                          <div className="flex-1 bg-white/[0.02] border border-border rounded-lg p-3.5 text-xs font-mono">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{hop.stage}</span>
                                <span className="text-zinc-500">·</span>
                                <span className="text-zinc-400">{hop.server}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 font-mono">{hop.latencyMs}ms</span>
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                                  hop.status === 'BLOCKED' ? "bg-critical/20 text-critical" :
                                  hop.status === 'RESOLVED' ? "bg-accent/20 text-accent" :
                                  hop.status === 'HIT' ? "bg-blue-500/20 text-blue-400" :
                                  "bg-white/10 text-zinc-400"
                                )}>
                                  {hop.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-zinc-400 mt-1.5 leading-relaxed">{hop.details}</p>
                            <p className="text-[10px] text-zinc-600 mt-1 font-mono">IP: {hop.serverIp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-xs">
                  <Globe className="w-8 h-8 mb-2 opacity-20" />
                  <p>Select a DNS query to view the full resolution trace journey</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: DEEP PACKET INSPECTION ======================= */}
      {activeTab === 'packets' && (
        <div className="space-y-6">
          {/* Packet Stream Toolbar */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setIsPacketStreamPaused(!isPacketStreamPaused)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-mono flex items-center gap-2 font-bold cursor-pointer transition-colors",
                  isPacketStreamPaused
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-accent/20 text-accent border border-accent/30"
                )}
              >
                {isPacketStreamPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {isPacketStreamPaused ? 'Resume Capture' : 'Pause Live Capture'}
              </button>

              <button
                onClick={() => setPacketRecords([])}
                className="px-3 py-1.5 rounded text-xs font-mono bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-border flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Buffer
              </button>

              <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

              {/* Protocol Filters */}
              {['ALL', 'DNS', 'TCP', 'UDP', 'TLS/HTTPS', 'HTTP'].map((proto) => (
                <button
                  key={proto}
                  onClick={() => setPacketProtoFilter(proto)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer",
                    packetProtoFilter === proto
                      ? "bg-accent text-black font-semibold"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  )}
                >
                  {proto}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={packetSearchQuery}
                onChange={(e) => setPacketSearchQuery(e.target.value)}
                placeholder="Filter by IP, port, payload..."
                className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Packet Table & Deep Inspector Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Captured Packets Table */}
            <div className="lg:col-span-7 bg-card border border-border rounded-xl flex flex-col h-[650px] overflow-hidden">
              <div className="p-3 bg-white/[0.02] border-b border-border flex items-center justify-between text-xs font-mono text-zinc-500">
                <span>Captured Frames: {filteredPackets.length}</span>
                <span className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isPacketStreamPaused ? "bg-amber-400" : "bg-accent animate-pulse"
                  )} />
                  {isPacketStreamPaused ? "Paused" : "Live Streaming"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-zinc-400 text-[10px] uppercase sticky top-0 border-b border-border z-10">
                    <tr>
                      <th className="p-2.5">No.</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5">Protocol</th>
                      <th className="p-2.5">Source &rarr; Destination</th>
                      <th className="p-2.5">Len</th>
                      <th className="p-2.5 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredPackets.map((pkt) => {
                      const isSelected = selectedPacket?.frameNumber === pkt.frameNumber;
                      return (
                        <tr
                          key={pkt.frameNumber}
                          onClick={() => setSelectedPacket(pkt)}
                          className={cn(
                            "cursor-pointer transition-colors",
                            isSelected
                              ? "bg-accent/15 text-white"
                              : "hover:bg-white/5 text-zinc-300"
                          )}
                        >
                          <td className="p-2.5 text-zinc-500 font-mono">#{pkt.frameNumber}</td>
                          <td className="p-2.5 text-zinc-400">{new Date(pkt.timestamp).toLocaleTimeString()}</td>
                          <td className="p-2.5">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                              pkt.protocol === 'DNS' ? "bg-blue-500/20 text-blue-400" :
                              pkt.protocol === 'TLS/HTTPS' ? "bg-purple-500/20 text-purple-400" :
                              pkt.protocol === 'TCP' ? "bg-emerald-500/20 text-emerald-400" :
                              "bg-zinc-700/50 text-zinc-300"
                            )}>
                              {pkt.protocol}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <div className="truncate max-w-[220px]">
                              <span>{pkt.sourceIp}:{pkt.sourcePort}</span>
                              <span className="text-zinc-500 mx-1">&rarr;</span>
                              <span>{pkt.destIp}:{pkt.destPort}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 block truncate">{pkt.summary}</span>
                          </td>
                          <td className="p-2.5 text-zinc-400">{pkt.length} B</td>
                          <td className="p-2.5 text-right">
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                              pkt.deepPacketInspection.verdict === 'Alert' ? "bg-critical/20 text-critical" :
                              pkt.deepPacketInspection.verdict === 'Suspicious' ? "bg-amber-500/20 text-amber-400" :
                              "bg-emerald-500/20 text-emerald-400"
                            )}>
                              {pkt.deepPacketInspection.verdict}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredPackets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                          No packets matching current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deep Packet Inspector & Hex Dissector Panel */}
            <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 flex flex-col h-[650px] overflow-y-auto space-y-4">
              {selectedPacket ? (
                <>
                  <div className="pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        Packet Dissection View
                      </span>
                      <span className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded font-bold uppercase",
                        selectedPacket.deepPacketInspection.verdict === 'Alert' ? "bg-critical/20 text-critical" :
                        selectedPacket.deepPacketInspection.verdict === 'Suspicious' ? "bg-amber-500/20 text-amber-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      )}>
                        DPI Verdict: {selectedPacket.deepPacketInspection.verdict}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-sm font-mono mt-1">
                      Frame #{selectedPacket.frameNumber} &middot; {selectedPacket.protocol} ({selectedPacket.length} bytes on wire)
                    </h3>
                  </div>

                  {/* DPI Alert Notice if any */}
                  {selectedPacket.deepPacketInspection.ruleTriggered && (
                    <div className="p-3 bg-critical/10 border border-critical/30 rounded-lg text-critical text-xs font-mono flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>IDS Rule Matched: </strong>
                        {selectedPacket.deepPacketInspection.ruleTriggered}
                      </div>
                    </div>
                  )}

                  {/* Dissected Protocol Layers */}
                  <div className="space-y-2 text-xs font-mono">
                    <details open className="bg-white/[0.02] border border-border rounded-lg p-2.5">
                      <summary className="font-bold text-white cursor-pointer select-none">
                        Layer 2 &middot; Ethernet II
                      </summary>
                      <div className="mt-2 text-zinc-400 space-y-1 pl-3 border-l border-border text-[11px]">
                        <p>Source MAC: {selectedPacket.sourceMac}</p>
                        <p>Destination MAC: {selectedPacket.destMac}</p>
                        <p>EtherType: 0x0800 (IPv4)</p>
                      </div>
                    </details>

                    <details open className="bg-white/[0.02] border border-border rounded-lg p-2.5">
                      <summary className="font-bold text-white cursor-pointer select-none">
                        Layer 3 &middot; Internet Protocol Version 4
                      </summary>
                      <div className="mt-2 text-zinc-400 space-y-1 pl-3 border-l border-border text-[11px]">
                        <p>Source IP: {selectedPacket.sourceIp}</p>
                        <p>Destination IP: {selectedPacket.destIp}</p>
                        <p>Time to Live (TTL): {selectedPacket.ttl}</p>
                        <p>Total Length: {selectedPacket.length} bytes</p>
                      </div>
                    </details>

                    <details open className="bg-white/[0.02] border border-border rounded-lg p-2.5">
                      <summary className="font-bold text-white cursor-pointer select-none">
                        Layer 4 &middot; {selectedPacket.protocol.includes('TCP') || selectedPacket.protocol.includes('TLS') ? 'TCP' : 'UDP'} Transport
                      </summary>
                      <div className="mt-2 text-zinc-400 space-y-1 pl-3 border-l border-border text-[11px]">
                        <p>Source Port: {selectedPacket.sourcePort}</p>
                        <p>Destination Port: {selectedPacket.destPort}</p>
                        {selectedPacket.flags && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-zinc-500">Flags:</span>
                            {Object.entries(selectedPacket.flags).map(([flag, val]) => (
                              <span
                                key={flag}
                                className={cn(
                                  "px-1 py-0.2 rounded text-[9px] uppercase",
                                  val ? "bg-accent/20 text-accent font-bold" : "bg-white/5 text-zinc-600"
                                )}
                              >
                                {flag.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                        {selectedPacket.windowSize && <p>Window Size: {selectedPacket.windowSize}</p>}
                      </div>
                    </details>

                    <details open className="bg-white/[0.02] border border-border rounded-lg p-2.5">
                      <summary className="font-bold text-white cursor-pointer select-none">
                        Layer 7 &middot; Deep Packet Inspection (DPI) & Heuristics
                      </summary>
                      <div className="mt-2 text-zinc-400 space-y-1 pl-3 border-l border-border text-[11px]">
                        <p>Application Proto: {selectedPacket.deepPacketInspection.applicationLayerProto}</p>
                        <p>Payload Entropy: {selectedPacket.deepPacketInspection.entropy} bits/byte</p>
                        {selectedPacket.deepPacketInspection.ciphersuite && (
                          <p>TLS Cipher: {selectedPacket.deepPacketInspection.ciphersuite}</p>
                        )}
                        <p className="text-zinc-300">Summary: {selectedPacket.summary}</p>
                      </div>
                    </details>
                  </div>

                  {/* Raw Hex & ASCII Dump View */}
                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                      Payload Hex & ASCII Dissection
                    </span>
                    <div className="bg-black/60 border border-border rounded-lg p-3 font-mono text-[10px] leading-relaxed overflow-x-auto text-zinc-300 select-all">
                      <pre className="whitespace-pre">{selectedPacket.payloadHex}</pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 font-mono text-xs">
                  <Terminal className="w-8 h-8 mb-2 opacity-20" />
                  <p>Click any packet frame from the live table to dissect</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
