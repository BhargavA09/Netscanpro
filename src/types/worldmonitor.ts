export type WorldMonitorLayer = 
  | 'cables'
  | 'pipelines'
  | 'tradeRoutes'
  | 'weather'
  | 'outages'
  | 'natural'
  | 'waterways'
  | 'economic'
  | 'sanctions'
  | 'stockExchanges'
  | 'financialCenters'
  | 'centralBanks';

export interface GeoCoordinate {
  lat: number;
  lon: number;
}

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
}

export interface EnergyPipeline {
  id: string;
  name: string;
  commodityType: 'crude_oil' | 'natural_gas' | 'hydrogen' | 'refined_products';
  lengthKm: number;
  capacityThroughput: string;
  status: 'operational' | 'reduced_flow' | 'shutdown' | 'sabotage_offline';
  origin: string;
  destination: string;
  pathCoordinates: GeoCoordinate[];
  riskLevel: 'LOW' | 'ELEVATED' | 'CRITICAL';
  description: string;
}

export interface TradeRouteChokepoint {
  id: string;
  name: string;
  type: 'strait' | 'canal' | 'corridor';
  coordinates: GeoCoordinate;
  dailyVessels: number;
  dailyVolume: string;
  transitDelayHours: number;
  status: 'nominal' | 'congested' | 'high_risk' | 'closed';
  securityNotice?: string;
  description: string;
}

export interface StockExchange {
  id: string;
  name: string;
  mic: string;
  city: string;
  country: string;
  coordinates: GeoCoordinate;
  marketCapTrillion: number;
  currency: string;
  timezone: string;
  tradingHoursUtc: string;
  status: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  primaryIndexName: string;
  indexValue: number;
  change24hPercent: number;
  volumeTodayBillion: number;
}

export interface CentralBank {
  id: string;
  name: string;
  country: string;
  city: string;
  coordinates: GeoCoordinate;
  governor: string;
  benchmarkRatePercent: number;
  inflationTargetPercent: number;
  balanceSheetTrillion: number;
  currency: string;
  stance: 'HAWKISH' | 'NEUTRAL' | 'DOVISH';
  nextMeetingDate: string;
  lastDecisionDate: string;
  policySummary: string;
}

export interface FinancialCenter {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: GeoCoordinate;
  globalRank: number;
  financialSecrecyTier: 'MODERATE' | 'STRICT' | 'OPEN';
  assetsUnderMgmtTrillion: number;
  dailyFxVolumeBillion: number;
  keyInstitutions: string[];
}

export interface WeatherSystem {
  id: string;
  name: string;
  category: string;
  type: 'tropical_cyclone' | 'typhoon' | 'polar_vortex' | 'severe_storm';
  coordinates: GeoCoordinate;
  windSpeedKnots: number;
  centralPressureMbar: number;
  movementKnots: number;
  radiusKm: number;
  severity: 'WARNING' | 'CRITICAL' | 'ADVISORY';
  affectedLogistics: string;
}

export interface InfrastructureOutage {
  id: string;
  title: string;
  type: 'cable_cut' | 'power_grid' | 'cloud_datacenter' | 'cyber_disruption';
  coordinates: GeoCoordinate;
  affectedRegions: string[];
  impactedTrafficPct: number;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  timestamp: string;
  estimatedRestoration: string;
  cause: string;
}

export interface NaturalHazard {
  id: string;
  name: string;
  type: 'earthquake' | 'volcano' | 'tsunami_alert';
  coordinates: GeoCoordinate;
  magnitude?: number;
  depthKm?: number;
  severity: 'ALERT' | 'WATCH' | 'CRITICAL';
  timestamp: string;
  proximityToTrade: string;
}

export interface StrategicWaterway {
  id: string;
  name: string;
  coordinates: GeoCoordinate;
  lengthKm: number;
  maxDraftMeters: number;
  activeVesselsWaiting: number;
  status: 'OPEN' | 'RESTRICTED' | 'MAINTENANCE';
  annualTonnageMillion: number;
}

export interface SanctionRegime {
  id: string;
  regimeName: string;
  authority: 'OFAC' | 'EU' | 'UN' | 'UK_OFSI';
  coordinates: GeoCoordinate;
  flaggedCount: number;
  targetedSectors: string[];
  shadowFleetTankersTracked: number;
  enforcementLevel: 'STRICT' | 'ACTIVE_BLOCKADE' | 'SECONDARY_SANCTIONS';
  summary: string;
}

export interface MacroEconomicMetric {
  id: string;
  country: string;
  code: string;
  coordinates: GeoCoordinate;
  gdpTrillion: number;
  gdpGrowthPercent: number;
  cpiInflationPercent: number;
  debtToGdpPercent: number;
  tenYearYieldPercent: number;
  foreignReservesBillion: number;
}

export interface FinancialTickerItem {
  symbol: string;
  name: string;
  category: 'equity' | 'forex' | 'commodity' | 'bond' | 'crypto';
  price: string;
  changePercent: number;
  changeAbsolute: string;
  currency: string;
}
