import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ThreatFeed } from './components/ThreatFeed';
import { ThreatAnalyzer } from './components/ThreatAnalyzer';
import { IoCLookup } from './components/IoCLookup';
import { SystemLogs } from './components/SystemLogs';
import { LiveAttackMap } from './components/LiveAttackMap';
import { ThreatCorrelation } from './components/ThreatCorrelation';
import { NetworkAnalysis } from './components/NetworkAnalysis';
import { ThreatAlertSystem } from './components/ThreatAlertSystem';
import { ThreatActorProfiles } from './components/ThreatActorProfiles';
import { Collaboration } from './components/Collaboration';
import { CmsHub } from './components/CmsHub';
import { CentralNetworkTracking } from './components/CentralNetworkTracking';
import { DevOpsArchitecture } from './components/DevOpsArchitecture';
import { GlobalSearch } from './components/GlobalSearch';
import { fetchJson } from './lib/api';
import { Bell, Search, User, Terminal, AlertTriangle, ShieldAlert, Globe, Link as LinkIcon, Zap, Network as NetworkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUnderAttack, setIsUnderAttack] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await fetchJson<{ isUnderAttack: boolean; alertCount: number }>('/api/status');
        setIsUnderAttack(data.isUnderAttack);
        setAlertCount(data.alertCount);
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return <LiveAttackMap />;
      case 'network':
        return <NetworkAnalysis />;
      case 'tracking':
        return <CentralNetworkTracking />;
      case 'correlation':
        return <ThreatCorrelation />;
      case 'feed':
        return <ThreatFeed />;
      case 'analyzer':
        return <ThreatAnalyzer />;
      case 'lookup':
        return <IoCLookup />;
      case 'actors':
        return <ThreatActorProfiles />;
      case 'collab':
        return <Collaboration />;
      case 'cms':
        return <CmsHub />;
      case 'devops':
        return <DevOpsArchitecture />;
      case 'activity':
        return <SystemLogs />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500">
            <Terminal className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-mono text-sm uppercase tracking-widest">Module Under Construction</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden relative">
      {/* Global Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      <ThreatAlertSystem />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="text-xs font-mono uppercase tracking-widest">Network Status:</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isUnderAttack ? "bg-critical" : "bg-accent"
              )} />
              <span className={cn(
                "text-xs font-mono",
                isUnderAttack ? "text-critical" : "text-accent"
              )}>
                {isUnderAttack ? 'UNDER ATTACK' : 'OPERATIONAL'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <GlobalSearch onNavigate={(tab) => setActiveTab(tab)} />
            </div>
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-critical rounded-full border-2 border-card" />
              )}
            </button>
            <div className="h-8 w-px bg-border" />
            <button 
              onClick={() => setActiveTab('devops')}
              className="flex items-center gap-3 hover:opacity-85 transition-opacity text-left cursor-pointer"
              title="View DevOps Architecture & Developer Profile"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white font-mono">Bhargav</p>
                <p className="text-[10px] font-mono text-accent uppercase">Lead DevOps & Architect</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent flex items-center justify-center shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                <User className="w-5 h-5 text-accent" />
              </div>
            </button>
          </div>
        </header>

        {/* Attack Alert Banner */}
        <AnimatePresence>
          {isUnderAttack && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-critical/10 border-b border-critical/30 px-8 py-2 flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-critical animate-pulse" />
                <span className="text-xs font-bold text-critical uppercase tracking-widest">
                  CRITICAL ALERT: System is currently experiencing a high-volume intrusion attempt.
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('activity')}
                className="text-[10px] font-mono text-critical hover:underline uppercase"
              >
                View Logs
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 data-grid">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white capitalize tracking-tight">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                {activeTab === 'dashboard' && 'Real-time overview of your security posture and threat landscape.'}
                {activeTab === 'map' && 'Live visualization of global cyber attacks and OSINT threat streams.'}
                {activeTab === 'network' && 'Real-time telemetry of network bandwidth, protocol distribution, and topology.'}
                {activeTab === 'tracking' && 'Central network tracking: real-time browser DNS resolution hop tracing, deep packet inspection (DPI), and packet-by-packet hex analysis.'}
                {activeTab === 'correlation' && 'Advanced heuristic analysis linking disparate system logs to known threat indicators.'}
                {activeTab === 'feed' && 'Chronological list of detected threats and security events.'}
                {activeTab === 'analyzer' && 'Advanced AI-driven analysis of suspicious files and behavior.'}
                {activeTab === 'lookup' && 'Query our global intelligence database for known malicious indicators.'}
                {activeTab === 'actors' && 'Intelligence on known adversary groups and their operations.'}
                {activeTab === 'collab' && 'Collaborative SOC incident reports, investigative playbooks, and secure chat with real-time sync and presence indicators.'}
                {activeTab === 'cms' && 'Content Management System (CMS) for uploading, categorizing, and managing publication states of bulletins and infosec papers.'}
                {activeTab === 'devops' && 'DevOps continuous delivery pipeline, SRE reliability standards, and clean hexagonal software architecture engineered by lead developer Bhargav.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
