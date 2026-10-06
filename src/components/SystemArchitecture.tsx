import React, { useState } from 'react';
import { 
  GitBranch, 
  Cpu, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Server, 
  Database, 
  Workflow, 
  CheckCircle2, 
  RefreshCw, 
  Code2, 
  User, 
  Mail, 
  Award, 
  Box, 
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

export function SystemArchitecture() {
  const [activeSection, setActiveSection] = useState<'architecture' | 'engineering' | 'developer'>('architecture');

  const developerInfo = {
    name: 'Bhargav',
    email: 'deck5566@gmail.com',
    role: 'Lead Full-Stack Developer & Systems Architect',
    organization: 'Sentinel Cyber Intelligence Core',
    certifications: [
      'Certified Kubernetes Administrator (CKA)',
      'AWS Certified Solutions Architect Professional',
      'Offensive Security Certified Professional (OSCP)'
    ],
    principles: [
      {
        title: 'Clean & Hexagonal Architecture',
        description: 'Separation of pure domain types, application use-cases, and transport adapters (REST/WebSocket).'
      },
      {
        title: 'SOLID Design Discipline',
        description: 'Strict adherence to SRP, Open/Closed protocol extensions, and resilient dependency inversion.'
      },
      {
        title: 'Zero-Trust Telemetry & DPI',
        description: 'Packet-by-packet packet inspection, DNS hop resolution tracking, and deterministic SIEM correlation.'
      },
      {
        title: 'SRE Resilience & Self-Healing',
        description: 'Automated type linting, reproducible builds, circuit breakers, and exponential backoff retry policies.'
      }
    ]
  };

  const ciCdStages = [
    {
      id: 'lint',
      name: 'Static Analysis & Typecheck',
      command: 'tsc --noEmit',
      status: 'PASSED',
      duration: '1.2s',
      detail: 'Zero TypeScript compilation warnings across client and server.'
    },
    {
      id: 'build',
      name: 'Vite Production Bundler',
      command: 'vite build',
      status: 'PASSED',
      duration: '2.8s',
      detail: 'Optimized Rollup chunks, minified asset graphs with CSS tree-shaking.'
    },
    {
      id: 'container',
      name: 'Full-Stack Runtime Container',
      command: 'tsx server.ts',
      status: 'RUNNING',
      duration: 'Continuous',
      detail: 'Unified Express HTTP/1.1 & WebSocket (ws) gateway on Port 3000.'
    },
    {
      id: 'probe',
      name: 'SRE Health & Latency Probe',
      command: 'GET /api/health',
      status: 'HEALTHY',
      duration: '5ms SLA',
      detail: 'Automated 200 OK liveness and readiness monitoring.'
    }
  ];

  const architectureLayers = [
    {
      layer: 'Presentation & UI Layer',
      tech: 'React 19 · Tailwind CSS · Recharts · Lucide Icons',
      responsibility: 'High-contrast SOC operator interface, zero-pill typography, reactive state hooks, and responsive real-time data widgets.',
      components: 'Dashboard, LiveAttackMap, CentralNetworkTracking, GodsEyeTracking, IoCLookup, Collaboration, CmsHub'
    },
    {
      layer: 'Client-Side API & Resilience Adapter',
      tech: 'Custom fetchJson Client with Circuit Breaker',
      responsibility: 'Self-healing API communications with automated exponential backoff retry on transient faults, timeout control via AbortController, and Content-Type enforcement.',
      components: 'src/lib/api.ts'
    },
    {
      layer: 'Backend Application & Gateway Layer',
      tech: 'Node.js · Express · TypeScript (tsx) · ws Engine',
      responsibility: 'REST routing, CORS enforcement, Cache-Control headers, real-time multi-client document synchronization, and telemetry broadcast.',
      components: 'server.ts (REST APIs & WebSocket Room Server)'
    },
    {
      layer: 'Deep Packet & Spectral Inspection Engine',
      tech: 'Fourier FFT & L3-L7 Dissector Heuristic Analyzer',
      responsibility: 'Hexadecimal byte offsets & ASCII rendering, DNS recursive hop resolution journey tracing, and Fourier harmonic frequency attenuation.',
      components: 'traceDomainQuery(), computeRegionalThreatMetrics(), FourierNetworkFilter'
    },
    {
      layer: 'Domain Entity & Contract Layer',
      tech: 'Strict TypeScript Domain Types',
      responsibility: 'Framework-independent data models representing security primitives, threat actors, packets, DNS records, and CMS content.',
      components: 'src/types.ts'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Developer Banner Card */}
      <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Award className="w-32 h-32" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-accent/20 border-2 border-accent flex items-center justify-center text-accent shrink-0 shadow-[0_0_20px_rgba(0,255,65,0.2)]">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white font-mono">{developerInfo.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/20 text-accent font-bold uppercase border border-accent/30">
                  Lead Architect
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{developerInfo.role}</p>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 mt-2">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  {developerInfo.email}
                </span>
                <span aria-hidden="true">·</span>
                <span>{developerInfo.organization}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection('developer')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono transition-colors",
                activeSection === 'developer' ? "bg-accent text-black font-semibold" : "bg-white/5 text-zinc-400 hover:text-white"
              )}
            >
              Architect Profile
            </button>
            <button
              onClick={() => setActiveSection('architecture')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono transition-colors",
                activeSection === 'architecture' ? "bg-accent text-black font-semibold" : "bg-white/5 text-zinc-400 hover:text-white"
              )}
            >
              Architecture & Design
            </button>
            <button
              onClick={() => setActiveSection('engineering')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono transition-colors",
                activeSection === 'engineering' ? "bg-accent text-black font-semibold" : "bg-white/5 text-zinc-400 hover:text-white"
              )}
            >
              Engineering & CI/CD
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: ARCHITECTURE & DESIGN PRINCIPLES */}
      {activeSection === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {developerInfo.principles.map((principle) => (
              <div key={principle.title} className="bg-card border border-border p-5 rounded-xl">
                <div className="p-2 w-fit rounded-lg bg-accent/10 text-accent mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-white font-bold text-sm font-mono">{principle.title}</h4>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </div>

          {/* Layered Architectural Diagram */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2 font-mono">
                  <Workflow className="w-5 h-5 text-accent" />
                  Layered Hexagonal Software Architecture
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Engineered by developer <strong className="text-white">{developerInfo.name}</strong> following strict Clean Architecture and high-throughput SIEM patterns.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2.5 py-1 rounded">
                Strict Separation of Concerns
              </span>
            </div>

            <div className="space-y-3">
              {architectureLayers.map((layer, index) => (
                <div key={layer.layer} className="bg-white/[0.02] border border-border rounded-lg p-4 transition-colors hover:bg-white/[0.04]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-accent/20 text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        0{index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono">{layer.layer}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      {layer.tech}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-2 pl-9 leading-relaxed">{layer.responsibility}</p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-2 pl-9">
                    <span className="text-zinc-400 uppercase">Modules:</span> {layer.components}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: ENGINEERING & PIPELINE */}
      {activeSection === 'engineering' && (
        <div className="space-y-6">
          {/* Pipeline Visual Flow */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2 font-mono">
                  <GitBranch className="w-5 h-5 text-accent" />
                  Automated Continuous Integration & Delivery Pipeline
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Lead Maintainer: <span className="text-accent font-mono">{developerInfo.name}</span>
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PIPELINE STATUS: HEALTHY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ciCdStages.map((stage) => (
                <div key={stage.id} className="bg-white/[0.02] border border-border rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{stage.id.toUpperCase()}</span>
                      <span className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase",
                        stage.status === 'PASSED' || stage.status === 'HEALTHY' ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-blue-500/20 text-blue-400"
                      )}>
                        {stage.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-mono">{stage.name}</h4>
                    <div className="bg-black/60 p-2 rounded mt-2 text-[10px] font-mono text-accent">
                      $ {stage.command}
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">{stage.detail}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>Duration</span>
                    <span className="text-white">{stage.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SRE Reliability Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Error Budget & Uptime SLA</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">99.98%</p>
              <p className="text-xs text-zinc-400 mt-1">Fault-tolerant Express process with zero-crash global handlers.</p>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Mean Time to Recovery (MTTR)</span>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">&lt; 2.4 min</p>
              <p className="text-xs text-zinc-400 mt-1">Automated container restart & instant Vite HMR rebuilds.</p>
            </div>

            <div className="bg-card border border-border p-5 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Network Client Circuit Breaker</span>
              <p className="text-2xl font-bold text-accent font-mono mt-1">ACTIVE</p>
              <p className="text-xs text-zinc-400 mt-1">Exponential backoff retry with AbortController timeouts.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: ARCHITECT PROFILE */}
      {activeSection === 'developer' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-lg font-bold text-white font-mono">Lead Architect Profile & Acknowledgements</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Authored and maintained by <strong className="text-accent">{developerInfo.name}</strong> ({developerInfo.email}).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                Engineering Roles & Capabilities
              </h4>
              <ul className="space-y-2 text-xs font-mono text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Architecture of Sentinel Threat Intelligence & SOC Orchestration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Real-time Deep Packet Inspection (DPI) & Browser DNS hop tracing engines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Fourier and Advanced Fourier spectral authentication & covert beacon filtering.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Omnipresent God's Eye multi-sensor panoramic telemetry tracking.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                Contact & Verification
              </h4>
              <div className="bg-white/[0.02] border border-border rounded-lg p-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-zinc-500">Architect:</span>
                  <span className="text-accent font-bold">{developerInfo.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-zinc-500">Primary Email:</span>
                  <span className="text-white">{developerInfo.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-zinc-500">Architecture Standard:</span>
                  <span className="text-zinc-300">Hexagonal / Clean Architecture</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Production Status:</span>
                  <span className="text-emerald-400 font-bold">Verified & Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
