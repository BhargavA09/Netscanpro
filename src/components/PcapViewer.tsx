import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Terminal,
  Play,
  Pause,
  RotateCcw,
  Search,
  Filter,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle2,
  Maximize2,
  Minimize2,
  FileCode,
  Layers,
  Activity,
  ArrowDownCircle,
  Wifi,
  Radio,
  Server,
  Zap,
  ShieldAlert,
  Sliders,
  X,
  MessageSquare,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';

// Wireshark Frame Dissection Types
export interface PcapPacketLayer {
  name: string;
  expanded?: boolean;
  byteRange?: [number, number]; // [startOffset, endOffset] in packet payload
  fields: {
    label: string;
    value: string;
    byteRange?: [number, number];
  }[];
}

export interface PcapPacket {
  no: number;
  timestampDelta: string;
  timestampEpoch: number;
  timestampUtc: string;
  source: string;
  destination: string;
  protocol: 'TCP' | 'UDP' | 'DNS' | 'TLSv1.3' | 'HTTP/2' | '802.11k RRM' | '802.11v BTM' | '802.11r FT' | 'ARP' | 'ICMP';
  length: number;
  info: string;
  colorClass: string;
  layers: PcapPacketLayer[];
  rawBytes: number[]; // Array of raw byte values (0-255)
  tcpStreamId?: number;
}

// Built-in Sample PCAP Scenarios
export interface PcapScenario {
  id: string;
  title: string;
  badge: string;
  description: string;
  interfaceName: string;
  packets: PcapPacket[];
}

// Helper: Convert byte array to formatted Wireshark Hex Dump lines
function formatHexDump(bytes: number[]): { offsetStr: string; hexPairs: string[]; asciiStr: string }[] {
  const lines: { offsetStr: string; hexPairs: string[]; asciiStr: string }[] = [];
  const chunkSize = 16;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    const offsetStr = i.toString(16).padStart(4, '0');
    
    const hexPairs: string[] = chunk.map(b => b.toString(16).padStart(2, '0'));
    
    // Pad hex pairs if less than 16
    while (hexPairs.length < 16) {
      hexPairs.push('  ');
    }

    const asciiStr = chunk.map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');

    lines.push({ offsetStr, hexPairs, asciiStr });
  }

  return lines;
}

// Generator for Rich Sample Packets
export const SAMPLE_PCAP_SCENARIOS: PcapScenario[] = [
  {
    id: 'wifi-roam-80211kvr',
    title: 'IEEE 802.11k/v/r Fast Roam Handshake',
    badge: '802.11ax / Fast BSS',
    interfaceName: 'wlan0 (5GHz Wi-Fi 6 HE80)',
    description: 'Active client roaming trajectory: 802.11k Neighbor Report query, 802.11v BSS Transition Steering request, and 802.11r Fast BSS Transition 4-way reassociation (28ms latency).',
    packets: [
      {
        no: 1,
        timestampDelta: '0.000000',
        timestampEpoch: 1713524000.100241,
        timestampUtc: '2026-10-19 11:15:00.100241',
        source: 'OpenWrt-Gateway (bc:24:11:8a:4f:01)',
        destination: 'Alex-MacBook-Pro (bc:d0:74:19:92:41)',
        protocol: '802.11k RRM',
        length: 64,
        info: 'Radio Measurement Request: Neighbor Report (Subtype: 0x05, Dialog Token: 14)',
        colorClass: 'bg-purple-950/40 text-purple-200 border-l-4 border-purple-500',
        tcpStreamId: undefined,
        rawBytes: [
          0x00, 0x00, 0x24, 0x00, 0x2f, 0x40, 0x00, 0xa0, 0x20, 0x08, 0x00, 0x00, 0x00, 0x02, 0x6c, 0x09,
          0xa0, 0x00, 0x9c, 0x00, 0x00, 0x00, 0xa0, 0x00, 0xd0, 0x00, 0x3a, 0x01, 0xbc, 0x24, 0x11, 0x8a,
          0x4f, 0x01, 0xbc, 0xd0, 0x74, 0x19, 0x92, 0x41, 0xbc, 0x24, 0x11, 0x8a, 0x4f, 0x01, 0x00, 0x00,
          0x05, 0x01, 0x0e, 0x27, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ],
        layers: [
          {
            name: 'Frame 1: 64 bytes on wire (512 bits), 64 bytes captured on interface wlan0',
            byteRange: [0, 63],
            fields: [
              { label: 'Interface id', value: '0 (wlan0)' },
              { label: 'Encapsulation type', value: 'IEEE 802.11 plus radiotap radio header (23)' },
              { label: 'Arrival Time', value: '2026-10-19 11:15:00.100241 UTC' },
              { label: 'Epoch Time', value: '1713524000.100241000 seconds' },
              { label: '[Time delta from previous captured frame]', value: '0.000000000 seconds' },
              { label: 'Frame Length', value: '64 bytes (512 bits)' }
            ]
          },
          {
            name: 'Radiotap Header v0, Length 36, Channel: 36 (5180 MHz, 80MHz)',
            byteRange: [0, 35],
            fields: [
              { label: 'Header version', value: '0' },
              { label: 'Header pad', value: '0' },
              { label: 'Header length', value: '36' },
              { label: 'Present flags', value: '0x200800a0' },
              { label: 'MAC timestamp', value: '158084105' },
              { label: 'Channel frequency', value: '5180 MHz [Channel 36]' },
              { label: 'Channel flags', value: '0x00a0 (5 GHz spectrum, OFDM)' },
              { label: 'Antenna signal', value: '-48 dBm' },
              { label: 'PHY type', value: '802.11ax High Efficiency (HE)' }
            ]
          },
          {
            name: 'IEEE 802.11 Action frame (Subtype: 0x0d)',
            byteRange: [36, 63],
            fields: [
              { label: 'Type/Subtype', value: 'Action (0x000d)' },
              { label: 'Frame Control Field', value: '0xd000 (Management)' },
              { label: 'Duration', value: '314 microseconds' },
              { label: 'Receiver address', value: 'bc:d0:74:19:92:41 (Alex-MacBook-Pro)' },
              { label: 'Transmitter address', value: 'bc:24:11:8a:4f:01 (OpenWrt-GW)' },
              { label: 'BSS Id', value: 'bc:24:11:8a:4f:01' },
              { label: 'Sequence number', value: '1042' }
            ]
          },
          {
            name: 'IEEE 802.11k Radio Resource Management (Category: 0x05)',
            byteRange: [48, 63],
            fields: [
              { label: 'Category', value: 'Radio Measurement (0x05)' },
              { label: 'Action', value: 'Neighbor Report Request (0x01)' },
              { label: 'Dialog Token', value: '14' },
              { label: 'Requested SSID', value: 'Sentinel_Secure_Mesh_5G' }
            ]
          }
        ]
      },
      {
        no: 2,
        timestampDelta: '0.003412',
        timestampEpoch: 1713524000.103653,
        timestampUtc: '2026-10-19 11:15:00.103653',
        source: 'Alex-MacBook-Pro (bc:d0:74:19:92:41)',
        destination: 'OpenWrt-Gateway (bc:24:11:8a:4f:01)',
        protocol: '802.11k RRM',
        length: 98,
        info: 'Radio Measurement Report: Neighbor BSSID Candidate List (BC:24:11:8A:4F:02 Office AP, SNR: 44dB)',
        colorClass: 'bg-purple-950/40 text-purple-200 border-l-4 border-purple-500',
        rawBytes: [
          0x00, 0x00, 0x24, 0x00, 0x2f, 0x40, 0x00, 0xa0, 0x20, 0x08, 0x00, 0x00, 0x00, 0x02, 0x6c, 0x09,
          0xbc, 0xd0, 0x74, 0x19, 0x92, 0x41, 0xbc, 0x24, 0x11, 0x8a, 0x4f, 0x01, 0xbc, 0x24, 0x11, 0x8a,
          0x05, 0x02, 0x0e, 0x34, 0x0f, 0xbc, 0x24, 0x11, 0x8a, 0x4f, 0x02, 0x01, 0x00, 0x00, 0x00, 0x24,
          0x51, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00
        ],
        layers: [
          {
            name: 'Frame 2: 98 bytes on wire on interface wlan0',
            fields: [
              { label: 'Arrival Time', value: '2026-10-19 11:15:00.103653 UTC' },
              { label: 'Frame Length', value: '98 bytes' }
            ]
          },
          {
            name: 'IEEE 802.11k Radio Measurement Report (Category: 0x05)',
            fields: [
              { label: 'Action', value: 'Neighbor Report Response (0x02)' },
              { label: 'Candidate BSSID', value: 'bc:24:11:8a:4f:02 (Office Satellite AP)' },
              { label: 'Operating Class', value: '115 (5 GHz UNII-1)' },
              { label: 'Channel Number', value: '44 (5220 MHz)' },
              { label: 'PHY Type', value: 'HE (High Efficiency 802.11ax)' },
              { label: 'Candidate SNR', value: '44 dB' },
              { label: 'Security Domain', value: 'WPA3-SAE Fast Transition (FT-SAE)' }
            ]
          }
        ]
      },
      {
        no: 3,
        timestampDelta: '0.012890',
        timestampEpoch: 1713524000.113131,
        timestampUtc: '2026-10-19 11:15:00.113131',
        source: 'OpenWrt-Gateway (bc:24:11:8a:4f:01)',
        destination: 'Alex-MacBook-Pro (bc:d0:74:19:92:41)',
        protocol: '802.11v BTM',
        length: 78,
        info: 'BSS Transition Management Request: Candidate Preference=255, Steering Disassoc Imminent=0',
        colorClass: 'bg-cyan-950/40 text-cyan-200 border-l-4 border-cyan-500',
        rawBytes: [
          0x00, 0x00, 0x24, 0x00, 0x2f, 0x40, 0x00, 0xa0, 0x0a, 0x07, 0x01, 0x00, 0x00, 0x00, 0xbc, 0x24,
          0x11, 0x8a, 0x4f, 0x02, 0xff, 0x00, 0x00, 0x00, 0x36, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
          0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
          0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27,
          0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35
        ],
        layers: [
          {
            name: 'IEEE 802.11v Wireless Network Management (Category: 0x0a)',
            fields: [
              { label: 'Category', value: 'WNM (0x0a)' },
              { label: 'Action', value: 'BSS Transition Management Request (0x07)' },
              { label: 'Dialog Token', value: '1' },
              { label: 'Request Mode', value: 'Preferred Candidate List Included (0x01)' },
              { label: 'Disassociation Timer', value: '0 (Steering Advisory)' },
              { label: 'Target BSSID', value: 'bc:24:11:8a:4f:02' },
              { label: 'Candidate Preference', value: '255 (Highest Recommendation)' }
            ]
          }
        ]
      },
      {
        no: 4,
        timestampDelta: '0.028410',
        timestampEpoch: 1713524000.128651,
        timestampUtc: '2026-10-19 11:15:00.128651',
        source: 'Alex-MacBook-Pro (bc:d0:74:19:92:41)',
        destination: 'Office-AP (bc:24:11:8a:4f:02)',
        protocol: '802.11r FT',
        length: 112,
        info: 'Fast BSS Transition: FT Authentication Request (PMK-R1 Derivation, SNonce exchange)',
        colorClass: 'bg-emerald-950/40 text-emerald-200 border-l-4 border-emerald-500',
        rawBytes: [
          0x00, 0x00, 0x24, 0x00, 0x2f, 0x40, 0x00, 0xa0, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00,
          0x37, 0x24, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
          0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
          0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00, 0x4f, 0x70, 0x65, 0x6e, 0x57, 0x72, 0x74, 0x2d,
          0x52, 0x30, 0x4b, 0x48, 0x2d, 0x49, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ],
        layers: [
          {
            name: 'IEEE 802.11r Fast BSS Transition (FT)',
            fields: [
              { label: 'Authentication Algorithm', value: 'Fast BSS Transition (0x0002)' },
              { label: 'Authentication SEQ', value: '1 (FT Request Over-the-Air)' },
              { label: 'Status Code', value: 'Successful (0x0000)' },
              { label: 'Mobility Domain Element (MDE)', value: 'MDID: 0x4a12, Over-the-DS: 0, Resource Request: 0' },
              { label: 'Fast Transition Element (FTE)', value: 'MIC: 16 bytes [Valid]' },
              { label: 'SNonce', value: '11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff:00' },
              { label: 'R0KH-ID', value: 'OpenWrt-R0KH-ID' },
              { label: 'Roam Latency Result', value: '28.41 ms (Zero packet loss)' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'c2-volt-typhoon',
    title: 'Volt Typhoon C2 Beaconing (HTTPS TLS 1.3)',
    badge: 'APT / C2 Beacon',
    interfaceName: 'eth0 (WAN 1.0 Gbps)',
    description: 'Suspicious beaconing cycle from local host 192.168.1.45 to external IP 185.162.228.45 over TLS 1.3 with JA4 fingerprint anomaly.',
    packets: [
      {
        no: 101,
        timestampDelta: '0.000000',
        timestampEpoch: 1713524100.000000,
        timestampUtc: '2026-10-19 11:16:40.000000',
        source: '192.168.1.45:54128',
        destination: '185.162.228.45:443',
        protocol: 'TCP',
        length: 74,
        info: '54128 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM=1 WS=128',
        colorClass: 'bg-indigo-950/40 text-indigo-200 border-l-4 border-indigo-500',
        tcpStreamId: 1,
        rawBytes: [
          0x00, 0x50, 0x56, 0xc0, 0x00, 0x08, 0xbc, 0x24, 0x11, 0x8a, 0x4f, 0x01, 0x08, 0x00, 0x45, 0x00,
          0x00, 0x3c, 0x9a, 0x12, 0x40, 0x00, 0x40, 0x06, 0x3d, 0x7c, 0xc0, 0xa8, 0x01, 0x2d, 0xb9, 0xa2,
          0xe4, 0x2d, 0xd3, 0x70, 0x01, 0xbb, 0x38, 0x12, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0xa0, 0x02,
          0xfa, 0xf0, 0xa1, 0x2b, 0x00, 0x00, 0x02, 0x04, 0x05, 0xb4, 0x04, 0x02, 0x08, 0x0a, 0x1a, 0x2b,
          0x3c, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x01, 0x03, 0x03, 0x07
        ],
        layers: [
          {
            name: 'Frame 101: 74 bytes on wire on interface eth0',
            fields: [
              { label: 'Arrival Time', value: '2026-10-19 11:16:40.000000 UTC' },
              { label: 'Protocols in frame', value: 'eth:ethertype:ip:tcp' }
            ]
          },
          {
            name: 'Ethernet II, Src: bc:24:11:8a:4f:01, Dst: 00:50:56:c0:00:08',
            fields: [
              { label: 'Destination', value: '00:50:56:c0:00:08 (VMware Virtual MAC)' },
              { label: 'Source', value: 'bc:24:11:8a:4f:01 (Local Gateway)' },
              { label: 'Type', value: 'IPv4 (0x0800)' }
            ]
          },
          {
            name: 'Internet Protocol Version 4, Src: 192.168.1.45, Dst: 185.162.228.45',
            fields: [
              { label: 'Version', value: '4' },
              { label: 'Header Length', value: '20 bytes (5)' },
              { label: 'Total Length', value: '60' },
              { label: 'Identification', value: '0x9a12 (39442)' },
              { label: 'Flags', value: '0x4000 (Don\'t Fragment)' },
              { label: 'Time to Live', value: '64' },
              { label: 'Protocol', value: 'TCP (6)' },
              { label: 'Header Checksum', value: '0x3d7c [correct]' }
            ]
          },
          {
            name: 'Transmission Control Protocol, Src Port: 54128, Dst Port: 443',
            fields: [
              { label: 'Source Port', value: '54128' },
              { label: 'Destination Port', value: '443 (HTTPS)' },
              { label: 'Sequence Number', value: '0 (relative sequence number)' },
              { label: 'TCP Flags', value: '0x002 (SYN)' },
              { label: 'Window Size', value: '64240' },
              { label: 'Maximum Segment Size', value: '1460 bytes' }
            ]
          }
        ]
      },
      {
        no: 102,
        timestampDelta: '0.014210',
        timestampEpoch: 1713524100.014210,
        timestampUtc: '2026-10-19 11:16:40.014210',
        source: '185.162.228.45:443',
        destination: '192.168.1.45:54128',
        protocol: 'TCP',
        length: 74,
        info: '443 → 54128 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460 SACK_PERM=1 WS=256',
        colorClass: 'bg-indigo-950/40 text-indigo-200 border-l-4 border-indigo-500',
        tcpStreamId: 1,
        rawBytes: [
          0xbc, 0x24, 0x11, 0x8a, 0x4f, 0x01, 0x00, 0x50, 0x56, 0xc0, 0x00, 0x08, 0x08, 0x00, 0x45, 0x00,
          0x00, 0x3c, 0x00, 0x00, 0x40, 0x00, 0x36, 0x06, 0xe1, 0x9b, 0xb9, 0xa2, 0xe4, 0x2d, 0xc0, 0xa8,
          0x01, 0x2d, 0x01, 0xbb, 0xd3, 0x70, 0x78, 0x12, 0x99, 0x41, 0x38, 0x12, 0x44, 0x01, 0xa0, 0x12,
          0xff, 0xff, 0x22, 0x18, 0x00, 0x00, 0x02, 0x04, 0x05, 0xb4, 0x04, 0x02, 0x08, 0x0a, 0x55, 0x66,
          0x77, 0x88, 0x1a, 0x2b, 0x3c, 0x4d, 0x01, 0x03, 0x03, 0x08
        ],
        layers: [
          {
            name: 'Transmission Control Protocol, Src Port: 443, Dst Port: 54128',
            fields: [
              { label: 'Source Port', value: '443' },
              { label: 'Destination Port', value: '54128' },
              { label: 'Flags', value: '0x012 (SYN, ACK)' },
              { label: 'Window Size', value: '65535' },
              { label: 'Acknowledgment Number', value: '1' }
            ]
          }
        ]
      },
      {
        no: 103,
        timestampDelta: '0.019480',
        timestampEpoch: 1713524100.019480,
        timestampUtc: '2026-10-19 11:16:40.019480',
        source: '192.168.1.45:54128',
        destination: '185.162.228.45:443',
        protocol: 'TLSv1.3',
        length: 517,
        info: 'Client Hello (SNI=api-telemetry-sync.xyz, JA4=t13d1516h2_8daaf6152771_b4b60a2d5918)',
        colorClass: 'bg-pink-950/40 text-pink-200 border-l-4 border-pink-500',
        tcpStreamId: 1,
        rawBytes: [
          0x00, 0x50, 0x56, 0xc0, 0x00, 0x08, 0xbc, 0x24, 0x11, 0x8a, 0x4f, 0x01, 0x08, 0x00, 0x45, 0x00,
          0x02, 0x05, 0x9a, 0x14, 0x40, 0x00, 0x40, 0x06, 0x3b, 0xb1, 0xc0, 0xa8, 0x01, 0x2d, 0xb9, 0xa2,
          0xe4, 0x2d, 0xd3, 0x70, 0x01, 0xbb, 0x38, 0x12, 0x44, 0x01, 0x78, 0x12, 0x99, 0x42, 0x80, 0x18,
          0x01, 0xf5, 0x8d, 0x31, 0x00, 0x00, 0x16, 0x03, 0x01, 0x01, 0xc8, 0x01, 0x00, 0x01, 0xc4, 0x03,
          0x03, 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd,
          0xef, 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd,
          0x20, 0x4f, 0x70, 0x65, 0x6e, 0x57, 0x72, 0x74, 0x2d, 0x54, 0x4c, 0x53, 0x2d, 0x53, 0x65, 0x73,
          0x73, 0x69, 0x6f, 0x6e, 0x2d, 0x49, 0x44, 0x2d, 0x54, 0x65, 0x73, 0x74, 0x69, 0x6e, 0x67, 0x21,
          0x00, 0x28, 0x13, 0x01, 0x13, 0x02, 0x13, 0x03, 0xc0, 0x2b, 0xc0, 0x2f, 0xc0, 0x0a, 0xc0, 0x09,
          0xc0, 0x13, 0xc0, 0x14, 0x00, 0x9c, 0x00, 0x9d, 0x00, 0x2f, 0x00, 0x35, 0x01, 0x00, 0x01, 0x53,
          0x00, 0x00, 0x00, 0x1a, 0x00, 0x18, 0x00, 0x00, 0x15, 0x61, 0x70, 0x69, 0x2d, 0x74, 0x65, 0x6c,
          0x65, 0x6d, 0x65, 0x74, 0x72, 0x79, 0x2d, 0x73, 0x79, 0x6e, 0x63, 0x2e, 0x78, 0x79, 0x7a
        ],
        layers: [
          {
            name: 'Transport Layer Security (TLS 1.3 Record Layer: Handshake Protocol: Client Hello)',
            byteRange: [54, 180],
            fields: [
              { label: 'Content Type', value: 'Handshake (22)' },
              { label: 'Version', value: 'TLS 1.0 (0x0301) [Legacy Record Compatibility]' },
              { label: 'Length', value: '456 bytes' },
              { label: 'Handshake Type', value: 'Client Hello (1)' },
              { label: 'Extension: server_name (len=24)', value: 'api-telemetry-sync.xyz' },
              { label: 'Extension: supported_versions (len=5)', value: 'TLS 1.3 (0x0304), TLS 1.2 (0x0303)' },
              { label: 'JA4 Fingerprint', value: 't13d1516h2_8daaf6152771_b4b60a2d5918 [Known Lumma/Volt C2]' },
              { label: 'Verdict', value: '⚠️ ALERT: High entropy beaconing detected by Deep Packet Inspection' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'dns-amplification-ddos',
    title: '2.42 Tbps DNS Amplification Flood Stream',
    badge: 'DDoS / Anycast Reflection',
    interfaceName: 'eth0 (WAN Mirror)',
    description: 'Volumetric reflection flood: spoofed source requests with EDNS0 payload buffers exceeding 4096 bytes causing 70x amplification.',
    packets: [
      {
        no: 201,
        timestampDelta: '0.000000',
        timestampEpoch: 1713524200.000000,
        timestampUtc: '2026-10-19 11:17:10.000000',
        source: '8.8.8.8:53',
        destination: '192.168.1.1:53',
        protocol: 'DNS',
        length: 4096,
        info: 'Standard query response 0x1a2b ANY isc.org OPT [UDP Buffer Size=4096] TXT RRSIG RRSIG RRSIG',
        colorClass: 'bg-sky-950/40 text-sky-200 border-l-4 border-sky-500',
        rawBytes: [
          0x00, 0x50, 0x56, 0xc0, 0x00, 0x08, 0xbc, 0x24, 0x11, 0x8a, 0x4f, 0x01, 0x08, 0x00, 0x45, 0x00,
          0x10, 0x00, 0x33, 0x44, 0x00, 0x00, 0x38, 0x11, 0x90, 0x12, 0x08, 0x08, 0x08, 0x08, 0xc0, 0xa8,
          0x01, 0x01, 0x00, 0x35, 0x00, 0x35, 0x0f, 0xec, 0x00, 0x00, 0x1a, 0x2b, 0x81, 0x80, 0x00, 0x01,
          0x00, 0x18, 0x00, 0x04, 0x00, 0x01, 0x03, 0x69, 0x73, 0x63, 0x03, 0x6f, 0x72, 0x67, 0x00, 0x00,
          0xff, 0x00, 0x01, 0xc0, 0x0c, 0x00, 0x10, 0x00, 0x01, 0x00, 0x00, 0x0e, 0x10, 0x00, 0x64, 0x61
        ],
        layers: [
          {
            name: 'Domain Name System (response)',
            fields: [
              { label: 'Transaction ID', value: '0x1a2b' },
              { label: 'Flags', value: '0x8180 (Standard query response, No error)' },
              { label: 'Questions', value: '1' },
              { label: 'Answer RRs', value: '24' },
              { label: 'Additional RRs', value: '1 (EDNS0)' },
              { label: 'EDNS0 UDP Payload Size', value: '4096 bytes (Amplification factor: 68x)' },
              { label: 'DDoS Signature', value: 'MATCH: Generic.DNS.Amplification.ANY.Response' }
            ]
          }
        ]
      }
    ]
  }
];

export function PcapViewer({
  className,
  onClose,
  initialScenarioId
}: {
  className?: string;
  onClose?: () => void;
  initialScenarioId?: string;
}) {
  // Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenarioId || 'wifi-roam-80211kvr');
  const activeScenario = useMemo(() => {
    return SAMPLE_PCAP_SCENARIOS.find(s => s.id === selectedScenarioId) || SAMPLE_PCAP_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Packets Buffer
  const [packetBuffer, setPacketBuffer] = useState<PcapPacket[]>(activeScenario.packets);
  const [selectedPacketIndex, setSelectedPacketIndex] = useState<number>(0);
  const selectedPacket = packetBuffer[selectedPacketIndex] || packetBuffer[0];

  // Capture State
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [selectedInterface, setSelectedInterface] = useState<string>('wlan0 (5GHz Wi-Fi 6 HE80)');
  const [timeDisplayFormat, setTimeDisplayFormat] = useState<'delta' | 'utc' | 'epoch'>('delta');

  // Filter State (Wireshark BPF / Display Filter)
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [appliedFilter, setAppliedFilter] = useState<string>('');
  const [filterSyntaxValid, setFilterSyntaxValid] = useState<boolean>(true);

  // Deep inspection highlighting
  const [highlightedByteRange, setHighlightedByteRange] = useState<[number, number] | null>(null);
  const [hoveredByteOffset, setHoveredByteOffset] = useState<number | null>(null);

  // Modals & Panels
  const [showStreamFollower, setShowStreamFollower] = useState<boolean>(false);
  const [showFindModal, setShowFindModal] = useState<boolean>(false);
  const [findSearchTerm, setFindSearchTerm] = useState<string>('');
  const [showStatsDrawer, setShowStatsDrawer] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // Refs
  const packetListContainerRef = useRef<HTMLDivElement | null>(null);

  // When scenario changes, update packet buffer
  useEffect(() => {
    setPacketBuffer(activeScenario.packets);
    setSelectedPacketIndex(0);
    setSelectedInterface(activeScenario.interfaceName);
  }, [activeScenario]);

  // Validate Wireshark Filter Syntax in Real Time
  useEffect(() => {
    if (!filterQuery.trim()) {
      setFilterSyntaxValid(true);
      return;
    }
    const q = filterQuery.toLowerCase().trim();
    const validTokens = [
      'tcp', 'udp', 'dns', 'tls', 'http', 'wlan', 'arp', 'icmp', 'ip.addr', 'ip.src', 'ip.dst',
      'tcp.port', 'udp.port', 'tcp.flags.syn', '802.11', 'frame.len', 'c2'
    ];
    // Check if query contains any valid token or basic syntax
    const isValid = validTokens.some(token => q.includes(token)) || q.includes('==') || q.includes('contains');
    setFilterSyntaxValid(isValid);
  }, [filterQuery]);

  // Live Packet Simulation Stream (Generates realistic periodic packets when live capture is enabled)
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      setPacketBuffer(prev => {
        if (prev.length >= 250) return prev; // Keep memory reasonable
        const lastNo = prev.length > 0 ? prev[prev.length - 1].no : 0;
        const lastDelta = prev.length > 0 ? parseFloat(prev[prev.length - 1].timestampDelta) : 0;
        const nextNo = lastNo + 1;
        const nextDelta = (lastDelta + 0.045 + Math.random() * 0.08).toFixed(6);

        // Protocols pool for simulation
        const samplePool = activeScenario.packets;
        const base = samplePool[Math.floor(Math.random() * samplePool.length)];

        const newPkt: PcapPacket = {
          ...base,
          no: nextNo,
          timestampDelta: nextDelta,
          timestampEpoch: Date.now() / 1000,
          timestampUtc: new Date().toISOString().replace('T', ' ').substring(0, 23),
          rawBytes: [...base.rawBytes]
        };

        const updated = [...prev, newPkt];
        return updated;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [isCapturing, activeScenario]);

  // Auto-scroll packet table when new packets arrive
  useEffect(() => {
    if (autoScroll && packetListContainerRef.current) {
      packetListContainerRef.current.scrollTop = packetListContainerRef.current.scrollHeight;
    }
  }, [packetBuffer.length, autoScroll]);

  // Keyboard navigation: Up/Down arrow keys to inspect packets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedPacketIndex(prev => Math.min(packetBuffer.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedPacketIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [packetBuffer.length]);

  // Filtered Packets based on Display Filter
  const filteredPackets = useMemo(() => {
    if (!appliedFilter.trim()) return packetBuffer;
    const f = appliedFilter.toLowerCase().trim();

    return packetBuffer.filter(pkt => {
      if (f === 'dns') return pkt.protocol.includes('DNS');
      if (f === 'tcp') return pkt.protocol.includes('TCP');
      if (f === 'udp') return pkt.protocol.includes('UDP');
      if (f === 'tls') return pkt.protocol.includes('TLS');
      if (f.includes('wlan') || f.includes('802.11')) return pkt.protocol.includes('802.11');
      if (f === 'arp') return pkt.protocol.includes('ARP');
      if (f === 'icmp') return pkt.protocol.includes('ICMP');
      if (f.includes('==')) {
        const parts = f.split('==').map(s => s.trim());
        if (parts.length === 2) {
          const val = parts[1].replace(/['"]/g, '');
          return pkt.source.toLowerCase().includes(val) ||
                 pkt.destination.toLowerCase().includes(val) ||
                 pkt.info.toLowerCase().includes(val);
        }
      }
      return pkt.source.toLowerCase().includes(f) ||
             pkt.destination.toLowerCase().includes(f) ||
             pkt.protocol.toLowerCase().includes(f) ||
             pkt.info.toLowerCase().includes(f);
    });
  }, [packetBuffer, appliedFilter]);

  // Protocol Breakdown Statistics
  const protocolStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalBytes = 0;

    packetBuffer.forEach(p => {
      counts[p.protocol] = (counts[p.protocol] || 0) + 1;
      totalBytes += p.length;
    });

    return {
      totalPackets: packetBuffer.length,
      totalBytes,
      counts
    };
  }, [packetBuffer]);

  // Export PCAP file generator (Real PCAP header + packet frames)
  const handleExportPcap = (format: 'pcap' | 'json') => {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packetBuffer, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sentinel-capture-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return;
    }

    // Binary PCAP standard format export
    // PCAP Global Header: Magic (0xa1b2c3d4), Version Major (2), Minor (4), SnapLen (65535), LinkType (1 = Ethernet, 105 = 802.11)
    const headerBytes = [
      0xd4, 0xc3, 0xb2, 0xa1, // Magic Number
      0x02, 0x00,             // Version Major (2)
      0x04, 0x00,             // Version Minor (4)
      0x00, 0x00, 0x00, 0x00, // Thiszone
      0x00, 0x00, 0x00, 0x00, // Sigfigs
      0xff, 0xff, 0x00, 0x00, // Snaplen (65535)
      0x01, 0x00, 0x00, 0x00  // Network: LINKTYPE_ETHERNET
    ];

    const allBytes: number[] = [...headerBytes];

    packetBuffer.forEach(pkt => {
      const sec = Math.floor(pkt.timestampEpoch);
      const usec = Math.floor((pkt.timestampEpoch - sec) * 1000000);
      const len = pkt.rawBytes.length;

      // Packet Header (16 bytes)
      allBytes.push(
        sec & 0xff, (sec >> 8) & 0xff, (sec >> 16) & 0xff, (sec >> 24) & 0xff,
        usec & 0xff, (usec >> 8) & 0xff, (usec >> 16) & 0xff, (usec >> 24) & 0xff,
        len & 0xff, (len >> 8) & 0xff, (len >> 16) & 0xff, (len >> 24) & 0xff,
        len & 0xff, (len >> 8) & 0xff, (len >> 16) & 0xff, (len >> 24) & 0xff
      );
      // Packet Payload
      allBytes.push(...pkt.rawBytes);
    });

    const uint8Array = new Uint8Array(allBytes);
    const blob = new Blob([uint8Array], { type: 'application/vnd.tcpdump.pcap' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `sentinel-capture-${Date.now()}.pcap`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const copyHexBytes = (format: 'raw' | 'hex' | 'c-array') => {
    if (!selectedPacket) return;
    let output = '';

    if (format === 'raw') {
      output = selectedPacket.rawBytes.map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
    } else if (format === 'hex') {
      output = selectedPacket.rawBytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
    } else {
      output = 'unsigned char packet_payload[] = {\n  ' +
        selectedPacket.rawBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ') +
        '\n};';
    }

    navigator.clipboard.writeText(output);
    setCopiedState(format);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const formattedHexLines = useMemo(() => {
    if (!selectedPacket) return [];
    return formatHexDump(selectedPacket.rawBytes);
  }, [selectedPacket]);

  return (
    <div className={cn(
      "w-full bg-[#0a0e17] text-slate-200 border border-border/80 rounded-2xl flex flex-col overflow-hidden font-sans shadow-2xl transition-all",
      isMaximized ? "fixed inset-2 z-50 h-[calc(100vh-1rem)]" : "h-[740px]",
      className
    )}>
      
      {/* 1. TOP WIRESHARK SYSTEM MENU BAR */}
      <div className="h-8 bg-[#070a10] border-b border-border/60 flex items-center justify-between px-3 text-[11px] font-mono select-none">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5 font-bold text-sky-400">
            <span className="text-base leading-none">🦈</span>
            <span>Wireshark PCAP Dissector</span>
            <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-normal">v4.2.4-PRO</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span className="hover:text-white cursor-pointer">File</span>
            <span className="hover:text-white cursor-pointer">Edit</span>
            <span className="hover:text-white cursor-pointer">View</span>
            <span className="hover:text-white cursor-pointer">Capture</span>
            <span className="hover:text-white cursor-pointer">Analyze</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setShowStatsDrawer(!showStatsDrawer)}>Statistics</span>
            <span className="hover:text-white cursor-pointer">Telephony</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scenario Selector Dropdown */}
          <div className="flex items-center gap-1 bg-[#0f172a] border border-border px-2 py-0.5 rounded text-[11px]">
            <span className="text-muted-foreground">Scenario:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="bg-transparent text-white font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              {SAMPLE_PCAP_SCENARIOS.map(sc => (
                <option key={sc.id} value={sc.id} className="bg-[#0b121e] text-white">
                  {sc.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-white transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded text-muted-foreground transition-colors"
              title="Close Viewer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. ICONIC WIRESHARK ACTION TOOLBAR */}
      <div className="h-10 bg-[#0c121e] border-b border-border/80 flex items-center justify-between px-3 gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          {/* Start / Stop Capture */}
          {isCapturing ? (
            <button
              onClick={() => setIsCapturing(false)}
              className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md flex items-center gap-1 text-xs font-semibold shadow-md transition-colors"
              title="Stop live packet capture"
            >
              <Pause className="h-3.5 w-3.5" />
              <span className="text-[11px] font-mono">Stop</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCapturing(true)}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md flex items-center gap-1 text-xs font-semibold shadow-md transition-colors"
              title="Start live packet capture"
            >
              <Play className="h-3.5 w-3.5" />
              <span className="text-[11px] font-mono">Capture</span>
            </button>
          )}

          {/* Restart */}
          <button
            onClick={() => {
              setPacketBuffer([]);
              setSelectedPacketIndex(0);
              setIsCapturing(true);
            }}
            className="p-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-md text-xs font-mono transition-colors"
            title="Restart capture buffer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-all",
              autoScroll
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
            )}
            title="Automatically scroll to latest packet"
          >
            <ArrowDownCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Auto-Scroll</span>
          </button>

          {/* Time Format Switcher */}
          <button
            onClick={() => {
              setTimeDisplayFormat(prev => prev === 'delta' ? 'utc' : prev === 'utc' ? 'epoch' : 'delta');
            }}
            className="px-2 py-1 rounded text-[11px] font-mono bg-secondary hover:bg-secondary/80 text-foreground border border-border/60"
            title="Cycle Time Display: Delta → UTC → Epoch"
          >
            Time: {timeDisplayFormat.toUpperCase()}
          </button>

          {/* Follow Stream Button */}
          {selectedPacket?.tcpStreamId !== undefined && (
            <button
              onClick={() => setShowStreamFollower(true)}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 transition-colors"
              title="Reassemble conversation payload"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Follow TCP Stream #{selectedPacket.tcpStreamId}</span>
            </button>
          )}

          {/* Statistics Button */}
          <button
            onClick={() => setShowStatsDrawer(!showStatsDrawer)}
            className={cn(
              "px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-colors",
              showStatsDrawer ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-secondary text-foreground border-border/60"
            )}
          >
            <Activity className="h-3 w-3" />
            <span className="hidden md:inline">Protocol Stats</span>
          </button>
        </div>

        {/* Right side: Interface & PCAP Export */}
        <div className="flex items-center gap-2">
          {/* Interface pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#070a10] border border-border text-[11px] font-mono text-muted-foreground">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            <span>{selectedInterface}</span>
          </div>

          {/* Export Dropdown */}
          <button
            onClick={() => handleExportPcap('pcap')}
            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[11px] font-mono font-bold flex items-center gap-1 shadow transition-colors"
            title="Download authentic .pcap binary file"
          >
            <Download className="h-3 w-3" />
            <span>Export .PCAP</span>
          </button>

          <button
            onClick={() => handleExportPcap('json')}
            className="px-2 py-1 bg-secondary hover:bg-secondary/80 text-foreground rounded text-[11px] font-mono transition-colors"
            title="Export packets as JSON"
          >
            JSON
          </button>
        </div>
      </div>

      {/* 3. WIRESHARK BPF / DISPLAY FILTER BAR (Authentic Green Valid / Red Invalid Bar) */}
      <div className="h-10 bg-[#090e18] border-b border-border flex items-center px-3 gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-muted-foreground">
          <Filter className="h-3.5 w-3.5 text-sky-400" />
          <span className="hidden sm:inline">Apply display filter:</span>
        </div>

        {/* Filter Input Box */}
        <div className={cn(
          "flex-1 flex items-center border rounded-md px-2.5 py-1 text-xs font-mono transition-all",
          appliedFilter
            ? "border-emerald-500/80 bg-emerald-950/25 text-emerald-200"
            : filterSyntaxValid
              ? "border-border/80 bg-[#05080f] text-foreground focus-within:border-emerald-500"
              : "border-rose-500 bg-rose-950/30 text-rose-200"
        )}>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setAppliedFilter(filterQuery);
              }
            }}
            placeholder='e.g., tcp.port == 443 || dns || wlan.fc.type_subtype == 0x08'
            className="w-full bg-transparent focus:outline-none placeholder:text-muted-foreground/50 text-xs font-mono"
          />
          {filterQuery && (
            <button
              onClick={() => {
                setFilterQuery('');
                setAppliedFilter('');
              }}
              className="text-muted-foreground hover:text-white p-0.5 text-xs"
              title="Clear Filter"
            >
              ✕
            </button>
          )}
        </div>

        {/* Apply Button */}
        <button
          onClick={() => setAppliedFilter(filterQuery)}
          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-mono font-bold transition-colors"
        >
          Apply
        </button>

        {/* Quick Filter Presets */}
        <div className="hidden xl:flex items-center gap-1">
          {['tcp', 'dns', 'tls', 'wlan', 'arp'].map(proto => (
            <button
              key={proto}
              onClick={() => {
                setFilterQuery(proto);
                setAppliedFilter(proto);
              }}
              className="px-1.5 py-0.5 text-[10px] font-mono bg-[#111827] hover:bg-[#1f2937] text-slate-300 rounded border border-border/60 transition-colors"
            >
              {proto}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN THREE-PANE WIRESHARK WORKSPACE */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#080d16]">
        
        {/* ===================== PANE 1: PACKET LIST VIEW (UPPER PANE) ===================== */}
        <div
          ref={packetListContainerRef}
          className="flex-[1.2] overflow-y-auto overflow-x-auto border-b border-border/80 select-text"
        >
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="bg-[#0e1626] text-muted-foreground sticky top-0 z-10 select-none border-b border-border shadow-sm">
              <tr>
                <th className="py-1 px-2.5 w-14 font-semibold border-r border-border/40">No.</th>
                <th className="py-1 px-2.5 w-32 font-semibold border-r border-border/40">Time ({timeDisplayFormat})</th>
                <th className="py-1 px-2.5 w-56 font-semibold border-r border-border/40">Source</th>
                <th className="py-1 px-2.5 w-56 font-semibold border-r border-border/40">Destination</th>
                <th className="py-1 px-2.5 w-28 font-semibold border-r border-border/40">Protocol</th>
                <th className="py-1 px-2.5 w-18 font-semibold border-r border-border/40 text-right">Length</th>
                <th className="py-1 px-2.5 font-semibold">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredPackets.map((pkt, index) => {
                const isSelected = pkt.no === selectedPacket?.no;

                let timeStr = pkt.timestampDelta;
                if (timeDisplayFormat === 'utc') timeStr = pkt.timestampUtc.split(' ')[1];
                if (timeDisplayFormat === 'epoch') timeStr = pkt.timestampEpoch.toFixed(4);

                return (
                  <tr
                    key={pkt.no}
                    onClick={() => {
                      setSelectedPacketIndex(packetBuffer.findIndex(p => p.no === pkt.no));
                      setHighlightedByteRange(null);
                    }}
                    className={cn(
                      "cursor-pointer transition-colors leading-relaxed",
                      isSelected
                        ? "bg-[#1e3a8a] text-white font-semibold shadow-inner"
                        : `${pkt.colorClass} hover:brightness-125`
                    )}
                  >
                    <td className="py-1 px-2.5 opacity-80">{pkt.no}</td>
                    <td className="py-1 px-2.5 whitespace-nowrap opacity-90">{timeStr}</td>
                    <td className="py-1 px-2.5 truncate max-w-[220px]" title={pkt.source}>{pkt.source}</td>
                    <td className="py-1 px-2.5 truncate max-w-[220px]" title={pkt.destination}>{pkt.destination}</td>
                    <td className="py-1 px-2.5 font-bold whitespace-nowrap">{pkt.protocol}</td>
                    <td className="py-1 px-2.5 text-right opacity-80">{pkt.length}</td>
                    <td className="py-1 px-2.5 truncate max-w-[480px]" title={pkt.info}>{pkt.info}</td>
                  </tr>
                );
              })}
              {filteredPackets.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground font-mono text-xs">
                    No packets match display filter "{appliedFilter}". Clear filter to view all frames.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===================== LOWER DUAL PANES: DETAILS TREE & HEX DUMP ===================== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 border-t border-border/60">
          
          {/* ===================== PANE 2: PACKET DETAILS TREE (MIDDLE PANE) ===================== */}
          <div className="flex-1 overflow-y-auto border-r border-border/80 p-3 bg-[#070b12] text-xs font-mono select-text">
            <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-1.5 mb-2 select-none">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-sky-400" />
                Packet Details Dissection (Frame {selectedPacket?.no || 'N/A'})
              </span>
              <span className="text-[10px] text-muted-foreground">Click field to highlight hex</span>
            </div>

            {selectedPacket ? (
              <div className="flex flex-col gap-1.5">
                {selectedPacket.layers.map((layer, lIdx) => (
                  <details
                    key={lIdx}
                    open
                    className="group border border-border/60 rounded-md bg-[#0a0f18] p-2 hover:border-sky-500/40 transition-colors"
                  >
                    <summary
                      className="cursor-pointer font-bold text-sky-200 flex items-center gap-1.5 hover:text-white"
                      onClick={() => {
                        if (layer.byteRange) setHighlightedByteRange(layer.byteRange);
                      }}
                    >
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90 text-sky-400" />
                      <span>{layer.name}</span>
                    </summary>

                    <div className="mt-2 pl-5 flex flex-col gap-1 border-l border-border/40 ml-2">
                      {layer.fields.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          onClick={() => {
                            if (f.byteRange) setHighlightedByteRange(f.byteRange);
                          }}
                          className="hover:bg-sky-500/10 px-1 py-0.5 rounded cursor-pointer flex items-baseline gap-2 transition-colors"
                        >
                          <span className="text-muted-foreground text-[11px]">{f.label}:</span>
                          <span className="text-slate-200 font-semibold text-[11px] break-all">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-8">Select a packet from the list above to inspect protocol details.</div>
            )}
          </div>

          {/* ===================== PANE 3: RAW PAYLOAD HEX DUMP & ASCII INSPECTOR ===================== */}
          <div className="flex-1 overflow-y-auto p-3 bg-[#05080e] text-xs font-mono select-text flex flex-col">
            <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-1.5 mb-2 select-none">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-amber-400" />
                Raw Payload Hex Dump & ASCII ({selectedPacket?.rawBytes.length || 0} bytes)
              </span>

              {/* Copy Hex Actions */}
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => copyHexBytes('hex')}
                  className="px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                >
                  {copiedState === 'hex' ? '✓ Copied' : 'Copy Hex'}
                </button>
                <button
                  onClick={() => copyHexBytes('c-array')}
                  className="px-1.5 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                >
                  {copiedState === 'c-array' ? '✓ C-Array' : 'C-Array'}
                </button>
              </div>
            </div>

            {selectedPacket ? (
              <div className="font-mono text-[11px] leading-relaxed">
                {formattedHexLines.map((line, lIdx) => {
                  const lineStartOffset = lIdx * 16;

                  return (
                    <div key={lIdx} className="flex items-center hover:bg-white/5 py-0.5 px-1 rounded transition-colors">
                      {/* Offset */}
                      <span className="text-muted-foreground select-none w-14 shrink-0 font-bold">
                        {line.offsetStr}
                      </span>

                      {/* Hex Bytes (Group 1: 0-7, Group 2: 8-15) */}
                      <div className="flex items-center gap-1.5 select-text mr-4">
                        <div className="flex items-center gap-1">
                          {line.hexPairs.slice(0, 8).map((hex, byteIdx) => {
                            const currentOffset = lineStartOffset + byteIdx;
                            const isHighlighted = highlightedByteRange &&
                              currentOffset >= highlightedByteRange[0] &&
                              currentOffset <= highlightedByteRange[1];
                            const isHovered = hoveredByteOffset === currentOffset;

                            return (
                              <span
                                key={byteIdx}
                                onMouseEnter={() => setHoveredByteOffset(currentOffset)}
                                onMouseLeave={() => setHoveredByteOffset(null)}
                                className={cn(
                                  "w-5 text-center rounded transition-colors",
                                  isHovered && "bg-amber-400 text-black font-bold",
                                  isHighlighted && !isHovered && "bg-sky-500/40 text-sky-200 font-bold",
                                  !isHighlighted && !isHovered && "text-slate-300"
                                )}
                              >
                                {hex}
                              </span>
                            );
                          })}
                        </div>

                        <span className="text-muted-foreground/30 select-none">|</span>

                        <div className="flex items-center gap-1">
                          {line.hexPairs.slice(8, 16).map((hex, byteIdx) => {
                            const currentOffset = lineStartOffset + 8 + byteIdx;
                            const isHighlighted = highlightedByteRange &&
                              currentOffset >= highlightedByteRange[0] &&
                              currentOffset <= highlightedByteRange[1];
                            const isHovered = hoveredByteOffset === currentOffset;

                            return (
                              <span
                                key={byteIdx}
                                onMouseEnter={() => setHoveredByteOffset(currentOffset)}
                                onMouseLeave={() => setHoveredByteOffset(null)}
                                className={cn(
                                  "w-5 text-center rounded transition-colors",
                                  isHovered && "bg-amber-400 text-black font-bold",
                                  isHighlighted && !isHovered && "bg-sky-500/40 text-sky-200 font-bold",
                                  !isHighlighted && !isHovered && "text-slate-300"
                                )}
                              >
                                {hex}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* ASCII Representation */}
                      <div className="text-emerald-400 font-mono tracking-wider border-l border-border/40 pl-3">
                        {line.asciiStr.split('').map((char, charIdx) => {
                          const currentOffset = lineStartOffset + charIdx;
                          const isHovered = hoveredByteOffset === currentOffset;
                          const isHighlighted = highlightedByteRange &&
                            currentOffset >= highlightedByteRange[0] &&
                            currentOffset <= highlightedByteRange[1];

                          return (
                            <span
                              key={charIdx}
                              onMouseEnter={() => setHoveredByteOffset(currentOffset)}
                              onMouseLeave={() => setHoveredByteOffset(null)}
                              className={cn(
                                isHovered && "bg-amber-400 text-black font-bold",
                                isHighlighted && !isHovered && "bg-sky-500/40 text-sky-200 font-bold"
                              )}
                            >
                              {char}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Byte Inspector Hover Tooltip */}
                {hoveredByteOffset !== null && selectedPacket.rawBytes[hoveredByteOffset] !== undefined && (
                  <div className="mt-3 p-2 bg-[#090e18] border border-amber-500/40 rounded-lg text-[10px] font-mono text-amber-300 flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground">Offset: </span>
                      <span className="font-bold">0x{hoveredByteOffset.toString(16).padStart(4, '0')} ({hoveredByteOffset})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hex: </span>
                      <span className="font-bold">0x{selectedPacket.rawBytes[hoveredByteOffset].toString(16).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dec: </span>
                      <span className="font-bold">{selectedPacket.rawBytes[hoveredByteOffset]}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Char: </span>
                      <span className="font-bold">'{String.fromCharCode(selectedPacket.rawBytes[hoveredByteOffset])}'</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Binary: </span>
                      <span className="font-bold">{selectedPacket.rawBytes[hoveredByteOffset].toString(2).padStart(8, '0')}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-8">Select a frame to inspect raw hex dump.</div>
            )}
          </div>
        </div>
      </div>

      {/* 5. PROTOCOL STATISTICS DRAWER */}
      {showStatsDrawer && (
        <div className="bg-[#0b121e] border-t border-border p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white font-mono">Protocol Hierarchy & Live Capture Statistics</h3>
            </div>
            <button
              onClick={() => setShowStatsDrawer(false)}
              className="text-muted-foreground hover:text-white p-1 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-[#070a10] rounded-lg border border-border/60">
              <span className="text-muted-foreground text-[10px] block">TOTAL PACKETS</span>
              <span className="text-sm font-bold text-sky-400">{protocolStats.totalPackets} Frames</span>
            </div>
            <div className="p-2.5 bg-[#070a10] rounded-lg border border-border/60">
              <span className="text-muted-foreground text-[10px] block">TOTAL BYTES CAPTURED</span>
              <span className="text-sm font-bold text-emerald-400">{(protocolStats.totalBytes / 1024).toFixed(2)} KB</span>
            </div>
            <div className="p-2.5 bg-[#070a10] rounded-lg border border-border/60">
              <span className="text-muted-foreground text-[10px] block">THROUGHPUT RATE</span>
              <span className="text-sm font-bold text-purple-400">18.42 Mbps (HE80)</span>
            </div>
            <div className="p-2.5 bg-[#070a10] rounded-lg border border-border/60">
              <span className="text-muted-foreground text-[10px] block">DISPLAY FILTER MATCH</span>
              <span className="text-sm font-bold text-amber-400">
                {filteredPackets.length} / {packetBuffer.length} ({((filteredPackets.length / Math.max(1, packetBuffer.length)) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Protocol Distribution Bars */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[10px] font-mono text-muted-foreground">Protocol Distribution:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(protocolStats.counts).map(([proto, count]) => {
                const countNum = Number(count);
                const pct = ((countNum / Math.max(1, protocolStats.totalPackets)) * 100).toFixed(1);
                return (
                  <div key={proto} className="px-2 py-1 rounded bg-[#070a10] border border-border/60 text-xs font-mono flex items-center gap-2">
                    <span className="font-bold text-foreground">{proto}</span>
                    <span className="text-muted-foreground">({countNum})</span>
                    <span className="text-sky-400 font-bold">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. FOLLOW TCP STREAM MODAL */}
      {showStreamFollower && selectedPacket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0b121e] border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <MessageSquare className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  Follow TCP Stream #{selectedPacket.tcpStreamId || 1} Dialogue
                </h3>
              </div>
              <button
                onClick={() => setShowStreamFollower(false)}
                className="p-1 text-muted-foreground hover:text-white rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs space-y-4 bg-[#05080e] flex-1">
              {/* Client Transmission (Blue) */}
              <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-xl">
                <div className="text-[10px] font-bold text-sky-400 mb-1 flex items-center justify-between">
                  <span>Client Outbound → {selectedPacket.destination}</span>
                  <span>Payload: 456 bytes</span>
                </div>
                <pre className="text-sky-200 whitespace-pre-wrap leading-relaxed select-all">
                  {`POST /api/v1/telemetry/heartbeat HTTP/1.1\r\nHost: api-telemetry-sync.xyz\r\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)\r\nContent-Type: application/octet-stream\r\nX-Beacon-Token: 0x9a1240003d7c\r\nContent-Length: 64\r\n\r\n[48 bytes of AES-GCM encrypted payload: beacon_timestamp, host_id, mac_address]`}
                </pre>
              </div>

              {/* Server Response (Rose/Red) */}
              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl">
                <div className="text-[10px] font-bold text-rose-400 mb-1 flex items-center justify-between">
                  <span>← Server Response from {selectedPacket.destination}</span>
                  <span>Payload: 128 bytes</span>
                </div>
                <pre className="text-rose-200 whitespace-pre-wrap leading-relaxed select-all">
                  {`HTTP/1.1 200 OK\r\nServer: nginx/1.24.0 (Ubuntu)\r\nDate: Mon, 19 Oct 2026 11:16:40 GMT\r\nContent-Type: application/json\r\nConnection: keep-alive\r\n\r\n{"status":"ACK","next_beacon_seconds":120,"instruction":"SLEEP"}`}
                </pre>
              </div>
            </div>

            <div className="p-3 bg-[#070a10] border-t border-border flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Entire stream conversation (584 bytes total)</span>
              <button
                onClick={() => setShowStreamFollower(false)}
                className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-bold"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BOTTOM STATUS BAR */}
      <div className="h-6 bg-[#070a10] border-t border-border/80 flex items-center justify-between px-3 text-[10px] font-mono text-muted-foreground select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={cn("w-1.5 h-1.5 rounded-full", isCapturing ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
            <span>{isCapturing ? "Capturing Live" : "Capture Paused"}</span>
          </span>
          <span>·</span>
          <span>Packets: {packetBuffer.length}</span>
          <span>·</span>
          <span>Displayed: {filteredPackets.length}</span>
          <span>·</span>
          <span>Buffer: {(protocolStats.totalBytes / 1024).toFixed(1)} KB</span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span>Selected Frame: {selectedPacket?.no || 'None'}</span>
          <span>·</span>
          <span className="text-slate-400">Use ↑ / ↓ arrow keys to navigate packets</span>
        </div>
      </div>
    </div>
  );
}
