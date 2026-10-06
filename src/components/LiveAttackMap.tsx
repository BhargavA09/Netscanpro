import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Globe, Crosshair, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

// Fix for default marker icons in Leaflet with React
// We are using L.divIcon for all markers, so we don't need the default icon imports
// which can cause issues in some build environments.

interface AttackPoint {
  id: string;
  ip?: string;
  source: { lat: number; lng: number };
  target: { lat: number; lng: number };
  type: string;
  country?: string;
}

// Custom component to handle map interactions if needed
function MapController() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export function LiveAttackMap() {
  const [attacks, setAttacks] = useState<AttackPoint[]>([]);

  useEffect(() => {
    const fetchAttacks = async () => {
      try {
        const data = await fetchJson<AttackPoint[]>('/api/attack-map');
        if (Array.isArray(data)) {
          setAttacks(data);
        }
      } catch (error) {
        console.error('Error fetching attack map data:', error);
      }
    };

    fetchAttacks();
    const interval = setInterval(fetchAttacks, 3000);
    return () => clearInterval(interval);
  }, []);

  // Custom marker icons
  const sourceIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-2 h-2 bg-critical rounded-full animate-ping"></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4]
  });

  const targetIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-3 h-3 bg-accent rounded-full shadow-[0_0_10px_#00ff41]"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden h-[600px] relative z-0">
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapController />
            {attacks.map(attack => (
              <React.Fragment key={attack.id}>
                <Polyline 
                  positions={[
                    [attack.source.lat, attack.source.lng],
                    [attack.target.lat, attack.target.lng]
                  ]}
                  pathOptions={{
                    color: attack.type.toLowerCase().includes('botnet') ? '#ef4444' : 
                           attack.type.toLowerCase().includes('malware') ? '#f59e0b' : '#00ff41',
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 10'
                  }}
                />
                <Marker 
                  position={[attack.source.lat, attack.source.lng]} 
                  icon={sourceIcon}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="font-mono text-xs">
                      <p className="font-bold text-critical">Source</p>
                      <p>{attack.ip || `ID_${attack.id.slice(0, 6)}`}</p>
                      <p className="text-zinc-400">{attack.type}</p>
                    </div>
                  </Tooltip>
                </Marker>
                <Marker 
                  position={[attack.target.lat, attack.target.lng]} 
                  icon={targetIcon}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="font-mono text-xs">
                      <p className="font-bold text-accent">Target</p>
                      <p>Internal Node</p>
                    </div>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>

          {/* Map Overlay */}
          <div className="absolute top-4 left-4 z-[1000] space-y-2">
            <div className="bg-black/80 backdrop-blur-md border border-border p-3 rounded-lg flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-white uppercase tracking-widest">OSINT Attack Stream</span>
              </div>
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Source: Abuse.ch ThreatFox</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 z-[1000]">
            <div className="bg-black/80 backdrop-blur-md border border-border p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-critical rounded-full" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Attack Source</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Target Node</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
              <Crosshair className="w-4 h-4 text-accent" />
              Active Threats (OSINT)
            </h3>
            <div className="space-y-4">
              {attacks.slice(0, 8).map(attack => (
                <div key={attack.id} className="flex items-center justify-between group border-b border-white/5 pb-2 last:border-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-white">{attack.ip || `ID_${attack.id.slice(0, 6)}`}</p>
                      {attack.country && (
                        <span className="text-[8px] font-mono bg-white/5 px-1 rounded text-zinc-400">
                          {attack.country}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase truncate max-w-[150px]">
                      {attack.type}
                    </p>
                  </div>
                  <Zap className={cn(
                    "w-3 h-3 transition-colors",
                    attack.type.toLowerCase().includes('botnet') ? "text-critical" : "text-accent"
                  )} />
                </div>
              ))}
              {attacks.length === 0 && (
                <div className="py-8 text-center text-zinc-600 text-[10px] font-mono uppercase">
                  Synchronizing with ThreatFox...
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-critical" />
              Global Risk Level
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
                <span>Threat Density</span>
                <span className="text-critical">High</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-critical w-[75%] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
