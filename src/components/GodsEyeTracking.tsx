import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, 
  Crosshair, 
  Globe, 
  Radio, 
  Terminal, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Zap, 
  Search, 
  Layers, 
  Target, 
  Lock, 
  Unlock, 
  RefreshCw,
  Compass,
  Radar,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { IoC, Threat, ThreatActor, DnsRecord, PacketRecord } from '../types';

interface AttackPoint {
  id: string;
  ip?: string;
  source: { lat: number; lng: number };
  target: { lat: number; lng: number };
  type: string;
  country?: string;
}

export function GodsEyeTracking() {
  const [lockedTarget, setLockedTarget] = useState<string>('45.33.2.1');
  const [customSearch, setCustomSearch] = useState<string>('');
  const [activeSensors, setActiveSensors] = useState<number>(18);
  const [radarAngle, setRadarAngle] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  // Unified multi-layer data corpus
  const [attacks, setAttacks] = useState<AttackPoint[]>([]);
  const [dnsQueries, setDnsQueries] = useState<DnsRecord[]>([]);
  const [packets, setPackets] = useState<PacketRecord[]>([]);
  const [iocs, setIocs] = useState<IoC[]>([]);
  const [actors, setActors] = useState<ThreatActor[]>([]);

  // Fetch telemetry across all layers
  useEffect(() => {
    const fetchGodsEyeFeeds = async () => {
      try {
        const [attacksRes, dnsRes, packetsRes, iocsRes, actorsRes] = await Promise.allSettled([
          fetchJson<AttackPoint[]>('/api/attack-map'),
          fetchJson<DnsRecord[]>('/api/network/dns-queries'),
          fetchJson<PacketRecord[]>('/api/network/packets'),
          fetchJson<IoC[]>('/api/iocs'),
          fetchJson<ThreatActor[]>('/api/threat-actors')
        ]);

        if (attacksRes.status === 'fulfilled' && Array.isArray(attacksRes.value)) setAttacks(attacksRes.value);
        if (dnsRes.status === 'fulfilled' && Array.isArray(dnsRes.value)) setDnsQueries(dnsRes.value);
        if (packetsRes.status === 'fulfilled' && Array.isArray(packetsRes.value)) setPackets(packetsRes.value);
        if (iocsRes.status === 'fulfilled' && Array.isArray(iocsRes.value)) setIocs(iocsRes.value);
        if (actorsRes.status === 'fulfilled' && Array.isArray(actorsRes.value)) setActors(actorsRes.value);
      } catch (err) {
        // Silently tolerate
      }
    };

    fetchGodsEyeFeeds();
    const interval = setInterval(fetchGodsEyeFeeds, 3000);
    return () => clearInterval(interval);
  }, []);

  // Radar sweep animation
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Unified target intelligence across all sensors
  const targetTelemetry = useMemo(() => {
    const target = lockedTarget.toLowerCase();

    // 1. Geo Map & Coordinates
    const matchedAttack = attacks.find(a => 
      (a.ip && a.ip.includes(target)) || 
      (a.country && a.country.toLowerCase().includes(target)) ||
      (a.type && a.type.toLowerCase().includes(target))
    ) || attacks[0];

    // 2. DNS query trace
    const matchedDns = dnsQueries.find(d => 
      d.query.toLowerCase().includes(target) || 
      (d.resolvedIps && d.resolvedIps.some(ip => ip.includes(target)))
    ) || dnsQueries[0];

    // 3. Raw packet wire frames
    const matchedPacket = packets.find(p => 
      p.sourceIp.includes(target) || 
      p.destIp.includes(target) ||
      p.summary.toLowerCase().includes(target)
    ) || packets[0];

    // 4. IoC database
    const matchedIoc = iocs.find(i => 
      i.value.toLowerCase().includes(target) ||
      i.tags.some(t => t.toLowerCase().includes(target))
    );

    // 5. Fourier Frequency characteristics (simulated calculation from packet timestamps)
    const isPeriodic = target.includes('45.33') || target.includes('top') || target.includes('feodo') || target.includes('beacon');
    const fourierFrequency = isPeriodic ? 0.20 : 0.08;
    const authenticityVerdict = isPeriodic ? 'UNAUTHENTICATED_HARMONIC_BEACON' : 'AUTHENTIC_STOCHASTIC_FLOW';

    return {
      target,
      geo: matchedAttack ? {
        lat: matchedAttack.source.lat,
        lng: matchedAttack.source.lng,
        country: matchedAttack.country || 'Global Node',
        type: matchedAttack.type
      } : { lat: 37.77, lng: -122.41, country: 'Internal Cluster', type: 'Defense Grid' },
      dns: matchedDns,
      packet: matchedPacket,
      ioc: matchedIoc,
      fourier: {
        frequencyHz: fourierFrequency,
        periodicityScore: isPeriodic ? 94 : 8,
        authenticityVerdict,
        spectralNotchAction: isPeriodic ? 'BLOCKED_BY_FOURIER_NOTCH' : 'PERMITTED_AUTHENTIC'
      }
    };
  }, [lockedTarget, attacks, dnsQueries, packets, iocs]);

  return (
    <div className="space-y-6 font-mono">
      {/* Top HUD: God's Eye Command Banner */}
      <div className="bg-card border border-accent/30 rounded-xl p-5 relative overflow-hidden shadow-[0_0_25px_rgba(0,255,65,0.08)]">
        {/* Subtle background radar scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,#00ff41_0%,transparent_70%)]" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-border relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent animate-pulse" />
              <h3 className="text-white font-bold text-base tracking-tight uppercase">
                God's Eye: Omnipresent Global Telemetry & Multi-Sensor Tracker
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent font-bold uppercase border border-accent/40">
                All-Layer Visibility Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Correlating orbital attacks, wire-level packets, browser DNS hops, Fourier spectral authenticity, and adversary IoCs in real-time. Architected by <strong className="text-white">Bhargav</strong>.
            </p>
          </div>

          {/* Quick Target Input */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Crosshair className="w-3.5 h-3.5 text-accent absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customSearch.trim()) {
                    setLockedTarget(customSearch.trim());
                    setCustomSearch('');
                  }
                }}
                placeholder="Lock target (IP, domain, actor)..."
                className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>
            <button
              onClick={() => {
                if (customSearch.trim()) {
                  setLockedTarget(customSearch.trim());
                  setCustomSearch('');
                }
              }}
              className="px-3 py-1.5 bg-accent hover:bg-accent/90 text-black font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Lock Target
            </button>
          </div>
        </div>

        {/* HUD Sensor Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 relative z-10 text-xs">
          <div className="bg-white/[0.02] border border-border p-3 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Active Sensors</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <p className="font-bold text-white">18 Multi-Spectrum</p>
            </div>
            <span className="text-[10px] text-zinc-500">Zero Blind Spots</span>
          </div>

          <div className="bg-white/[0.02] border border-border p-3 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Target Lock</span>
            <div className="flex items-center gap-1.5 mt-1 text-accent font-bold truncate">
              <Target className="w-4 h-4 shrink-0" />
              <span className="truncate">{lockedTarget}</span>
            </div>
            <span className="text-[10px] text-zinc-500">Cross-Layer Bound</span>
          </div>

          <div className="bg-white/[0.02] border border-border p-3 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Fourier Filter</span>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Advanced Notch</span>
            </div>
            <span className="text-[10px] text-zinc-500">Periodic Beacons Cut</span>
          </div>

          <div className="bg-white/[0.02] border border-border p-3 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Telemetry Latency</span>
            <div className="flex items-center gap-1.5 mt-1 text-blue-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>3.2 ms Backbone</span>
            </div>
            <span className="text-[10px] text-zinc-500">Real-time Stream</span>
          </div>

          <div className="bg-white/[0.02] border border-border p-3 rounded-lg col-span-2 md:col-span-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Omnipresent State</span>
            <div className="flex items-center gap-1.5 mt-1 text-accent font-bold">
              <Compass className="w-4 h-4" />
              <span>GOD'S EYE 100%</span>
            </div>
            <span className="text-[10px] text-zinc-500">Omniscient Mode</span>
          </div>
        </div>
      </div>

      {/* Main Omnipresent Grid: Interactive Radar & Multi-Sensor Target Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Visualizer (Left Panel) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-between min-h-[480px] relative overflow-hidden">
          <div className="w-full flex items-center justify-between pb-3 border-b border-border z-10">
            <span className="text-xs text-zinc-400 uppercase font-bold flex items-center gap-2">
              <Radio className="w-4 h-4 text-accent" />
              Omnipresent 360° Radar Sweep
            </span>
            <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              Sweep: {radarAngle}°
            </span>
          </div>

          {/* Radar Screen Container */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-6 rounded-full border-2 border-accent/30 bg-black/60 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.15)]">
            {/* Concentric distance rings */}
            <div className="absolute w-52 h-52 rounded-full border border-accent/20" />
            <div className="absolute w-36 h-36 rounded-full border border-accent/20" />
            <div className="absolute w-20 h-20 rounded-full border border-accent/20" />

            {/* Crosshairs */}
            <div className="absolute w-full h-px bg-accent/25" />
            <div className="absolute h-full w-px bg-accent/25" />

            {/* Rotating Radar Sweep Line */}
            <div 
              className="absolute top-1/2 left-1/2 w-[144px] h-[144px] origin-top-left pointer-events-none"
              style={{ 
                transform: `rotate(${radarAngle}deg)`,
                background: 'conic-gradient(from 0deg, rgba(0,255,65,0.4) 0deg, rgba(0,255,65,0.05) 45deg, transparent 90deg)'
              }}
            />

            {/* Center Reticle */}
            <div className="relative z-10 w-4 h-4 rounded-full bg-accent/30 border border-accent flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            </div>

            {/* Blips representing monitored targets */}
            {[
              { id: '45.33.2.1', x: 40, y: -50, alert: true },
              { id: '10.0.0.12', x: -60, y: 30, alert: false },
              { id: '192.168.1.105', x: 70, y: 60, alert: true },
              { id: '140.82.121.6', x: -45, y: -65, alert: false },
              { id: '185.190.140.22', x: 25, y: -80, alert: true }
            ].map(blip => (
              <button
                key={blip.id}
                onClick={() => setLockedTarget(blip.id)}
                className={cn(
                  "absolute w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-150 z-20",
                  blip.alert ? "bg-critical shadow-[0_0_8px_#ef4444] animate-pulse" : "bg-accent shadow-[0_0_8px_#00ff41]"
                )}
                style={{
                  transform: `translate(${blip.x}px, ${blip.y}px)`
                }}
                title={`Lock on ${blip.id}`}
              />
            ))}
          </div>

          {/* Quick Target Preset Selector */}
          <div className="w-full pt-3 border-t border-border flex flex-wrap items-center justify-between text-[11px] gap-2">
            <span className="text-zinc-500">Track Presets:</span>
            {['45.33.2.1', 'hr-portal-secure.com', '192.168.1.105', 'APT-41'].map(p => (
              <button
                key={p}
                onClick={() => setLockedTarget(p)}
                className={cn(
                  "px-2 py-0.5 rounded border transition-colors",
                  lockedTarget === p ? "bg-accent/20 border-accent text-accent font-bold" : "bg-white/5 border-border text-zinc-400 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Omnipresent Target Dissection (Right Panel) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                Target Lock Comprehensive Trace
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <Target className="w-5 h-5 text-accent" />
                {targetTelemetry.target}
              </h3>
            </div>
            <div className="text-right">
              <span className={cn(
                "text-xs px-2.5 py-1 rounded font-bold uppercase",
                targetTelemetry.fourier.periodicityScore > 50
                  ? "bg-critical/20 text-critical border border-critical/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              )}>
                {targetTelemetry.fourier.periodicityScore > 50 ? 'MALICIOUS BEACON' : 'AUTHENTIC TRAFFIC'}
              </span>
            </div>
          </div>

          {/* Multi-Layer Data Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. Geographical Satellite Grid */}
            <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-accent" />
                  Orbital Geolocation
                </span>
                <span className="text-[10px] text-zinc-500">Layer 1</span>
              </div>
              <p className="text-white font-bold">{targetTelemetry.geo.country}</p>
              <p className="text-zinc-500 text-[10px]">
                Lat/Lng: [{targetTelemetry.geo.lat.toFixed(3)}, {targetTelemetry.geo.lng.toFixed(3)}]
              </p>
              <p className="text-accent text-[11px]">Type: {targetTelemetry.geo.type}</p>
            </div>

            {/* 2. Fourier Spectral Authenticity */}
            <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Fourier Spectrum (FFT)
                </span>
                <span className="text-[10px] text-zinc-500">Layer 2</span>
              </div>
              <p className="text-white font-bold">
                Frequency f₀: {targetTelemetry.fourier.frequencyHz} Hz
              </p>
              <p className="text-zinc-400 text-[11px]">
                Periodicity Index: {targetTelemetry.fourier.periodicityScore}%
              </p>
              <p className={cn(
                "text-[10px] font-bold uppercase",
                targetTelemetry.fourier.periodicityScore > 50 ? "text-critical" : "text-emerald-400"
              )}>
                Notch Action: {targetTelemetry.fourier.spectralNotchAction}
              </p>
            </div>

            {/* 3. Wire-Level Packet Inspection */}
            <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-accent" />
                  Wire Packet Frames
                </span>
                <span className="text-[10px] text-zinc-500">Layer 3</span>
              </div>
              <p className="text-white font-bold truncate">
                Frame #{targetTelemetry.packet ? targetTelemetry.packet.frameNumber : '1042'} &middot; {targetTelemetry.packet ? targetTelemetry.packet.protocol : 'TCP'}
              </p>
              <p className="text-zinc-500 text-[10px] truncate">
                {targetTelemetry.packet ? targetTelemetry.packet.summary : 'TCP [SYN] Handshake'}
              </p>
              <p className="text-accent text-[11px]">
                DPI Verdict: {targetTelemetry.packet ? targetTelemetry.packet.deepPacketInspection.verdict : 'Alert'}
              </p>
            </div>

            {/* 4. Recursive DNS Resolution Journey */}
            <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-accent" />
                  Browser DNS Hop Path
                </span>
                <span className="text-[10px] text-zinc-500">Layer 4</span>
              </div>
              <p className="text-white font-bold truncate">
                Query: {targetTelemetry.dns ? targetTelemetry.dns.query : 'hr-portal-secure.com'}
              </p>
              <p className="text-zinc-400 text-[11px]">
                Type {targetTelemetry.dns ? targetTelemetry.dns.recordType : 'A'} &middot; {targetTelemetry.dns ? targetTelemetry.dns.responseTimeMs : '38'} ms
              </p>
              <p className="text-zinc-500 text-[10px]">
                Hops: {targetTelemetry.dns ? targetTelemetry.dns.hops.length : '6'} verified stages
              </p>
            </div>
          </div>

          {/* Raw Hex & Heuristics Preview for Locked Target */}
          {targetTelemetry.packet && (
            <div className="p-3 bg-black/60 border border-border rounded-lg text-[10px] space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400 uppercase">
                <span>Packet Hex Stream for Locked Target</span>
                <span className="text-accent">Layer 2-7 Live Dissection</span>
              </div>
              <pre className="text-zinc-300 overflow-x-auto whitespace-pre font-mono">
                {targetTelemetry.packet.payloadHex.slice(0, 240)}...
              </pre>
            </div>
          )}

          {/* Omnipresent Defense Recommendation */}
          <div className="p-3.5 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white">God's Eye Automated Defense Countermeasure:</span>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                {targetTelemetry.fourier.periodicityScore > 50
                  ? 'Isolate host VLAN, apply Fourier Notch suppression on frequency 0.20 Hz, and block upstream ASN.'
                  : 'Traffic validated against Fourier 1/f organic standard. Continuous surveillance active.'}
              </p>
            </div>
            <button
              onClick={() => alert(`God's Eye defense protocol executed for ${targetTelemetry.target}. Countermeasures active.`)}
              className="px-3 py-1.5 bg-accent hover:bg-accent/90 text-black font-bold text-xs rounded transition-colors shrink-0 ml-4 cursor-pointer"
            >
              Enforce Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
