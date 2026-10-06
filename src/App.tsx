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
import { SystemArchitecture } from './components/SystemArchitecture';
import { GodsEyeTracking } from './components/GodsEyeTracking';
import { GlobalSearch } from './components/GlobalSearch';
import { fetchJson } from './lib/api';
import { Bell, Menu, User, Terminal, ShieldAlert, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUnderAttack, setIsUnderAttack] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await fetchJson<{ isUnderAttack: boolean; alertCount: number }>('/api/status');
        setIsUnderAttack(data.isUnderAttack);
        setAlertCount(data.alertCount);
      } catch (error) {
        // Silently handled by resilient API client fallback
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
      case 'godseye':
        return <GodsEyeTracking />;
      case 'map':
        return <LiveAttackMap />;
      case 'network':
        return <NetworkAnalysis />;
      case 'tracking':
        return <CentralNetworkTracking />;
      case 'architecture':
        return <SystemArchitecture />;
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

      {/* Responsive Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Responsive Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 gap-3">
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

            <div className="flex items-center gap-2 text-zinc-500 min-w-0">
              <span className="text-xs font-mono uppercase tracking-widest hidden sm:inline">Status:</span>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full shrink-0 animate-pulse",
                  isUnderAttack ? "bg-critical" : "bg-accent"
                )} />
                <span className={cn(
                  "text-xs font-mono font-bold truncate",
                  isUnderAttack ? "text-critical" : "text-accent"
                )}>
                  {isUnderAttack ? 'UNDER ATTACK' : 'OPERATIONAL'}
                </span>
              </div>
            </div>
          </div>

          {/* Center & Right: Search, Alerts & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
            <div className="relative flex-1 min-w-0">
              <GlobalSearch onNavigate={(tab) => setActiveTab(tab)} />
            </div>

            <button 
              type="button"
              onClick={() => setActiveTab('feed')}
              className="relative p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Threat Alerts"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full border-2 border-card" />
              )}
            </button>

            <div className="h-6 w-px bg-border hidden sm:block" />

            {/* Developer Attribution Profile */}
            <button 
              type="button"
              onClick={() => setActiveTab('architecture')}
              className="flex items-center gap-2.5 hover:opacity-85 transition-opacity text-left cursor-pointer shrink-0"
              title="View System Architecture & Developer Profile (Bhargav)"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white font-mono leading-tight">Bhargav</p>
                <p className="text-[10px] font-mono text-accent uppercase leading-tight">Lead Systems Architect</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent flex items-center justify-center shadow-[0_0_10px_rgba(0,255,65,0.2)] shrink-0">
                <User className="w-4 h-4 text-accent" />
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
              className="bg-critical/10 border-b border-critical/30 px-4 sm:px-8 py-2 flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-3 min-w-0">
                <ShieldAlert className="w-4 h-4 text-critical animate-pulse shrink-0" />
                <span className="text-xs font-bold text-critical uppercase tracking-wider truncate">
                  CRITICAL ALERT: System experiencing volumetric intrusion attempt.
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('activity')}
                className="text-[10px] font-mono text-critical hover:underline uppercase shrink-0 ml-2"
              >
                View Logs
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Responsive Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 data-grid">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white capitalize tracking-tight">
                {activeTab === 'godseye' ? "God's Eye Omnipresent Tracker" : activeTab.replace('-', ' ')}
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                {activeTab === 'dashboard' && 'Real-time overview of your security posture and threat landscape.'}
                {activeTab === 'godseye' && 'God\'s Eye omnipresent surveillance: 360-degree radar sweep correlating orbital attacks, wire packets, DNS hops, and Fourier spectral authenticity across all sensors.'}
                {activeTab === 'map' && 'Live visualization of global cyber attacks and OSINT threat streams.'}
                {activeTab === 'network' && 'Real-time telemetry of network bandwidth, protocol distribution, and topology.'}
                {activeTab === 'tracking' && 'Central network tracking: real-time browser DNS resolution hop tracing, deep packet inspection (DPI), Fourier spectral filters, and God\'s Eye HUD.'}
                {activeTab === 'architecture' && 'Layered hexagonal software architecture, SRE reliability standards, and domain-driven design engineered by lead developer Bhargav.'}
                {activeTab === 'correlation' && 'Advanced heuristic analysis linking disparate system logs to known threat indicators.'}
                {activeTab === 'feed' && 'Chronological list of detected threats and security events.'}
                {activeTab === 'analyzer' && 'Advanced AI-driven analysis of suspicious files and behavior.'}
                {activeTab === 'lookup' && 'Query our global intelligence database for known malicious indicators.'}
                {activeTab === 'actors' && 'Intelligence on known adversary groups and their operations.'}
                {activeTab === 'collab' && 'Collaborative SOC incident reports, investigative playbooks, and secure chat with real-time sync and presence indicators.'}
                {activeTab === 'cms' && 'Content Management System (CMS) for uploading, categorizing, and managing publication states of bulletins and infosec papers.'}
                {activeTab === 'activity' && 'Real-time audit trails, kernel events, and application activity logs.'}
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
      </main>
    </div>
  );
}
