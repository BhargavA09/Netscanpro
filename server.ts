import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { WebSocketServer } from "ws";

import { IoC, Threat, CollabDocument, CollabUser, ChatMessage, CmsItem } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    const app = express();
    const server = http.createServer(app);
    const PORT = 3000;

  app.use(express.json());

  // Simple request logger
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
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
