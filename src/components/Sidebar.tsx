import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Search, 
  Zap, 
  Settings, 
  LogOut,
  Activity,
  Globe,
  Link as LinkIcon,
  Network as NetworkIcon,
  Users,
  Users2,
  FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Live Map', icon: Globe },
  { id: 'network', label: 'Network Analysis', icon: NetworkIcon },
  { id: 'feed', label: 'Threat Feed', icon: ShieldAlert },
  { id: 'correlation', label: 'Threat Correlation', icon: LinkIcon },
  { id: 'lookup', label: 'IoC Lookup', icon: Search },
  { id: 'actors', label: 'Threat Actors', icon: Users },
  { id: 'collab', label: 'SOC Collab', icon: Users2 },
  { id: 'cms', label: 'Intelligence CMS', icon: FolderOpen },
  { id: 'analyzer', label: 'AI Analyzer', icon: Zap },
  { id: 'activity', label: 'System Logs', icon: Activity },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const data = await fetchJson<{ alertCount: number }>('/api/status');
        setAlertCount(data.alertCount);
      } catch (error) {
        console.error('Error fetching alerts for sidebar:', error);
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/20 rounded flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">SENTINEL</h1>
        </div>
        <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">
          Threat Intel v2.4.0
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-accent/10 text-accent border border-accent/20" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                activeTab === item.id ? "text-accent" : "text-zinc-500 group-hover:text-zinc-300"
              )} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.id === 'dashboard' && alertCount > 0 && (
              <span className="bg-critical text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-critical hover:bg-critical/5 rounded-lg transition-all">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
