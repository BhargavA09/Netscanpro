export interface Threat {
  id: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  source?: string;
  timestamp: string;
  message: string;
  status?: 'Active' | 'Mitigated' | 'Investigating';
  indicators?: string[];
}

export interface IoC {
  id?: string;
  value: string;
  type: 'IP' | 'Domain' | 'Hash' | 'URL';
  reputation: 'Malicious' | 'Suspicious' | 'Clean' | 'Unknown';
  lastSeen: string;
  tags: string[];
  source?: string;
}

export interface AnalysisResult {
  summary: string;
  riskScore: number;
  recommendations: string[];
  relatedTechniques: string[];
}

export interface TTP {
  id: string;
  name: string;
  description: string;
  mitreUrl?: string;
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  targetSectors: string[];
  motivations: string[];
  ttps: TTP[];
  description: string;
  lastActive: string;
}

export interface CollabDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface CollabUser {
  id: string;
  username: string;
  color: string;
  lastActive: string;
  cursor?: {
    selectionStart: number;
    selectionEnd: number;
    line?: number;
    ch?: number;
  };
}

export interface ChatMessage {
  id: string;
  documentId: string;
  sender: string;
  color: string;
  text: string;
  timestamp: string;
}

export type CmsContentType = 'article' | 'document' | 'multimedia';
export type CmsPublicationStatus = 'Draft' | 'Under Review' | 'Published' | 'Archived';

export interface CmsItem {
  id: string;
  title: string;
  type: CmsContentType;
  category: string;
  content: string;
  summary: string;
  status: CmsPublicationStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  fileUrl?: string; // For documents or multimedia (can be a base64 string or mock download path)
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
}

export interface RegionalThreatMetric {
  region: string;
  regionCode: string;
  activeAttacks: number;
  threatDensity: number; // percentage
  anomalyScore: number;  // 0 - 100
  avgLatency: number;    // ms
  vectorBreakdown: {
    ddos: number;
    malware: number;
    botnet: number;
    exploit: number;
    phishing: number;
  };
  topOriginCountry: string;
  topTargetSector: string;
  correlatedAttackCount: number;
  activeThreatIds: string[];
}

export interface DnsTraceHop {
  hopNumber: number;
  stage: string;
  server: string;
  serverIp: string;
  latencyMs: number;
  status: 'HIT' | 'FORWARD' | 'RESOLVED' | 'NXDOMAIN' | 'BLOCKED';
  details: string;
}

export interface DnsRecord {
  id: string;
  timestamp: string;
  query: string;
  recordType: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'PTR' | 'SRV' | 'SOA';
  clientIp: string;
  clientPort: number;
  browserContext: string;
  resolver: string;
  resolvedIps: string[];
  ttl: number;
  responseCode: 'NOERROR' | 'NXDOMAIN' | 'SERVFAIL' | 'REFUSED';
  responseTimeMs: number;
  dnssec: 'Secure' | 'Insecure' | 'Bogus';
  threatLevel: 'Safe' | 'Suspicious' | 'Malicious';
  threatReason?: string;
  hops: DnsTraceHop[];
}

export interface PacketFlags {
  syn: boolean;
  ack: boolean;
  fin: boolean;
  rst: boolean;
  psh: boolean;
  urg: boolean;
}

export interface PacketRecord {
  frameNumber: number;
  timestamp: string;
  interfaceName: string;
  length: number;
  sourceMac: string;
  destMac: string;
  sourceIp: string;
  sourcePort: number;
  destIp: string;
  destPort: number;
  protocol: 'DNS' | 'TCP' | 'UDP' | 'TLS/HTTPS' | 'HTTP' | 'ICMP';
  flags?: PacketFlags;
  seqNumber?: number;
  ackNumber?: number;
  windowSize?: number;
  ttl: number;
  summary: string;
  payloadHex: string;
  payloadAscii: string;
  deepPacketInspection: {
    verdict: 'Benign' | 'Suspicious' | 'Alert';
    ruleTriggered?: string;
    entropy: number;
    applicationLayerProto?: string;
    ciphersuite?: string;
  };
}

export type ApiVaultCategory = 
  | 'ip_reputation' 
  | 'url_domain' 
  | 'malware_hash' 
  | 'cve_vulnerability' 
  | 'botnet_c2' 
  | 'threat_intel';

export interface ApiVaultProvider {
  id: string;
  name: string;
  provider: string;
  category: ApiVaultCategory;
  description: string;
  authType: 'keyless' | 'free_tier_key';
  freeTierQuota: string;
  baseUrl: string;
  docsUrl: string;
  isEnabled: boolean;
  hasCustomKey: boolean;
  status: 'online' | 'degraded' | 'offline' | 'untested';
  latencyMs: number;
  lastTested?: string;
  queriesToday: number;
  sampleQuery: {
    type: 'IP' | 'Domain' | 'Hash' | 'CVE' | 'Recent' | 'Feed';
    value: string;
    label: string;
  };
}

export interface ApiVaultQueryResult {
  apiId: string;
  apiName: string;
  queryType: string;
  queryValue: string;
  timestamp: string;
  latencyMs: number;
  status: number;
  success: boolean;
  data: any;
  summary: string;
  threatLevel: 'Safe' | 'Suspicious' | 'Malicious' | 'Informational';
  tags: string[];
  extractedIocs?: Array<{
    value: string;
    type: 'IP' | 'Domain' | 'Hash' | 'CVE';
    reputation: 'Safe' | 'Suspicious' | 'Malicious';
  }>;
}

export interface ApiVaultStats {
  totalApis: number;
  activeApis: number;
  keylessApis: number;
  queriesExecuted: number;
  estimatedCostSaved: number;
  avgLatencyMs: number;
  cacheHitRate: number;
}

export interface NetworkDevice {
  id: string;
  ip: string;
  mac: string;
  vendor: string;
  hostname: string;
  assignedUser?: {
    name: string;
    role: string;
    isCurrentUser?: boolean;
    department: string;
    email?: string;
  };
  deviceType: 'workstation' | 'mobile' | 'server' | 'gateway' | 'iot' | 'printer' | 'vm';
  os: string;
  status: 'online' | 'idle' | 'flagged' | 'isolated';
  latencyMs: number;
  openPorts: number[];
  bandwidthInMb: number;
  bandwidthOutMb: number;
  lastSeen: string;
  riskScore: number; // 0 - 100
  threatVerdict: 'Clean' | 'Suspicious' | 'Under Investigation';
  trafficSummary?: string;
  discoveryMethod: 'ARP Broadcast' | 'mDNS Bonjour' | 'SSDP UPnP' | 'DHCP Lease' | 'Active Ping';
}

export interface NetworkNeighborhoodStats {
  subnet: string;
  gatewayIp: string;
  totalDevices: number;
  onlineDevices: number;
  activeUsers: number;
  flaggedDevices: number;
  isolatedDevices: number;
  totalBandwidthMb: number;
  scanTime: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
  status?: 'ACTIVE' | 'RESOLVED';
  remediation?: string;
  resolvedAt?: string;
  suggestedAction?: string;
}

export interface SreLatencyPoint {
  time: string;
  p50: number;
  p95: number;
  p99: number;
  slaTarget: number;
}

export interface SreErrorRatePoint {
  time: string;
  rate: number;
  count2xx: number;
  count4xx: number;
  count5xx: number;
  sloThreshold: number;
}

export interface SreUptimePoint {
  time: string;
  uptime: number;
  slaTarget: number;
}

export interface SreServiceNode {
  id: string;
  name: string;
  type: string;
  region: string;
  status: 'healthy' | 'degraded' | 'critical';
  uptimePercent: number;
  latencyMs: number;
  errorRatePercent: number;
  requestsPerSec: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
}

export interface SreMetricsResponse {
  summary: {
    currentP50: number;
    currentP95: number;
    currentP99: number;
    slaTargetMs: number;
    currentErrorRate: number;
    sloTargetErrorRate: number;
    errorBudgetRemainingPercent: number;
    uptime30dPercent: number;
    uptimeTargetPercent: number;
    mttdMinutes: number;
    mttrMinutes: number;
    overallHealth: 'Optimal' | 'Degraded' | 'At Risk';
    totalRequests24h: number;
    activeNodesCount: number;
  };
  latencyHistory: SreLatencyPoint[];
  errorRateHistory: SreErrorRatePoint[];
  uptimeHistory: SreUptimePoint[];
  services: SreServiceNode[];
  lastUpdated: string;
}

// ==========================================
// HOME WI-FI NODES & CONNECTED CLIENT USERS
// Powered by OpenWrt, Pi-hole, BATMAN-adv & DAWN
// ==========================================

export interface WifiRadioConfig {
  band: '2.4GHz' | '5GHz' | '6GHz';
  protocol: 'Wi-Fi 7 (802.11be)' | 'Wi-Fi 6E (802.11ax)' | 'Wi-Fi 6 (802.11ax)' | 'Wi-Fi 5 (802.11ac)';
  channel: number;
  channelWidth: string;
  txPowerDbm: number;
  bssid: string;
  channelUtilizationPercent: number;
}

export interface WifiNodeBackhaul {
  type: 'ethernet' | 'wireless_6ghz' | 'wireless_5ghz';
  parentBssid?: string;
  parentNodeId?: string;
  linkSpeedMbps: number;
  rssiDbm?: number;
  qualityPercent: number;
  meshProtocol: '802.11s' | 'B.A.T.M.A.N.-adv' | 'IEEE 1905.1 EasyMesh';
}

export interface WifiNode {
  id: string;
  name: string;
  role: 'gateway' | 'mesh_satellite' | 'ap' | 'extender';
  room: string;
  floor: 'ground' | 'upper' | 'outdoor';
  x: number; // 0-100% position on layout canvas
  y: number; // 0-100% position on layout canvas
  status: 'online' | 'degraded' | 'offline';
  ip: string;
  mac: string;
  model: string;
  firmware: string;
  openSourceDriver: string;
  radios: WifiRadioConfig[];
  backhaul: WifiNodeBackhaul;
  clientCount: number;
  totalBandwidthDownMbps: number;
  totalBandwidthUpMbps: number;
  cpuTempC: number;
  memoryUsagePercent: number;
  uptime: string;
  coverageRadiusMeters: number;
}

export interface WifiClientRoamingEvent {
  timestamp: string;
  fromNode: string;
  toNode: string;
  reason: string;
  rssi: number;
}

export interface WifiClientUser {
  id: string;
  nodeId: string;
  userName: string;
  userRole: 'Homeowner' | 'Family Member' | 'Remote Worker' | 'Guest' | 'Smart Home';
  avatar: string;
  deviceHost: string;
  deviceCategory: 'laptop' | 'phone' | 'tablet' | 'smart_tv' | 'smart_home' | 'console' | 'car';
  ip: string;
  mac: string;
  vendor: string;
  band: '2.4GHz' | '5GHz' | '6GHz';
  wifiStandard: '802.11be (Wi-Fi 7)' | '802.11ax (Wi-Fi 6)' | '802.11ac (Wi-Fi 5)';
  rssiDbm: number;
  snrDb: number;
  signalQuality: 'Excellent' | 'Good' | 'Fair' | 'Weak';
  txRateMbps: number;
  rxRateMbps: number;
  currentDownMbps: number;
  currentUpMbps: number;
  dataTransferred24hGb: number;
  dhcpLeaseExpires: string;
  dnsQueries24h: number;
  blockedQueries24h: number;
  networkVlan: 'Main LAN (VLAN 1)' | 'IoT Isolated (VLAN 20)' | 'Guest Portal (VLAN 30)';
  internetPaused: boolean;
  qosPriority: 'High (Gaming/VoIP)' | 'Normal' | 'Streaming' | 'Background';
  roamingHistory: WifiClientRoamingEvent[];
  lastActivity: string;
  isMyDevice?: boolean;
  detectedViaBrowser?: boolean;
  detectedOs?: string;
  detectedBrowser?: string;
  screenRes?: string;
  rttLatencyMs?: number;
}

export interface OpenSourceRepo {
  name: string;
  repo: string;
  stars: string;
  description: string;
  usedFor: string;
  commandSample: string;
  outputSample: string;
  status: 'Active Daemon' | 'Kernel Module' | 'Integrated Service' | 'Telemetry Provider';
}

export interface WifiMeshTelemetryResponse {
  nodes: WifiNode[];
  clients: WifiClientUser[];
  stats: {
    totalNodes: number;
    onlineNodes: number;
    totalConnectedUsers: number;
    activeBands: { band24: number; band5: number; band6: number };
    totalThroughputDownMbps: number;
    totalThroughputUpMbps: number;
    meshHealth: 'Optimal' | 'Good' | 'Interference Detected';
    piholeBlockedPercentage: number;
    fastRoamingEvents24h: number;
    averageRssiDbm: number;
  };
  openSourceRepos: OpenSourceRepo[];
  lastScanTime: string;
}

export interface WifiDeviceHistoryPoint {
  id: string;
  clientId: string;
  userName: string;
  deviceHost: string;
  timestamp: string;
  timeLabel: string;
  eventType: 'ROAM' | 'ASSOCIATE' | 'DISCONNECT' | 'BAND_STEER' | 'QOS_UPDATE' | 'PAUSE' | 'RESUME' | 'SPEED_SPIKE';
  fromNodeId?: string;
  fromNodeName?: string;
  toNodeId: string;
  toNodeName: string;
  rssiDbm: number;
  band: '2.4GHz' | '5GHz' | '6GHz';
  throughputDownMbps: number;
  throughputUpMbps: number;
  details: string;
}

export interface WifiEventLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'AUDIT';
  category: 'wifi_roaming' | 'dhcp' | 'dns_pihole' | 'mesh_backhaul' | 'security_firewall' | 'client_activity' | 'qos_sqm' | 'system_backend';
  nodeId?: string;
  clientId?: string;
  deviceHost?: string;
  userName?: string;
  message: string;
  source: string;
  details?: string;
}

export interface PythonBackendStatus {
  active: boolean;
  version: string;
  engine: string;
  port: number;
  pid: number;
  uptimeSeconds: number;
  totalRequestsHandled: number;
  totalEventsLogged: number;
  activeThreads: number;
  memoryRssMb: number;
  scriptPath: string;
  recentLogs: string[];
}

export interface NmapPortInfo {
  port: number;
  protocol: 'tcp' | 'udp';
  state: 'open' | 'filtered' | 'closed';
  service: string;
  version?: string;
  banner?: string;
}

export interface NetworkDiscoveryDevice {
  id: string;
  ip: string;
  mac: string;
  vendor: string;
  hostname: string;
  userOwner?: string;
  userRole?: string;
  status: 'online' | 'idle' | 'warning' | 'high_traffic';
  isMyDevice?: boolean;
  osFingerprint: string;
  deviceType: 'laptop' | 'smartphone' | 'tablet' | 'smart_tv' | 'gaming_console' | 'iot_camera' | 'smart_home' | 'ev_charger' | 'server' | 'networking';
  
  // Arping & Layer 2/3 Telemetry
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  lastArpReplyTime: string;
  interfaceName: string;
  
  // Wi-Fi Mesh Node Link & Placement
  connectedNodeId: string;
  connectedNodeName: string;
  nodeRoom: string;
  nodeFloor: string;
  bssid: string;
  band: '2.4GHz' | '5GHz' | '6GHz';
  channel: number;
  channelWidth: string;
  rssiDbm: number;
  snrDb: number;
  signalQuality: 'Excellent' | 'Good' | 'Fair' | 'Weak';
  
  // Throughput & Traffic
  rxRateMbps: number;
  txRateMbps: number;
  currentDownMbps: number;
  currentUpMbps: number;
  dataTransferred24hGb: number;
  
  // Network Config & DNS
  subnet: string;
  dhcpLeaseRemaining: string;
  dnsResolver: string;
  vlan: string;
  dnsQueries24h: number;
  blockedDns24h: number;
  
  // Nmap Port Scan Telemetry
  openPorts: NmapPortInfo[];
  lastNmapScanTime?: string;
  scanEngine: 'arping' | 'nmap' | 'hybrid';
}

export interface NetworkDiscoveryScanResponse {
  success: boolean;
  subnet: string;
  scanDurationMs: number;
  scanEngine: string;
  devicesFound: number;
  activeHosts: number;
  devices: NetworkDiscoveryDevice[];
  summary: {
    totalScannedIps: number;
    activeCount: number;
    openPortsTotal: number;
    avgLatencyMs: number;
    arpCacheHits: number;
    meshAssociatedCount: number;
  };
  timestamp: string;
}




