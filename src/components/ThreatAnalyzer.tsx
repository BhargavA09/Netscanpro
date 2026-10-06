import React, { useState } from 'react';
import { Zap, Loader2, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { analyzeThreat } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function ThreatAnalyzer() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const analysis = await analyzeThreat(input);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/20">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-white font-medium">AI Threat Intelligence</h3>
            <p className="text-xs text-zinc-500">Paste logs, threat descriptions, or IoCs for deep analysis</p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste threat data here (e.g., 'Suspicious activity on port 443 from IP 192.168.1.50...')"
            className="w-full h-40 bg-black/40 border border-border rounded-lg p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="w-full py-3 bg-accent text-black font-bold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                ANALYZING...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                RUN AI ANALYSIS
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border p-6 rounded-xl">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  Analysis Summary
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-accent" />
                  Recommendations
                </h4>
                <div className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-border">
                      <ChevronRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border p-6 rounded-xl text-center">
                <h4 className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-4">Risk Score</h4>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32">
                    <circle
                      className="text-white/5"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={cn(
                        "transition-all duration-1000",
                        result.riskScore > 70 ? "text-critical" : 
                        result.riskScore > 40 ? "text-high" : "text-low"
                      )}
                      strokeWidth="8"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * result.riskScore) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <span className="absolute text-3xl font-bold text-white">{result.riskScore}</span>
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl">
                <h4 className="text-white font-medium mb-4">MITRE ATT&CK</h4>
                <div className="flex flex-wrap gap-2">
                  {result.relatedTechniques.map((tech) => (
                    <span key={tech} className="text-[10px] font-mono px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
