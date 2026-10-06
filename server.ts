import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { WebSocketServer } from "ws";

import { IoC, Threat, CollabDocument, CollabUser, ChatMessage, CmsItem, RegionalThreatMetric, DnsRecord, PacketRecord, DnsTraceHop } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    const app = express();
    const server = http.createServer(app);
    const PORT = 3000;

  app.use(express.json());

  // CORS and Cache-Control middleware for API endpoints
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    if (req.url.startsWith("/api")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });

  // Mock database of IoCs
  let iocs: IoC[] = [
    {
      id: 'ioc-1',
      value: '45.33.2.1',
      type: 'IP',
      reputation: 'Malicious',
      lastSeen: new Date().toISOString(),
      tags: ['Ransomware', 'C2 Server']
    },
    {
      id: 'ioc-2',
      value: 'hr-portal-secure.com',
      type: 'Domain',
      reputation: 'Suspicious',
      lastSeen: new Date().toISOString(),
      tags: ['Phishing', 'Credential Harvesting']
    },
    {
      id: 'ioc-3',
      value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      type: 'Hash',
      reputation: 'Malicious',
      lastSeen: new Date().toISOString(),
      tags: ['LockBit', 'Trojan']
    }
  ];

  // System Logs and Alerts
  let logs: { id: string; timestamp: string; level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'; message: string; source: string }[] = [];
  let alerts: Threat[] = [];
  let attackMapData: { id: string; source: { lat: number; lng: number }; target: { lat: number; lng: number }; type: string; country?: string }[] = [];
  let isUnderAttack = false;
  const ipCache = new Map<string, { lat: number; lng: number; country: string }>();
  let correlations: { id: string; timestamp: string; title: string; description: string; severity: 'Critical' | 'High' | 'Medium'; relatedIds: string[]; pattern: string }[] = [];
  let networkStats = {
    bandwidth: { inbound: 45.2, outbound: 12.8 },
    packets: { inbound: 12500, outbound: 8400 },
    protocols: [
      { name: 'TCP', value: 65 },
      { name: 'UDP', value: 25 },
      { name: 'ICMP', value: 5 },
      { name: 'Other', value: 5 }
    ],
    topTalkers: [
      { ip: '10.0.0.45', traffic: '1.2 GB', type: 'Internal' },
      { ip: '10.0.0.12', traffic: '850 MB', type: 'Internal' },
      { ip: '45.33.2.1', traffic: '420 MB', type: 'External' },
      { ip: '192.168.1.105', traffic: '310 MB', type: 'Internal' },
      { ip: '8.8.8.8', traffic: '150 MB', type: 'External' }
    ]
  };

  const threatActors = [
    {
      id: 'APT-28',
      name: 'Fancy Bear',
      aliases: ['APT28', 'Pawn Storm', 'Sofacy Group', 'Sednit', 'STRONTIUM'],
      origin: 'Russia',
      targetSectors: ['Government', 'Military', 'Energy', 'Media'],
      motivations: ['Espionage', 'Political Influence'],
      ttps: [
        { id: 'T1566.001', name: 'Spearphishing Attachment', description: 'Sending malicious attachments via email to gain initial access.', mitreUrl: 'https://attack.mitre.org/techniques/T1566/001/' },
        { id: 'T1203', name: 'Exploitation for Client Execution', description: 'Exploiting software vulnerabilities on client systems.', mitreUrl: 'https://attack.mitre.org/techniques/T1203/' },
        { id: 'T1071.001', name: 'Web Protocols', description: 'Using standard web protocols for command and control communication.', mitreUrl: 'https://attack.mitre.org/techniques/T1071/001/' },
        { id: 'T1003', name: 'OS Credential Dumping', description: 'Extracting account credentials from operating systems.', mitreUrl: 'https://attack.mitre.org/techniques/T1003/' }
      ],
      description: 'A highly sophisticated threat actor group linked to the Russian GRU. Known for high-profile attacks on government and political organizations worldwide.',
      lastActive: '2026-03-15'
    },
    {
      id: 'APT-41',
      name: 'Double Dragon',
      aliases: ['APT41', 'BARIUM', 'Winnti Group', 'Wicked Panda'],
      origin: 'China',
      targetSectors: ['Technology', 'Healthcare', 'Gaming', 'Finance'],
      motivations: ['Espionage', 'Financial Gain'],
      ttps: [
        { id: 'T1195.002', name: 'Supply Chain Compromise', description: 'Compromising software updates or distribution channels.', mitreUrl: 'https://attack.mitre.org/techniques/T1195/002/' },
        { id: 'T1553.002', name: 'Code Signing', description: 'Using stolen or fraudulent certificates to sign malicious code.', mitreUrl: 'https://attack.mitre.org/techniques/T1553/002/' },
        { id: 'T1190', name: 'Exploit Public-Facing Application', description: 'Exploiting vulnerabilities in internet-facing software.', mitreUrl: 'https://attack.mitre.org/techniques/T1190/' },
        { id: 'T1505.003', name: 'Web Shell', description: 'Deploying web shells to maintain persistent access to servers.', mitreUrl: 'https://attack.mitre.org/techniques/T1505/003/' }
      ],
      description: 'A prolific Chinese state-sponsored group that conducts both espionage and financially motivated cybercrime. They are known for their technical skill and diverse target set.',
      lastActive: '2026-03-18'
    },
    {
      id: 'LAZARUS',
      name: 'Lazarus Group',
      aliases: ['Hidden Cobra', 'Guardians of Peace', 'Zinc'],
      origin: 'North Korea',
      targetSectors: ['Finance', 'Cryptocurrency', 'Critical Infrastructure', 'Entertainment'],
      motivations: ['Financial Gain', 'Destruction', 'Espionage'],
      ttps: [
        { id: 'T1486', name: 'Data Encrypted for Impact', description: 'Using ransomware or wipers to disrupt operations or extort money.', mitreUrl: 'https://attack.mitre.org/techniques/T1486/' },
        { id: 'T1566.002', name: 'Spearphishing Link', description: 'Sending malicious links via email or social media.', mitreUrl: 'https://attack.mitre.org/techniques/T1566/002/' },
        { id: 'T1059.003', name: 'Windows Command Shell', description: 'Using cmd.exe to execute malicious commands.', mitreUrl: 'https://attack.mitre.org/techniques/T1059/003/' },
        { id: 'T1547.001', name: 'Registry Run Keys / Startup Folder', description: 'Achieving persistence by adding entries to startup locations.', mitreUrl: 'https://attack.mitre.org/techniques/T1547/001/' }
      ],
      description: 'A North Korean state-sponsored group responsible for some of the most destructive and financially significant cyberattacks in history, including the Sony Pictures hack and the WannaCry ransomware attack.',
      lastActive: '2026-03-19'
    }
  ];

  const updateNetworkStats = () => {
    const multiplier = isUnderAttack ? 5 : 1;
    networkStats = {
      ...networkStats,
      bandwidth: {
        inbound: Number((40 + Math.random() * 10 * multiplier).toFixed(1)),
        outbound: Number((10 + Math.random() * 5 * multiplier).toFixed(1))
      },
      packets: {
        inbound: Math.floor((12000 + Math.random() * 2000) * multiplier),
        outbound: Math.floor((8000 + Math.random() * 1000) * multiplier)
      }
    };
  };

  setInterval(updateNetworkStats, 3000);

  const runCorrelationEngine = () => {
    const newCorrelations: typeof correlations = [];
    
    // Pattern 1: IoC Match in Logs
    iocs.forEach(ioc => {
      const matchingLogs = logs.filter(log => log.message.includes(ioc.value));
      if (matchingLogs.length > 0) {
        newCorrelations.push({
          id: `COR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          title: 'Known Malicious Indicator Detected',
          description: `Indicator ${ioc.value} (${ioc.tags.join(', ')}) was detected in system logs from ${matchingLogs[0].source}.`,
          severity: ioc.reputation === 'Malicious' ? 'Critical' : 'High',
          relatedIds: matchingLogs.map(l => l.id),
          pattern: 'IOC_MATCH'
        });
      }
    });

    // Pattern 2: Brute Force Attempt
    const authLogs = logs.filter(l => l.source === 'AuthService' && l.message.toLowerCase().includes('failed'));
    if (authLogs.length > 5) {
      newCorrelations.push({
        id: `COR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        title: 'Brute Force Pattern Identified',
        description: `Detected ${authLogs.length} failed login attempts within a short window. Possible automated credential stuffing.`,
        severity: 'High',
        relatedIds: authLogs.map(l => l.id),
        pattern: 'BRUTE_FORCE'
      });
    }

    // Pattern 3: Anomalous Data Access
    const dbLogs = logs.filter(l => l.source === 'DBProxy' && l.message.includes('executed'));
    const edgeLogs = logs.filter(l => l.source === 'EdgeFirewall' && l.message.includes('Connection established'));
    if (dbLogs.length > 10 && edgeLogs.length > 0) {
      newCorrelations.push({
        id: `COR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        title: 'Potential Data Exfiltration',
        description: 'High frequency of database queries followed by external network connections detected.',
        severity: 'Critical',
        relatedIds: [...dbLogs.map(l => l.id), ...edgeLogs.map(l => l.id)],
        pattern: 'DATA_EXFIL'
      });
    }

    correlations = [...newCorrelations, ...correlations].slice(0, 20);
  };

  setInterval(runCorrelationEngine, 5000);

  const fetchURLHausData = async () => {
    try {
      const response = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/');
      if (!response.ok) {
        console.warn(`URLHaus API returned ${response.status}`);
        return;
      }
      const data = await response.json();

      if (data.query_status === 'ok' && data.urls) {
        const newIocs: IoC[] = data.urls.slice(0, 10).map((url: any) => ({
          id: `urlhaus-${url.id}`,
          value: url.url,
          type: 'URL',
          reputation: 'Malicious',
          lastSeen: new Date().toISOString(),
          tags: url.tags || ['Malware'],
          source: 'URLHaus'
        }));
        const existingIocIds = new Set(newIocs.map(i => i.id));
        iocs = [...newIocs, ...iocs.filter(i => !existingIocIds.has(i.id))].slice(0, 50);

        const newAlerts = data.urls.slice(0, 3).map((url: any) => ({
          id: `URLH-${url.id}`,
          timestamp: new Date().toISOString(),
          severity: 'High' as const,
          message: `Malicious URL detected: ${url.url_status}`,
          type: 'Malware URL',
          source: 'URLHaus'
        }));
        
        const existingAlertIds = new Set(newAlerts.map(a => a.id));
        alerts = [...newAlerts, ...alerts.filter(a => !existingAlertIds.has(a.id))].slice(0, 100);
      }
    } catch (error) {
      console.error('Error fetching URLHaus data:', error);
    }
  };

  const fetchFeodoTrackerData = async () => {
    try {
      const response = await fetch('https://feodotracker.abuse.ch/downloads/ipblocklist.json');
      if (!response.ok) {
        console.warn(`Feodo Tracker API returned ${response.status}`);
        return;
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        const newIocs: IoC[] = data.slice(0, 10).map((item: any) => ({
          id: `feodo-${item.ip_address}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          value: item.ip_address,
          type: 'IP',
          reputation: 'Malicious',
          lastSeen: new Date().toISOString(),
          tags: [item.malware || 'Feodo'],
          source: 'Feodo Tracker'
        }));
        const existingIocIds = new Set(newIocs.map(i => i.id));
        iocs = [...newIocs, ...iocs.filter(i => !existingIocIds.has(i.id))].slice(0, 50);

        const newAlerts = data.slice(0, 2).map((item: any, index: number) => ({
          id: `FEODO-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          severity: 'Critical' as const,
          message: `Feodo C2 IP detected: ${item.ip_address}`,
          type: 'C2 Server',
          source: 'Feodo Tracker'
        }));
        
        const existingAlertIds = new Set(newAlerts.map(a => a.id));
        alerts = [...newAlerts, ...alerts.filter(a => !existingAlertIds.has(a.id))].slice(0, 100);
      }
    } catch (error) {
      console.error('Error fetching Feodo Tracker data:', error);
    }
  };

  const fetchMISPData = async () => {
    try {
      // Fetching from a public MISP feed (CIRCL)
      const manifestRes = await fetch('https://misp.circl.lu/feeds/circl/manifest.json');
      if (!manifestRes.ok) {
        console.warn(`MISP Manifest API returned ${manifestRes.status}`);
        return;
      }
      const manifest = await manifestRes.json();
      
      const eventIds = Object.keys(manifest).slice(0, 3);
      const newIocs: any[] = [];
      const newAlerts: any[] = [];

      for (const id of eventIds) {
        try {
          const eventRes = await fetch(`https://misp.circl.lu/feeds/circl/${id}.json`);
          if (!eventRes.ok) continue;
          const eventData = await eventRes.json();
          
          if (eventData.Event) {
            const event = eventData.Event;
            const newAlert: Threat = {
              id: `MISP-${event.id}`,
              timestamp: new Date().toISOString(),
              severity: event.threat_level_id === '1' ? 'Critical' as const : 'High' as const,
              message: `MISP Event: ${event.info}`,
              type: 'MISP Event',
              source: 'CIRCL MISP'
            };
            
            if (!alerts.some(a => a.id === newAlert.id)) {
              alerts = [newAlert, ...alerts].slice(0, 100);
            }

            if (event.Attribute) {
              event.Attribute.slice(0, 5).forEach((attr: any) => {
                if (['ip-src', 'ip-dst', 'domain', 'hostname', 'md5', 'sha1', 'sha256'].includes(attr.type)) {
                  const newIocEntry: IoC = {
                    id: `misp-${attr.id}`,
                    value: attr.value,
                    type: attr.type.includes('ip') ? 'IP' : attr.type.includes('domain') || attr.type.includes('hostname') ? 'Domain' : 'Hash',
                    reputation: 'Malicious',
                    lastSeen: new Date().toISOString(),
                    tags: [attr.category],
                    source: 'CIRCL MISP'
                  };
                  
                  if (!iocs.some(i => i.id === newIocEntry.id)) {
                    iocs = [newIocEntry, ...iocs].slice(0, 50);
                  }
                }
              });
            }
          }
        } catch (e) {
          console.error(`Error fetching MISP event ${id}:`, e);
        }
      }

      iocs = [...newIocs, ...iocs].slice(0, 50);
      alerts = [...newAlerts, ...alerts].slice(0, 100);
    } catch (error) {
      console.error('Error fetching MISP data:', error);
    }
  };

  const fetchRealThreatData = async () => {
    try {
      // Fetch from multiple sources
      await Promise.all([
        fetchURLHausData(),
        fetchFeodoTrackerData(),
        fetchMISPData(),
        (async () => {
          try {
            // Fetch recent IoCs from ThreatFox (Abuse.ch)
            const response = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
              method: 'POST',
              body: JSON.stringify({ query: 'get_recent', days: 1 })
            });
            if (!response.ok) {
              console.warn(`ThreatFox API returned ${response.status}`);
              return;
            }
            const data = await response.json();

            if (data.query_status === 'ok' && data.data) {
              const recentIoCs = data.data.slice(0, 10);
              const newAttacks = [];

              for (const ioc of recentIoCs) {
                // Add to global IoCs
                  const newIocEntry: IoC = {
                    id: `tf-${ioc.id}`,
                    value: ioc.ioc.split(':')[0],
                    type: ioc.ioc_type === 'ip:port' ? 'IP' : ioc.ioc_type === 'domain' ? 'Domain' : 'Hash',
                    reputation: 'Malicious',
                    lastSeen: new Date().toISOString(),
                    tags: [ioc.threat_type_desc],
                    source: 'ThreatFox'
                  };
                  
                  if (!iocs.some(i => i.id === newIocEntry.id)) {
                    iocs = [newIocEntry, ...iocs].slice(0, 50);
                  }

                // Only process IPs or domains we can resolve/geolocate
                if (ioc.ioc_type === 'ip:port' || ioc.ioc_type === 'domain') {
                  const targetIp = ioc.ioc.split(':')[0];
                  
                  let geo = ipCache.get(targetIp);
                  if (!geo) {
                    try {
                      // Geolocate using ip-api.com (Free for non-commercial)
                      // Note: HTTPS is available for Pro users, but we'll try it as many free APIs have upgraded.
                      // If it fails, response.ok will be false and we'll catch it.
                      const geoRes = await fetch(`https://ip-api.com/json/${targetIp}?fields=status,lat,lon,country`);
                      if (geoRes.ok) {
                        const contentType = geoRes.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                          const geoData = await geoRes.json();
                          if (geoData.status === 'success') {
                            geo = { lat: geoData.lat, lng: geoData.lon, country: geoData.country };
                            ipCache.set(targetIp, geo);
                          }
                        } else {
                          console.warn(`Geolocation API returned non-JSON response for ${targetIp}`);
                        }
                      } else {
                        console.warn(`Geolocation API returned ${geoRes.status} for ${targetIp}`);
                      }
                    } catch (e) {
                      console.error(`Error geolocating IP ${targetIp}:`, e);
                    }
                  }

                  if (geo) {
                    newAttacks.push({
                      id: ioc.id,
                      ip: targetIp,
                      source: { lat: geo.lat, lng: geo.lng },
                      target: {
                        lat: 37.7749 + (Math.random() * 4 - 2), // US Target for visualization
                        lng: -122.4194 + (Math.random() * 4 - 2)
                      },
                      type: ioc.threat_type_desc || 'Malware',
                      country: geo.country
                    });
                  }
                }
              }

              if (newAttacks.length > 0) {
                const existingAttackIds = new Set(attackMapData.map(a => a.id));
                const uniqueNewAttacks = newAttacks.filter(a => !existingAttackIds.has(a.id));
                attackMapData = [...uniqueNewAttacks, ...attackMapData].slice(0, 20);
              }
            }
          } catch (e) {
            console.error('Error in ThreatFox fetch:', e);
          }
        })()
      ]);
    } catch (error) {
      console.error('Error fetching real threat data:', error);
      // Fallback to mock data if API fails
      generateMockAttack();
    }
  };

  const generateMockAttack = () => {
    const newAttack = {
      id: Math.random().toString(36).substr(2, 9),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      source: {
        lat: (Math.random() * 140) - 70,
        lng: (Math.random() * 360) - 180
      },
      target: {
        lat: 37.7749 + (Math.random() * 10 - 5),
        lng: -122.4194 + (Math.random() * 10 - 5)
      },
      type: ['DDoS', 'Malware', 'Phishing', 'Exploit'][Math.floor(Math.random() * 4)]
    };
    attackMapData = [newAttack, ...attackMapData.slice(0, 14)];
  };

  // Initial fetch and periodic updates
  fetchRealThreatData();
  setInterval(fetchRealThreatData, 60000); // Update every minute to respect rate limits

  const generateLog = () => {
    const levels: ('INFO' | 'WARN' | 'ERROR' | 'CRITICAL')[] = ['INFO', 'INFO', 'INFO', 'WARN', 'INFO'];
    const sources = ['AuthService', 'EdgeFirewall', 'DBProxy', 'APIGateway', 'Kernel'];
    const messages = [
      'User login successful',
      'Connection established from 10.0.0.45',
      'Database query executed in 12ms',
      'Heartbeat signal received',
      'Resource allocation optimized'
    ];

    if (isUnderAttack) {
      levels.push('ERROR', 'CRITICAL');
      messages.push('Multiple failed login attempts detected', 'Unauthorized access attempt blocked', 'High volumetric traffic on port 80');
    }

    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    };

    logs = [newLog, ...logs.slice(0, 99)];

    // Attack Detection Logic
    const recentCriticalLogs = logs.filter(l => (l.level === 'CRITICAL' || l.level === 'ERROR') && 
      (new Date().getTime() - new Date(l.timestamp).getTime() < 30000));
    
    // Random chance to start an attack if not already under one
    if (!isUnderAttack && Math.random() > 0.95) {
      isUnderAttack = true;
      const newAlert = {
        id: `AL-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        severity: 'Critical' as const,
        message: 'SYSTEM UNDER ATTACK: Automated intrusion attempt detected',
        type: 'Intrusion'
      };
      alerts = [newAlert, ...alerts];
    }

    // Generate random High/Medium alerts more frequently
    if (Math.random() > 0.85) {
      const types = ['Phishing', 'Malware', 'Policy Violation', 'Anomalous Traffic'];
      const type = types[Math.floor(Math.random() * types.length)];
      const newAlert = {
        id: `AL-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        severity: (Math.random() > 0.5 ? 'High' : 'Medium') as any,
        message: `Security Event: ${type} detected on endpoint ${Math.floor(Math.random() * 255)}`,
        type
      };
      alerts = [newAlert, ...alerts.slice(0, 49)];
    }

    if (recentCriticalLogs.length > 3 && !isUnderAttack) {
      isUnderAttack = true;
      const newAlert = {
        id: `AL-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        severity: 'Critical' as const,
        message: 'SYSTEM UNDER ATTACK: Brute force / DDoS pattern detected',
        type: 'Intrusion'
      };
      alerts = [newAlert, ...alerts];
    } else if (recentCriticalLogs.length === 0 && isUnderAttack && Math.random() > 0.7) {
      isUnderAttack = false;
    }
  };

  setInterval(generateLog, 2000);

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/iocs", (req, res) => {
    res.json(iocs);
  });

  app.get("/api/logs", (req, res) => {
    res.json(logs);
  });

  app.get("/api/status", (req, res) => {
    res.json({ isUnderAttack, alertCount: alerts.length, latestAlert: alerts[0] || null });
  });

  app.get("/api/alerts", (req, res) => {
    res.json(alerts);
  });

  app.get("/api/attack-map", (req, res) => {
    res.json(attackMapData);
  });

  app.get("/api/correlations", (req, res) => {
    res.json(correlations);
  });

  app.get("/api/network-stats", (req, res) => {
    res.json(networkStats);
  });

  app.get("/api/threat-actors", (req, res) => {
    res.json(threatActors);
  });

  // --- REGIONAL THREAT DENSITY & CORRELATION LOGIC ---
  const getRegionFromCoordinates = (lat: number, lng: number, country?: string): string => {
    if (country) {
      const c = country.toLowerCase();
      if (c.includes('united states') || c.includes('canada') || c.includes('mexico') || c.includes('usa')) return 'North America';
      if (c.includes('china') || c.includes('japan') || c.includes('korea') || c.includes('india') || c.includes('australia') || c.includes('singapore') || c.includes('taiwan')) return 'Asia-Pacific';
      if (c.includes('germany') || c.includes('france') || c.includes('russia') || c.includes('united kingdom') || c.includes('netherlands') || c.includes('ukraine') || c.includes('italy')) return 'Europe';
      if (c.includes('brazil') || c.includes('argentina') || c.includes('colombia') || c.includes('chile')) return 'Latin America';
      if (c.includes('iran') || c.includes('saudi') || c.includes('israel') || c.includes('egypt') || c.includes('south africa') || c.includes('uae')) return 'Middle East & Africa';
    }
    if (lat >= 15 && lat <= 72 && lng >= -168 && lng <= -50) return 'North America';
    if (lat >= 35 && lat <= 72 && lng >= -25 && lng <= 45) return 'Europe';
    if (lat >= -12 && lat <= 65 && lng >= 60 && lng <= 180) return 'Asia-Pacific';
    if (lat >= -60 && lat <= 15 && lng >= -120 && lng <= -35) return 'Latin America';
    if (lat >= -35 && lat <= 40 && lng >= -20 && lng <= 60) return 'Middle East & Africa';
    return 'Europe';
  };

  const computeRegionalThreatMetrics = (): RegionalThreatMetric[] => {
    const regionDefinitions = [
      { name: 'North America', code: 'NA', baseLatency: 28, topOrigin: 'US', defaultSector: 'Financial Services' },
      { name: 'Europe', code: 'EU', baseLatency: 34, topOrigin: 'DE / RU', defaultSector: 'Energy & Critical Infra' },
      { name: 'Asia-Pacific', code: 'APAC', baseLatency: 79, topOrigin: 'CN / KR', defaultSector: 'Semiconductors & Tech' },
      { name: 'Latin America', code: 'LATAM', baseLatency: 105, topOrigin: 'BR', defaultSector: 'Government & Telecom' },
      { name: 'Middle East & Africa', code: 'MEA', baseLatency: 92, topOrigin: 'IR / AE', defaultSector: 'Defense & Aerospace' }
    ];

    const counts: Record<string, { count: number; ids: string[]; vectors: { ddos: number; malware: number; botnet: number; exploit: number; phishing: number } }> = {};
    regionDefinitions.forEach(r => {
      counts[r.name] = { count: 0, ids: [], vectors: { ddos: 0, malware: 0, botnet: 0, exploit: 0, phishing: 0 } };
    });

    attackMapData.forEach(atk => {
      const reg = getRegionFromCoordinates(atk.source.lat, atk.source.lng, atk.country);
      if (!counts[reg]) {
        counts[reg] = { count: 0, ids: [], vectors: { ddos: 0, malware: 0, botnet: 0, exploit: 0, phishing: 0 } };
      }
      counts[reg].count++;
      counts[reg].ids.push(atk.id);
      const t = (atk.type || '').toLowerCase();
      if (t.includes('ddos') || t.includes('syn')) counts[reg].vectors.ddos++;
      else if (t.includes('botnet') || t.includes('feodo') || t.includes('c2')) counts[reg].vectors.botnet++;
      else if (t.includes('exploit') || t.includes('zero-day')) counts[reg].vectors.exploit++;
      else if (t.includes('phishing') || t.includes('credential')) counts[reg].vectors.phishing++;
      else counts[reg].vectors.malware++;
    });

    const totalRaw = Object.values(counts).reduce((acc, c) => acc + c.count, 0) || 1;

    return regionDefinitions.map(r => {
      const data = counts[r.name] || { count: 0, ids: [], vectors: { ddos: 0, malware: 0, botnet: 0, exploit: 0, phishing: 0 } };
      const simulatedExtra = isUnderAttack ? Math.floor(Math.random() * 8) + 6 : Math.floor(Math.random() * 4) + 2;
      const activeAttacks = data.count + simulatedExtra;
      const threatDensity = Math.min(100, Math.round((activeAttacks / (totalRaw + simulatedExtra * 5)) * 100));
      const anomalyScore = Math.min(99, Math.max(12, Math.round(
        (activeAttacks * 5) + (isUnderAttack ? 35 : 12) + (data.vectors.exploit * 6) + (data.vectors.ddos * 4)
      )));

      return {
        region: r.name,
        regionCode: r.code,
        activeAttacks,
        threatDensity,
        anomalyScore,
        avgLatency: r.baseLatency + Math.floor(Math.random() * 10),
        vectorBreakdown: {
          ddos: data.vectors.ddos + 2,
          malware: data.vectors.malware + 5,
          botnet: data.vectors.botnet + 3,
          exploit: data.vectors.exploit + 2,
          phishing: data.vectors.phishing + 2
        },
        topOriginCountry: r.topOrigin,
        topTargetSector: r.defaultSector,
        correlatedAttackCount: data.ids.length,
        activeThreatIds: data.ids
      };
    });
  };

  // --- CENTRAL NETWORK TRACKING & PACKET INSPECTOR STORE ---
  let nextFrameNumber = 1045;
  let dnsRecords: DnsRecord[] = [
    {
      id: "dns-1",
      timestamp: new Date(Date.now() - 4000).toISOString(),
      query: "api.threatfox.abuse.ch",
      recordType: "A",
      clientIp: "10.0.0.45",
      clientPort: 52188,
      browserContext: "Chrome 124 (Fetch Client / Sentinel UI)",
      resolver: "1.1.1.1 (Cloudflare DoH)",
      resolvedIps: ["185.220.101.44"],
      ttl: 300,
      responseCode: "NOERROR",
      responseTimeMs: 24,
      dnssec: "Secure",
      threatLevel: "Safe",
      hops: [
        { hopNumber: 1, stage: "Browser Socket", server: "Localhost Web Engine", serverIp: "127.0.0.1", latencyMs: 1, status: "FORWARD", details: "Socket opened via DoH query pipeline" },
        { hopNumber: 2, stage: "OS Stub Resolver", server: "systemd-resolved", serverIp: "127.0.0.53", latencyMs: 2, status: "FORWARD", details: "Local stub cache miss" },
        { hopNumber: 3, stage: "Gateway Resolver", server: "Edge Security Gateway", serverIp: "10.0.0.1", latencyMs: 4, status: "FORWARD", details: "Inspected against local corporate DNS policy" },
        { hopNumber: 4, stage: "Root Nameserver", server: "a.root-servers.net", serverIp: "198.41.0.4", latencyMs: 14, status: "FORWARD", details: "Delegated to .ch TLD registry" },
        { hopNumber: 5, stage: "TLD Nameserver", server: "a.nic.ch", serverIp: "130.59.31.29", latencyMs: 19, status: "FORWARD", details: "Delegated to authoritative Cloudflare DNS" },
        { hopNumber: 6, stage: "Authoritative NS", server: "ns1.cloudflare.com", serverIp: "173.245.58.51", latencyMs: 24, status: "RESOLVED", details: "Answer: 185.220.101.44 with valid RRSIG" }
      ]
    },
    {
      id: "dns-2",
      timestamp: new Date(Date.now() - 8000).toISOString(),
      query: "hr-portal-secure.com",
      recordType: "A",
      clientIp: "10.0.0.12",
      clientPort: 48992,
      browserContext: "Chrome 124 (Browser Navigation)",
      resolver: "8.8.8.8 (Google Public DNS)",
      resolvedIps: ["45.33.2.1"],
      ttl: 60,
      responseCode: "NOERROR",
      responseTimeMs: 38,
      dnssec: "Insecure",
      threatLevel: "Malicious",
      threatReason: "Identified in CIRCL MISP and IoC blocklist as active phishing / credential harvester infrastructure",
      hops: [
        { hopNumber: 1, stage: "Browser Socket", server: "User Agent", serverIp: "127.0.0.1", latencyMs: 1, status: "FORWARD", details: "New tab address bar request" },
        { hopNumber: 2, stage: "OS Stub Resolver", server: "systemd-resolved", serverIp: "127.0.0.53", latencyMs: 2, status: "FORWARD", details: "Cache miss" },
        { hopNumber: 3, stage: "Gateway Resolver", server: "Edge Security Gateway", serverIp: "10.0.0.1", latencyMs: 5, status: "FORWARD", details: "DNS firewall alarm triggered (Threat: IOC Match)" },
        { hopNumber: 4, stage: "Root Nameserver", server: "k.root-servers.net", serverIp: "193.0.14.129", latencyMs: 18, status: "FORWARD", details: "Referral to .com TLD" },
        { hopNumber: 5, stage: "TLD Nameserver", server: "a.gtld-servers.net", serverIp: "192.5.6.30", latencyMs: 27, status: "FORWARD", details: "Delegated to bulletproof authoritative host" },
        { hopNumber: 6, stage: "Authoritative NS", server: "ns-fastflux.biz", serverIp: "45.33.2.1", latencyMs: 38, status: "BLOCKED", details: "Resolved IP: 45.33.2.1 sinkholed / quarantined" }
      ]
    },
    {
      id: "dns-3",
      timestamp: new Date(Date.now() - 12000).toISOString(),
      query: "v1-beacon.update-synctool.top",
      recordType: "TXT",
      clientIp: "192.168.1.105",
      clientPort: 60124,
      browserContext: "Edge (Background Sync / Service Worker)",
      resolver: "1.1.1.1 (Cloudflare DoH)",
      resolvedIps: [],
      ttl: 15,
      responseCode: "NOERROR",
      responseTimeMs: 52,
      dnssec: "Bogus",
      threatLevel: "Malicious",
      threatReason: "DNS Tunneling Detected: base64 payload in TXT record exceeds entropy threshold (5.24 bits/char)",
      hops: [
        { hopNumber: 1, stage: "Browser Socket", server: "Background Worker", serverIp: "127.0.0.1", latencyMs: 1, status: "FORWARD", details: "Asynchronous poll" },
        { hopNumber: 2, stage: "OS Stub Resolver", server: "systemd-resolved", serverIp: "127.0.0.53", latencyMs: 3, status: "FORWARD", details: "Query: TXT record" },
        { hopNumber: 3, stage: "Gateway Resolver", server: "Edge Security Gateway", serverIp: "10.0.0.1", latencyMs: 6, status: "FORWARD", details: "Inspection flag: TXT record with high entropy" },
        { hopNumber: 4, stage: "Root Nameserver", server: "j.root-servers.net", serverIp: "192.58.128.30", latencyMs: 22, status: "FORWARD", details: "Referral to .top TLD" },
        { hopNumber: 5, stage: "TLD Nameserver", server: "a.nic.top", serverIp: "156.154.100.3", latencyMs: 36, status: "FORWARD", details: "Authoritative delegation" },
        { hopNumber: 6, stage: "Authoritative NS", server: "ns1.c2-stealth.top", serverIp: "185.190.140.22", latencyMs: 52, status: "BLOCKED", details: "TXT payload returned: 'token=eyJhbGciOi...'" }
      ]
    },
    {
      id: "dns-4",
      timestamp: new Date(Date.now() - 16000).toISOString(),
      query: "gateway.internal-corp.net",
      recordType: "A",
      clientIp: "10.0.0.45",
      clientPort: 54312,
      browserContext: "Firefox 125 (REST API Client)",
      resolver: "10.0.0.1 (Internal Domain Controller)",
      resolvedIps: ["10.0.0.1", "10.0.0.2"],
      ttl: 3600,
      responseCode: "NOERROR",
      responseTimeMs: 3,
      dnssec: "Secure",
      threatLevel: "Safe",
      hops: [
        { hopNumber: 1, stage: "Browser Socket", server: "Firefox Engine", serverIp: "127.0.0.1", latencyMs: 1, status: "FORWARD", details: "Internal API call" },
        { hopNumber: 2, stage: "OS Stub Resolver", server: "systemd-resolved", serverIp: "127.0.0.53", latencyMs: 1, status: "FORWARD", details: "Forwarding to internal DC" },
        { hopNumber: 3, stage: "Gateway Resolver", server: "Active Directory DNS", serverIp: "10.0.0.1", latencyMs: 3, status: "HIT", details: "Authoritative internal zone record resolved" }
      ]
    }
  ];

  let packetRecords: PacketRecord[] = [
    {
      frameNumber: 1041,
      timestamp: new Date(Date.now() - 3200).toISOString(),
      interfaceName: "eth0 (WAN Gateway)",
      length: 82,
      sourceMac: "00:1a:2b:3c:4d:5e",
      destMac: "00:50:56:c0:00:08",
      sourceIp: "10.0.0.45",
      sourcePort: 52188,
      destIp: "1.1.1.1",
      destPort: 53,
      protocol: "DNS",
      ttl: 64,
      summary: "Standard query 0x7a12 A api.threatfox.abuse.ch",
      payloadHex: "0000  00 50 56 c0 00 08 00 1a 2b 3c 4d 5e 08 00 45 00  .PV.....+<M^..E.\n0010  00 44 2f 14 40 00 40 11 b6 8c 0a 00 00 2d 01 01  .D/.@.@......-..\n0020  01 01 cb dc 00 35 00 30 18 a2 7a 12 01 00 00 01  .....5.0..z.....\n0030  00 00 00 00 00 00 03 61 70 69 09 74 68 72 65 61  .......api.threa\n0040  74 66 6f 78 05 61 62 75 73 65 02 63 68 00 00 01  tfox.abuse.ch...\n0050  00 01                                            ..",
      payloadAscii: ".PV.....+<M^..E..D/.@.@......-.......5.0..z............api.threatfox.abuse.ch.....",
      deepPacketInspection: {
        verdict: "Benign",
        entropy: 3.42,
        applicationLayerProto: "DNS Query (UDP/53)"
      }
    },
    {
      frameNumber: 1042,
      timestamp: new Date(Date.now() - 2500).toISOString(),
      interfaceName: "eth0 (WAN Gateway)",
      length: 60,
      sourceMac: "00:11:22:33:44:55",
      destMac: "00:50:56:c0:00:08",
      sourceIp: "45.33.2.1",
      sourcePort: 44912,
      destIp: "10.0.0.12",
      destPort: 80,
      protocol: "TCP",
      flags: { syn: true, ack: false, fin: false, rst: false, psh: false, urg: false },
      seqNumber: 382910294,
      ackNumber: 0,
      windowSize: 1024,
      ttl: 48,
      summary: "TCP [SYN] Seq=382910294 Win=1024 Len=0",
      payloadHex: "0000  00 50 56 c0 00 08 00 11 22 33 44 55 08 00 45 00  .PV.....\"3DU..E.\n0010  00 28 a1 40 40 00 30 06 c9 31 2d 21 02 01 0a 00  .(@..0..1-!.....\n0020  00 0c af 70 00 50 16 d2 ec 96 00 00 00 00 50 02  ...p.P........P.\n0030  04 00 bb 24 00 00                                ..$...          ",
      payloadAscii: ".PV.....\"3DU..E..(@..0..1-!........p.P........P...$...",
      deepPacketInspection: {
        verdict: "Alert",
        ruleTriggered: "SURICATA SCAN Port 80 rapid probe from known Malicious Feodo C2 IP",
        entropy: 2.15,
        applicationLayerProto: "TCP Handshake (SYN)"
      }
    },
    {
      frameNumber: 1043,
      timestamp: new Date(Date.now() - 1800).toISOString(),
      interfaceName: "eth0 (WAN Gateway)",
      length: 1420,
      sourceMac: "00:50:56:c0:00:08",
      destMac: "00:1a:2b:3c:4d:5e",
      sourceIp: "104.16.132.229",
      sourcePort: 443,
      destIp: "10.0.0.45",
      destPort: 51990,
      protocol: "TLS/HTTPS",
      flags: { syn: false, ack: true, fin: false, rst: false, psh: true, urg: false },
      seqNumber: 8192831,
      ackNumber: 991823,
      windowSize: 65535,
      ttl: 57,
      summary: "TLSv1.3 Application Data (Encrypted Transport)",
      payloadHex: "0000  00 1a 2b 3c 4d 5e 00 50 56 c0 00 08 08 00 45 00  ..+<M^.PV.....E.\n0010  05 8c b2 91 40 00 39 06 cd 12 68 10 84 e5 0a 00  ....@.9...h.....\n0020  00 2d 01 bb cb 16 00 7d 06 ff 00 0f 23 a1 80 18  .-.....}....#...\n0030  ff ff 91 2b 00 00 01 01 08 0a 24 ab cd 12 12 34  ...+......$....4\n0040  17 03 03 05 35 a8 d9 21 b3 e4 10 99 ff 28 41 cc  ....5..!.....(A.",
      payloadAscii: "..+<M^.PV.....E.....@.9...h......-.....}....#......+......$....4....5..!.....(A.",
      deepPacketInspection: {
        verdict: "Benign",
        entropy: 7.94,
        applicationLayerProto: "TLS 1.3 / AES-256-GCM",
        ciphersuite: "TLS_AES_256_GCM_SHA384"
      }
    },
    {
      frameNumber: 1044,
      timestamp: new Date(Date.now() - 900).toISOString(),
      interfaceName: "eth0 (WAN Gateway)",
      length: 168,
      sourceMac: "00:1a:2b:3c:4d:5e",
      destMac: "00:50:56:c0:00:08",
      sourceIp: "192.168.1.105",
      sourcePort: 60124,
      destIp: "185.190.140.22",
      destPort: 53,
      protocol: "DNS",
      ttl: 64,
      summary: "Standard query TXT v1-beacon.update-synctool.top (Suspicious Exfil)",
      payloadHex: "0000  00 50 56 c0 00 08 00 1a 2b 3c 4d 5e 08 00 45 00  .PV.....+<M^..E.\n0010  00 9a cd 44 40 00 40 11 31 1f c0 a8 01 69 b9 be  ...D@.@.1....i..\n0020  8c 16 ea ec 00 35 00 86 ab c1 99 2f 01 00 00 01  .....5...../....\n0030  00 00 00 00 00 00 09 76 31 2d 62 65 61 63 6f 6e  .......v1-beacon\n0040  0f 75 70 64 61 74 65 2d 73 79 6e 63 74 6f 6f 6c  .update-synctool\n0050  03 74 6f 70 00 00 10 00 01                      .top.....       ",
      payloadAscii: ".PV.....+<M^..E...D@.@.1....i.......5...../...........v1-beacon.update-synctool.top.....",
      deepPacketInspection: {
        verdict: "Alert",
        ruleTriggered: "ET MALWARE Potential DNS Tunneling / Covert Channel Data Exfiltration",
        entropy: 5.34,
        applicationLayerProto: "DNS TXT Query (UDP/53)"
      }
    }
  ];

  // Helper to trace any domain live
  const traceDomainQuery = (domain: string, recordType: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' = 'A', clientIp = '10.0.0.45'): DnsRecord => {
    const isThreat = domain.includes('c2') || domain.includes('malware') || domain.includes('feodo') || 
                     domain.includes('synctool') || domain.includes('beacon') || domain.includes('portal-secure') ||
                     domain.includes('darknet') || domain.includes('top');
    
    const isInternal = domain.includes('local') || domain.includes('internal') || domain.includes('corp');
    
    const resolvedIps = isThreat 
      ? ['45.33.2.1', '185.190.140.22'] 
      : isInternal 
        ? ['10.0.0.1'] 
        : [`${Math.floor(Math.random() * 150) + 20}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`];

    const hops: DnsTraceHop[] = [
      {
        hopNumber: 1,
        stage: "Browser Socket",
        server: "Browser Host Network Stack",
        serverIp: "127.0.0.1",
        latencyMs: 1,
        status: "FORWARD",
        details: `Browser client initiating DNS resolution request for domain ${domain} via getaddrinfo()`
      },
      {
        hopNumber: 2,
        stage: "OS Stub Resolver",
        server: "Localhost Stub (systemd-resolved)",
        serverIp: "127.0.0.53",
        latencyMs: 2,
        status: "FORWARD",
        details: "Checked local OS nscd / DNS cache. No non-expired TTL found, forwarding to upstream."
      },
      {
        hopNumber: 3,
        stage: "Gateway Resolver",
        server: "Security Gateway & DNS Firewall",
        serverIp: isInternal ? "10.0.0.1" : "192.168.1.1",
        latencyMs: 5,
        status: isThreat ? "BLOCKED" : "FORWARD",
        details: isThreat 
          ? `IoC Detection Triggered: ${domain} matches blacklist database. Quarantine route engaged.` 
          : "Corporate security inspection passed. Recursive forwarding initiated."
      },
      {
        hopNumber: 4,
        stage: "Root Nameserver",
        server: "a.root-servers.net",
        serverIp: "198.41.0.4",
        latencyMs: 16,
        status: "FORWARD",
        details: `Queried Root zone for TLD delegation (.${domain.split('.').pop() || 'com'})`
      },
      {
        hopNumber: 5,
        stage: "TLD Nameserver",
        server: `tld-ns.${domain.split('.').pop() || 'com'}.gtld`,
        serverIp: "192.5.6.30",
        latencyMs: 28,
        status: "FORWARD",
        details: `TLD Registry responded with Authoritative Nameserver referrals and glue records.`
      },
      {
        hopNumber: 6,
        stage: "Authoritative NS",
        server: isThreat ? "ns-bulletproof.c2host.ru" : "ns1.cloudflare.com",
        serverIp: isThreat ? "185.190.140.22" : "173.245.58.51",
        latencyMs: isThreat ? 44 : 32,
        status: isThreat ? "NXDOMAIN" : "RESOLVED",
        details: isThreat 
          ? `Returned suspicious fast-flux target. Heuristic rating: High Risk.` 
          : `Authoritative answer returned with TTL 300s. RRSIG signed validly.`
      }
    ];

    const newRecord: DnsRecord = {
      id: `dns-trace-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      query: domain,
      recordType,
      clientIp,
      clientPort: Math.floor(Math.random() * 20000) + 40000,
      browserContext: "Sentinel Network Probe / Browser Engine",
      resolver: isThreat ? "1.1.1.1 (Security Shielded)" : "8.8.8.8 (Google Public)",
      resolvedIps,
      ttl: isThreat ? 30 : 300,
      responseCode: isThreat ? "NXDOMAIN" : "NOERROR",
      responseTimeMs: hops.reduce((acc, h) => acc + h.latencyMs, 0),
      dnssec: isThreat ? "Bogus" : "Secure",
      threatLevel: isThreat ? "Malicious" : "Safe",
      threatReason: isThreat ? `Correlated with adversary TTPs: High risk domain signature detected` : undefined,
      hops
    };

    dnsRecords = [newRecord, ...dnsRecords.slice(0, 49)];
    return newRecord;
  };

  // Periodic network packet and DNS activity generator
  setInterval(() => {
    nextFrameNumber++;
    const protocols: ('DNS' | 'TCP' | 'UDP' | 'TLS/HTTPS' | 'HTTP')[] = ['TLS/HTTPS', 'DNS', 'TCP', 'UDP', 'HTTP'];
    const selectedProto = protocols[Math.floor(Math.random() * protocols.length)];
    const isAlert = isUnderAttack && Math.random() > 0.4;

    const sampleDomains = [
      'api.sentinel-intel.org', 'cdn.jsdelivr.net', 'github.com', 
      'analytics.azure.com', 'internal-db.corp.net', 'metrics.prometheus.io',
      'c2-beacon.dyn-update.top', 'exfil-vault.biz'
    ];
    const pickedDomain = sampleDomains[Math.floor(Math.random() * sampleDomains.length)];

    const newPacket: PacketRecord = {
      frameNumber: nextFrameNumber,
      timestamp: new Date().toISOString(),
      interfaceName: "eth0 (WAN Gateway)",
      length: Math.floor(Math.random() * 1200) + 64,
      sourceMac: "00:1a:2b:3c:4d:5e",
      destMac: "00:50:56:c0:00:08",
      sourceIp: isAlert ? '45.33.2.1' : `10.0.0.${Math.floor(Math.random() * 100) + 1}`,
      sourcePort: Math.floor(Math.random() * 20000) + 40000,
      destIp: isAlert ? '10.0.0.12' : `${Math.floor(Math.random() * 100) + 104}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.1`,
      destPort: selectedProto === 'DNS' ? 53 : selectedProto === 'TLS/HTTPS' ? 443 : selectedProto === 'HTTP' ? 80 : 8080,
      protocol: selectedProto,
      flags: selectedProto === 'TCP' ? {
        syn: isAlert,
        ack: !isAlert,
        fin: false,
        rst: false,
        psh: !isAlert,
        urg: false
      } : undefined,
      ttl: Math.floor(Math.random() * 32) + 48,
      summary: selectedProto === 'DNS' 
        ? `Standard query A ${pickedDomain}`
        : selectedProto === 'TLS/HTTPS'
          ? `TLSv1.3 Encrypted Handshake / Payload [Application Data]`
          : selectedProto === 'TCP'
            ? `TCP [${isAlert ? 'SYN' : 'ACK, PSH'}] Window=${Math.floor(Math.random() * 60000) + 1024}`
            : `HTTP Payload Exchange to internal endpoint`,
      payloadHex: `0000  00 50 56 c0 00 08 00 1a 2b 3c 4d 5e 08 00 45 00  .PV.....+<M^..E.\n0010  00 ${Math.floor(Math.random() * 50 + 10).toString(16)} 12 34 40 00 40 06 c0 a8 01 01 0a 00 00 01  ...4@.@.........\n0020  cb dc 01 bb 12 34 56 78 87 65 43 21 50 18 ff ff  .....4Vx.eC!P...\n0030  ${Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ')}  ..data-stream...`,
      payloadAscii: `.PV.....+<M^..E....4@.@...........4Vx.eC!P.....data-stream...`,
      deepPacketInspection: {
        verdict: isAlert ? 'Alert' : (pickedDomain.includes('dyn') || pickedDomain.includes('biz') ? 'Suspicious' : 'Benign'),
        ruleTriggered: isAlert ? 'HIGH_RISK_INTRUSION: Volumetric traffic anomalous signature detected' : undefined,
        entropy: Number((Math.random() * 4 + (selectedProto === 'TLS/HTTPS' ? 4 : 2)).toFixed(2)),
        applicationLayerProto: selectedProto
      }
    };

    packetRecords = [newPacket, ...packetRecords.slice(0, 79)];

    if (selectedProto === 'DNS' && Math.random() > 0.4) {
      traceDomainQuery(pickedDomain, 'A');
    }
  }, 2500);

  // --- REGIONAL THREAT DENSITY & CORRELATION API ---
  app.get("/api/network/regional-density", (req, res) => {
    const regions = computeRegionalThreatMetrics();
    const totalAttacks = regions.reduce((acc, r) => acc + r.activeAttacks, 0);
    const avgAnomaly = Math.round(regions.reduce((acc, r) => acc + r.anomalyScore, 0) / regions.length);
    res.json({
      timestamp: new Date().toISOString(),
      totalAttacks,
      avgAnomaly,
      regions,
      liveAttacksCount: attackMapData.length
    });
  });

  // --- CENTRAL NETWORK TRACKING & DNS APIS ---
  app.get("/api/network/dns-queries", (req, res) => {
    res.json(dnsRecords);
  });

  app.post("/api/network/trace-dns", (req, res) => {
    const { domain, recordType, clientIp } = req.body;
    if (!domain) {
      return res.status(400).json({ error: "Domain parameter is required" });
    }
    const trace = traceDomainQuery(domain, recordType || 'A', clientIp || '10.0.0.45');
    res.json(trace);
  });

  app.get("/api/network/packets", (req, res) => {
    res.json(packetRecords);
  });


  // --- CMS STORE & API ENDPOINTS ---
  let cmsItems: CmsItem[] = [
    {
      id: "cms-item-1",
      title: "The Rise of Zero-Day Exploits in Industrial IoT Devices",
      type: "article",
      category: "Threat Intel",
      content: "Over the past six months, we have observed a marked increase in zero-day exploitation targeting operational technology (OT) and industrial internet of things (IIoT) firmware layers. Threat actors, specifically APT-41, are bypassing standard firewall policy controls through web shell injections and device telemetry interface overflows. Initial entry vectors frequently exploit obsolete RPC endpoints or unpatched security policies in administrative dashboards.\n\nRecommended remediations include:\n1. Strict micro-segmentation of all OT and telemetry devices.\n2. Disabling unencrypted administrative web consoles.\n3. Continuous integrity checking of device firmware signatures.",
      summary: "An analytical review of advanced persistent threats leveraging firmware-level overrides on IIoT controllers.",
      status: "Published",
      author: "Lead Threat Hunter Zeta",
      createdAt: "2026-05-10T10:00:00Z",
      updatedAt: "2026-05-12T14:30:00Z",
      tags: ["IoT", "APT-41", "Zero-Day"]
    },
    {
      id: "cms-item-2",
      title: "System Security Hardening Guide: Windows AD & Kerberos",
      type: "document",
      category: "SOC Guides",
      content: "Technical documentation outlining exact Group Policy (GPO) and Active Directory configurations. Includes steps for setting up Kerberos Armoring (FAST), restricting NTLM auth, and disabling RC4 encryption algorithms in corporate domains. Detailed steps are provided to configure secure RPC interactions and block lateral movement avenues within the AD database structure.",
      summary: "GPO template guidelines and technical steps to secure Windows server infrastructures and Active Directory.",
      status: "Published",
      author: "Senior Security Engineer Alpha",
      createdAt: "2026-05-15T08:00:00Z",
      updatedAt: "2026-05-15T08:00:00Z",
      tags: ["Active Directory", "Hardening", "GPO"],
      fileName: "AD_Hardening_Standardv4.pdf",
      fileSize: "2.4 MB",
      mimeType: "application/pdf"
    },
    {
      id: "cms-item-3",
      title: "Interactive Threat Vector Infographic: Ransomware Kill Chain",
      type: "multimedia",
      category: "Vulnerability",
      content: "Visual sequence showing credential access -> privilege escalation -> defense evasion -> credential dumping -> lateral movement -> volume shadow copy deletion -> file system encryption. Crucial educational media asset designed for internal staff security briefings and cyber security awareness programs.",
      summary: "A structured visual flow of modern double-extortion ransomware operations from compromise to payout.",
      status: "Under Review",
      author: "UX SecOps Lead Gamma",
      createdAt: "2026-05-18T11:20:00Z",
      updatedAt: "2026-05-19T16:15:00Z",
      tags: ["Ransomware", "Infographic", "TTPs"],
      fileName: "ransomware_kill_chain_v1.png",
      fileSize: "5.1 MB",
      mimeType: "image/png"
    }
  ];

  // Get all CMS items
  app.get("/api/cms/items", (req, res) => {
    res.json(cmsItems);
  });

  // Get a single CMS item
  app.get("/api/cms/items/:id", (req, res) => {
    const item = cmsItems.find(x => x.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: "CMS item not found" });
    }
    res.json(item);
  });

  // Create a CMS item
  app.post("/api/cms/items", (req, res) => {
    const { title, type, category, content, summary, status, author, tags, fileUrl, fileName, fileSize, mimeType } = req.body;
    
    if (!title || !type || !category || !content) {
      return res.status(400).json({ error: "Title, type, category, and content are required parameters" });
    }

    const newItem: CmsItem = {
      id: `cms-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      type,
      category,
      content,
      summary: summary || "",
      status: status || "Draft",
      author: author || "Administrator",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags || [],
      fileUrl,
      fileName,
      fileSize,
      mimeType
    };

    cmsItems.push(newItem);
    res.status(201).json(newItem);
  });

  // Update a CMS item
  app.put("/api/cms/items/:id", (req, res) => {
    const { title, type, category, content, summary, status, author, tags, fileUrl, fileName, fileSize, mimeType } = req.body;
    const index = cmsItems.findIndex(x => x.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: "CMS item not found" });
    }

    const currentItem = cmsItems[index];
    const updatedItem: CmsItem = {
      ...currentItem,
      title: title !== undefined ? title : currentItem.title,
      type: type !== undefined ? type : currentItem.type,
      category: category !== undefined ? category : currentItem.category,
      content: content !== undefined ? content : currentItem.content,
      summary: summary !== undefined ? summary : currentItem.summary,
      status: status !== undefined ? status : currentItem.status,
      author: author !== undefined ? author : currentItem.author,
      tags: tags !== undefined ? tags : currentItem.tags,
      fileUrl: fileUrl !== undefined ? fileUrl : currentItem.fileUrl,
      fileName: fileName !== undefined ? fileName : currentItem.fileName,
      fileSize: fileSize !== undefined ? fileSize : currentItem.fileSize,
      mimeType: mimeType !== undefined ? mimeType : currentItem.mimeType,
      updatedAt: new Date().toISOString()
    };

    cmsItems[index] = updatedItem;
    res.json(updatedItem);
  });

  // Delete a CMS item
  app.delete("/api/cms/items/:id", (req, res) => {
    const index = cmsItems.findIndex(x => x.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "CMS item not found" });
    }
    cmsItems.splice(index, 1);
    res.json({ success: true, message: "CMS item successfully deleted" });
  });

  // --- REAL-TIME COLLABORATION STORE ---
  const collabDocs: Record<string, CollabDocument> = {
    'incident-report-1': {
      id: 'incident-report-1',
      title: 'Incident Report: FEODO C2 Network Breach',
      category: 'Incident Response',
      content: `# Incident Report: FEODO C2 Network Breach\n\n**Date:** 2026-05-23\n**Status:** INVESTIGATING\n**Lead Analyst:** Level-3 Security Operator\n\n## 1. Executive Summary\nOn 2026-05-23, our intrusion detection systems triggered critical alerts indicating outbound tunneling attempts to verified Feodo Botnet command-and-control servers. Micro-segmentation policies are currently being verified, and perimeter blocklists have been updated.\n\n## 2. Chronological Timeline\n- **17:36:00** - Initial alerts raised regarding outbound traffic from Host 10.0.0.45 on Port 443.\n- **17:38:00** - Threat feed queried, matching Destination IP 45.33.2.1 to known Feodo infrastructure.\n- **17:40:00** - Containment protocols activated.\n\n## 3. Recommended Actions\n- Isolate VLAN and perform memory dumps of the affected system.\n- Revoke valid session keys and administrative tokens.`,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System'
    },
    'security-charter': {
      id: 'security-charter',
      title: 'Sentinel SOC Security Operations Policy',
      category: 'Policy',
      content: `# Sentinel SOC Security Operations Policy\n\n## 1. Purpose & Objectives\nThis charter outlines the standard operational response procedures, containment guidelines, and investigative timelines required by the Security Operations Center (SOC) team during active campaign events.\n\n## 2. Severity Classification Matrix\n- **Critical (P1)**: Volumetric compromise or active ransomware infection. Response SLA: 10 minutes.\n- **High (P2)**: Multi-stage lateral movement or confirmed persistent access inside production networks. Response SLA: 30 minutes.\n- **Medium (P3)**: Scanning activity or isolated commodity malware. Response SLA: 4 hours.`,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System'
    },
    'apt28-intel-card': {
      id: 'apt28-intel-card',
      title: 'Threat Intelligence Briefing: APT28 (Fancy Bear)',
      category: 'Threat Intel',
      content: `# Threat Intelligence Briefing: APT28\n\n## 1. Actor Profile\nAPT28 (Fancy Bear, Sofacy) is a highly disciplined threat adversary executing strategic cyber campaigns since at least 2004. Primary objectives lean towards strategic intelligence collection focusing on defense, political institutions, and infrastructure.\n\n## 2. Core TTPs Leveraged\n- **T1566.001 (Spearphishing Attachment)**: Crafting highly convincing emails with customized macro-embedded attachments.\n- **T1059.001 (PowerShell Execution)**: Utilizing custom reflective loaders to run secondary malicious payloads directly inside memory blocks.\n\n## 3. Verified Mitigations\n- Restrict PowerShell script executions to certified directories.\n- Enable strict mail filtering and SPF/DKIM/DMARC analysis.`,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System'
    }
  };

  const collabChats: Record<string, ChatMessage[]> = {
    'incident-report-1': [],
    'security-charter': [],
    'apt28-intel-card': []
  };

  // --- REST ENDPOINTS FOR COLLABORATION ---
  app.get("/api/collab/documents", (req, res) => {
    const docsArray = Object.values(collabDocs).map(doc => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      lastUpdated: doc.lastUpdated,
      updatedBy: doc.updatedBy
    }));
    res.json(docsArray);
  });

  app.get("/api/collab/documents/:id", (req, res) => {
    const doc = collabDocs[req.params.id];
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(doc);
  });

  // --- WEBSOCKET REAL-TIME SYNC LOGIC ---
  const wss = new WebSocketServer({ noServer: true });
  const connectedClients = new Map<any, {
    id: string;
    username: string;
    color: string;
    documentId?: string;
  }>();

  // Helper: Find all connected users in a room
  const getRoomUsers = (documentId: string): CollabUser[] => {
    const users: CollabUser[] = [];
    connectedClients.forEach((info) => {
      if (info.documentId === documentId) {
        users.push({
          id: info.id,
          username: info.username,
          color: info.color,
          lastActive: new Date().toISOString()
        });
      }
    });
    return users;
  };

  // Helper: Broadcast to room
  const broadcastToRoom = (documentId: string, messageObj: any, excludeWs?: any) => {
    const msgStr = JSON.stringify(messageObj);
    connectedClients.forEach((info, ws) => {
      if (info.documentId === documentId && ws !== excludeWs && ws.readyState === 1) {
        ws.send(msgStr);
      }
    });
  };

  wss.on('connection', (ws) => {
    const clientId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Set initial client state with defaults
    connectedClients.set(ws, {
      id: clientId,
      username: 'Anonymous User',
      color: '#A1A1AA'
    });

    ws.on('message', (message) => {
      let parsed: any;
      try {
        parsed = JSON.parse(message.toString());
      } catch (e) {
        return;
      }

      const clientInfo = connectedClients.get(ws);
      if (!clientInfo) return;

      switch (parsed.type) {
        case 'join': {
          const { documentId, username, color } = parsed;
          clientInfo.documentId = documentId;
          clientInfo.username = username || 'Anonymous User';
          clientInfo.color = color || '#A1A1AA';

          // Join document state check
          if (collabDocs[documentId]) {
            // Send initial document state and message history
            ws.send(JSON.stringify({
              type: 'init',
              content: collabDocs[documentId].content,
              chatHistory: collabChats[documentId] || []
            }));

            // Notify everyone in the room about presence update
            const users = getRoomUsers(documentId);
            broadcastToRoom(documentId, {
              type: 'presence_update',
              users
            });

            // Create and log system chat announcement
            const sysMsg: ChatMessage = {
              id: `sys-${Date.now()}`,
              documentId,
              sender: 'System',
              color: '#10B981',
              text: `${clientInfo.username} joined the session`,
              timestamp: new Date().toISOString()
            };
            collabChats[documentId] = collabChats[documentId] || [];
            collabChats[documentId].push(sysMsg);
            if (collabChats[documentId].length > 100) collabChats[documentId].shift();

            broadcastToRoom(documentId, {
              type: 'chat',
              message: sysMsg
            });
          }
          break;
        }

        case 'edit': {
          const { documentId, content } = parsed;
          if (collabDocs[documentId]) {
            collabDocs[documentId].content = content;
            collabDocs[documentId].lastUpdated = new Date().toISOString();
            collabDocs[documentId].updatedBy = clientInfo.username;

            // Broadcast edit update to other players
            broadcastToRoom(documentId, {
              type: 'edit',
              documentId,
              content,
              updatedBy: clientInfo.username
            }, ws);
          }
          break;
        }

        case 'cursor': {
          const { documentId, cursor } = parsed;
          broadcastToRoom(documentId, {
            type: 'cursor_update',
            userId: clientInfo.id,
            username: clientInfo.username,
            color: clientInfo.color,
            cursor
          }, ws);
          break;
        }

        case 'chat': {
          const { documentId, text } = parsed;
          if (collabChats[documentId]) {
            const newChat: ChatMessage = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              documentId,
              sender: clientInfo.username,
              color: clientInfo.color,
              text,
              timestamp: new Date().toISOString()
            };

            collabChats[documentId].push(newChat);
            if (collabChats[documentId].length > 100) collabChats[documentId].shift();

            // Broadcast message back to everyone
            broadcastToRoom(documentId, {
              type: 'chat',
              message: newChat
            });
          }
          break;
        }
      }
    });

    ws.on('close', () => {
      const clientInfo = connectedClients.get(ws);
      if (clientInfo && clientInfo.documentId) {
        const documentId = clientInfo.documentId;
        connectedClients.delete(ws);

        // Send a system message to chat history
        const sysMsg: ChatMessage = {
          id: `sys-${Date.now()}`,
          documentId,
          sender: 'System',
          color: '#EF4444',
          text: `${clientInfo.username} left the session`,
          timestamp: new Date().toISOString()
        };
        if (collabChats[documentId]) {
          collabChats[documentId].push(sysMsg);
          if (collabChats[documentId].length > 100) collabChats[documentId].shift();
        }

        broadcastToRoom(documentId, {
          type: 'chat',
          message: sysMsg
        });

        // Broadcast presence update
        const users = getRoomUsers(documentId);
        broadcastToRoom(documentId, {
          type: 'presence_update',
          users
        });
      } else {
        connectedClients.delete(ws);
      }
    });
  });

  // Attach WebSocket to same HTTP port handler
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    if (url.pathname === '/ws-collab') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Simulate new IoCs being added periodically
  setInterval(() => {
    const newIoC = {
      id: `ioc-${Math.random().toString(36).substr(2, 5)}`,
      value: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      type: 'IP' as const,
      reputation: 'Suspicious' as const,
      lastSeen: new Date().toISOString(),
      tags: ['Anomalous Traffic', 'Scanner']
    };
    iocs = [newIoC, ...iocs.slice(0, 19)]; // Keep last 20
  }, 10000);

  // Catch-all for API routes that don't exist
  app.all("/api*", (req, res) => {
    console.warn(`404: API route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "API route not found", path: req.url });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler to ensure JSON responses even on errors
  // This MUST be the last middleware in the stack
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    
    // If it's an API request, always return JSON
    if (req.url.startsWith('/api')) {
      return res.status(500).json({ 
        error: "Internal Server Error", 
        message: err.message || "An unexpected error occurred",
        path: req.url
      });
    }
    
    // Otherwise, let the default handler or Vite handle it
    next(err);
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  } catch (error) {
    console.error("CRITICAL: Error in startServer:", error);
  }
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
});
