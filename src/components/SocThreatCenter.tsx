import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Terminal,
  Activity,
  Lock,
  Unlock,
  Radio,
  Server,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  RefreshCw,
  Search,
  Sliders,
  ChevronRight,
  Shield,
  Layers,
  Network
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

interface SuricataAlert {
  id: string;
  timestamp: string;
  signature: string;
  category: 'MALWARE' | 'EXPLOIT' | 'SCAN' | 'POLICY' | 'DNS_ANOMALY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  srcIp: string;
  srcHost: string;
  dstIp: string;
  proto: 'TCP' | 'UDP' | 'ICMP';
  actionTaken: 'BLOCKED' | 'FLAGGED' | 'QUARANTINED';
  mitreTactic: string;
  mitreId: string;
  cveId?: string;
}

interface CveVulnerability {
  id: string;
  cve: string;
  title: string;
  cvssScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  affectedHost: string;
  affectedPort: number;
  status: 'MITIGATED' | 'REQUIRES_PATCH' | 'ISOLATED';
  description: string;
  remediation: string;
}

const INITIAL_SURICATA_ALERTS: SuricataAlert[] = [
  {
    id: 'alert-1',
    timestamp: '11:04:12 UTC',
    signature: 'ET MALWARE Suspected Cobalt Strike Malleable C2 Beaconing (Jitter 15%)',
    category: 'MALWARE',
    severity: 'CRITICAL',
    srcIp: '192.168.20.55',
    srcHost: 'Ring-Floodlight-Cam-Pro',
    dstIp: '45.33.2.1:443',
    proto: 'TCP',
    actionTaken: 'QUARANTINED',
    mitreTactic: 'Command & Control',
    mitreId: 'T1071.001',
    cveId: 'CVE-2023-4863'
  },
  {
    id: 'alert-2',
    timestamp: '10:58:30 UTC',
    signature: 'ET SCAN Potential Nmap Stealth SYN Port Sweep (-sS) across Subnet',
    category: 'SCAN',
    severity: 'HIGH',
    srcIp: '192.168.1.118',
    srcHost: 'ThinkPad-X1-Carbon',
    dstIp: '192.168.1.0/24',
    proto: 'TCP',
    actionTaken: 'FLAGGED',
    mitreTactic: 'Discovery',
    mitreId: 'T1046'
  },
  {
    id: 'alert-3',
    timestamp: '10:45:05 UTC',
    signature: 'ET EXPLOIT UPnP SSDP CallStranger Buffer Overflow Reflection Probe',
    category: 'EXPLOIT',
    severity: 'HIGH',
    srcIp: '185.220.101.5',
    srcHost: 'External WAN Threat Actor',
    dstIp: '192.168.1.1:1900',
    proto: 'UDP',
    actionTaken: 'BLOCKED',
    mitreTactic: 'Initial Access',
    mitreId: 'T1190',
    cveId: 'CVE-2020-12695'
  },
  {
    id: 'alert-4',
    timestamp: '10:12:44 UTC',
    signature: 'ET DNS Fast-Flux Algorithm Dynamic Domain Generation (DGA) Query',
    category: 'DNS_ANOMALY',
    severity: 'MEDIUM',
    srcIp: '192.168.20.56',
    srcHost: 'Chamberlain-myQ-Opener',
    dstIp: '192.168.1.1:53 (Pi-hole)',
    proto: 'UDP',
    actionTaken: 'BLOCKED',
    mitreTactic: 'Command & Control',
    mitreId: 'T1568.002'
  }
];

const CVE_DATABASE: CveVulnerability[] = [
  {
    id: 'cve-1',
    cve: 'CVE-2024-6387',
    title: 'OpenSSH regreSSHion Signal Handler Race Condition (RCE)',
    cvssScore: 8.1,
    severity: 'HIGH',
    affectedHost: 'Living Room Gateway & Office AP (Port 22)',
    affectedPort: 22,
    status: 'MITIGATED',
    description: 'Signal handler race condition in OpenSSH server allowing unauthenticated root remote code execution on glibc systems.',
    remediation: 'Upgraded OpenWrt hostapd/dropbear to dropbear-2024.85; password auth disabled, ED25519 keys strictly enforced.'
  },
  {
    id: 'cve-2',
    cve: 'CVE-2023-4863',
    title: 'libwebp Heap Buffer Overflow (Chromium / AirPlay Engine)',
    cvssScore: 8.8,
    severity: 'HIGH',
    affectedHost: 'Sony-Bravia-OLED (Port 8008)',
    affectedPort: 8008,
    status: 'ISOLATED',
    description: 'Heap buffer overflow in WebP lossless decoding allowing arbitrary code execution via crafted web image stream.',
    remediation: 'Isolated Smart TV to VLAN 20 IoT Quarantine; WAN internet permitted, cross-subnet access to home computers blocked.'
  },
  {
    id: 'cve-3',
    cve: 'CVE-2020-12695',
    title: 'CallStranger UPnP Event Notification DDoS & Port Scan Vulnerability',
    cvssScore: 7.5,
    severity: 'HIGH',
    affectedHost: 'OpenWrt WAN Gateway (Port 1900)',
    affectedPort: 1900,
    status: 'MITIGATED',
    description: 'UPnP protocol flaw allowing attackers to bypass perimeter firewalls and use routers for DDoS reflection attacks.',
    remediation: 'Disabled miniupnpd WAN listening interface; internal UPnP constrained to authorized media devices.'
  },
  {
    id: 'cve-4',
    cve: 'CVE-2019-9494',
    title: 'Dragonblood: WPA3-Personal SAE Side-Channel Timing Leak',
    cvssScore: 6.5,
    severity: 'MEDIUM',
    affectedHost: 'All 4 Wi-Fi Mesh AP Nodes',
    affectedPort: 0,
    status: 'MITIGATED',
    description: 'Timing side-channel leaks during Simultaneous Authentication of Equals (SAE) handshake revealing Wi-Fi passwords.',
    remediation: 'Enforced constant-time hash-to-curve (H2C) algorithm and 802.11w Protected Management Frames (PMF Required).'
  }
];

const MITRE_TACTICS = [
  {
    name: 'Reconnaissance',
    id: 'TA0043',
    techniques: [
      { id: 'T1595', name: 'Active Scanning', active: true, hits: 14 },
      { id: 'T1592', name: 'Gather Host Info', active: false, hits: 0 }
    ]
  },
  {
    name: 'Initial Access',
    id: 'TA0001',
    techniques: [
      { id: 'T1190', name: 'Exploit Public App (UPnP)', active: true, hits: 8 },
      { id: 'T1566', name: 'Phishing Vectors', active: false, hits: 0 }
    ]
  },
  {
    name: 'Discovery',
    id: 'TA0007',
    techniques: [
      { id: 'T1046', name: 'Network Service Scanning', active: true, hits: 32 },
      { id: 'T1018', name: 'Remote System Discovery', active: true, hits: 18 }
    ]
  },
  {
    name: 'Lateral Movement',
    id: 'TA0008',
    techniques: [
      { id: 'T1021', name: 'Remote Services (SSH/SMB)', active: false, hits: 0 },
      { id: 'T1080', name: 'Taint Shared Content', active: false, hits: 0 }
    ]
  },
  {
    name: 'Command & Control',
    id: 'TA0011',
    techniques: [
      { id: 'T1071.001', name: 'Web Traffic C2 Beacon', active: true, hits: 2 },
      { id: 'T1568', name: 'Dynamic Resolution (DGA)', active: true, hits: 1 }
    ]
  }
];

export function SocThreatCenter() {
  const [activeTab, setActiveTab] = useState<'ids_alerts' | 'cve_matrix' | 'mitre_matrix' | 'firewall_rules'>('ids_alerts');
  const [alerts, setAlerts] = useState<SuricataAlert[]>(INITIAL_SURICATA_ALERTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Firewall Zero-Trust Rule Toggles
  const [firewallRules, setFirewallRules] = useState([
    {
      id: 'fw-1',
      name: 'Isolate IoT Devices to VLAN 20 (Quarantine Mode)',
      desc: 'Drops all Layer-3 routing from smart TVs and cameras to trusted home laptops/phones.',
      active: true,
      category: 'VLAN Segmentation'
    },
    {
      id: 'fw-2',
      name: 'Enforce Pi-hole DNS Sinkhole & Block Plaintext Port 53',
      desc: 'Redirects rogue device DNS queries directly to local sinkhole; blocks outbound DoH bypass.',
      active: true,
      category: 'DNS Integrity'
    },
    {
      id: 'fw-3',
      name: 'Drop Inbound UPnP / SSDP WAN Broadcasts (Port 1900)',
      desc: 'Eliminates CallStranger vulnerability and unauthorized port forwarding mappings.',
      active: true,
      category: 'Perimeter Hardening'
    },
    {
      id: 'fw-4',
      name: 'Mandatory 802.11w Protected Management Frames (PMF)',
      desc: 'Cryptographically signs Wi-Fi deauth/disassociation frames to prevent denial-of-service kicks.',
      active: true,
      category: 'Wireless Physical'
    },
    {
      id: 'fw-5',
      name: 'Automated Threat IP Drop via Nftables IPset',
      desc: 'Synchronizes with AlienVault OTX and CISA KEV feeds to drop known C2 IPs at WAN boundary.',
      active: true,
      category: 'Threat Intelligence'
    }
  ]);

  const toggleFirewallRule = (ruleId: string) => {
    setFirewallRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, active: !r.active } : r))
    );
  };

  const handleQuarantineDevice = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, actionTaken: 'QUARANTINED' as const } : a))
    );
  };

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.signature.toLowerCase().includes(q) ||
      a.srcHost.toLowerCase().includes(q) ||
      a.srcIp.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Threat Intelligence Posture & KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Posture Rating */}
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              ZERO-TRUST POSTURE
            </span>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">94 / 100</p>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">GRADE A+ · Enterprise Hardened</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Active IDS/IPS Engine */}
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              SURICATA IDS ENGINE
            </span>
            <p className="text-2xl font-extrabold text-white font-mono mt-0.5">4 Active Rulesets</p>
            <p className="text-[11px] text-sky-400 font-mono mt-0.5">0 Unmitigated Breaches</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* CVE Vulnerability Status */}
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              CVE EXPOSURE SCAN
            </span>
            <p className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5">4 Scanned</p>
            <p className="text-[11px] text-emerald-400 font-mono mt-0.5">100% Mitigated / Isolated</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Firewall Status */}
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              NFTABLES FIREWALL
            </span>
            <p className="text-2xl font-extrabold text-purple-400 font-mono mt-0.5">5/5 Enforced</p>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">IoT VLAN 20 Quarantine ON</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Lock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="p-1 bg-black/40 border border-border rounded-xl flex flex-wrap items-center gap-1">
        {[
          { id: 'ids_alerts', label: 'Suricata IDS / IPS Alerts', icon: ShieldAlert, count: alerts.length },
          { id: 'cve_matrix', label: 'CVE Vulnerability Matrix', icon: AlertTriangle, count: CVE_DATABASE.length },
          { id: 'mitre_matrix', label: 'MITRE ATT&CK Matrix', icon: Layers, count: 5 },
          { id: 'firewall_rules', label: 'Zero-Trust Firewall Rules', icon: Lock, count: firewallRules.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-2",
                isActive
                  ? "bg-accent/20 text-accent border border-accent/40 shadow-xs"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded font-normal",
                isActive ? "bg-accent/30 text-accent" : "bg-white/5 text-zinc-500"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: SURICATA IDS / IPS LIVE INTRUSION FEED                   */}
      {/* ============================================================== */}
      {activeTab === 'ids_alerts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">SEVERITY:</span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={cn(
                    "px-2.5 py-1 rounded transition cursor-pointer text-[11px]",
                    selectedSeverity === sev
                      ? "bg-white/20 text-white font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search alerts, hosts, or IPs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-black/60 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-accent w-56"
              />
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3 font-mono">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-2xl border transition shadow-lg backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
                  alert.severity === 'CRITICAL' ? "bg-rose-950/20 border-rose-500/40" :
                  alert.severity === 'HIGH' ? "bg-amber-950/20 border-amber-500/40" :
                  "bg-sky-950/20 border-sky-500/40"
                )}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold border",
                      alert.severity === 'CRITICAL' ? "bg-rose-500/20 text-rose-300 border-rose-500/50" :
                      alert.severity === 'HIGH' ? "bg-amber-500/20 text-amber-300 border-amber-500/50" :
                      "bg-sky-500/20 text-sky-300 border-sky-500/50"
                    )}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-zinc-400">{alert.timestamp}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[10px] text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                      MITRE: {alert.mitreTactic} ({alert.mitreId})
                    </span>
                    {alert.cveId && (
                      <span className="text-[10px] text-red-300 font-bold bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                        {alert.cveId}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {alert.signature}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                    <span>Source: <strong className="text-sky-300">{alert.srcHost}</strong> ({alert.srcIp})</span>
                    <span>→</span>
                    <span>Target: <strong className="text-white">{alert.dstIp}</strong></span>
                    <span>·</span>
                    <span className="text-zinc-400">Proto: {alert.proto}</span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    "px-2.5 py-1 rounded text-xs font-bold border",
                    alert.actionTaken === 'QUARANTINED' ? "bg-amber-500/20 border-amber-500/40 text-amber-300" :
                    alert.actionTaken === 'BLOCKED' ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" :
                    "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  )}>
                    {alert.actionTaken}
                  </span>

                  {alert.actionTaken === 'FLAGGED' && (
                    <button
                      onClick={() => handleQuarantineDevice(alert.id)}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition cursor-pointer"
                    >
                      Quarantine Station
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CVE VULNERABILITY MATRIX & CVSS SCORES                  */}
      {/* ============================================================== */}
      {activeTab === 'cve_matrix' && (
        <div className="space-y-3 font-mono">
          <div className="p-3 bg-zinc-900 border border-border rounded-xl text-xs text-zinc-400">
            Automated host vulnerability correlation against the National Vulnerability Database (NVD) based on discovered open ports, service banners, and wireless chipset firmwares.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CVE_DATABASE.map(cve => (
              <div
                key={cve.id}
                className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400">{cve.cve}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300">
                      CVSS {cve.cvssScore} {cve.severity}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                    {cve.title}
                  </h4>

                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {cve.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Affected Target:</span>
                    <span className="text-white font-semibold">{cve.affectedHost}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300">
                    <strong className="block text-emerald-400">Remediation Status ({cve.status}):</strong>
                    {cve.remediation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MITRE ATT&CK FRAMEWORK HEATMAP                          */}
      {/* ============================================================== */}
      {activeTab === 'mitre_matrix' && (
        <div className="space-y-4 font-mono">
          <div className="p-3 bg-zinc-900 border border-border rounded-xl text-xs text-zinc-400">
            Real-time behavioral telemetry mapping observed network packets, port sweeps, and connection patterns to the MITRE ATT&CK Enterprise Matrix.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {MITRE_TACTICS.map(tactic => (
              <div
                key={tactic.id}
                className="p-3.5 rounded-xl bg-card border border-border space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                    {tactic.id}
                  </span>
                  <h4 className="text-xs font-bold text-white mt-0.5">
                    {tactic.name}
                  </h4>
                </div>

                <div className="space-y-2">
                  {tactic.techniques.map(tech => (
                    <div
                      key={tech.id}
                      className={cn(
                        "p-2 rounded-lg border text-xs",
                        tech.active
                          ? "bg-rose-950/30 border-rose-500/50 text-rose-200"
                          : "bg-black/30 border-zinc-800 text-zinc-500"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold">{tech.id}</span>
                        {tech.active && (
                          <span className="px-1 rounded bg-rose-500/20 text-rose-400 font-bold">
                            {tech.hits} hits
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold mt-1 leading-tight">
                        {tech.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ZERO-TRUST NFTABLES FIREWALL ENFORCER                   */}
      {/* ============================================================== */}
      {activeTab === 'firewall_rules' && (
        <div className="space-y-3 font-mono">
          <div className="p-3 bg-zinc-900 border border-border rounded-xl text-xs text-zinc-400">
            Kernel-level Nftables and OpenWrt firewall chains governing lateral movement, inter-VLAN quarantine, and port-level reflection mitigation.
          </div>

          <div className="space-y-3">
            {firewallRules.map(rule => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-card border border-border flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-border text-zinc-400 uppercase">
                      {rule.category}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      rule.active ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                    )}>
                      {rule.active ? "ACTIVE CHAIN" : "DISABLED"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                  <p className="text-xs text-zinc-400">{rule.desc}</p>
                </div>

                <button
                  onClick={() => toggleFirewallRule(rule.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 border",
                    rule.active
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                      : "bg-white/5 border-border text-zinc-400 hover:text-white"
                  )}
                >
                  {rule.active ? "Enforced" : "Enable Rule"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
