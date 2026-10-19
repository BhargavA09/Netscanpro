import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Layers,
  ChevronDown,
  ChevronRight,
  Wifi,
  Radio,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WifiClientUser, WifiNode } from '../types';

export interface WiresharkFrame {
  no: number;
  timeDelta: string;
  source: string;
  destination: string;
  protocol: '802.11 BTM' | '802.11v BTM' | '802.11r FT' | '802.11k RRM' | 'EAPOL-Key' | 'DNS' | 'TCP SYN' | 'TCP SYN-ACK' | 'TLSv1.3' | 'ARP';
  length: number;
  info: string;
  treeDetails: {
    frame: string;
    radiotap: string;
    wlan: string;
    actionOrTransport: string;
    payloadData?: string;
  };
  hexDump: string[];
}

const SAMPLE_WIRESHARK_FRAMES: WiresharkFrame[] = [
  {
    no: 1041,
    timeDelta: '0.000000',
    source: 'OpenWrt-GW (BC:24:11:8A:4F:01)',
    destination: 'Alex-MacBook (BC:D0:74:19:92:41)',
    protocol: '802.11k RRM',
    length: 64,
    info: 'Radio Measurement Request: Neighbor Report (Subtype: 0x05, Dialog Token: 14)',
    treeDetails: {
      frame: 'Frame 1041: 64 bytes on wire (512 bits), 64 bytes captured (512 bits) on interface wlan0',
      radiotap: 'Radiotap Header v0, Length 36, Channel: 36 (5180 MHz, 80MHz width), RSSI: -48 dBm, PHY: 802.11ax HE',
      wlan: 'IEEE 802.11 Wireless LAN management frame, Subtype: Action (13), Flags: .0000000',
      actionOrTransport: 'IEEE 802.11k Radio Resource Management: Action Category: Radio Measurement (0x05), Neighbor Report Request'
    },
    hexDump: [
      '0000  00 00 24 00 2f 40 00 a0  20 08 00 00 00 02 6c 09  ..$../@. .....l.',
      '0010  a0 00 9c 00 00 00 a0 00  d0 00 3a 01 bc 24 11 8a  ..........:..$..',
      "0030  05 01 0e 27 00 00 00 00  00 00 00 00 00 00 00 00  ...`............"
    ]
  },
  {
    no: 1042,
    timeDelta: '0.003412',
    source: 'Alex-MacBook (BC:D0:74:19:92:41)',
    destination: 'OpenWrt-GW (BC:24:11:8A:4F:01)',
    protocol: '802.11k RRM',
    length: 98,
    info: 'Radio Measurement Report: Neighbor BSSID Candidate List (BC:24:11:8A:4F:02 Office AP, SNR: 42dB)',
    treeDetails: {
      frame: 'Frame 1042: 98 bytes on wire (784 bits), 98 bytes captured on interface wlan0',
      radiotap: 'Radiotap Header v0, Length 36, Channel: 36 (5180 MHz), RSSI: -47 dBm, Antenna: 2x2 MIMO',
      wlan: 'IEEE 802.11 Action frame, Source: BC:D0:74:19:92:41, Destination: BC:24:11:8A:4F:01',
      actionOrTransport: 'IEEE 802.11k Radio Measurement Report: Neighbor Report Element (ID 52): BSSID: BC:24:11:8A:4F:02, BSSID Info: Reachable=1, Security=WPA3-SAE, KeyScope=Same'
    },
    hexDump: [
      '0000  00 00 24 00 2f 40 00 a0  20 08 00 00 00 02 6c 09  ..$../@. .....l.',
      '0010  bc d0 74 19 92 41 bc 24  11 8a 4f 01 bc 24 11 8a  ..t..A.$ ..O..$..',
      '0020  05 02 0e 34 0f bc 24 11  8a 4f 02 01 00 00 00 24  ...4..$. .O.....$',
      '0030  51 04 2a 00 00 00 00 00  00 00 00 00 00 00 00 00  Q.*.............'
    ]
  },
  {
    no: 1043,
    timeDelta: '0.012104',
    source: 'OpenWrt-GW (BC:24:11:8A:4F:01)',
    destination: 'Alex-MacBook (BC:D0:74:19:92:41)',
    protocol: '802.11v BTM',
    length: 86,
    info: 'BSS Transition Management Request: Candidate Preference=255, Target: BC:24:11:8A:4F:02 (Disassoc Imminent: 0)',
    treeDetails: {
      frame: 'Frame 1043: 86 bytes captured on wire',
      radiotap: 'Radiotap Header v0, Length 36, Channel: 36 (5180 MHz), TX Power: 23 dBm',
      wlan: 'IEEE 802.11 Wireless LAN management frame (Subtype: Action)',
      actionOrTransport: 'IEEE 802.11v WNM Action: BSS Transition Management Request: Request Mode: Preferred Candidate List Included (0x01), Disassoc Imminent: 0, Validity Interval: 100 TUs'
    },
    hexDump: [
      '0000  00 00 24 00 2f 40 00 a0  20 08 00 00 00 02 6c 09  ..$../@. .....l.',
      '0010  a0 00 9c 00 d0 00 3a 01  bc 24 11 8a 4f 01 bc d0  ......:. .$..O...',
      '0020  74 19 92 41 bc 24 11 8a  4f 01 0a 07 01 00 64 00  t..A.$.. O.....d.',
      '0030  34 0f bc 24 11 8a 4f 02  01 00 00 00 24 51 04 ff  4..$..O. ....$Q..'
    ]
  },
  {
    no: 1044,
    timeDelta: '0.016250',
    source: 'Alex-MacBook (BC:D0:74:19:92:41)',
    destination: 'OpenWrt-GW (BC:24:11:8A:4F:01)',
    protocol: '802.11v BTM',
    length: 52,
    info: 'BSS Transition Management Response: Status: Accept (0x00), Target BSSID: BC:24:11:8A:4F:02',
    treeDetails: {
      frame: 'Frame 1044: 52 bytes captured',
      radiotap: 'Radiotap Header v0, Length 36',
      wlan: 'IEEE 802.11 Management Frame, Subtype: Action',
      actionOrTransport: 'IEEE 802.11v WNM: BSS Transition Management Response: Status Code: Accept (0x00), Target BSSID: BC:24:11:8A:4F:02'
    },
    hexDump: [
      '0000  00 00 24 00 2f 40 00 a0  20 08 00 00 00 02 6c 09  ..$../@. .....l.',
      '0010  d0 00 3a 01 bc 24 11 8a  4f 01 bc d0 74 19 92 41  ..:..$.. O...t..A',
      '0020  0a 08 00 00 bc 24 11 8a  4f 02 00 00 00 00 00 00  .....$.. O.......'
    ]
  },
  {
    no: 1045,
    timeDelta: '0.021890',
    source: 'Alex-MacBook (BC:D0:74:19:92:41)',
    destination: 'Office AP (BC:24:11:8A:4F:02)',
    protocol: '802.11r FT',
    length: 122,
    info: 'Fast BSS Transition (FT) Auth Request Over-the-DS (SNonce, PMK-R0-Name: 4a9f82d1c6...)',
    treeDetails: {
      frame: 'Frame 1045: 122 bytes captured',
      radiotap: 'Radiotap Header v0, Channel: 36 (5180 MHz)',
      wlan: 'IEEE 802.11 Authentication Frame (Subtype: Auth), Algorithm: Fast BSS Transition (0x0002)',
      actionOrTransport: 'IEEE 802.11r Fast BSS Transition: Auth Transaction: 1, Status: Successful (0x0000), Fast Transition element (FTE): SNonce generated, PMK-R0 Name verified'
    },
    hexDump: [
      '0000  00 00 24 00 2f 40 00 a0  20 08 00 00 00 02 6c 09  ..$../@. .....l.',
      '0010  b0 00 3a 01 bc 24 11 8a  4f 02 bc d0 74 19 92 41  ..:..$.. O...t..A',
      '0020  02 00 01 00 00 00 37 36  01 00 4a 9f 82 d1 c6 11  ......76 ..J.....',
      '0030  94 e0 22 81 74 61 99 e2  05 1a b2 cc 44 91 88 20  ..".ta.. ....D.. '
    ]
  },
  {
    no: 1046,
    timeDelta: '0.028420',
    source: 'Office AP (BC:24:11:8A:4F:02)',
    destination: 'Alex-MacBook (BC:D0:74:19:92:41)',
    protocol: '802.11r FT',
    length: 134,
    info: 'Fast BSS Transition (FT) Reassociation Response: Success (0x0000), Handshake Latency: 28.4ms (0 Drops)',
    treeDetails: {
      frame: 'Frame 1046: 134 bytes captured on wire',
      radiotap: 'Radiotap Header v0, PHY: 802.11ax (Wi-Fi 6), MCS 11 (1024-QAM)',
      wlan: 'IEEE 802.11 Reassociation Response: Status: Successful (0x0000), AID: 0xc003',
      actionOrTransport: 'IEEE 802.11r Fast Transition Information Element: PMK-R1 key installed into hardware crypto engine. Zero frame drop, total roaming latency: 28.4ms'
    },
    hexDump: [
      '0000  00 00 24 00 2f 40 00 a0  20 08 00 00 00 02 6c 09  ..$../@. .....l.',
      '0010  30 00 3a 01 bc d0 74 19  92 41 bc 24 11 8a 4f 02  0.:...t. .A.$..O.',
      '0020  01 01 00 00 03 c0 01 08  82 84 8b 96 0c 12 18 24  ........ .......$',
      '0030  37 3c 01 00 8f 24 19 a2  77 b1 04 22 91 00 4a 12  7<...$.. w.."..J.'
    ]
  },
  {
    no: 1047,
    timeDelta: '0.034180',
    source: '192.168.1.102 (Alex-MacBook)',
    destination: '192.168.1.1 (Pi-hole DNS)',
    protocol: 'DNS',
    length: 74,
    info: 'Standard query 0x7a12 A api.apple.com',
    treeDetails: {
      frame: 'Frame 1047: 74 bytes captured on wlan0',
      radiotap: 'Radiotap Header v0, Channel: 36 (5180 MHz)',
      wlan: 'IEEE 802.11 Data frame, LLC SNAP: IP (0x0800)',
      actionOrTransport: 'Domain Name System (query): Transaction ID: 0x7a12, Flags: 0x0100 Standard query, Queries: api.apple.com: type A, class IN'
    },
    hexDump: [
      '0000  45 00 00 4a 8f 12 40 00  40 11 e2 90 c0 a8 01 66  E..J..@. @......f',
      '0010  c0 a8 01 01 d4 12 00 35  00 36 7b 12 7a 12 01 00  .......5 .6{.z...',
      '0020  00 01 00 00 00 00 00 00  03 61 70 69 05 61 70 70  ........ .api.app',
      '0030  6c 65 03 63 6f 6d 00 00  01 00 01 00 00 00 00 00  le.com.. ........'
    ]
  },
  {
    no: 1048,
    timeDelta: '0.040210',
    source: '192.168.1.102 (Alex-MacBook)',
    destination: '17.248.160.84 (Apple CDN)',
    protocol: 'TCP SYN',
    length: 74,
    info: '51280 → 443 [SYN] Seq=0 Win=65535 Len=0 MSS=1460 WS=64 TSval=38910291',
    treeDetails: {
      frame: 'Frame 1048: 74 bytes on wire',
      radiotap: 'Radiotap Header v0',
      wlan: 'IEEE 802.11 QoS Data',
      actionOrTransport: 'Transmission Control Protocol, Src Port: 51280, Dst Port: 443, Seq: 0, Flags: 0x002 (SYN), Window: 65535, Options: (MSS, SACK, Timestamp, NOP, WScale)'
    },
    hexDump: [
      '0000  45 00 00 4a 41 90 40 00  40 06 31 10 c0 a8 01 66  E..JA.@. @.1....f',
      '0010  11 f8 a0 54 c8 50 01 bb  8a 12 90 00 00 00 00 00  ...T.P.. ........',
      '0020  a0 02 ff ff 71 a2 00 00  02 04 05 b4 01 03 03 06  ....q... ........',
      '0030  01 01 08 0a 02 51 c3 13  00 00 00 00 04 02 00 00  .....Q.. ........'
    ]
  }
];

interface WiresharkNmapInspectorProps {
  selectedClient?: WifiClientUser | null;
  selectedNode?: WifiNode | null;
  onClose?: () => void;
}

export function WiresharkNmapInspector({
  selectedClient,
  selectedNode,
  onClose
}: WiresharkNmapInspectorProps) {
  const [activeTab, setActiveTab] = useState<'wireshark' | 'nmap'>('wireshark');
  const [frames, setFrames] = useState<WiresharkFrame[]>(SAMPLE_WIRESHARK_FRAMES);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number>(2); // 802.11v BTM selected
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [filterProtocol, setFilterProtocol] = useState<string>('ALL');

  // Nmap Scan State
  const [isNmapRunning, setIsNmapRunning] = useState<boolean>(false);
  const [nmapProgress, setNmapProgress] = useState<number>(100);
  const [nmapScanType, setNmapScanType] = useState<string>('-sS -sV -O -T4 (Stealth SYN + OS Detect)');

  // Selected Frame
  const selectedFrame = frames[selectedFrameIndex] || frames[0];

  const handleTriggerNmapScan = () => {
    setIsNmapRunning(true);
    setNmapProgress(10);
    const interval = setInterval(() => {
      setNmapProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsNmapRunning(false);
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const filteredFrames = frames.filter(f => {
    if (filterProtocol === 'ALL') return true;
    return f.protocol.includes(filterProtocol);
  });

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
      {/* Top Header: Wireshark & Nmap Hybrid Suite */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveTab('wireshark')}
              className={cn(
                "px-3 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 font-bold",
                activeTab === 'wireshark'
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>WIRESHARK PACKET CAPTURE</span>
            </button>

            <button
              onClick={() => setActiveTab('nmap')}
              className={cn(
                "px-3 py-1 rounded text-xs transition cursor-pointer flex items-center gap-1.5 font-bold",
                activeTab === 'nmap'
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>NMAP RECON & PORT SCANNER</span>
            </button>
          </div>

          <span className="text-zinc-500 hidden sm:inline">|</span>

          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Target Host: <strong className="text-white">{selectedClient ? `${selectedClient.deviceHost} (${selectedClient.ip})` : selectedNode ? `${selectedNode.name} (${selectedNode.ip})` : 'wlan0.mon (Promiscuous)'}</strong>
          </span>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'wireshark' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCapturing(!isCapturing)}
                className={cn(
                  "px-2.5 py-1 rounded border text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5",
                  isCapturing ? "bg-rose-500/20 border-rose-500/40 text-rose-300" : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                )}
              >
                {isCapturing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isCapturing ? "Pause Sniffer" : "Resume Sniffer"}</span>
              </button>

              <button
                onClick={() => setFrames(SAMPLE_WIRESHARK_FRAMES)}
                className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                title="Reset Buffer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {activeTab === 'nmap' && (
            <button
              onClick={handleTriggerNmapScan}
              disabled={isNmapRunning}
              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Zap className={cn("w-3.5 h-3.5", isNmapRunning && "animate-spin")} />
              <span>{isNmapRunning ? `Scanning... ${nmapProgress}%` : "Run Stealth SYN Scan"}</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/5 transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: WIRESHARK PACKET CAPTURE & DISSECTOR                    */}
      {/* ============================================================== */}
      {activeTab === 'wireshark' && (
        <div className="flex flex-col h-[420px]">
          {/* Protocol Filter Bar */}
          <div className="px-3 py-1.5 bg-black/40 border-b border-zinc-800 flex items-center gap-2 text-[11px]">
            <Filter className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500">DISPLAY FILTER:</span>
            {['ALL', '802.11', '802.11r', '802.11v', 'DNS', 'TCP'].map(proto => (
              <button
                key={proto}
                onClick={() => setFilterProtocol(proto)}
                className={cn(
                  "px-2 py-0.5 rounded transition cursor-pointer",
                  filterProtocol === proto
                    ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {proto}
              </button>
            ))}
          </div>

          {/* Top Half: Scrolling Packet List */}
          <div className="h-44 overflow-y-auto border-b border-zinc-800 select-none">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-900 sticky top-0 text-[10px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-1 px-2 w-12">No.</th>
                  <th className="py-1 px-2 w-20">Time</th>
                  <th className="py-1 px-2 w-48">Source</th>
                  <th className="py-1 px-2 w-48">Destination</th>
                  <th className="py-1 px-2 w-28">Protocol</th>
                  <th className="py-1 px-2 w-16">Length</th>
                  <th className="py-1 px-2">Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-[11px] tabular-nums">
                {filteredFrames.map((frame, idx) => {
                  const isSelected = selectedFrameIndex === idx;
                  const is80211 = frame.protocol.startsWith('802.11');

                  return (
                    <tr
                      key={frame.no}
                      onClick={() => setSelectedFrameIndex(idx)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected
                          ? "bg-sky-500/20 text-white font-semibold"
                          : is80211
                          ? "hover:bg-zinc-900/60 text-sky-300/90"
                          : "hover:bg-zinc-900/60 text-zinc-300"
                      )}
                    >
                      <td className="py-1 px-2 text-zinc-500">{frame.no}</td>
                      <td className="py-1 px-2 text-zinc-400">{frame.timeDelta}</td>
                      <td className="py-1 px-2 truncate max-w-[180px]">{frame.source}</td>
                      <td className="py-1 px-2 truncate max-w-[180px]">{frame.destination}</td>
                      <td className="py-1 px-2 font-bold">
                        <span className={cn(
                          "px-1.5 py-0.2 rounded text-[10px]",
                          frame.protocol === '802.11r FT' ? "bg-emerald-500/20 text-emerald-300 font-bold" :
                          frame.protocol === '802.11v BTM' ? "bg-cyan-500/20 text-cyan-300 font-bold" :
                          frame.protocol === '802.11k RRM' ? "bg-purple-500/20 text-purple-300" :
                          "bg-zinc-800 text-zinc-300"
                        )}>
                          {frame.protocol}
                        </span>
                      </td>
                      <td className="py-1 px-2 text-zinc-400">{frame.length}</td>
                      <td className="py-1 px-2 truncate text-zinc-200">{frame.info}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Half: Dissector Tree & Hex Dump Split */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 overflow-hidden bg-black/60">
            {/* Left: Hierarchical Dissection Tree */}
            <div className="p-3 overflow-y-auto space-y-2 text-[11px]">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                PACKET DISSECTION TREE (FRAME #{selectedFrame.no})
              </span>
              <div className="space-y-1 text-zinc-300">
                <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800 flex items-start gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-200">{selectedFrame.treeDetails.frame}</span>
                </div>
                <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800 flex items-start gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span className="text-sky-300">{selectedFrame.treeDetails.radiotap}</span>
                </div>
                <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800 flex items-start gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-emerald-300">{selectedFrame.treeDetails.wlan}</span>
                </div>
                <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800 flex items-start gap-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-amber-200 font-semibold">{selectedFrame.treeDetails.actionOrTransport}</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Hex Dump */}
            <div className="p-3 overflow-y-auto space-y-2 text-[11px] bg-zinc-950">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                PACKET BYTES (HEX DUMP)
              </span>
              <div className="font-mono text-zinc-400 bg-black/80 p-2.5 rounded-lg border border-zinc-800 space-y-0.5 select-text">
                {selectedFrame.hexDump.map((line, lIdx) => (
                  <div key={lIdx} className="hover:text-cyan-300 hover:bg-white/5 px-1 rounded transition-colors">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: NMAP HOST RECON & PORT SCANNER                          */}
      {/* ============================================================== */}
      {activeTab === 'nmap' && (
        <div className="p-4 space-y-4">
          {/* Scan Profile Banner */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">
                NMAP SCAN COMMAND & TARGET
              </span>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">
                nmap {nmapScanType} {selectedClient ? selectedClient.ip : selectedNode ? selectedNode.ip : '192.168.1.0/24'}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Host is up (0.0012s latency) · 1000 scanned ports on {selectedClient ? selectedClient.deviceHost : selectedNode ? selectedNode.name : 'Target'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs">OS Match:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {selectedClient?.deviceCategory === 'laptop' ? 'Apple macOS Sonoma 14.4 / Darwin 23.4.0' :
                 selectedClient?.deviceCategory === 'car' ? 'Tesla Automotive Linux OS (AMD Ryzen MCU3)' :
                 selectedClient?.deviceCategory === 'console' ? 'Sony PlayStation OS (FreeBSD 12.0 kernel)' :
                 'Linux 6.6.21-mvebu (OpenWrt 23.05.3)'}
              </span>
            </div>
          </div>

          {/* Open Ports & Services Table */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-900 text-[10px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-2 px-3">Port</th>
                  <th className="py-2 px-3">State</th>
                  <th className="py-2 px-3">Service</th>
                  <th className="py-2 px-3">Version & Fingerprint Banner</th>
                  <th className="py-2 px-3">Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs">
                {(selectedClient?.openPorts || [
                  { port: 22, proto: 'tcp', service: 'ssh', state: 'open' },
                  { port: 53, proto: 'udp', service: 'domain (Pi-hole DNS)', state: 'open' },
                  { port: 80, proto: 'tcp', service: 'http (Lighttpd OpenWrt LuCI)', state: 'open' },
                  { port: 443, proto: 'tcp', service: 'https (TLSv1.3 OpenSSL)', state: 'open' },
                  { port: 8554, proto: 'tcp', service: 'rtsp (Encrypted H.264 Live Stream)', state: 'open' }
                ]).map((p: any) => (
                  <tr key={p.port} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-2 px-3 font-bold text-white">
                      {p.port}/{p.proto || 'tcp'}
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>open</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sky-300 font-semibold">{p.service}</td>
                    <td className="py-2 px-3 text-zinc-400 text-[11px]">
                      {p.port === 22 ? 'OpenSSH 9.6p1 Ubuntu-3ubuntu13 (protocol 2.0)' :
                       p.port === 53 ? 'Pi-hole FTL v5.25.2 (dnsmasq-2.90 with DNSSEC)' :
                       p.port === 80 ? 'lighttpd/1.4.73 (OpenWrt LuCI Web Admin)' :
                       p.port === 443 ? 'nginx/1.24.0 (TLS 1.3 AES-GCM-256)' :
                       'Live H.264 RTSP Media Stream Engine'}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Nominal / Secured
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
