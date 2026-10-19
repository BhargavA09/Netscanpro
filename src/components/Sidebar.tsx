import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wifi, 
  Radar, 
  Radio, 
  Users, 
  Activity,
  X,
  Server,
  Globe,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { id: 'worldmonitor', label: 'Global Cyber Threat Map', icon: Globe },
  { id: 'threats', label: 'SOC Threat Intel & IDS', icon: ShieldAlert },
  { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'wifimap', label: 'Wi-Fi Mesh & Floorplan', icon: Wifi },
  { id: 'tracking', label: 'Wireshark PCAP & DPI', icon: Radio },
  { id: 'neighborhood', label: 'Zero-Trust Access Control', icon: Users },
  { id: 'activity', label: 'System & Security Logs', icon: Activity },
];

export function Sidebar({ activeTab, setActiveTab, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const data = await fetchJson<{ alertCount: number }>('/api/status');
        setAlertCount(data.alertCount);
      } catch (error) {
        // Silently handled by resilient API client fallback
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="w-64 h-full bg-card border-r border-border flex flex-col shrink-0">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500/20 border border-sky-500/40 rounded flex items-center justify-center text-sky-400">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight font-mono">SENTINEL WI-FI</h1>
            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
              Enterprise Home Portal
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onMobileClose && (
          <button 
            type="button" 
            onClick={onMobileClose} 
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all duration-200 group text-left cursor-pointer",
              activeTab === item.id 
                ? "bg-accent/10 text-accent border border-accent/20" 
                : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <item.icon className={cn(
                "w-4 h-4 transition-colors shrink-0",
                activeTab === item.id ? "text-accent" : "text-zinc-500 group-hover:text-zinc-300"
              )} />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </div>
            {item.id === 'dashboard' && alertCount > 0 && (
              <span className="bg-critical text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shrink-0">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-300">Python 3.10 Daemon</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">ACTIVE</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex h-screen shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={onMobileClose} 
            aria-hidden="true"
          />
          {/* Drawer Panel */}
          <div className="relative z-50 flex-1 max-w-xs animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
