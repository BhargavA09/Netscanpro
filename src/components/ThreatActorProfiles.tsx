import React, { useState, useEffect } from 'react';
import { ThreatActor } from '../types';
import { Users, Globe, Target, Zap, Info, Clock, Search, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

export function ThreatActorProfiles() {
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        const data = await fetchJson<ThreatActor[]>('/api/threat-actors');
        setActors(data);
      } catch (error) {
        console.error('Error fetching threat actors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActors();
  }, []);

  const filteredActors = actors.filter(actor => 
    actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    actor.aliases.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase())) ||
    actor.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-accent" />
            Threat Actor Profiles
          </h2>
          <p className="text-zinc-500 text-sm mt-1 font-mono uppercase tracking-wider">
            Intelligence on known adversary groups and their operations
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search actors, aliases, or origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actor List */}
        <div className="lg:col-span-1 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs animate-pulse">
              LOADING INTEL...
            </div>
          ) : filteredActors.length > 0 ? (
            filteredActors.map((actor) => (
              <div
                key={actor.id}
                onClick={() => setSelectedActor(actor)}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer group",
                  selectedActor?.id === actor.id 
                    ? "bg-accent/10 border-accent shadow-lg shadow-accent/5" 
                    : "bg-card border-border hover:border-zinc-700"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold">{actor.name}</h3>
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {actor.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                  <Globe className="w-3 h-3" />
                  {actor.origin}
                </div>
                <div className="flex flex-wrap gap-1">
                  {actor.aliases.slice(0, 3).map(alias => (
                    <span key={alias} className="text-[9px] font-mono text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                      {alias}
                    </span>
                  ))}
                  {actor.aliases.length > 3 && (
                    <span className="text-[9px] font-mono text-zinc-600">+{actor.aliases.length - 3} more</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-border rounded-xl">
              NO MATCHING ADVERSARIES FOUND
            </div>
          )}
        </div>

        {/* Actor Details */}
        <div className="lg:col-span-2">
          {selectedActor ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border bg-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{selectedActor.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedActor.aliases.map(alias => (
                        <span key={alias} className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-border">
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono text-zinc-500">LAST ACTIVE</span>
                    <span className="text-sm font-bold text-accent">{selectedActor.lastActive}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                      <Globe className="w-3 h-3 text-accent" />
                      Origin
                    </div>
                    <p className="text-sm text-white font-medium">{selectedActor.origin}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                      <Target className="w-3 h-3 text-accent" />
                      Target Sectors
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedActor.targetSectors.map(sector => (
                        <span key={sector} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                      <Zap className="w-3 h-3 text-accent" />
                      Motivations
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedActor.motivations.map(motivation => (
                        <span key={motivation} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                          {motivation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                <section>
                  <h4 className="text-white font-bold flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-accent" />
                    Overview
                  </h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {selectedActor.description}
                  </p>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      Tactics, Techniques & Procedures (TTPs)
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                      {selectedActor.ttps.length} Techniques Identified
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {selectedActor.ttps.map(ttp => (
                      <div key={ttp.id} className="p-4 bg-white/5 border border-border rounded-xl group hover:border-accent/30 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(0,255,157,0.5)]" />
                            <h5 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{ttp.name}</h5>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-border">
                            {ttp.id}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-3 pl-5">
                          {ttp.description}
                        </p>
                        {ttp.mitreUrl && (
                          <div className="pl-5 flex items-center gap-4">
                            <a 
                              href={ttp.mitreUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-accent/70 hover:text-accent transition-colors uppercase tracking-widest"
                            >
                              <ExternalLink className="w-3 h-3" />
                              MITRE ATT&CK Details
                            </a>
                            <div className="h-px flex-1 bg-border/30" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <h4 className="text-accent text-xs font-mono font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Search className="w-3 h-3" />
                    TTP Visual Breakdown
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedActor.ttps.map(ttp => (
                      <div key={`breakdown-${ttp.id}`} className="p-2 bg-black/20 rounded border border-border/50 text-center">
                        <div className="text-[9px] font-mono text-zinc-500 mb-1">{ttp.id}</div>
                        <div className="text-[10px] text-white font-medium truncate">{ttp.name}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="pt-6 border-t border-border flex justify-end">
                  <button className="flex items-center gap-2 text-xs font-mono text-accent hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    VIEW FULL MITRE ATT&CK PROFILE
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-card/50 border border-dashed border-border rounded-xl p-12 text-center">
              <Users className="w-16 h-16 text-zinc-800 mb-4" />
              <h3 className="text-zinc-500 font-bold uppercase tracking-widest">Select an Adversary</h3>
              <p className="text-zinc-600 text-sm mt-2 max-w-xs">
                Select a threat actor from the list to view detailed intelligence on their operations and TTPs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
