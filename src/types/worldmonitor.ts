export type WorldMonitorLayer = 
  | 'cables'         // Subsea Fiber Cables & Landing Stations
  | 'botnets'        // C2 Servers & Botnet Clusters
  | 'ddos'           // Volumetric DDoS Attacks & Amplification Floods
  | 'bgpHijacks'     // BGP Route Hijacks & AS Routing Anomaly
  | 'aptActors'      // Nation-State APT Threat Actor Campaigns
  | 'zeroDays'       // Active Zero-Day & CISA KEV Exploits
  | 'ransomware'     // Ransomware Extortion Cartels & Leak Dumps
  | 'gnssJamming'    // Electronic Warfare & GPS/GNSS Spoofing Zones
  | 'honeypots'      // Global Honeypot Sensor Grid & Darknet Probes
  | 'cloudOutages';  // Cloud Hyperscaler & Internet Backbone Outages

export interface GeoCoordinate {
  lat: number;
  lon: number;
}

// Subsea Telecom Fiber Cables & Landing Points
export interface SubseaCable {
  id: string;
  name: string;
  lengthKm: number;
  capacityTbps: number;
  rfsYear: number;
  status: 'active' | 'degraded' | 'cut' | 'under_maintenance';
  latencyMs: number;
  operators: string[];
  landingPoints: { name: string; country: string; coordinates: GeoCoordinate }[];
  pathCoordinates: GeoCoordinate[];
  description: string;
  securityNotice?: string;
  associatedIxp?: string;
}

// C2 Botnet Infrastructure & Beaconing Servers
export interface C2BotnetCluster {
  id: string;
  name: string;
  malwareFamily: 'Cobalt Strike' | 'Mirai' | 'Lumma Stealer' | 'Emotet' | 'Qakbot' | 'Pikabot' | 'AsyncRAT';
  threatSeverity: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  coordinates: GeoCoordinate;
  city: string;
  country: string;
  activeBeaconsCount: number;
  infectedHostsEstimate: number;
  primaryC2Port: number;
  protocol: 'HTTPS' | 'TCP/DNS' | 'IRC' | 'Tor Onion';
  c2Ip: string;
  asn: string;
  ja4Fingerprint: string;
  targetedSectors: string[];
  mitreTechnique: string;
  mitreTactic: string;
  status: 'ACTIVE_BEACONING' | 'CONTAINMENT_IN_PROGRESS' | 'DORMANT_RESERVE';
  lastSeen: string;
  remediationCommand: string;
}

// Volumetric DDoS Attacks & Amplification Vectors
export interface DdosAttackStream {
  id: string;
  targetName: string;
  victimSector: 'Financial Gateway' | 'Critical Cloud Hyperscaler' | 'DNS Root Server' | 'Government Portal' | 'Defense Industrial Base';
  attackType: 'DNS Amplification' | 'NTP Monlist' | 'SYN Flood' | 'HTTP/2 Rapid Reset' | 'CLDAP Reflection';
  peakBandwidthTbps: number;
  peakPacketsMpps: number;
  coordinates: GeoCoordinate;
  originCoordinates: GeoCoordinate;
  targetAsn: string;
  status: 'ONGOING_ATTACK' | 'MITIGATING' | 'DEFLECTED';
  durationMinutes: number;
  mitigationMethod: string;
  description: string;
}

// BGP Route Hijacks & AS Leaks
export interface BgpHijackIncident {
  id: string;
  prefix: string;
  victimAsn: string;
  victimOrg: string;
  hijackerAsn: string;
  hijackerOrg: string;
  coordinates: GeoCoordinate;
  rpkiStatus: 'INVALID' | 'UNAUTHORIZED_ANNOUNCEMENT' | 'SUB_PREFIX_HIJACK';
  severity: 'CRITICAL' | 'MAJOR';
  impactedPrefixes: number;
  detectedAt: string;
  durationMinutes: number;
  status: 'ACTIVE_HIJACK' | 'WITHDRAWN' | 'FILTERED_BY_UPSTREAMS';
  packetRedirectionRisk: string;
}

// Nation-State APT Campaigns
export interface AptActorCampaign {
  id: string;
  name: string;
  alias: string;
  nationSponsor: 'Russia (GRU/SVR)' | 'China (MSS/PLA)' | 'North Korea (RGB)' | 'Iran (IRGC)' | 'Unknown State';
  coordinates: GeoCoordinate;
  activeCampaignName: string;
  targetCountries: string[];
  targetSectors: string[];
  primaryObjective: 'Critical Infrastructure Pre-positioning' | 'Espionage & Source Exfiltration' | 'Financial Crypto Theft' | 'Destructive Wiper';
  primaryCVEs: string[];
  mitreAttAndCkGroup: string;
  ttps: string[];
  threatLevel: 'CRITICAL' | 'HIGH';
  status: 'ACTIVE_CAMPAIGN' | 'MONITORED';
  indicatorsOfCompromise: string[];
  countermeasure: string;
}

// Zero-Day & CISA KEV Exploits
export interface ZeroDayExploit {
  id: string;
  cveId: string;
  softwareName: string;
  vendor: string;
  cvssScore: number;
  epssProbability: number;
  coordinates: GeoCoordinate;
  attackVector: 'REMOTE_CODE_EXECUTION' | 'AUTHENTICATION_BYPASS' | 'PRIVILEGE_ESCALATION' | 'COMMAND_INJECTION';
  cisaKevDate: string;
  exploitInTheWild: boolean;
  publicPocAvailable: boolean;
  activeExploitationBursts: number;
  patchStatus: 'EMERGENCY_PATCH_AVAILABLE' | 'UNPATCHED_ZERO_DAY' | 'WORKAROUND_ONLY';
  remediationGuidance: string;
}

// Ransomware Cartels & Leak Dumps
export interface RansomwareCartel {
  id: string;
  gangName: string;
  ransomwareVariant: string;
  coordinates: GeoCoordinate;
  totalVictimsYtd: number;
  activeExtortionCount: number;
  latestVictim: string;
  latestVictimSector: string;
  exfiltratedDataGb: number;
  countdownHoursLeft: number;
  cryptoWalletTracked: string;
  leakSiteStatus: 'ONLINE_ACTIVE' | 'SEIZED_BY_LE' | 'DDoS_OFFLINE';
  severity: 'CRITICAL' | 'HIGH';
}

// Electronic Warfare & GPS/GNSS Spoofing
export interface GnssJammingZone {
  id: string;
  regionName: string;
  coordinates: GeoCoordinate;
  radiusKm: number;
  jammingType: 'GPS_SPOOFING' | 'L1_L2_NOISE_JAMMING' | 'NTP_TIME_SHIFT_ATTACK';
  impactLevel: 'SEVERE_CIVIL_DISRUPTION' | 'CRITICAL_TIMING_DESYNC' | 'ELEVATED';
  affectedAirMaritimeRoutes: string;
  suspectedOrigin: string;
  status: 'ACTIVE_JAMMING' | 'INTERMITTENT';
  description: string;
}

// Honeypot Sensor Grid Hits
export interface HoneypotHit {
  id: string;
  sensorLocation: string;
  coordinates: GeoCoordinate;
  sensorType: 'SSH/Cowrie' | 'Telnet/Mirai' | 'DNP3/SCADA' | 'SIP/VoIP' | 'SMB/EternalBlue';
  hitsLastHour: number;
  topAttackingSubnet: string;
  topOriginCountry: string;
  bruteForceCredentialsSample: string[];
  payloadCaptured: string;
  severity: 'HIGH' | 'MEDIUM';
}

// Cloud Hyperscaler & Infrastructure Outages
export interface InfrastructureOutage {
  id: string;
  title: string;
  type: 'cable_cut' | 'cloud_datacenter' | 'ixp_failure' | 'dns_infrastructure';
  coordinates: GeoCoordinate;
  affectedRegions: string[];
  impactedTrafficPct: number;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  timestamp: string;
  estimatedRestoration: string;
  cause: string;
}

// Live Threat Telemetry HUD Item
export interface CyberThreatTickerItem {
  indicator: string;
  label: string;
  value: string;
  status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'ACTIVE';
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// Global Cyber Situation Event
export interface GlobalCyberEvent {
  id: string;
  headline: string;
  threatType: 'APT_CAMPAIGN' | 'DDOS_BURST' | 'ZERO_DAY' | 'BGP_LEAK' | 'CABLE_CUT' | 'RANSOMWARE';
  region: string;
  source: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  coordinates: GeoCoordinate;
}
