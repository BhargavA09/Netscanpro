import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  Activity, 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Radio, 
  Cpu, 
  Filter, 
  Sparkles, 
  HelpCircle,
  Play,
  Pause,
  RefreshCw,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { PacketRecord } from '../types';

interface SpectralHarmonic {
  frequencyHz: number;
  label: string;
  powerDb: number;
  noiseFloorDb: number;
  isHarmonicPeak: boolean;
  classification: 'Authentic 1/f Noise' | 'C2 Periodic Beacon' | 'Botnet Burst' | 'DNS Covert Tunnel';
}

interface AuthenticatedFlow {
  id: string;
  sourceIp: string;
  destIp: string;
  protocol: string;
  periodicityScore: number; // 0 - 100%
  dominantFrequencyHz: number;
  authenticityStatus: 'AUTHENTIC' | 'FILTERED_BEACON' | 'FILTERED_BURST';
  confidence: number;
  packetCount: number;
  filterAction: 'PERMITTED' | 'DROPPED_BY_FOURIER' | 'ATTENUATED';
  detail: string;
}

export function FourierNetworkFilter() {
  const [filterMode, setFilterMode] = useState<'standard' | 'advanced' | 'bypass'>('advanced');
  const [peakSensitivity, setPeakSensitivity] = useState<number>(2.5); // Peak threshold multiplier
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [selectedHarmonic, setSelectedHarmonic] = useState<SpectralHarmonic | null>(null);
  const [flowSearch, setFlowSearch] = useState<string>('');

  // Spectral frequencies (0.05 Hz to 3.0 Hz) simulating live FFT Power Spectral Density
  const [spectralData, setSpectralData] = useState<SpectralHarmonic[]>([
    { frequencyHz: 0.05, label: '0.05 Hz (20s)', powerDb: 18.2, noiseFloorDb: 18.0, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' },
    { frequencyHz: 0.10, label: '0.10 Hz (10s)', powerDb: 16.5, noiseFloorDb: 16.2, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' },
    { frequencyHz: 0.20, label: '0.20 Hz (5.0s)', powerDb: 42.8, noiseFloorDb: 14.1, isHarmonicPeak: true, classification: 'C2 Periodic Beacon' },
    { frequencyHz: 0.30, label: '0.30 Hz (3.3s)', powerDb: 13.9, noiseFloorDb: 13.5, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' },
    { frequencyHz: 0.40, label: '0.40 Hz (2.5s)', powerDb: 34.2, noiseFloorDb: 12.8, isHarmonicPeak: true, classification: 'DNS Covert Tunnel' },
    { frequencyHz: 0.50, label: '0.50 Hz (2.0s)', powerDb: 12.1, noiseFloorDb: 12.0, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' },
    { frequencyHz: 0.75, label: '0.75 Hz (1.3s)', powerDb: 11.2, noiseFloorDb: 11.0, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' },
    { frequencyHz: 1.00, label: '1.00 Hz (1.0s)', powerDb: 10.4, noiseFloorDb: 10.2, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' },
    { frequencyHz: 1.25, label: '1.25 Hz (0.8s)', powerDb: 48.6, noiseFloorDb: 9.8, isHarmonicPeak: true, classification: 'Botnet Burst' },
    { frequencyHz: 1.50, label: '1.50 Hz (0.6s)', powerDb: 9.2, noiseFloorDb: 9.1, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' },
    { frequencyHz: 2.00, label: '2.00 Hz (0.5s)', powerDb: 8.5, noiseFloorDb: 8.4, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' },
    { frequencyHz: 2.50, label: '2.50 Hz (0.4s)', powerDb: 39.1, noiseFloorDb: 7.9, isHarmonicPeak: true, classification: 'Botnet Burst' },
    { frequencyHz: 3.00, label: '3.00 Hz (0.3s)', powerDb: 7.4, noiseFloorDb: 7.2, isHarmonicPeak: false, classification: 'Authentic 1/f Noise' }
  ]);

  // Authenticated Network Flows analyzed by Fourier engine
  const [flows, setFlows] = useState<AuthenticatedFlow[]>([
    {
      id: 'flow-auth-01',
      sourceIp: '10.0.0.45',
      destIp: '140.82.121.6 (github.com)',
      protocol: 'TLS 1.3 (TCP 443)',
      periodicityScore: 8,
      dominantFrequencyHz: 0.08,
      authenticityStatus: 'AUTHENTIC',
      confidence: 99.4,
      packetCount: 342,
      filterAction: 'PERMITTED',
      detail: 'Stochastic Poisson distribution verified. 1/f pink noise spectrum matches organic interactive developer activity.'
    },
    {
      id: 'flow-c2-02',
      sourceIp: '10.0.0.12',
      destIp: '45.33.2.1 (Feodo C2)',
      protocol: 'TCP 80',
      periodicityScore: 94,
      dominantFrequencyHz: 0.20,
      authenticityStatus: 'FILTERED_BEACON',
      confidence: 98.7,
      packetCount: 184,
      filterAction: 'DROPPED_BY_FOURIER',
      detail: 'Discrete 0.20 Hz (5.0s ± 0.02s) harmonic spike identified. High spectral resonance indicates automated C2 heartbeat beacon.'
    },
    {
      id: 'flow-dns-03',
      sourceIp: '192.168.1.105',
      destIp: '185.190.140.22 (Exfil NS)',
      protocol: 'DNS TXT (UDP 53)',
      periodicityScore: 88,
      dominantFrequencyHz: 0.40,
      authenticityStatus: 'FILTERED_BEACON',
      confidence: 96.2,
      packetCount: 92,
      filterAction: 'DROPPED_BY_FOURIER',
      detail: 'Periodic 0.40 Hz query pulse with constant payload length variance. Identified as automated covert DNS tunneling channel.'
    },
    {
      id: 'flow-auth-04',
      sourceIp: '10.0.0.45',
      destIp: '104.16.132.229 (Cloudflare CDN)',
      protocol: 'HTTPS (TCP 443)',
      periodicityScore: 12,
      dominantFrequencyHz: 0.12,
      authenticityStatus: 'AUTHENTIC',
      confidence: 97.9,
      packetCount: 512,
      filterAction: 'PERMITTED',
      detail: 'Dynamic jitter spectrum. Non-periodic HTTP/2 multiplexed streams validated.'
    },
    {
      id: 'flow-ddos-05',
      sourceIp: '192.168.1.44',
      destIp: '10.0.0.1',
      protocol: 'TCP SYN (Port 80)',
      periodicityScore: 99,
      dominantFrequencyHz: 1.25,
      authenticityStatus: 'FILTERED_BURST',
      confidence: 99.8,
      packetCount: 8400,
      filterAction: 'DROPPED_BY_FOURIER',
      detail: 'Micro-burst pulse at 1.25 Hz. Coordinated botnet SYN flood signature attenuated via Advanced Fourier Notch filter.'
    }
  ]);

  // Periodic simulated live spectral dynamics
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setSpectralData(prev => prev.map(item => {
        // Add subtle natural jitter to spectral power
        const noiseDelta = (Math.random() - 0.5) * 0.4;
        const peakDelta = item.isHarmonicPeak ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 0.3;
        return {
          ...item,
          powerDb: Number(Math.max(5, item.powerDb + peakDelta).toFixed(1)),
          noiseFloorDb: Number(Math.max(4, item.noiseFloorDb + noiseDelta).toFixed(1))
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  // Compute filter metrics
  const filterStats = useMemo(() => {
    const totalFlows = flows.length;
    const authenticFlows = flows.filter(f => f.authenticityStatus === 'AUTHENTIC').length;
    const droppedFlows = flows.filter(f => f.filterAction === 'DROPPED_BY_FOURIER').length;
    const harmonicPeaksCount = spectralData.filter(d => d.isHarmonicPeak).length;

    return {
      totalFlows,
      authenticFlows,
      droppedFlows,
      harmonicPeaksCount,
      authenticityRatio: Math.round((authenticFlows / totalFlows) * 100),
      attenuationDb: filterMode === 'advanced' ? '-42 dB (Adaptive Notch)' : filterMode === 'standard' ? '-24 dB (Band-Stop)' : '0 dB (Bypass)'
    };
  }, [flows, spectralData, filterMode]);

  // Filtered flows matching search
  const filteredFlows = useMemo(() => {
    if (!flowSearch.trim()) return flows;
    const query = flowSearch.toLowerCase();
    return flows.filter(f => 
      f.sourceIp.includes(query) ||
      f.destIp.toLowerCase().includes(query) ||
      f.authenticityStatus.toLowerCase().includes(query) ||
      f.detail.toLowerCase().includes(query)
    );
  }, [flows, flowSearch]);

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner explaining Fourier Authenticity Filtering */}
      <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <h3 className="text-white font-bold text-base tracking-tight">
                Fourier & Advanced Fourier Network Spectral Authenticator
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent font-bold uppercase border border-accent/30">
                L3-L7 Signal Processing
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono leading-relaxed max-w-4xl">
              Authenticates legitimate organic network flows and filters out artificial C2 beaconing, botnet burst pulses, and covert DNS channels by transforming packet inter-arrival time-series into the frequency domain (<span className="text-accent font-semibold">Discrete Fourier Transform / FFT</span>).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsProcessing(!isProcessing)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors font-bold",
                isProcessing ? "bg-accent/20 text-accent border border-accent/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              )}
            >
              {isProcessing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isProcessing ? 'Sampling FFT' : 'Paused'}
            </button>
          </div>
        </div>

        {/* Live Filter Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Spectral Authenticity</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{filterStats.authenticityRatio}% Verified</p>
            <span className="text-[10px] text-zinc-500">1/f Pareto Noise Validated</span>
          </div>

          <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Harmonic Resonance Spikes</span>
            <p className="text-xl font-bold text-critical mt-1">{filterStats.harmonicPeaksCount} Periodic Peaks</p>
            <span className="text-[10px] text-zinc-500">Detected Beacon Harmonics</span>
          </div>

          <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Unauthenticated Dropped</span>
            <p className="text-xl font-bold text-accent mt-1">{filterStats.droppedFlows} Illegitimate Flows</p>
            <span className="text-[10px] text-zinc-500">Filtered by Fourier Notch</span>
          </div>

          <div className="bg-white/[0.02] border border-border p-3.5 rounded-lg">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">Harmonic Notch Attenuation</span>
            <p className="text-xl font-bold text-white mt-1">{filterStats.attenuationDb}</p>
            <span className="text-[10px] text-zinc-500">Stopband Suppression</span>
          </div>
        </div>
      </div>

      {/* Filter Mode & Parameter Selector */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-zinc-400 font-bold uppercase flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-accent" />
            Filter Engine:
          </span>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setFilterMode('bypass')}
              className={cn(
                "px-3 py-1 rounded transition-colors cursor-pointer",
                filterMode === 'bypass' ? "bg-white/20 text-white font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Raw Bypass
            </button>
            <button
              onClick={() => setFilterMode('standard')}
              className={cn(
                "px-3 py-1 rounded transition-colors cursor-pointer",
                filterMode === 'standard' ? "bg-accent/20 text-accent font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              Standard Fourier (FFT Band-Stop)
            </button>
            <button
              onClick={() => setFilterMode('advanced')}
              className={cn(
                "px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1",
                filterMode === 'advanced' ? "bg-accent text-black font-bold shadow-[0_0_10px_rgba(0,255,65,0.3)]" : "text-zinc-400 hover:text-white"
              )}
            >
              <Sparkles className="w-3 h-3" />
              Advanced Fourier (Adaptive Wavelet Notch)
            </button>
          </div>
        </div>

        {/* Sensitivity Slider */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-zinc-400 whitespace-nowrap">Resonance Threshold:</span>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.5"
            value={peakSensitivity}
            onChange={(e) => setPeakSensitivity(parseFloat(e.target.value))}
            className="w-32 accent-accent cursor-pointer"
          />
          <span className="text-xs text-accent font-bold w-12">{peakSensitivity}x σ</span>
        </div>
      </div>

      {/* Main Split: Spectral Power Density (PSD) Chart & Harmonic Resonance Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fourier Power Spectral Density (PSD) Chart */}
        <div className="lg:col-span-8 bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                FFT Power Spectral Density Spectrum | P(f) = |X(f)|²
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Horizontal Axis: Frequency (Hz). Discrete spikes indicate periodic unauthenticated beaconing.
              </p>
            </div>
            <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-1 rounded">
              FFT Window: N=2048 samples
            </span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spectralData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorNoise" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ff41" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#525252" 
                  fontSize={10} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#525252" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 60]}
                  unit=" dB"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#00ff41' }}
                  formatter={(val: any, name: string) => [`${val} dB`, name === 'powerDb' ? 'Observed Spectral Power' : 'Authentic Noise Floor']}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="powerDb" 
                  name="Observed Spectral Power (dB)" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorPower)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="noiseFloorDb" 
                  name="Authentic 1/f Baseline Noise (dB)" 
                  stroke="#00ff41" 
                  fillOpacity={1} 
                  fill="url(#colorNoise)" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                {/* Reference line showing notch cutoff */}
                {filterMode !== 'bypass' && (
                  <ReferenceLine y={20 * peakSensitivity} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Fourier Filter Threshold', fill: '#38bdf8', fontSize: 10 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Explanation Banner */}
          <div className="p-3 bg-white/[0.02] border border-border rounded-lg text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">How Fourier Network Authentication Works: </strong>
              Legitimate user web traffic follows a continuous 1/f power law (green dashed line). When automated malware or C2 agents beacon periodically (e.g., at 0.20 Hz / 5.0 seconds), a sharp spike appears in the Fourier spectrum (red line). The <strong>Advanced Fourier Filter</strong> applies a narrow band notch to cancel those exact frequencies, preventing unauthenticated communication.
            </div>
          </div>
        </div>

        {/* Selected Harmonic Resonance Card */}
        <div className="lg:col-span-4 bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-border">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                Spectral Dissector
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Harmonic Resonance Analysis
              </h4>
            </div>

            <div className="space-y-3 mt-4">
              {spectralData.filter(d => d.isHarmonicPeak).map((peak) => (
                <div 
                  key={peak.frequencyHz}
                  onClick={() => setSelectedHarmonic(peak)}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer",
                    selectedHarmonic?.frequencyHz === peak.frequencyHz
                      ? "bg-critical/15 border-critical text-white"
                      : "bg-white/[0.02] border-border hover:bg-white/5 text-zinc-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-critical font-mono">{peak.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-critical/20 text-critical font-bold">
                      +{Number((peak.powerDb - peak.noiseFloorDb).toFixed(1))} dB SNR
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">{peak.classification}</p>
                  <div className="mt-2 text-[10px] text-zinc-500 flex items-center justify-between">
                    <span>Observed: {peak.powerDb} dB</span>
                    <span className="text-accent">
                      {filterMode === 'advanced' ? 'NOTCH FILTERED' : filterMode === 'standard' ? 'ATTENUATED' : 'PASSING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-border text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Harmonic Engine: ONLINE</span>
            <span className="text-emerald-400 font-bold">DSP Active</span>
          </div>
        </div>
      </div>

      {/* Traffic Authenticity Verification Stream */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Fourier-Filtered Network Flows & Authenticity Verification
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Every tracked stream is validated against Fourier frequency criteria before being labeled legitimate.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={flowSearch}
              onChange={(e) => setFlowSearch(e.target.value)}
              placeholder="Search flow, IP, verdict..."
              className="w-full bg-white/5 border border-border rounded px-8 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Flows Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-white/5 text-zinc-400 text-[10px] uppercase border-b border-border">
              <tr>
                <th className="p-3">Session Flow</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">Dominant Freq (f₀)</th>
                <th className="p-3">Periodicity Index</th>
                <th className="p-3">Authenticity Verdict</th>
                <th className="p-3 text-right">Fourier Filter Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredFlows.map((flow) => (
                <tr key={flow.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-white">{flow.sourceIp} &rarr; {flow.destIp}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{flow.detail}</p>
                  </td>
                  <td className="p-3 text-zinc-300 font-mono">{flow.protocol}</td>
                  <td className="p-3 text-accent font-mono font-bold">{flow.dominantFrequencyHz} Hz</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            flow.periodicityScore > 70 ? "bg-critical" : "bg-emerald-400"
                          )} 
                          style={{ width: `${flow.periodicityScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400">{flow.periodicityScore}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      flow.authenticityStatus === 'AUTHENTIC' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      flow.authenticityStatus === 'FILTERED_BEACON' ? "bg-critical/20 text-critical border border-critical/30" :
                      "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    )}>
                      {flow.authenticityStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={cn(
                      "text-[10px] font-bold uppercase",
                      flow.filterAction === 'PERMITTED' ? "text-emerald-400" :
                      flow.filterAction === 'DROPPED_BY_FOURIER' ? "text-critical" : "text-amber-400"
                    )}>
                      {flow.filterAction.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredFlows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No matching flows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
