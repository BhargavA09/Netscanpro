import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HomeWifiMap } from './components/HomeWifiMap';
import { NetworkAnalysis } from './components/NetworkAnalysis';
import { CentralNetworkTracking } from './components/CentralNetworkTracking';
import { NetworkNeighborhood } from './components/NetworkNeighborhood';
import { SystemLogs } from './components/SystemLogs';
import { GlobalSearch } from './components/GlobalSearch';
import { WorldMonitorDashboard } from './components/WorldMonitorDashboard';
import { SocThreatCenter } from './components/SocThreatCenter';
import { ThreatAlertSystem } from './components/ThreatAlertSystem';
import { fetchJson } from './lib/api';
import { Bell, Menu, User, Terminal, Wifi, Globe, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const q = window.location.search;
      if (q.includes('lat=') || q.includes('layers=') || q.includes('view=')) {
        return 'worldmonitor';
      }
    }
    return 'worldmonitor'; // Default to the requested World Monitor dashboard!
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStationsCount, setActiveStationsCount] = useState(15);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await fetchJson<{ alertCount?: number; totalClients?: number }>('/api/wifi/telemetry');
        if (data && (data as any).clients) {
          setActiveStationsCount((data as any).clients.length);
        }
      } catch (error) {
        // Handled gracefully
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'worldmonitor':
        return <WorldMonitorDashboard />;
      case 'threats':
        return <SocThreatCenter />;
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'wifimap':
        return <HomeWifiMap />;
      case 'network':
        return <NetworkAnalysis />;
      case 'tracking':
        return <CentralNetworkTracking />;
      case 'neighborhood':
        return <NetworkNeighborhood />;
      case 'activity':
        return <SystemLogs />;
      default:
        return <WorldMonitorDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden relative">
      {/* Global Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Responsive Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Responsive Header: Residential Mesh Health HUD */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 gap-3">
          {/* Left: Mobile Toggle & Network Status */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ring-4 ring-emerald-500/20" />
              <div className="flex items-baseline gap-2 truncate">
                <span className="text-xs font-mono font-bold text-white tracking-tight">
                  SENTINEL MESH: 4/4 APs ONLINE
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  OPTIMAL HEALTH
                </span>
              </div>
            </div>
          </div>

          {/* Center HUD: WAN Uplink & Active Stations */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400 bg-black/30 px-2.5 py-1 rounded-lg border border-border/80">
              <span className="text-sky-400 font-semibold">WAN:</span>
              <span className="text-zinc-200">1.0 Gbps Fiber (940M/940M)</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 bg-black/30 px-2.5 py-1 rounded-lg border border-border/80">
              <span className="text-emerald-400 font-semibold">{activeStationsCount}</span>
              <span className="text-zinc-300">Stations Connected</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-zinc-400 bg-black/30 px-2.5 py-1 rounded-lg border border-border/80">
              <span className="text-purple-400 font-semibold">Pi-hole:</span>
              <span className="text-zinc-300">99.4% Clean · 1,840 Blocked</span>
            </div>
          </div>

          {/* Right: Search, Logs Alert Bell & Household Profile */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <GlobalSearch onNavigate={(tab) => setActiveTab(tab)} />
            </div>

            <button 
              type="button"
              onClick={() => setActiveTab('activity')}
              className="relative p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 rounded-lg hover:bg-white/5"
              title="Network & System Logs"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            </button>

            <div className="h-6 w-px bg-border hidden sm:block" />

            {/* Household Admin Profile */}
            <div 
              className="flex items-center gap-2.5 text-left shrink-0 pl-1"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white font-mono leading-tight">Alex Morgan</p>
                <p className="text-[10px] font-mono text-zinc-400 leading-tight">Homeowner & Admin</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.2)] shrink-0 font-mono text-xs font-bold">
                AM
              </div>
            </div>
          </div>
        </header>

        {/* Responsive Content Area */}
        {activeTab === 'worldmonitor' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            {renderContent()}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 data-grid">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {activeTab === 'threats' && 'SOC Threat Intelligence & Intrusion Detection (Suricata + CVE Matrix)'}
                  {activeTab === 'dashboard' && 'Overview Dashboard'}
                  {activeTab === 'wifimap' && 'Home Wi-Fi Mesh & Floorplan Topology'}
                  {activeTab === 'network' && 'Device Discovery & Reconnaissance (ARPing + Nmap)'}
                  {activeTab === 'tracking' && 'Wireshark PCAP Capture & Deep Packet Inspection (DPI)'}
                  {activeTab === 'neighborhood' && 'Zero-Trust Device & User Access Control'}
                  {activeTab === 'activity' && 'Network Event Logs & Universal System Audit'}
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  {activeTab === 'threats' && 'Real-time signature-based intrusion detection, automated CVE-to-port vulnerability mapping, MITRE ATT&CK framework heatmap, and zero-trust firewall policy enforcement.'}
                  {activeTab === 'dashboard' && 'Live residential mesh topology status, WAN uplink telemetry, connected stations count, and DPI anomaly overview.'}
                  {activeTab === 'wifimap' && 'Multi-band 2.4/5/6GHz access points, interactive floorplan placement, mesh backhauls, client roaming handoffs, and Cake SQM QoS.'}
                  {activeTab === 'network' && 'Hybrid Layer-2 ARPing and Layer-4 Nmap scanner: active host discovery, MAC vendor resolution, and open port profiling.'}
                  {activeTab === 'tracking' && 'Real-time 3-pane Wireshark packet capture dissector, live BPF display filters, payload hex dump byte inspector, TCP stream reassembly, and PCAP export.'}
                  {activeTab === 'neighborhood' && 'Household user roles (Homeowner, Family, Smart Home IoT, Guests), device quarantine, VLAN isolation, and speed limits.'}
                  {activeTab === 'activity' && 'Universal system events: DAWN roaming steers, DHCP leases, Pi-hole DNS sinkholes, and OpenWrt nftables firewall drops.'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Real-time High-Priority Threat Alert Toast Stream */}
      <ThreatAlertSystem />
    </div>
  );
}
