import {
  SubseaCable,
  EnergyPipeline,
  TradeRouteChokepoint,
  StockExchange,
  CentralBank,
  FinancialCenter,
  WeatherSystem,
  InfrastructureOutage,
  NaturalHazard,
  StrategicWaterway,
  SanctionRegime,
  MacroEconomicMetric,
  FinancialTickerItem
} from '../types/worldmonitor';

// Real-Time Financial & Commodity Ticker
export const TICKER_ITEMS: FinancialTickerItem[] = [
  { symbol: 'SPX', name: 'S&P 500', category: 'equity', price: '5,864.67', changePercent: 0.42, changeAbsolute: '+24.50', currency: 'USD' },
  { symbol: 'NDX', name: 'Nasdaq 100', category: 'equity', price: '20,324.12', changePercent: 0.68, changeAbsolute: '+137.20', currency: 'USD' },
  { symbol: 'FTSE', name: 'FTSE 100', category: 'equity', price: '8,247.10', changePercent: -0.15, changeAbsolute: '-12.40', currency: 'GBP' },
  { symbol: 'N225', name: 'Nikkei 225', category: 'equity', price: '38,981.75', changePercent: 1.12, changeAbsolute: '+431.10', currency: 'JPY' },
  { symbol: 'BRENT', name: 'Brent Crude', category: 'commodity', price: '74.29', changePercent: -1.24, changeAbsolute: '-0.93', currency: 'USD/bbl' },
  { symbol: 'WTI', name: 'WTI Crude', category: 'commodity', price: '70.58', changePercent: -1.02, changeAbsolute: '-0.73', currency: 'USD/bbl' },
  { symbol: 'GOLD', name: 'Gold Spot', category: 'commodity', price: '2,721.40', changePercent: 0.85, changeAbsolute: '+22.90', currency: 'USD/oz' },
  { symbol: 'NGAS', name: 'Natural Gas', category: 'commodity', price: '2.28', changePercent: 2.15, changeAbsolute: '+0.05', currency: 'USD/MMBtu' },
  { symbol: 'BTC', name: 'Bitcoin', category: 'crypto', price: '68,450.00', changePercent: 2.45, changeAbsolute: '+1,640.00', currency: 'USD' },
  { symbol: 'ETH', name: 'Ethereum', category: 'crypto', price: '2,642.50', changePercent: 1.82, changeAbsolute: '+47.20', currency: 'USD' },
  { symbol: 'EUR/USD', name: 'EUR / USD', category: 'forex', price: '1.0862', changePercent: -0.12, changeAbsolute: '-0.0013', currency: 'USD' },
  { symbol: 'USD/JPY', name: 'USD / JPY', category: 'forex', price: '149.52', changePercent: 0.35, changeAbsolute: '+0.52', currency: 'JPY' },
  { symbol: 'US10Y', name: 'US 10-Yr Yield', category: 'bond', price: '4.08%', changePercent: -0.49, changeAbsolute: '-0.02', currency: '%' },
  { symbol: 'DE10Y', name: 'German 10Y Bund', category: 'bond', price: '2.18%', changePercent: 0.21, changeAbsolute: '+0.01', currency: '%' }
];

// 29 Major Global Stock Exchanges
export const STOCK_EXCHANGES: StockExchange[] = [
  {
    id: 'nyse',
    name: 'New York Stock Exchange',
    mic: 'XNYS',
    city: 'New York',
    country: 'United States',
    coordinates: { lat: 40.7069, lon: -74.0089 },
    marketCapTrillion: 28.5,
    currency: 'USD',
    timezone: 'America/New_York (UTC-4)',
    tradingHoursUtc: '13:30 - 20:00 UTC',
    status: 'OPEN',
    primaryIndexName: 'NYSE Composite',
    indexValue: 19680.4,
    change24hPercent: 0.38,
    volumeTodayBillion: 42.1
  },
  {
    id: 'nasdaq',
    name: 'Nasdaq Stock Market',
    mic: 'XNAS',
    city: 'New York',
    country: 'United States',
    coordinates: { lat: 40.756, lon: -73.986 },
    marketCapTrillion: 25.1,
    currency: 'USD',
    timezone: 'America/New_York (UTC-4)',
    tradingHoursUtc: '13:30 - 20:00 UTC',
    status: 'OPEN',
    primaryIndexName: 'Nasdaq Composite',
    indexValue: 18518.6,
    change24hPercent: 0.72,
    volumeTodayBillion: 68.4
  },
  {
    id: 'tse-tokyo',
    name: 'Tokyo Stock Exchange',
    mic: 'XJPX',
    city: 'Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6828, lon: 139.7772 },
    marketCapTrillion: 6.8,
    currency: 'JPY',
    timezone: 'Asia/Tokyo (UTC+9)',
    tradingHoursUtc: '00:00 - 06:30 UTC',
    status: 'CLOSED',
    primaryIndexName: 'Nikkei 225',
    indexValue: 38981.8,
    change24hPercent: 1.12,
    volumeTodayBillion: 28.6
  },
  {
    id: 'sse-shanghai',
    name: 'Shanghai Stock Exchange',
    mic: 'XSHG',
    city: 'Shanghai',
    country: 'China',
    coordinates: { lat: 31.2397, lon: 121.4997 },
    marketCapTrillion: 7.2,
    currency: 'CNY',
    timezone: 'Asia/Shanghai (UTC+8)',
    tradingHoursUtc: '01:30 - 07:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'SSE Composite',
    indexValue: 3261.6,
    change24hPercent: 2.91,
    volumeTodayBillion: 52.3
  },
  {
    id: 'hkex',
    name: 'Hong Kong Exchanges & Clearing',
    mic: 'XHKG',
    city: 'Hong Kong',
    country: 'Hong Kong SAR',
    coordinates: { lat: 22.2842, lon: 114.1582 },
    marketCapTrillion: 4.6,
    currency: 'HKD',
    timezone: 'Asia/Hong_Kong (UTC+8)',
    tradingHoursUtc: '01:30 - 08:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'Hang Seng Index',
    indexValue: 20804.1,
    change24hPercent: 3.61,
    volumeTodayBillion: 34.8
  },
  {
    id: 'euronext',
    name: 'Euronext (Amsterdam/Paris/Brussels/Lisbon)',
    mic: 'XAMS',
    city: 'Amsterdam / Paris',
    country: 'European Union',
    coordinates: { lat: 48.8708, lon: 2.3411 },
    marketCapTrillion: 7.1,
    currency: 'EUR',
    timezone: 'Europe/Paris (UTC+2)',
    tradingHoursUtc: '07:00 - 15:30 UTC',
    status: 'OPEN',
    primaryIndexName: 'CAC 40 / AEX',
    indexValue: 7576.4,
    change24hPercent: -0.08,
    volumeTodayBillion: 22.4
  },
  {
    id: 'lse-london',
    name: 'London Stock Exchange',
    mic: 'XLON',
    city: 'London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5152, lon: -0.0993 },
    marketCapTrillion: 3.8,
    currency: 'GBP',
    timezone: 'Europe/London (UTC+1)',
    tradingHoursUtc: '07:00 - 15:30 UTC',
    status: 'OPEN',
    primaryIndexName: 'FTSE 100',
    indexValue: 8247.1,
    change24hPercent: -0.15,
    volumeTodayBillion: 18.2
  },
  {
    id: 'xetra-frankfurt',
    name: 'Deutsche Börse (XETRA)',
    mic: 'XFRA',
    city: 'Frankfurt',
    country: 'Germany',
    coordinates: { lat: 50.1154, lon: 8.6781 },
    marketCapTrillion: 2.3,
    currency: 'EUR',
    timezone: 'Europe/Berlin (UTC+2)',
    tradingHoursUtc: '07:00 - 15:30 UTC',
    status: 'OPEN',
    primaryIndexName: 'DAX 40',
    indexValue: 19612.3,
    change24hPercent: 0.28,
    volumeTodayBillion: 14.5
  },
  {
    id: 'bse-india',
    name: 'Bombay Stock Exchange (BSE & NSE)',
    mic: 'XBOM',
    city: 'Mumbai',
    country: 'India',
    coordinates: { lat: 18.9298, lon: 72.8333 },
    marketCapTrillion: 5.2,
    currency: 'INR',
    timezone: 'Asia/Kolkata (UTC+5:30)',
    tradingHoursUtc: '03:45 - 10:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'BSE SENSEX',
    indexValue: 81224.7,
    change24hPercent: 0.27,
    volumeTodayBillion: 24.1
  },
  {
    id: 'tsx-toronto',
    name: 'Toronto Stock Exchange',
    mic: 'XTSE',
    city: 'Toronto',
    country: 'Canada',
    coordinates: { lat: 43.6487, lon: -79.3817 },
    marketCapTrillion: 3.4,
    currency: 'CAD',
    timezone: 'America/Toronto (UTC-4)',
    tradingHoursUtc: '13:30 - 20:00 UTC',
    status: 'OPEN',
    primaryIndexName: 'S&P/TSX Composite',
    indexValue: 24723.3,
    change24hPercent: 0.19,
    volumeTodayBillion: 9.8
  },
  {
    id: 'asx-australia',
    name: 'Australian Securities Exchange',
    mic: 'XASX',
    city: 'Sydney',
    country: 'Australia',
    coordinates: { lat: -33.8688, lon: 151.2093 },
    marketCapTrillion: 2.1,
    currency: 'AUD',
    timezone: 'Australia/Sydney (UTC+11)',
    tradingHoursUtc: '23:00 - 05:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'S&P/ASX 200',
    indexValue: 8283.2,
    change24hPercent: -0.42,
    volumeTodayBillion: 8.5
  },
  {
    id: 'six-swiss',
    name: 'SIX Swiss Exchange',
    mic: 'XSWX',
    city: 'Zurich',
    country: 'Switzerland',
    coordinates: { lat: 47.3769, lon: 8.5417 },
    marketCapTrillion: 2.0,
    currency: 'CHF',
    timezone: 'Europe/Zurich (UTC+2)',
    tradingHoursUtc: '07:00 - 15:30 UTC',
    status: 'OPEN',
    primaryIndexName: 'SMI (Swiss Market Index)',
    indexValue: 12284.5,
    change24hPercent: 0.14,
    volumeTodayBillion: 7.2
  },
  {
    id: 'szse-shenzhen',
    name: 'Shenzhen Stock Exchange',
    mic: 'XSHE',
    city: 'Shenzhen',
    country: 'China',
    coordinates: { lat: 22.5431, lon: 114.0579 },
    marketCapTrillion: 4.1,
    currency: 'CNY',
    timezone: 'Asia/Shanghai (UTC+8)',
    tradingHoursUtc: '01:30 - 07:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'SZSE Component',
    indexValue: 10458.2,
    change24hPercent: 4.71,
    volumeTodayBillion: 64.2
  },
  {
    id: 'tadawul',
    name: 'Saudi Exchange (Tadawul)',
    mic: 'XSAU',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    coordinates: { lat: 24.7136, lon: 46.6753 },
    marketCapTrillion: 2.7,
    currency: 'SAR',
    timezone: 'Asia/Riyadh (UTC+3)',
    tradingHoursUtc: '07:00 - 12:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'TASI',
    indexValue: 11985.4,
    change24hPercent: -0.32,
    volumeTodayBillion: 5.1
  },
  {
    id: 'sgx-singapore',
    name: 'Singapore Exchange (SGX)',
    mic: 'XSES',
    city: 'Singapore',
    country: 'Singapore',
    coordinates: { lat: 1.2801, lon: 103.8509 },
    marketCapTrillion: 0.72,
    currency: 'SGD',
    timezone: 'Asia/Singapore (UTC+8)',
    tradingHoursUtc: '01:00 - 09:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'Straits Times Index',
    indexValue: 3640.2,
    change24hPercent: 0.44,
    volumeTodayBillion: 4.3
  },
  {
    id: 'krx-korea',
    name: 'Korea Exchange (KRX)',
    mic: 'XKRX',
    city: 'Seoul',
    country: 'South Korea',
    coordinates: { lat: 37.5255, lon: 126.9242 },
    marketCapTrillion: 1.9,
    currency: 'KRW',
    timezone: 'Asia/Seoul (UTC+9)',
    tradingHoursUtc: '00:00 - 06:30 UTC',
    status: 'CLOSED',
    primaryIndexName: 'KOSPI',
    indexValue: 2604.9,
    change24hPercent: 0.78,
    volumeTodayBillion: 12.1
  },
  {
    id: 'twse-taiwan',
    name: 'Taiwan Stock Exchange',
    mic: 'XTAI',
    city: 'Taipei',
    country: 'Taiwan',
    coordinates: { lat: 25.033, lon: 121.5654 },
    marketCapTrillion: 2.2,
    currency: 'TWD',
    timezone: 'Asia/Taipei (UTC+8)',
    tradingHoursUtc: '01:00 - 05:30 UTC',
    status: 'CLOSED',
    primaryIndexName: 'TAIEX',
    indexValue: 23487.3,
    change24hPercent: 1.88,
    volumeTodayBillion: 16.7
  },
  {
    id: 'b3-brazil',
    name: 'B3 - Brasil Bolsa Balcão',
    mic: 'BVMF',
    city: 'São Paulo',
    country: 'Brazil',
    coordinates: { lat: -23.5489, lon: -46.6388 },
    marketCapTrillion: 0.88,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo (UTC-3)',
    tradingHoursUtc: '13:00 - 20:00 UTC',
    status: 'OPEN',
    primaryIndexName: 'Ibovespa',
    indexValue: 130499.1,
    change24hPercent: -0.22,
    volumeTodayBillion: 6.2
  },
  {
    id: 'jse-southafrica',
    name: 'Johannesburg Stock Exchange',
    mic: 'XJSE',
    city: 'Johannesburg',
    country: 'South Africa',
    coordinates: { lat: -26.1015, lon: 28.0567 },
    marketCapTrillion: 1.1,
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg (UTC+2)',
    tradingHoursUtc: '07:00 - 15:00 UTC',
    status: 'OPEN',
    primaryIndexName: 'FTSE/JSE Top 40',
    indexValue: 80112.5,
    change24hPercent: 0.35,
    volumeTodayBillion: 2.8
  },
  {
    id: 'bmv-mexico',
    name: 'Bolsa Mexicana de Valores',
    mic: 'XMEX',
    city: 'Mexico City',
    country: 'Mexico',
    coordinates: { lat: 19.427, lon: -99.1677 },
    marketCapTrillion: 0.54,
    currency: 'MXN',
    timezone: 'America/Mexico_City (UTC-6)',
    tradingHoursUtc: '14:30 - 21:00 UTC',
    status: 'OPEN',
    primaryIndexName: 'S&P/BMV IPC',
    indexValue: 53120.4,
    change24hPercent: 0.41,
    volumeTodayBillion: 2.1
  },
  {
    id: 'difx-dubai',
    name: 'Dubai Financial Market (DFM & Nasdaq Dubai)',
    mic: 'XDFM',
    city: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: { lat: 25.2048, lon: 55.2708 },
    marketCapTrillion: 0.22,
    currency: 'AED',
    timezone: 'Asia/Dubai (UTC+4)',
    tradingHoursUtc: '06:00 - 10:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'DFM General',
    indexValue: 4480.1,
    change24hPercent: 0.12,
    volumeTodayBillion: 1.2
  },
  {
    id: 'omx-nordic',
    name: 'Nasdaq Nordic (Stockholm/Helsinki/Copenhagen)',
    mic: 'XSTO',
    city: 'Stockholm',
    country: 'Sweden',
    coordinates: { lat: 59.3293, lon: 18.0686 },
    marketCapTrillion: 1.8,
    currency: 'SEK',
    timezone: 'Europe/Stockholm (UTC+2)',
    tradingHoursUtc: '07:00 - 15:30 UTC',
    status: 'OPEN',
    primaryIndexName: 'OMXS30',
    indexValue: 2584.2,
    change24hPercent: -0.18,
    volumeTodayBillion: 4.5
  },
  {
    id: 'bme-madrid',
    name: 'Bolsas y Mercados Españoles (BME)',
    mic: 'XMAD',
    city: 'Madrid',
    country: 'Spain',
    coordinates: { lat: 40.4189, lon: -3.6923 },
    marketCapTrillion: 0.85,
    currency: 'EUR',
    timezone: 'Europe/Madrid (UTC+2)',
    tradingHoursUtc: '07:00 - 15:30 UTC',
    status: 'OPEN',
    primaryIndexName: 'IBEX 35',
    indexValue: 11925.1,
    change24hPercent: -0.05,
    volumeTodayBillion: 3.1
  },
  {
    id: 'idx-indonesia',
    name: 'Indonesia Stock Exchange',
    mic: 'XIDX',
    city: 'Jakarta',
    country: 'Indonesia',
    coordinates: { lat: -6.2238, lon: 106.8087 },
    marketCapTrillion: 0.78,
    currency: 'IDR',
    timezone: 'Asia/Jakarta (UTC+7)',
    tradingHoursUtc: '02:00 - 09:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'IDX Composite',
    indexValue: 7750.3,
    change24hPercent: 0.19,
    volumeTodayBillion: 3.8
  },
  {
    id: 'set-thailand',
    name: 'Stock Exchange of Thailand',
    mic: 'XBKK',
    city: 'Bangkok',
    country: 'Thailand',
    coordinates: { lat: 13.722, lon: 100.563 },
    marketCapTrillion: 0.52,
    currency: 'THB',
    timezone: 'Asia/Bangkok (UTC+7)',
    tradingHoursUtc: '03:00 - 09:30 UTC',
    status: 'CLOSED',
    primaryIndexName: 'SET Index',
    indexValue: 1489.8,
    change24hPercent: 0.55,
    volumeTodayBillion: 2.2
  },
  {
    id: 'borsa-istanbul',
    name: 'Borsa Istanbul',
    mic: 'XIST',
    city: 'Istanbul',
    country: 'Turkey',
    coordinates: { lat: 41.1114, lon: 29.0396 },
    marketCapTrillion: 0.38,
    currency: 'TRY',
    timezone: 'Europe/Istanbul (UTC+3)',
    tradingHoursUtc: '07:00 - 15:00 UTC',
    status: 'OPEN',
    primaryIndexName: 'BIST 100',
    indexValue: 8870.2,
    change24hPercent: -0.65,
    volumeTodayBillion: 2.9
  },
  {
    id: 'tase-israel',
    name: 'Tel Aviv Stock Exchange',
    mic: 'XTAE',
    city: 'Tel Aviv',
    country: 'Israel',
    coordinates: { lat: 32.0628, lon: 34.7709 },
    marketCapTrillion: 0.32,
    currency: 'ILS',
    timezone: 'Asia/Jerusalem (UTC+3)',
    tradingHoursUtc: '07:00 - 14:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'TA-125',
    indexValue: 2140.7,
    change24hPercent: 0.22,
    volumeTodayBillion: 1.1
  },
  {
    id: 'nzx-newzealand',
    name: 'New Zealand Exchange',
    mic: 'XNZE',
    city: 'Wellington',
    country: 'New Zealand',
    coordinates: { lat: -41.2865, lon: 174.7762 },
    marketCapTrillion: 0.13,
    currency: 'NZD',
    timezone: 'Pacific/Auckland (UTC+13)',
    tradingHoursUtc: '21:00 - 04:00 UTC',
    status: 'CLOSED',
    primaryIndexName: 'S&P/NZX 50',
    indexValue: 12840.1,
    change24hPercent: 0.05,
    volumeTodayBillion: 0.8
  },
  {
    id: 'moex-moscow',
    name: 'Moscow Exchange',
    mic: 'MISX',
    city: 'Moscow',
    country: 'Russia',
    coordinates: { lat: 55.7539, lon: 37.6044 },
    marketCapTrillion: 0.45,
    currency: 'RUB',
    timezone: 'Europe/Moscow (UTC+3)',
    tradingHoursUtc: '07:00 - 16:00 UTC',
    status: 'OPEN',
    primaryIndexName: 'MOEX Russia Index',
    indexValue: 2750.4,
    change24hPercent: -1.18,
    volumeTodayBillion: 1.9
  }
];

// Major Subsea Fiber Optic Telecommunication Cables
export const SUBSEA_CABLES: SubseaCable[] = [
  {
    id: 'marea',
    name: 'MAREA',
    lengthKm: 6605,
    capacityTbps: 224,
    rfsYear: 2018,
    status: 'active',
    latencyMs: 62,
    operators: ['Telxius', 'Meta', 'Microsoft'],
    landingPoints: [
      { name: 'Virginia Beach', country: 'United States', coordinates: { lat: 36.8529, lon: -75.978 } },
      { name: 'Bilbao', country: 'Spain', coordinates: { lat: 43.263, lon: -2.935 } }
    ],
    pathCoordinates: [
      { lat: 36.8529, lon: -75.978 },
      { lat: 38.2, lon: -62.5 },
      { lat: 40.5, lon: -42.0 },
      { lat: 42.8, lon: -20.5 },
      { lat: 43.263, lon: -2.935 }
    ],
    description: 'Highest-capacity transatlantic fiber optic cable across the Atlantic, linking Virginia data centers to Southern Europe.'
  },
  {
    id: 'grace-hopper',
    name: 'Grace Hopper',
    lengthKm: 6250,
    capacityTbps: 350,
    rfsYear: 2022,
    status: 'active',
    latencyMs: 58,
    operators: ['Google'],
    landingPoints: [
      { name: 'New York', country: 'United States', coordinates: { lat: 40.7128, lon: -74.006 } },
      { name: 'Bude', country: 'United Kingdom', coordinates: { lat: 50.826, lon: -4.544 } },
      { name: 'Bilbao', country: 'Spain', coordinates: { lat: 43.263, lon: -2.935 } }
    ],
    pathCoordinates: [
      { lat: 40.7128, lon: -74.006 },
      { lat: 42.5, lon: -55.0 },
      { lat: 46.0, lon: -35.0 },
      { lat: 49.5, lon: -15.0 },
      { lat: 50.826, lon: -4.544 }
    ],
    description: 'Google private subsea cable equipped with optical fiber switching, directly routing between US East Coast, UK, and Spain.'
  },
  {
    id: '2africa',
    name: '2Africa',
    lengthKm: 45000,
    capacityTbps: 180,
    rfsYear: 2024,
    status: 'active',
    latencyMs: 145,
    operators: ['Meta', 'Vodafone', 'Orange', 'China Mobile', 'Telecom Egypt'],
    landingPoints: [
      { name: 'Bude', country: 'United Kingdom', coordinates: { lat: 50.826, lon: -4.544 } },
      { name: 'Genoa', country: 'Italy', coordinates: { lat: 44.4056, lon: 8.9463 } },
      { name: 'Port Said', country: 'Egypt', coordinates: { lat: 31.2653, lon: 32.3019 } },
      { name: 'Mombasa', country: 'Kenya', coordinates: { lat: -4.0435, lon: 39.6682 } },
      { name: 'Cape Town', country: 'South Africa', coordinates: { lat: -33.9249, lon: 18.4241 } }
    ],
    pathCoordinates: [
      { lat: 50.826, lon: -4.544 },
      { lat: 36.1, lon: -6.0 },
      { lat: 44.4056, lon: 8.9463 },
      { lat: 31.2653, lon: 32.3019 },
      { lat: 12.5, lon: 43.5 },
      { lat: -4.0435, lon: 39.6682 },
      { lat: -25.0, lon: 35.0 },
      { lat: -33.9249, lon: 18.4241 }
    ],
    description: 'Longest subsea cable system on Earth, circumnavigating the African continent to connect 33 countries.'
  },
  {
    id: 'sea-me-we-6',
    name: 'SEA-ME-WE 6',
    lengthKm: 19200,
    capacityTbps: 126,
    rfsYear: 2025,
    status: 'degraded',
    latencyMs: 168,
    operators: ['Singtel', 'Orange', 'Telecom Egypt', 'Bharti Airtel'],
    landingPoints: [
      { name: 'Marseille', country: 'France', coordinates: { lat: 43.2965, lon: 5.3698 } },
      { name: 'Zafarana', country: 'Egypt', coordinates: { lat: 29.116, lon: 32.65 } },
      { name: 'Mumbai', country: 'India', coordinates: { lat: 18.9298, lon: 72.8333 } },
      { name: 'Tuas', country: 'Singapore', coordinates: { lat: 1.32, lon: 103.65 } }
    ],
    pathCoordinates: [
      { lat: 43.2965, lon: 5.3698 },
      { lat: 35.0, lon: 18.0 },
      { lat: 29.116, lon: 32.65 },
      { lat: 15.0, lon: 42.0 },
      { lat: 12.0, lon: 55.0 },
      { lat: 18.9298, lon: 72.8333 },
      { lat: 5.0, lon: 88.0 },
      { lat: 1.32, lon: 103.65 }
    ],
    description: 'South East Asia-Middle East-Western Europe trunk corridor. Experiencing rerouting through Red Sea choke corridor.'
  },
  {
    id: 'faster',
    name: 'FASTER (Trans-Pacific)',
    lengthKm: 11629,
    capacityTbps: 60,
    rfsYear: 2016,
    status: 'active',
    latencyMs: 84,
    operators: ['Google', 'China Mobile', 'KDDI', 'Singtel'],
    landingPoints: [
      { name: 'Bandon', country: 'United States', coordinates: { lat: 43.1187, lon: -124.4085 } },
      { name: 'Chikura', country: 'Japan', coordinates: { lat: 34.9622, lon: 139.9575 } },
      { name: 'Tamsui', country: 'Taiwan', coordinates: { lat: 25.1764, lon: 121.4428 } }
    ],
    pathCoordinates: [
      { lat: 43.1187, lon: -124.4085 },
      { lat: 45.0, lon: -150.0 },
      { lat: 44.0, lon: -175.0 },
      { lat: 40.0, lon: 165.0 },
      { lat: 34.9622, lon: 139.9575 },
      { lat: 25.1764, lon: 121.4428 }
    ],
    description: 'Ultra-high-speed transpacific optical link with direct 60 Tbps capacity connecting Oregon with Tokyo and Taipei.'
  },
  {
    id: 'monet',
    name: 'Monet (US-Brazil)',
    lengthKm: 10556,
    capacityTbps: 64,
    rfsYear: 2017,
    status: 'active',
    latencyMs: 98,
    operators: ['Google', 'Antel', 'Angola Cables', 'Algar Telecom'],
    landingPoints: [
      { name: 'Boca Raton', country: 'United States', coordinates: { lat: 26.3587, lon: -80.0831 } },
      { name: 'Fortaleza', country: 'Brazil', coordinates: { lat: -3.7327, lon: -38.527 } },
      { name: 'Praia Grande', country: 'Brazil', coordinates: { lat: -24.0058, lon: -46.4029 } }
    ],
    pathCoordinates: [
      { lat: 26.3587, lon: -80.0831 },
      { lat: 18.6552, lon: -63.0564 }, // Near user coordinate!
      { lat: 8.0, lon: -50.0 },
      { lat: -3.7327, lon: -38.527 },
      { lat: -15.0, lon: -36.0 },
      { lat: -24.0058, lon: -46.4029 }
    ],
    description: 'Crucial South American trunk linking Florida data centers to São Paulo and Fortaleza through the Eastern Caribbean corridor.'
  }
];

// Critical Global Energy Pipelines
export const ENERGY_PIPELINES: EnergyPipeline[] = [
  {
    id: 'druzhba',
    name: 'Druzhba Pipeline (Friendship)',
    commodityType: 'crude_oil',
    lengthKm: 4000,
    capacityThroughput: '1.4M bpd',
    status: 'reduced_flow',
    origin: 'Samara, Russia',
    destination: 'Schwedt, Germany / Slovnaft, Slovakia',
    riskLevel: 'ELEVATED',
    pathCoordinates: [
      { lat: 53.2, lon: 50.15 },
      { lat: 52.8, lon: 35.0 },
      { lat: 52.4, lon: 23.6 },
      { lat: 52.0, lon: 18.5 },
      { lat: 53.05, lon: 14.28 }
    ],
    description: 'World’s longest crude oil pipeline network delivering Urals crude to Central European refineries under EU exemptions.'
  },
  {
    id: 'cpc',
    name: 'Caspian Pipeline Consortium (CPC)',
    commodityType: 'crude_oil',
    lengthKm: 1511,
    capacityThroughput: '1.5M bpd',
    status: 'operational',
    origin: 'Tengiz Field, Kazakhstan',
    destination: 'Novorossiysk Marine Terminal, Black Sea',
    riskLevel: 'ELEVATED',
    pathCoordinates: [
      { lat: 46.85, lon: 53.3 },
      { lat: 46.3, lon: 48.0 },
      { lat: 45.4, lon: 41.5 },
      { lat: 44.7, lon: 37.78 }
    ],
    description: 'Key export route for Chevron/ExxonMobil Kazakh oil to global markets through Black Sea tanker loadings.'
  },
  {
    id: 'btc',
    name: 'Baku-Tbilisi-Ceyhan (BTC)',
    commodityType: 'crude_oil',
    lengthKm: 1768,
    capacityThroughput: '1.2M bpd',
    status: 'operational',
    origin: 'Sangachal, Azerbaijan',
    destination: 'Ceyhan Marine Terminal, Turkey',
    riskLevel: 'LOW',
    pathCoordinates: [
      { lat: 40.18, lon: 49.46 },
      { lat: 41.71, lon: 44.78 },
      { lat: 40.5, lon: 40.0 },
      { lat: 36.88, lon: 35.84 }
    ],
    description: 'Strategic BP-operated bypass corridor delivering Caspian crude to the Mediterranean without crossing Russian territory.'
  },
  {
    id: 'nord-stream-1',
    name: 'Nord Stream 1 & 2',
    commodityType: 'natural_gas',
    lengthKm: 1224,
    capacityThroughput: '55 Bcm/year (offline)',
    status: 'sabotage_offline',
    origin: 'Vyborg & Ust-Luga, Russia',
    destination: 'Lubmin, Germany',
    riskLevel: 'CRITICAL',
    pathCoordinates: [
      { lat: 60.67, lon: 28.5 },
      { lat: 59.5, lon: 23.0 },
      { lat: 56.5, lon: 18.0 },
      { lat: 55.5, lon: 15.7 },
      { lat: 54.14, lon: 13.65 }
    ],
    description: 'Baltic Sea subsea twin natural gas pipelines severed by underwater detonations in September 2022 near Bornholm Island.'
  },
  {
    id: 'power-of-siberia',
    name: 'Power of Siberia',
    commodityType: 'natural_gas',
    lengthKm: 3000,
    capacityThroughput: '38 Bcm/year',
    status: 'operational',
    origin: 'Chayandinskoye & Kovyktinskoye, Russia',
    destination: 'Heihe / Shanghai, China',
    riskLevel: 'LOW',
    pathCoordinates: [
      { lat: 59.8, lon: 112.5 },
      { lat: 56.0, lon: 125.0 },
      { lat: 50.25, lon: 127.5 },
      { lat: 40.0, lon: 120.0 }
    ],
    description: 'Gazprom mega-pipeline transferring East Siberian gas to CNPC northern China industrial centers.'
  },
  {
    id: 'keystone',
    name: 'Keystone Pipeline System',
    commodityType: 'crude_oil',
    lengthKm: 3461,
    capacityThroughput: '622,000 bpd',
    status: 'operational',
    origin: 'Hardisty, Alberta, Canada',
    destination: 'Cushing, OK & Texas Gulf Coast, USA',
    riskLevel: 'LOW',
    pathCoordinates: [
      { lat: 52.65, lon: -111.3 },
      { lat: 48.0, lon: -100.0 },
      { lat: 41.0, lon: -97.0 },
      { lat: 35.98, lon: -96.76 },
      { lat: 29.9, lon: -94.0 }
    ],
    description: 'TC Energy crude artery transporting Canadian heavy oil sands diluted bitumen directly to US refinery hubs.'
  }
];

// Strategic Maritime Trade Routes & Chokepoints
export const TRADE_ROUTE_CHOKEPOINTS: TradeRouteChokepoint[] = [
  {
    id: 'strait-of-malacca',
    name: 'Strait of Malacca',
    type: 'strait',
    coordinates: { lat: 2.5, lon: 101.5 },
    dailyVessels: 240,
    dailyVolume: '16.5M bpd oil & 40% of global container trade',
    transitDelayHours: 3.5,
    status: 'nominal',
    description: 'Narrow 1.5-nautical-mile funnel connecting Indian Ocean to South China Sea, vital for Japan, Korea, and China energy imports.'
  },
  {
    id: 'suez-canal',
    name: 'Suez Canal',
    type: 'canal',
    coordinates: { lat: 30.5852, lon: 32.2654 },
    dailyVessels: 32,
    dailyVolume: 'Reduced ~60% due to Red Sea diversions',
    transitDelayHours: 18.0,
    status: 'congested',
    securityNotice: 'Severe diversion around Cape of Good Hope adds 10-14 transit days.',
    description: 'Artificial sea-level waterway connecting Mediterranean to Red Sea; revenue down 55% as boxships reroute around Africa.'
  },
  {
    id: 'bab-el-mandeb',
    name: 'Bab-el-Mandeb Strait',
    type: 'strait',
    coordinates: { lat: 12.5833, lon: 43.3333 },
    dailyVessels: 28,
    dailyVolume: '4.8M bpd oil & petroleum',
    transitDelayHours: 24.0,
    status: 'high_risk',
    securityNotice: 'Active anti-ship ballistic missile and drone threat zone; Operation Prosperity Guardian armed escort required.',
    description: '18-mile-wide strait separating Arabian Peninsula from Horn of Africa. Critical choke point between Aden and Red Sea.'
  },
  {
    id: 'strait-of-hormuz',
    name: 'Strait of Hormuz',
    type: 'strait',
    coordinates: { lat: 26.5667, lon: 56.25 },
    dailyVessels: 135,
    dailyVolume: '21M bpd (21% of global petroleum consumption)',
    transitDelayHours: 4.2,
    status: 'high_risk',
    securityNotice: 'IRGC naval boarding risk, AIS spoofing active, heightened radar jamming near Abu Musa Island.',
    description: 'The world’s most critical oil transit chokepoint between Persian Gulf and Gulf of Oman. Daily crude value exceeds $1.6B.'
  },
  {
    id: 'panama-canal',
    name: 'Panama Canal (Neo-Panamax)',
    type: 'canal',
    coordinates: { lat: 9.08, lon: -79.68 },
    dailyVessels: 34,
    dailyVolume: '500M tons annual cargo (LNG, grain, containers)',
    transitDelayHours: 36.0,
    status: 'nominal',
    description: 'Freshwater lock canal linking Atlantic and Pacific oceans. Gatun Lake levels recovering from drought restriction quotas.'
  },
  {
    id: 'bosporus',
    name: 'Bosporus & Dardanelles',
    type: 'strait',
    coordinates: { lat: 41.11, lon: 29.07 },
    dailyVessels: 110,
    dailyVolume: '3.0M bpd oil & 25% of global wheat exports',
    transitDelayHours: 12.0,
    status: 'nominal',
    description: 'Turkish straits regulated under Montreux Convention, controlling Black Sea entrance and Danube grain exports.'
  },
  {
    id: 'danish-straits',
    name: 'Danish Straits (Storebælt & Øresund)',
    type: 'strait',
    coordinates: { lat: 55.35, lon: 11.0 },
    dailyVessels: 95,
    dailyVolume: '3.2M bpd Russian Baltic crude export route',
    transitDelayHours: 2.0,
    status: 'nominal',
    description: 'Chokepoint controlling Baltic Sea egress to North Sea; heavily monitored for uninsured Russian shadow tankers.'
  }
];

// Central Banks & Monetary Policy
export const CENTRAL_BANKS: CentralBank[] = [
  {
    id: 'federal-reserve',
    name: 'Federal Reserve System (FOMC)',
    country: 'United States',
    city: 'Washington, D.C.',
    coordinates: { lat: 38.8929, lon: -77.045 },
    governor: 'Jerome H. Powell',
    benchmarkRatePercent: 4.875,
    inflationTargetPercent: 2.0,
    balanceSheetTrillion: 7.1,
    currency: 'USD',
    stance: 'NEUTRAL',
    lastDecisionDate: '2024-09-18 (-50 bps)',
    nextMeetingDate: '2024-11-07',
    policySummary: 'Dual mandate: maximum employment & 2% core PCE. Calibrating easing trajectory based on labor market cooling.'
  },
  {
    id: 'ecb',
    name: 'European Central Bank',
    country: 'Eurozone (20 Nations)',
    city: 'Frankfurt am Main',
    coordinates: { lat: 50.11, lon: 8.702 },
    governor: 'Christine Lagarde',
    benchmarkRatePercent: 3.25,
    inflationTargetPercent: 2.0,
    balanceSheetTrillion: 6.5,
    currency: 'EUR',
    stance: 'DOVISH',
    lastDecisionDate: '2024-10-17 (-25 bps)',
    nextMeetingDate: '2024-12-12',
    policySummary: 'Deposit facility rate lowered to 3.25% as disinflation progresses faster than baseline projections; German PMI contraction.'
  },
  {
    id: 'bank-of-japan',
    name: 'Bank of Japan (BOJ)',
    country: 'Japan',
    city: 'Tokyo',
    coordinates: { lat: 35.6865, lon: 139.771 },
    governor: 'Kazuo Ueda',
    benchmarkRatePercent: 0.25,
    inflationTargetPercent: 2.0,
    balanceSheetTrillion: 5.1,
    currency: 'JPY',
    stance: 'HAWKISH',
    lastDecisionDate: '2024-07-31 (+15 bps)',
    nextMeetingDate: '2024-10-31',
    policySummary: 'Exited negative interest rates & YCC. Watching wage growth momentum (Shunto) and Yen FX volatility.'
  },
  {
    id: 'bank-of-england',
    name: 'Bank of England (MPC)',
    country: 'United Kingdom',
    city: 'London',
    coordinates: { lat: 51.5142, lon: -0.0883 },
    governor: 'Andrew Bailey',
    benchmarkRatePercent: 5.0,
    inflationTargetPercent: 2.0,
    balanceSheetTrillion: 1.1,
    currency: 'GBP',
    stance: 'NEUTRAL',
    lastDecisionDate: '2024-08-01 (-25 bps)',
    nextMeetingDate: '2024-11-07',
    policySummary: 'Headline CPI fell to 1.7% in September below target. Rate cut odds for November meeting stand at 92%.'
  },
  {
    id: 'pboc',
    name: "People's Bank of China (PBOC)",
    country: 'China',
    city: 'Beijing',
    coordinates: { lat: 39.9075, lon: 116.368 },
    governor: 'Pan Gongsheng',
    benchmarkRatePercent: 3.1,
    inflationTargetPercent: 3.0,
    balanceSheetTrillion: 5.9,
    currency: 'CNY',
    stance: 'DOVISH',
    lastDecisionDate: '2024-10-21 (-25 bps LPR)',
    nextMeetingDate: '2024-11-20',
    policySummary: 'Comprehensive fiscal-monetary stimulus: 1Y LPR cut to 3.1%, 5Y LPR to 3.6%, RRR slashed 50 bps, 800B RMB liquidity for equities.'
  },
  {
    id: 'snb-swiss',
    name: 'Swiss National Bank (SNB)',
    country: 'Switzerland',
    city: 'Bern / Zurich',
    coordinates: { lat: 46.9479, lon: 7.4474 },
    governor: 'Martin Schlegel',
    benchmarkRatePercent: 1.0,
    inflationTargetPercent: 2.0,
    balanceSheetTrillion: 0.95,
    currency: 'CHF',
    stance: 'DOVISH',
    lastDecisionDate: '2024-09-26 (-25 bps)',
    nextMeetingDate: '2024-12-12',
    policySummary: 'Policy rate cut to 1.00% to combat strong Franc (CHF) deflationary pressure on export competitiveness.'
  }
];

// Global Financial Centers
export const FINANCIAL_CENTERS: FinancialCenter[] = [
  {
    id: 'fc-ny',
    name: 'New York Financial District & Midtown',
    city: 'New York',
    country: 'United States',
    coordinates: { lat: 40.7128, lon: -74.006 },
    globalRank: 1,
    financialSecrecyTier: 'MODERATE',
    assetsUnderMgmtTrillion: 32.4,
    dailyFxVolumeBillion: 1850,
    keyInstitutions: ['JPMorgan Chase', 'Goldman Sachs', 'BlackRock', 'Citigroup', 'Morgan Stanley']
  },
  {
    id: 'fc-london',
    name: 'City of London & Canary Wharf',
    city: 'London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5074, lon: -0.1278 },
    globalRank: 2,
    financialSecrecyTier: 'MODERATE',
    assetsUnderMgmtTrillion: 11.8,
    dailyFxVolumeBillion: 2850,
    keyInstitutions: ['HSBC', 'Barclays', 'London Stock Exchange', 'Lloyds of London', 'Standard Chartered']
  },
  {
    id: 'fc-singapore',
    name: 'Singapore Marina Bay Financial Centre',
    city: 'Singapore',
    country: 'Singapore',
    coordinates: { lat: 1.2801, lon: 103.8509 },
    globalRank: 3,
    financialSecrecyTier: 'STRICT',
    assetsUnderMgmtTrillion: 4.8,
    dailyFxVolumeBillion: 820,
    keyInstitutions: ['DBS Bank', 'GIC Sovereign Fund', 'Temasek Holdings', 'OCBC', 'UOB']
  },
  {
    id: 'fc-hk',
    name: 'Hong Kong Central & Two IFC',
    city: 'Hong Kong',
    country: 'Hong Kong SAR',
    coordinates: { lat: 22.2855, lon: 114.1577 },
    globalRank: 4,
    financialSecrecyTier: 'MODERATE',
    assetsUnderMgmtTrillion: 3.9,
    dailyFxVolumeBillion: 640,
    keyInstitutions: ['AIA Group', 'Bank of China (HK)', 'HKMA', 'Hang Seng Bank']
  },
  {
    id: 'fc-tokyo',
    name: 'Tokyo Marunouchi & Otemachi',
    city: 'Tokyo',
    country: 'Japan',
    coordinates: { lat: 35.6812, lon: 139.7671 },
    globalRank: 5,
    financialSecrecyTier: 'OPEN',
    assetsUnderMgmtTrillion: 5.6,
    dailyFxVolumeBillion: 450,
    keyInstitutions: ['Mitsubishi UFJ (MUFG)', 'SMBC Group', 'Mizuho Financial', 'Nomura']
  },
  {
    id: 'fc-zurich',
    name: 'Zurich Paradeplatz & Geneva Private Banking',
    city: 'Zurich',
    country: 'Switzerland',
    coordinates: { lat: 47.3695, lon: 8.5388 },
    globalRank: 6,
    financialSecrecyTier: 'STRICT',
    assetsUnderMgmtTrillion: 3.1,
    dailyFxVolumeBillion: 210,
    keyInstitutions: ['UBS Group', 'Julius Baer', 'Pictet & Cie', 'Lombard Odier']
  },
  {
    id: 'fc-dubai',
    name: 'Dubai International Financial Centre (DIFC)',
    city: 'Dubai',
    country: 'United Arab Emirates',
    coordinates: { lat: 25.2104, lon: 55.2825 },
    globalRank: 7,
    financialSecrecyTier: 'STRICT',
    assetsUnderMgmtTrillion: 1.4,
    dailyFxVolumeBillion: 140,
    keyInstitutions: ['Emirates NBD', 'First Abu Dhabi Bank (FAB)', 'ADIA Fund', 'DIFC Courts']
  }
];

// Active Weather Systems & Cyclones
export const WEATHER_SYSTEMS: WeatherSystem[] = [
  {
    id: 'storm-1',
    name: 'Hurricane Oscar / North Atlantic Swell',
    category: 'Category 1 Hurricane',
    type: 'tropical_cyclone',
    coordinates: { lat: 21.4, lon: -72.6 },
    windSpeedKnots: 75,
    centralPressureMbar: 986,
    movementKnots: 11,
    radiusKm: 280,
    severity: 'WARNING',
    affectedLogistics: 'Caribbean maritime lanes, Bahamas container shipping, East Coast bunker operations.'
  },
  {
    id: 'typhoon-trami',
    name: 'Severe Tropical Storm Trami (Kristine)',
    category: 'Tropical Storm',
    type: 'typhoon',
    coordinates: { lat: 14.8, lon: 128.2 },
    windSpeedKnots: 55,
    centralPressureMbar: 990,
    movementKnots: 14,
    radiusKm: 650,
    severity: 'WARNING',
    affectedLogistics: 'Luzon Strait, Manila port terminals, South China Sea trans-shipping corridors.'
  }
];

// Critical Infrastructure Disruptions & Subsea Severances
export const INFRASTRUCTURE_OUTAGES: InfrastructureOutage[] = [
  {
    id: 'outage-redsea',
    title: 'Red Sea Subsea Cable Severances (Seacom, TGN-EA, AAE-1)',
    type: 'cable_cut',
    coordinates: { lat: 14.2, lon: 42.4 },
    affectedRegions: ['India', 'Middle East', 'East Africa', 'Southern Europe'],
    impactedTrafficPct: 24,
    severity: 'CRITICAL',
    timestamp: '2024-03-04T08:00:00Z',
    estimatedRestoration: 'Pending security clearance for marine repair vessels in Bab-el-Mandeb',
    cause: 'Dragging anchor from sunken cargo vessel Rubymar during maritime hostility.'
  },
  {
    id: 'outage-baltic',
    title: 'Balticconnector Gas Pipeline & EE-FI Telecom Cable Drag',
    type: 'power_grid',
    coordinates: { lat: 59.8, lon: 25.2 },
    affectedRegions: ['Finland', 'Estonia', 'Baltic Gas Grid'],
    impactedTrafficPct: 15,
    severity: 'MAJOR',
    timestamp: '2023-10-08T01:30:00Z',
    estimatedRestoration: 'Gas pipeline repaired; telecom fiber spare core operational',
    cause: 'External mechanical damage by anchor dragging from container ship Newnew Polar Bear.'
  }
];

// Natural Hazards & Seismic Activity
export const NATURAL_HAZARDS: NaturalHazard[] = [
  {
    id: 'quake-pacific',
    name: 'M6.6 Offshore Coquimbo Earthquake',
    type: 'earthquake',
    coordinates: { lat: -30.1, lon: -71.8 },
    magnitude: 6.6,
    depthKm: 28,
    severity: 'ALERT',
    timestamp: '2024-10-18T14:22:00Z',
    proximityToTrade: 'Near Chilean copper shipping terminals; no tsunami generated; port cranes inspected.'
  },
  {
    id: 'volcano-iceland',
    name: 'Reykjanes Volcanic Fissure Eruption',
    type: 'volcano',
    coordinates: { lat: 63.88, lon: -22.42 },
    severity: 'WATCH',
    timestamp: '2024-10-15T09:10:00Z',
    proximityToTrade: 'Grindavik zone; Keflavik International Airport air traffic operational with radar monitoring.'
  }
];

// Strategic Waterways
export const STRATEGIC_WATERWAYS: StrategicWaterway[] = [
  {
    id: 'kiel-canal',
    name: 'Kiel Canal (Nord-Ostsee-Kanal)',
    coordinates: { lat: 54.3, lon: 9.8 },
    lengthKm: 98,
    maxDraftMeters: 9.5,
    activeVesselsWaiting: 14,
    status: 'OPEN',
    annualTonnageMillion: 88
  },
  {
    id: 'st-lawrence',
    name: 'St. Lawrence Seaway',
    coordinates: { lat: 45.0, lon: -74.8 },
    lengthKm: 3700,
    maxDraftMeters: 8.08,
    activeVesselsWaiting: 8,
    status: 'OPEN',
    annualTonnageMillion: 44
  }
];

// Economic Sanctions & Watchlists
export const SANCTION_REGIMES: SanctionRegime[] = [
  {
    id: 'ofac-maritime',
    regimeName: 'OFAC G7 Maritime Crude Price Cap & Shadow Fleet',
    authority: 'OFAC',
    coordinates: { lat: 38.897, lon: -77.036 },
    flaggedCount: 184,
    targetedSectors: ['Russian crude transport', 'Maritime insurance P&I clubs', 'Flag-of-convenience registries'],
    shadowFleetTankersTracked: 620,
    enforcementLevel: 'SECONDARY_SANCTIONS',
    summary: 'Secondary sanctions targeting tankers loading Russian crude above $60/bbl threshold using deceptive AIS practices.'
  },
  {
    id: 'iran-oil',
    regimeName: 'US & EU Iranian Petroleum Export Sanctions',
    authority: 'OFAC',
    coordinates: { lat: 35.6892, lon: 51.389 },
    flaggedCount: 310,
    targetedSectors: ['Ship-to-ship crude transfers', 'Malacca strait transshipment', 'Front companies'],
    shadowFleetTankersTracked: 390,
    enforcementLevel: 'STRICT',
    summary: 'Designated vessels engaging in nighttime STS transfers off Fujairah and Riau Archipelago to disguise origin.'
  }
];

// Macroeconomic Indicators
export const MACRO_METRICS: MacroEconomicMetric[] = [
  {
    id: 'macro-usa',
    country: 'United States',
    code: 'USA',
    coordinates: { lat: 37.0902, lon: -95.7129 },
    gdpTrillion: 28.7,
    gdpGrowthPercent: 2.8,
    cpiInflationPercent: 2.4,
    debtToGdpPercent: 122.3,
    tenYearYieldPercent: 4.08,
    foreignReservesBillion: 242
  },
  {
    id: 'macro-chn',
    country: 'China',
    code: 'CHN',
    coordinates: { lat: 35.8617, lon: 104.1954 },
    gdpTrillion: 18.5,
    gdpGrowthPercent: 4.8,
    cpiInflationPercent: 0.4,
    debtToGdpPercent: 83.6,
    tenYearYieldPercent: 2.12,
    foreignReservesBillion: 3316
  },
  {
    id: 'macro-deu',
    country: 'Germany',
    code: 'DEU',
    coordinates: { lat: 51.1657, lon: 10.4515 },
    gdpTrillion: 4.5,
    gdpGrowthPercent: -0.2,
    cpiInflationPercent: 1.6,
    debtToGdpPercent: 63.7,
    tenYearYieldPercent: 2.18,
    foreignReservesBillion: 312
  },
  {
    id: 'macro-jpn',
    country: 'Japan',
    code: 'JPN',
    coordinates: { lat: 36.2048, lon: 138.2529 },
    gdpTrillion: 4.2,
    gdpGrowthPercent: 0.5,
    cpiInflationPercent: 2.5,
    debtToGdpPercent: 255.2,
    tenYearYieldPercent: 0.96,
    foreignReservesBillion: 1250
  },
  {
    id: 'macro-ind',
    country: 'India',
    code: 'IND',
    coordinates: { lat: 20.5937, lon: 78.9629 },
    gdpTrillion: 3.9,
    gdpGrowthPercent: 7.0,
    cpiInflationPercent: 5.49,
    debtToGdpPercent: 82.5,
    tenYearYieldPercent: 6.82,
    foreignReservesBillion: 701
  }
];

// Live Situation Updates Feed
export const SITUATION_EVENTS = [
  {
    id: 'sit-1',
    timestamp: '10:48 UTC',
    category: 'CABLES',
    title: 'Grace Hopper trans-Atlantic optical link operational at 350 Tbps throughput',
    level: 'INFO'
  },
  {
    id: 'sit-2',
    timestamp: '10:32 UTC',
    category: 'CHOKEPOINT',
    title: 'Bab-el-Mandeb: Combined Maritime Forces issue merchant advisory for vessel speed >18 kts',
    level: 'WARNING'
  },
  {
    id: 'sit-3',
    timestamp: '10:15 UTC',
    category: 'CENTRAL BANK',
    title: "People's Bank of China executes 25 bps Loan Prime Rate cut to 3.10%",
    level: 'UPDATE'
  },
  {
    id: 'sit-4',
    timestamp: '09:55 UTC',
    category: 'MARKETS',
    title: 'NYSE & NASDAQ pre-market tech equity volume exceeds $14.2B with semiconductors leading',
    level: 'INFO'
  },
  {
    id: 'sit-5',
    timestamp: '09:20 UTC',
    category: 'WEATHER',
    title: 'Hurricane Oscar tracking north-northwest past Bahamas; marine swell warnings active',
    level: 'WARNING'
  },
  {
    id: 'sit-6',
    timestamp: '08:44 UTC',
    category: 'PIPELINES',
    title: 'CPC Black Sea terminal confirms nominal tanker berthing schedule after mooring inspection',
    level: 'INFO'
  }
];
