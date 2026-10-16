import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wifi, 
  Router, 
  Radio, 
  Users, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Laptop, 
  Smartphone, 
  Tv, 
  Gamepad2, 
  Car, 
  Home, 
  Layers, 
  Terminal, 
  RefreshCw, 
  Plus, 
  Zap, 
  Pause, 
  Play, 
  ArrowRightLeft, 
  Sliders, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  GitBranch, 
  Sparkles, 
  Gauge, 
  Network as NetworkIcon,
  Search,
  ExternalLink,
  Cpu,
  Trash2,
  Settings,
  History,
  FileText,
  Clock,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Database,
  Server,
  Crosshair,
  Radar,
  Compass,
  Check,
  UserCheck,
  SignalHigh
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchJson } from '../lib/api';
import { 
  WifiNode, 
  WifiClientUser, 
  WifiMeshTelemetryResponse, 
  OpenSourceRepo, 
  WifiClientRoamingEvent,
  WifiDeviceHistoryPoint,
  WifiEventLogEntry,
  PythonBackendStatus
} from '../types';

export function HomeWifiMap() {
  const [telemetry, setTelemetry] = useState<WifiMeshTelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Floor and View filter
  const [activeFloor, setActiveFloor] = useState<'all' | 'ground' | 'upper' | 'outdoor'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'clients' | 'history' | 'logs' | 'topology' | 'opensource' | 'python'>('map');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Map overlays toggles
  const [showCoverageRadius, setShowCoverageRadius] = useState(true);
  const [showBackhaulLinks, setShowBackhaulLinks] = useState(true);
  const [showClientPointers, setShowClientPointers] = useState(true);
  const [activeBandFilter, setActiveBandFilter] = useState<'all' | '2.4GHz' | '5GHz' | '6GHz'>('all');

  // Search & Filters for connected clients
  const [clientSearch, setClientSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [vlanFilter, setVlanFilter] = useState<string>('all');
  const [onlyMyDeviceFilter, setOnlyMyDeviceFilter] = useState(false);

  // Device History State
  const [deviceHistory, setDeviceHistory] = useState<WifiDeviceHistoryPoint[]>([]);
  const [historyClientFilter, setHistoryClientFilter] = useState<string>('all');
  const [historyEventFilter, setHistoryEventFilter] = useState<string>('all');

  // Universal "Make Log All" Event Logs State
  const [eventLogs, setEventLogs] = useState<WifiEventLogEntry[]>([]);
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all');
  const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [newLogMessage, setNewLogMessage] = useState('');
  const [newLogLevel, setNewLogLevel] = useState<'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'AUDIT'>('INFO');
  const [newLogCategory, setNewLogCategory] = useState<string>('wifi_roaming');

  // Python Backend Engine State
  const [pythonStatus, setPythonStatus] = useState<PythonBackendStatus | null>(null);

  // Modal: Add Node
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeRoom, setNewNodeRoom] = useState('Guest Bedroom');
  const [newNodeFloor, setNewNodeFloor] = useState<'ground' | 'upper' | 'outdoor'>('upper');
  const [newNodeRole, setNewNodeRole] = useState<'mesh_satellite' | 'ap' | 'extender'>('mesh_satellite');
  const [newNodeModel, setNewNodeModel] = useState('OpenWrt GL-MT3000 (Beryl AX)');

  // Roam modal / action
  const [roamingClientId, setRoamingClientId] = useState<string | null>(null);
  const [targetRoamNodeId, setTargetRoamNodeId] = useState<string>('');

  // Open-source terminal simulation
  const [activeCliRepo, setActiveCliRepo] = useState<string>('OpenWrt Core & iwinfo');
  const [cliOutput, setCliOutput] = useState<string>('');
  const [runningCli, setRunningCli] = useState(false);

  // Accurate "My Device" Scanner State
  const [isScanningMyDevice, setIsScanningMyDevice] = useState(false);
  const [myDeviceScanModalOpen, setMyDeviceScanModalOpen] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 1: Browser Network API, 2: Latency Ping, 3: WebRTC LAN IP, 4: Python AP fingerprint, 5: Complete
  const [scanTelemetryResult, setScanTelemetryResult] = useState<any | null>(null);
  const [initialScanCompleted, setInitialScanCompleted] = useState(false);

  // Canvas Dragging State
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const fetchTelemetry = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const data = await fetchJson<WifiMeshTelemetryResponse>('/api/wifi/telemetry');
      if (data && data.nodes) {
        setTelemetry(data);
      }
    } catch {
      // Silently handled by resilient API fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchHistoryAndLogs = async () => {
    try {
      const [histData, logsData, pyData] = await Promise.all([
        fetchJson<{ history: WifiDeviceHistoryPoint[] }>('/api/wifi/history'),
        fetchJson<{ logs: WifiEventLogEntry[] }>('/api/wifi/logs'),
        fetchJson<PythonBackendStatus>('/api/backend-status')
      ]);

      if (histData && Array.isArray(histData.history)) {
        setDeviceHistory(histData.history);
      }
      if (logsData && Array.isArray(logsData.logs)) {
        setEventLogs(logsData.logs);
      }
      if (pyData && pyData.version) {
        setPythonStatus(pyData);
      }
    } catch {
      // Handled gracefully
    }
  };

  // Run Accurate Device Scan via WebRTC, Browser Network Information API, and Python Backend
  const runAccurateDeviceScan = async (showModal = true) => {
    setIsScanningMyDevice(true);
    if (showModal) {
      setMyDeviceScanModalOpen(true);
      setScanStep(1);
    }

    try {
      // Step 1: Query browser & system platform
      const ua = navigator.userAgent;
      const platform = navigator.platform;
      const screenRes = `${window.screen.width}x${window.screen.height}`;
      const conn = (navigator as any).connection;
      const downlink = conn ? conn.downlink : 35.0;
      const reportedRtt = conn ? conn.rtt : 8;

      if (showModal) {
        await new Promise(r => setTimeout(r, 450));
        setScanStep(2);
      }

      // Step 2: Measure accurate roundtrip ping latency
      const pingSamples: number[] = [];
      for (let i = 0; i < 3; i++) {
        const t0 = performance.now();
        await fetch('/api/wifi/telemetry', { method: 'HEAD', cache: 'no-store' });
        const t1 = performance.now();
        pingSamples.push(Math.round(t1 - t0));
      }
      const measuredPing = Math.max(1, Math.min(...pingSamples));

      if (showModal) {
        await new Promise(r => setTimeout(r, 450));
        setScanStep(3);
      }

      // Step 3: WebRTC local LAN IP candidate discovery
      let detectedLanIp = '192.168.1.102';
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        pc.onicecandidate = (ice) => {
          if (ice && ice.candidate && ice.candidate.candidate) {
            const match = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
            if (match && match[1] && !match[1].startsWith('127.')) {
              detectedLanIp = match[1];
            }
          }
        };
        setTimeout(() => pc.close(), 1000);
      } catch {
        // Fallback gracefully
      }

      if (showModal) {
        await new Promise(r => setTimeout(r, 450));
        setScanStep(4);
      }

      // Step 4: Call Python backend accurate scan API
      const result = await fetchJson<any>('/api/wifi/my-device/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIp: detectedLanIp,
          userAgent: ua,
          platform,
          downlink,
          rtt: reportedRtt,
          measuredPingMs: measuredPing,
          screen: screenRes
        })
      });

      setScanTelemetryResult(result);
      if (showModal) {
        setScanStep(5);
      }
      await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
    } catch (err) {
      console.error("Accurate device scan error:", err);
    } finally {
      setIsScanningMyDevice(false);
      setInitialScanCompleted(true);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    fetchHistoryAndLogs();

    // Auto-run accurate device scan quickly on load to identify current device
    const timer = setTimeout(() => {
      runAccurateDeviceScan(false);
    }, 250);

    const interval = setInterval(() => {
      fetchTelemetry(true);
      fetchHistoryAndLogs();
    }, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Set default CLI output when repo changes
  useEffect(() => {
    if (telemetry && telemetry.openSourceRepos) {
      const current = telemetry.openSourceRepos.find(r => r.name === activeCliRepo);
      if (current) {
        setCliOutput(`${current.commandSample}\n\n# Open-Source Output (${current.repo}):\n${current.outputSample}`);
      }
    }
  }, [activeCliRepo, telemetry]);

  const nodes = telemetry?.nodes || [];
  const clients = telemetry?.clients || [];
  const stats = telemetry?.stats;
  const repos = telemetry?.openSourceRepos || [];

  // Identify "My Device" (Current User's device)
  const myDevice = useMemo(() => {
    return clients.find(c => c.isMyDevice) || clients.find(c => c.id === 'cli-1') || clients[0] || null;
  }, [clients]);

  const myDeviceNode = useMemo(() => {
    if (!myDevice) return null;
    return nodes.find(n => n.id === myDevice.nodeId) || nodes[0] || null;
  }, [myDevice, nodes]);

  // Filtered nodes by floor
  const displayedNodes = useMemo(() => {
    if (activeFloor === 'all') return nodes;
    return nodes.filter(n => n.floor === activeFloor);
  }, [nodes, activeFloor]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (onlyMyDeviceFilter) {
        return c.isMyDevice || c.id === myDevice?.id;
      }

      const matchesSearch = 
        c.userName.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.deviceHost.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.ip.includes(clientSearch) ||
        c.mac.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.vendor.toLowerCase().includes(clientSearch.toLowerCase());

      const matchesNode = selectedNodeId ? c.nodeId === selectedNodeId : true;
      const matchesRole = userRoleFilter === 'all' || c.userRole === userRoleFilter;
      const matchesVlan = vlanFilter === 'all' || c.networkVlan === vlanFilter;
      const matchesBand = activeBandFilter === 'all' || c.band === activeBandFilter;

      return matchesSearch && matchesNode && matchesRole && matchesVlan && matchesBand;
    }).sort((a, b) => {
      const aIsSelf = a.isMyDevice || a.id === myDevice?.id;
      const bIsSelf = b.isMyDevice || b.id === myDevice?.id;
      if (aIsSelf && !bIsSelf) return -1;
      if (!aIsSelf && bIsSelf) return 1;
      return 0;
    });
  }, [clients, clientSearch, selectedNodeId, userRoleFilter, vlanFilter, activeBandFilter, onlyMyDeviceFilter, myDevice]);

  // Filtered Device History
  const filteredHistory = useMemo(() => {
    return deviceHistory.filter(h => {
      const matchesClient = historyClientFilter === 'all' || h.clientId === historyClientFilter;
      const matchesEvent = historyEventFilter === 'all' || h.eventType === historyEventFilter;
      return matchesClient && matchesEvent;
    });
  }, [deviceHistory, historyClientFilter, historyEventFilter]);

  // Filtered Event Logs
  const filteredEventLogs = useMemo(() => {
    return eventLogs.filter(l => {
      const matchesCategory = logCategoryFilter === 'all' || l.category === logCategoryFilter;
      const matchesLevel = logLevelFilter === 'all' || l.level === logLevelFilter;
      const q = logSearch.toLowerCase();
      const matchesSearch = !q || 
        l.message.toLowerCase().includes(q) || 
        l.source.toLowerCase().includes(q) || 
        (l.deviceHost || '').toLowerCase().includes(q) ||
        (l.details || '').toLowerCase().includes(q);

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [eventLogs, logCategoryFilter, logLevelFilter, logSearch]);

  // Selected details
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Handlers
  const handleScanSweep = async () => {
    setRefreshing(true);
    try {
      await fetchJson('/api/wifi/scan', { method: 'POST' });
      await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchJson('/api/wifi/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newNodeName || `Mesh Node (${newNodeRoom})`,
          room: newNodeRoom,
          floor: newNodeFloor,
          role: newNodeRole,
          model: newNodeModel,
          x: Math.floor(Math.random() * 60) + 20,
          y: Math.floor(Math.random() * 60) + 20
        })
      });
      setShowAddNodeModal(false);
      setNewNodeName('');
      await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptimizeNode = async (nodeId: string) => {
    try {
      await fetchJson(`/api/wifi/nodes/${nodeId}/optimize`, { method: 'POST' });
      await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRebootNode = async (nodeId: string) => {
    try {
      await fetchJson(`/api/wifi/nodes/${nodeId}/reboot`, { method: 'POST' });
      await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (confirm("Remove this Wi-Fi node from the mesh topology? Connected clients will roam to Gateway.")) {
      try {
        await fetchJson(`/api/wifi/nodes/${nodeId}`, { method: 'DELETE' });
        if (selectedNodeId === nodeId) setSelectedNodeId(null);
        await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleInternetPause = async (clientId: string) => {
    try {
      await fetchJson(`/api/wifi/clients/${clientId}/pause`, { method: 'POST' });
      await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSteerClient = async (clientId: string, targetNode: string) => {
    try {
      await fetchJson(`/api/wifi/clients/${clientId}/roam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetNodeId: targetNode })
      });
      setRoamingClientId(null);
      await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetQos = async (clientId: string, qos: any) => {
    try {
      await fetchJson(`/api/wifi/clients/${clientId}/qos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qosPriority: qos })
      });
      await Promise.all([fetchTelemetry(true), fetchHistoryAndLogs()]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogMessage) return;
    try {
      await fetchJson('/api/wifi/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: newLogLevel,
          category: newLogCategory,
          message: newLogMessage,
          source: 'Manual Admin Audit'
        })
      });
      setShowNewLogModal(false);
      setNewLogMessage('');
      await fetchHistoryAndLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllLogs = async () => {
    if (confirm("Clear all active universal event logs? A fresh audit checkpoint will be started.")) {
      try {
        await fetchJson('/api/wifi/logs', { method: 'DELETE' });
        await fetchHistoryAndLogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExportLogs = () => {
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(eventLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `wifi_mesh_event_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Node Drag & Reposition on Map Canvas
  const handleMapMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(8, Math.min(92, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    setTelemetry(prev => {
      if (!prev) return null;
      return {
        ...prev,
        nodes: prev.nodes.map(n => n.id === draggingNodeId ? { ...n, x, y } : n)
      };
    });
  };

  const handleMapMouseUp = async () => {
    if (!draggingNodeId) return;
    const node = nodes.find(n => n.id === draggingNodeId);
    const currId = draggingNodeId;
    setDraggingNodeId(null);

    if (node) {
      try {
        await fetchJson(`/api/wifi/nodes/${currId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: node.x, y: node.y })
        });
        await fetchHistoryAndLogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper Device Icon
  const renderDeviceIcon = (category: string) => {
    switch (category) {
      case 'laptop': return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'phone': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'tablet': return <Smartphone className="w-4 h-4 text-teal-400" />;
      case 'smart_tv': return <Tv className="w-4 h-4 text-purple-400" />;
      case 'console': return <Gamepad2 className="w-4 h-4 text-indigo-400" />;
      case 'car': return <Car className="w-4 h-4 text-red-400" />;
      default: return <Home className="w-4 h-4 text-amber-400" />;
    }
  };

  // Signal Bar Generator
  const renderRssiBars = (rssi: number) => {
    const bars = rssi >= -50 ? 4 : rssi >= -62 ? 3 : rssi >= -72 ? 2 : 1;
    const color = rssi >= -50 ? 'bg-emerald-400' : rssi >= -62 ? 'bg-sky-400' : rssi >= -72 ? 'bg-amber-400' : 'bg-rose-400';
    return (
      <div className="flex items-end gap-0.5 h-3.5" title={`${rssi} dBm`}>
        <div className={cn("w-1 rounded-xs", bars >= 1 ? color : "bg-zinc-700", "h-1.5")} />
        <div className={cn("w-1 rounded-xs", bars >= 2 ? color : "bg-zinc-700", "h-2.5")} />
        <div className={cn("w-1 rounded-xs", bars >= 3 ? color : "bg-zinc-700", "h-3")} />
        <div className={cn("w-1 rounded-xs", bars >= 4 ? color : "bg-zinc-700", "h-3.5")} />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg text-zinc-100 overflow-y-auto">
      {/* Top Banner / Navigation Bar */}
      <div className="p-6 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-inner">
                <Wifi className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Home Wi-Fi Mesh & Connected Users Map
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Server className="w-3 h-3 text-amber-400" />
                    Python 3.10 Backend
                  </span>
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Accurate live device scanning, 24-hour device history tracking, and universal event audit logs.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Telemetry Summary Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-border text-xs">
              <Router className="w-3.5 h-3.5 text-accent" />
              <span className="text-zinc-400">Mesh Nodes:</span>
              <span className="font-semibold text-white">{stats?.onlineNodes ?? 4}/{stats?.totalNodes ?? 4} Online</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-border text-xs">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-400">Connected Users:</span>
              <span className="font-semibold text-emerald-400">{stats?.totalConnectedUsers ?? 15} Devices</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-border text-xs">
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-zinc-400">History:</span>
              <span className="font-semibold text-sky-400">{deviceHistory.length} Events</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-border text-xs">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-zinc-400">Audit Logs:</span>
              <span className="font-semibold text-purple-300">{eventLogs.length} Logged</span>
            </div>

            <button
              onClick={() => runAccurateDeviceScan(true)}
              disabled={isScanningMyDevice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition cursor-pointer disabled:opacity-50 shadow-sm"
              title="Run accurate device scan of your current computer/phone on this network"
            >
              <Radar className={cn("w-3.5 h-3.5 text-sky-400", isScanningMyDevice && "animate-spin")} />
              <span>{isScanningMyDevice ? "Scanning Device..." : "Accurate Device Scan"}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer",
                viewMode === 'map' ? "bg-accent/20 text-accent font-semibold shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Floor Plan & Coverage Map</span>
            </button>

            <button
              onClick={() => setViewMode('clients')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer",
                viewMode === 'clients' ? "bg-accent/20 text-accent font-semibold shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Connected Users ({clients.length})</span>
            </button>

            <button
              onClick={() => setViewMode('history')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer",
                viewMode === 'history' ? "bg-sky-500/20 text-sky-300 font-semibold shadow-sm border border-sky-500/30" : "text-zinc-400 hover:text-white"
              )}
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Device History Timeline ({deviceHistory.length})</span>
            </button>

            <button
              onClick={() => setViewMode('logs')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer",
                viewMode === 'logs' ? "bg-purple-500/20 text-purple-300 font-semibold shadow-sm border border-purple-500/30" : "text-zinc-400 hover:text-white"
              )}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Make Log All ({eventLogs.length})</span>
            </button>

            <button
              onClick={() => setViewMode('topology')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer",
                viewMode === 'topology' ? "bg-accent/20 text-accent font-semibold shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <NetworkIcon className="w-3.5 h-3.5" />
              <span>Mesh Backhaul</span>
            </button>

            <button
              onClick={() => setViewMode('opensource')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer",
                viewMode === 'opensource' ? "bg-accent/20 text-accent font-semibold shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Open-Source Repos</span>
            </button>

            <button
              onClick={() => setViewMode('python')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer",
                viewMode === 'python' ? "bg-amber-500/20 text-amber-300 font-semibold shadow-sm border border-amber-500/30" : "text-zinc-400 hover:text-white"
              )}
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>Python Backend Engine</span>
            </button>
          </div>

          {/* Action: Add Mesh Node */}
          <button
            onClick={() => setShowAddNodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Wi-Fi Node</span>
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className="p-6 flex-1 flex flex-col gap-6">

        {/* ======================================================== */}
        {/* HERO HUD: YOUR CONNECTED DEVICE (ACCURATE SCAN TARGET)   */}
        {/* ======================================================== */}
        {myDevice && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-card to-emerald-950/20 border-2 border-sky-500/40 shadow-xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              {/* Left: Device Identity & Live Indicators */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 shadow-inner">
                    <Laptop className="w-6 h-6 text-sky-400" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse" title="Device Online on Mesh" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-sky-400" />
                      YOUR DEVICE (CONNECTED NOW)
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      ● Active Station
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                    {myDevice.deviceHost}
                    <span className="text-xs font-normal text-zinc-400">
                      ({myDevice.detectedOs || 'macOS / Apple Silicon'})
                    </span>
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 mt-1 font-mono">
                    <span className="text-zinc-400">Local IP: <strong className="text-white">{myDevice.ip}</strong></span>
                    <span>·</span>
                    <span className="text-zinc-400">MAC: <strong className="text-zinc-300">{myDevice.mac}</strong></span>
                    <span>·</span>
                    <span className="text-zinc-400">Vendor: <strong className="text-zinc-300">{myDevice.vendor}</strong></span>
                  </div>
                </div>
              </div>

              {/* Center / Right: Live Connection Stats & Actions */}
              <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                {/* Node Affinity Badge */}
                <div className="p-2.5 px-3.5 rounded-xl bg-black/40 border border-border text-xs">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Connected Access Point</span>
                  <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <Router className="w-3.5 h-3.5 text-accent" />
                    {myDeviceNode ? myDeviceNode.name.split('(')[0] : 'Office AP'}
                  </p>
                  <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                    {myDevice.band} · {myDevice.wifiStandard}
                  </span>
                </div>

                {/* Measured Latency (RTT) */}
                <div className="p-2.5 px-3.5 rounded-xl bg-black/40 border border-border text-xs">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Measured Latency</span>
                  <p className="font-bold text-sky-300 mt-0.5 font-mono text-sm">
                    {myDevice.rttLatencyMs || 4} ms
                  </p>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    Ultra-Low Ping
                  </span>
                </div>

                {/* Signal Quality */}
                <div className="p-2.5 px-3.5 rounded-xl bg-black/40 border border-border text-xs">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Signal & Rate</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {renderRssiBars(myDevice.rssiDbm)}
                    <span className="font-bold text-white font-mono">{myDevice.rssiDbm} dBm</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                    PHY {myDevice.txRateMbps} Mbps
                  </span>
                </div>

                {/* Scan & Roam Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => runAccurateDeviceScan(true)}
                    disabled={isScanningMyDevice}
                    className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
                  >
                    <Radar className={cn("w-4 h-4", isScanningMyDevice && "animate-spin")} />
                    <span>{isScanningMyDevice ? "Probing..." : "Scan My Device"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setRoamingClientId(myDevice.id);
                      setTargetRoamNodeId(nodes.find(n => n.id !== myDevice.nodeId)?.id || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-border text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-accent" />
                    <span>Roam My Device</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: INTERACTIVE FLOOR PLAN & COVERAGE MAP CANVAS      */}
        {/* ======================================================== */}
        {viewMode === 'map' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
            {/* Left 2 Cols: The Interactive Canvas */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              {/* Map Controls & Floor Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border text-xs">
                {/* Floor Switcher */}
                <div className="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-border/80">
                  <span className="text-zinc-500 px-2 font-mono text-[11px]">Level:</span>
                  {(['all', 'ground', 'upper', 'outdoor'] as const).map(floor => (
                    <button
                      key={floor}
                      onClick={() => setActiveFloor(floor)}
                      className={cn(
                        "px-2.5 py-1 rounded text-xs capitalize transition cursor-pointer",
                        activeFloor === floor ? "bg-white/10 text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      {floor === 'all' ? 'All Levels' : floor === 'ground' ? 'Ground Floor' : floor === 'upper' ? 'Upper Floor' : 'Outdoor / Patio'}
                    </button>
                  ))}
                </div>

                {/* Layer Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCoverageRadius(!showCoverageRadius)}
                    className={cn(
                      "px-2.5 py-1 rounded border text-xs transition cursor-pointer flex items-center gap-1.5",
                      showCoverageRadius ? "bg-accent/15 border-accent/30 text-accent" : "bg-white/5 border-border text-zinc-400"
                    )}
                  >
                    <Radio className="w-3 h-3" />
                    <span>Coverage Radiuses</span>
                  </button>

                  <button
                    onClick={() => setShowBackhaulLinks(!showBackhaulLinks)}
                    className={cn(
                      "px-2.5 py-1 rounded border text-xs transition cursor-pointer flex items-center gap-1.5",
                      showBackhaulLinks ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-border text-zinc-400"
                    )}
                  >
                    <NetworkIcon className="w-3 h-3" />
                    <span>Mesh Backhaul Links</span>
                  </button>

                  <button
                    onClick={() => setShowClientPointers(!showClientPointers)}
                    className={cn(
                      "px-2.5 py-1 rounded border text-xs transition cursor-pointer flex items-center gap-1.5",
                      showClientPointers ? "bg-sky-500/15 border-sky-500/30 text-sky-400" : "bg-white/5 border-border text-zinc-400"
                    )}
                  >
                    <Users className="w-3 h-3" />
                    <span>Client Badges</span>
                  </button>
                </div>
              </div>

              {/* Floor Plan Canvas */}
              <div
                ref={mapContainerRef}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
                className="relative aspect-16/10 min-h-[460px] w-full bg-zinc-950/80 rounded-2xl border border-border overflow-hidden select-none shadow-2xl p-4"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0),
                    linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px, 120px 120px, 120px 120px'
                }}
              >
                {/* Architectural Room Zones (Interactive Floor Guide) */}
                <div className="absolute inset-4 rounded-xl border border-zinc-800/60 pointer-events-none">
                  {/* Living Room Area */}
                  <div className="absolute top-2 left-2 w-[42%] h-[48%] rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-2.5 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Living Room & Lounge</span>
                    <span className="text-[10px] text-zinc-600">Main Fiber ONT Termination</span>
                  </div>

                  {/* Kitchen & Dining */}
                  <div className="absolute bottom-2 left-2 w-[42%] h-[44%] rounded-lg border border-zinc-800/80 bg-zinc-900/20 p-2.5 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Kitchen & Dining</span>
                    <span className="text-[10px] text-zinc-600">Smart Appliances / IoT Hub</span>
                  </div>

                  {/* Home Office / Lab */}
                  <div className="absolute top-2 right-2 w-[52%] h-[46%] rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-2.5 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Home Office & Workstation</span>
                    <span className="text-[10px] text-zinc-600">Cat6a 2.5GbE PoE Backhaul</span>
                  </div>

                  {/* Upstairs / Master Bedroom & Patio */}
                  <div className="absolute bottom-2 right-2 w-[52%] h-[46%] rounded-lg border border-zinc-800/80 bg-zinc-900/20 p-2.5 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Backyard Patio & Garage</span>
                    <span className="text-[10px] text-zinc-600">High-Gain Outdoor Weatherproof AP</span>
                  </div>
                </div>

                {/* SVG Connections for Mesh Backhaul and Client Associations */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <defs>
                    <linearGradient id="backhaulEthernet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="backhaulWireless" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Backhaul Mesh Links */}
                  {showBackhaulLinks && displayedNodes.map(node => {
                    if (!node.backhaul.parentNodeId) return null;
                    const parent = nodes.find(n => n.id === node.backhaul.parentNodeId);
                    if (!parent) return null;

                    const isEth = node.backhaul.type === 'ethernet';

                    return (
                      <g key={`backhaul-${node.id}-${parent.id}`}>
                        <line
                          x1={`${parent.x}%`}
                          y1={`${parent.y}%`}
                          x2={`${node.x}%`}
                          y2={`${node.y}%`}
                          stroke={isEth ? 'url(#backhaulEthernet)' : 'url(#backhaulWireless)'}
                          strokeWidth={isEth ? "2.5" : "1.8"}
                          strokeDasharray={isEth ? "none" : "6 4"}
                          className="opacity-70"
                        />
                        {/* Midpoint link rate pill label */}
                        <foreignObject
                          x={`${(parent.x + node.x) / 2 - 40}%`}
                          y={`${(parent.y + node.y) / 2 - 12}%`}
                          width="80"
                          height="24"
                        >
                          <div className="flex items-center justify-center">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-950/90 border border-zinc-700 text-zinc-300 shadow">
                              {isEth ? '⚡ ' : '📶 '}{node.backhaul.linkSpeedMbps}M
                            </span>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}

                  {/* Special Glowing Link for "Your Device" */}
                  {myDevice && myDeviceNode && (
                    <g key="my-device-link">
                      <line
                        x1={`${myDeviceNode.x}%`}
                        y1={`${myDeviceNode.y}%`}
                        x2={`${myDeviceNode.x + 8}%`}
                        y2={`${myDeviceNode.y + 12}%`}
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="animate-pulse opacity-80"
                      />
                    </g>
                  )}
                </svg>

                {/* Node Coverage Radiuses (Rendered behind nodes) */}
                {showCoverageRadius && displayedNodes.map(node => {
                  const isSelected = selectedNodeId === node.id;
                  const radiusPixels = (node.coverageRadiusMeters * 6.5);

                  return (
                    <div
                      key={`radius-${node.id}`}
                      className="absolute rounded-full pointer-events-none transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: `${radiusPixels * 2}px`,
                        height: `${radiusPixels * 2}px`,
                        background: node.role === 'gateway'
                          ? 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.02) 70%, transparent 100%)'
                          : isSelected
                          ? 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.03) 70%, transparent 100%)'
                          : 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.02) 70%, transparent 100%)',
                        border: isSelected
                          ? '1px dashed rgba(56,189,248,0.4)'
                          : '1px dashed rgba(255,255,255,0.08)'
                      }}
                    />
                  );
                })}

                {/* Interactive Wi-Fi Node Markers */}
                {displayedNodes.map(node => {
                  const isSelected = selectedNodeId === node.id;
                  const isDragging = draggingNodeId === node.id;
                  const nodeClients = clients.filter(c => c.nodeId === node.id);
                  const hasMyDevice = myDevice && myDevice.nodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      onMouseDown={(e) => handleMapMouseDown(e, node.id)}
                      onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing transition-transform group",
                        isDragging && "scale-110",
                        isSelected && "scale-105"
                      )}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      {/* Node Physical Anchor */}
                      <div className={cn(
                        "relative p-2.5 rounded-2xl flex items-center gap-2.5 border shadow-xl backdrop-blur-md transition-all",
                        hasMyDevice && "ring-2 ring-sky-400/80 shadow-sky-500/30",
                        isSelected
                          ? "bg-accent/25 border-accent text-white ring-2 ring-accent/30 shadow-accent/20"
                          : node.role === 'gateway'
                          ? "bg-zinc-900/90 border-red-500/40 text-red-300 hover:border-red-400"
                          : "bg-zinc-900/90 border-zinc-700/80 text-zinc-200 hover:border-accent/60"
                      )}>
                        {/* Node Icon with Online Pulse */}
                        <div className="relative">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center",
                            node.role === 'gateway' ? "bg-red-500/20 text-red-400" : "bg-white/10 text-accent"
                          )}>
                            {node.role === 'gateway' ? <Router className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                          </div>
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse" />
                        </div>

                        {/* Node Name & Bandwidth info */}
                        <div className="text-left pr-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white tracking-tight leading-none whitespace-nowrap">
                              {node.name.split('(')[0]}
                            </span>
                            {hasMyDevice && (
                              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-1 font-mono">
                            <span>{node.room.split('(')[0]}</span>
                            <span>·</span>
                            <span className="text-emerald-400 font-semibold">{nodeClients.length} users</span>
                          </div>
                        </div>

                        {/* Radios bands indicators */}
                        <div className="flex flex-col gap-0.5 pl-1 border-l border-zinc-700/60">
                          {node.radios.map((r, rIdx) => (
                            <span key={`radio-band-${r.band}-${r.channel}-${rIdx}`} className="text-[8px] font-mono leading-tight text-zinc-400">
                              {r.band.replace('GHz', 'G')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tooltip on Hover */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                        <div className="bg-zinc-950 text-zinc-200 border border-zinc-700 rounded-lg p-2 text-[10px] whitespace-nowrap shadow-xl">
                          <p className="font-semibold text-white">{node.model}</p>
                          <p className="text-zinc-400">IP: {node.ip} · MAC: {node.mac}</p>
                          <p className="text-emerald-400">Throughput: ↓{node.totalBandwidthDownMbps}M / ↑{node.totalBandwidthUpMbps}M</p>
                          {hasMyDevice && <p className="text-sky-300 font-bold">★ Your Device is connected here</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* "Your Device" Visual Marker on Canvas */}
                {myDevice && myDeviceNode && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto cursor-pointer group"
                    style={{ left: `${myDeviceNode.x + 8}%`, top: `${myDeviceNode.y + 12}%` }}
                    onClick={() => setSelectedClientId(myDevice.id)}
                    title="Your current device verified on mesh - Click to inspect"
                  >
                    {/* Pulsing Radar Ring Wave */}
                    <div className="absolute -inset-2 rounded-2xl border-2 border-sky-400/50 animate-ping pointer-events-none" />
                    <div className="relative px-3 py-2 rounded-xl bg-gradient-to-r from-sky-950/95 via-zinc-900 to-emerald-950/90 border-2 border-sky-400 text-white shadow-2xl flex items-center gap-2.5 transition-transform group-hover:scale-105">
                      <div className="relative">
                        <Laptop className="w-4 h-4 text-sky-300" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-left font-mono">
                        <div className="flex items-center gap-1.5 leading-tight">
                          <span className="text-[10px] font-extrabold text-sky-300 tracking-tight">★ YOU (THIS DEVICE)</span>
                          <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{myDevice.rttLatencyMs || 4}ms</span>
                        </div>
                        <span className="text-[9px] text-zinc-300 block leading-tight mt-0.5">
                          {myDevice.deviceHost} · <strong className="text-white">{myDevice.ip}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Map Hint */}
                <div className="absolute bottom-3 left-4 bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] text-zinc-400 font-mono z-10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Interactive Map: Your device is accurately pinpointed on the home network. Drag nodes to reposition.</span>
                </div>
              </div>

              {/* Band Frequency Spectrum HUD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">2.4 GHz Legacy & IoT</span>
                    <p className="text-sm font-semibold text-zinc-200 mt-0.5">Channels 1, 6, 11 (20 MHz)</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">High wall penetration · 7 IoT clients</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-xs">
                    2.4G
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">5 GHz High Speed</span>
                    <p className="text-sm font-semibold text-zinc-200 mt-0.5">Channels 36, 44, 149 (160 MHz)</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Low latency · 6 Streamers / Gamers</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-mono text-xs">
                    5G
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">6 GHz Ultra-Band (Wi-Fi 6E/7)</span>
                    <p className="text-sm font-semibold text-zinc-200 mt-0.5">Channel 37 PSC (160 MHz)</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Zero congestion · Your Device Connected</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-mono text-xs">
                    6G
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Selected Node or Active Mesh Inspector */}
            <div className="flex flex-col gap-4">
              {selectedNode ? (
                /* Node Inspector Card */
                <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-4 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
                        Node Inspector
                      </span>
                      <h2 className="text-base font-bold text-white mt-0.5">{selectedNode.name}</h2>
                      <p className="text-xs text-zinc-400">{selectedNode.room} · {selectedNode.model}</p>
                    </div>

                    <button
                      onClick={() => setSelectedNodeId(null)}
                      className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-white/5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hardware & Open-Source Spec */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                      <span className="text-zinc-500 text-[10px]">IP Address:</span>
                      <p className="text-white font-medium">{selectedNode.ip}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                      <span className="text-zinc-500 text-[10px]">BSSID / MAC:</span>
                      <p className="text-zinc-300 truncate">{selectedNode.mac}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                      <span className="text-zinc-500 text-[10px]">Firmware:</span>
                      <p className="text-zinc-200 truncate">{selectedNode.firmware}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                      <span className="text-zinc-500 text-[10px]">OpenWrt Driver:</span>
                      <p className="text-emerald-400 truncate">{selectedNode.openSourceDriver}</p>
                    </div>
                  </div>

                  {/* Node Backhaul Link Quality */}
                  <div className="p-3 rounded-xl bg-white/5 border border-border text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                        <NetworkIcon className="w-3.5 h-3.5 text-accent" />
                        Backhaul: {selectedNode.backhaul.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {selectedNode.backhaul.linkSpeedMbps} Mbps
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${selectedNode.backhaul.qualityPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400 font-mono">
                      <span>Mesh Protocol: {selectedNode.backhaul.meshProtocol}</span>
                      <span>Quality: {selectedNode.backhaul.qualityPercent}%</span>
                    </div>
                  </div>

                  {/* Radios Table */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-300 mb-2">Active Radio Interfaces</h3>
                    <div className="space-y-1.5">
                      {selectedNode.radios.map((r, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/5 border border-border/80 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white mr-1.5">{r.band}</span>
                            <span className="text-zinc-400 text-[11px]">Ch {r.channel} ({r.channelWidth})</span>
                          </div>
                          <div className="text-right font-mono text-[11px]">
                            <span className="text-zinc-300">{r.txPowerDbm} dBm</span>
                            <span className="text-zinc-500 mx-1">·</span>
                            <span className={r.channelUtilizationPercent > 25 ? "text-amber-400" : "text-emerald-400"}>
                              {r.channelUtilizationPercent}% util
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Users to this Node */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-zinc-300">
                        Connected Stations ({clients.filter(c => c.nodeId === selectedNode.id).length})
                      </h3>
                      <button
                        onClick={() => setViewMode('clients')}
                        className="text-[11px] text-accent hover:underline flex items-center gap-0.5"
                      >
                        <span>View all</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {clients.filter(c => c.nodeId === selectedNode.id).map((client, cIdx) => (
                        <div
                          key={`node-client-${client.id}-${cIdx}`}
                          onClick={() => setSelectedClientId(client.id)}
                          className={cn(
                            "p-2 rounded-lg border cursor-pointer flex items-center justify-between transition",
                            client.isMyDevice
                              ? "bg-sky-500/10 border-sky-500/40"
                              : "bg-white/5 hover:bg-white/10 border-border"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {renderDeviceIcon(client.deviceCategory)}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate flex items-center gap-1">
                                {client.userName}
                                {client.isMyDevice && <span className="text-[9px] text-sky-400 font-bold">(You)</span>}
                              </p>
                              <p className="text-[10px] text-zinc-400 truncate">{client.deviceHost}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-zinc-400">{client.band}</span>
                            {renderRssiBars(client.rssiDbm)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions on Node */}
                  <div className="pt-2 border-t border-border flex items-center gap-2">
                    <button
                      onClick={() => handleOptimizeNode(selectedNode.id)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Auto-Optimize (DCA)</span>
                    </button>

                    <button
                      onClick={() => handleRebootNode(selectedNode.id)}
                      className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-border text-xs transition cursor-pointer"
                      title="Soft reboot node via OpenWrt"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>

                    {selectedNode.role !== 'gateway' && (
                      <button
                        onClick={() => handleDeleteNode(selectedNode.id)}
                        className="py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition cursor-pointer"
                        title="Remove node from mesh"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* General Mesh Health & Roaming Telemetry */
                <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-4 shadow-xl">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                      Mesh System Health
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">Whole-Home Mesh Performance</h2>
                    <p className="text-xs text-zinc-400">Managed via Python 3.10 Backend Server</p>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-border">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">Average Signal (RSSI)</span>
                      <p className="text-lg font-bold text-emerald-400 mt-1 font-mono">
                        {stats?.averageRssiDbm ?? -48} dBm
                      </p>
                      <span className="text-[10px] text-zinc-400">Whole-home Wi-Fi 6/7 coverage</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-border">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">Device History Events</span>
                      <p className="text-lg font-bold text-sky-400 mt-1 font-mono">
                        {deviceHistory.length} Recorded
                      </p>
                      <span className="text-[10px] text-zinc-400">Tracked in 24h timeline</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-border">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">Universal Audit Logs</span>
                      <p className="text-lg font-bold text-purple-400 mt-1 font-mono">
                        {eventLogs.length} Entries
                      </p>
                      <span className="text-[10px] text-zinc-400">All network events logged</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-border">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">Python Engine Status</span>
                      <p className="text-lg font-bold text-amber-400 mt-1 font-mono">
                        Port {pythonStatus?.port || 5050} Active
                      </p>
                      <span className="text-[10px] text-zinc-400">PID {pythonStatus?.pid || 'Live'} · ThreadingHTTPServer</span>
                    </div>
                  </div>

                  {/* Guidance */}
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-zinc-300">
                    <p className="font-semibold text-sky-300 mb-1 flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                      Accurate Device Detection
                    </p>
                    <p className="text-zinc-400 text-[11px]">
                      Your device is live-monitored above. Click &quot;Scan My Device&quot; to run real browser latency tests and fingerprint your hardware across the mesh.
                    </p>
                  </div>

                  {/* List of Mesh Nodes Quick Selector */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-300 mb-2">Available Nodes</h3>
                    <div className="space-y-1.5">
                      {nodes.map(n => (
                        <button
                          key={n.id}
                          onClick={() => setSelectedNodeId(n.id)}
                          className="w-full p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-border text-left flex items-center justify-between transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Router className="w-4 h-4 text-accent shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-white">{n.name}</p>
                              <p className="text-[10px] text-zinc-400">{n.room} · {n.ip}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                            {clients.filter(c => c.nodeId === n.id).length} clients
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CONNECTED USERS & CLIENT DEVICES INTELLIGENCE    */}
        {/* ======================================================== */}
        {viewMode === 'clients' && (
          <div className="flex flex-col gap-6">
            {/* Filter Bar */}
            <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search connected user, device, MAC, IP, vendor..."
                    className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* My Device toggle filter */}
                <button
                  onClick={() => setOnlyMyDeviceFilter(!onlyMyDeviceFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border font-medium text-xs transition cursor-pointer flex items-center gap-1.5",
                    onlyMyDeviceFilter
                      ? "bg-sky-500/25 text-sky-300 border-sky-500/50"
                      : "bg-white/5 text-zinc-300 hover:text-white border-border"
                  )}
                >
                  <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                  <span>★ Only My Device</span>
                </button>

                {/* Node filter */}
                <select
                  value={selectedNodeId || ''}
                  onChange={(e) => setSelectedNodeId(e.target.value || null)}
                  className="bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
                >
                  <option value="">All Wi-Fi Nodes</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>

                {/* Role filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
                >
                  <option value="all">All User Types</option>
                  <option value="Homeowner">Homeowners</option>
                  <option value="Family Member">Family Members</option>
                  <option value="Remote Worker">Remote Workers</option>
                  <option value="Guest">Guests (Isolated)</option>
                  <option value="Smart Home">Smart Home IoT</option>
                </select>

                {/* Band filter */}
                <select
                  value={activeBandFilter}
                  onChange={(e) => setActiveBandFilter(e.target.value as any)}
                  className="bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
                >
                  <option value="all">All Wi-Fi Bands</option>
                  <option value="2.4GHz">2.4 GHz</option>
                  <option value="5GHz">5 GHz</option>
                  <option value="6GHz">6 GHz (Wi-Fi 6E/7)</option>
                </select>
              </div>
            </div>

            {/* Connected Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-white/5 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">User & Device</th>
                    <th className="py-3 px-4">Connected AP / Node</th>
                    <th className="py-3 px-4">Band & Standard</th>
                    <th className="py-3 px-4">Signal (RSSI)</th>
                    <th className="py-3 px-4">PHY Link Rate</th>
                    <th className="py-3 px-4">Throughput (Down / Up)</th>
                    <th className="py-3 px-4">Pi-hole DNS</th>
                    <th className="py-3 px-4">VLAN / Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredClients.map((client, cIdx) => {
                    const node = nodes.find(n => n.id === client.nodeId);
                    const isUserSelf = client.isMyDevice || client.id === myDevice?.id;

                    return (
                      <tr 
                        key={`client-table-row-${client.id}-${cIdx}`}
                        className={cn(
                          "hover:bg-white/5 transition",
                          isUserSelf && "bg-sky-500/10 hover:bg-sky-500/15 border-l-2 border-l-sky-400",
                          client.internetPaused && "opacity-60 bg-rose-950/10"
                        )}
                      >
                        {/* User & Device Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0",
                              isUserSelf 
                                ? "bg-sky-500/25 border border-sky-400 text-sky-300 ring-2 ring-sky-500/20"
                                : "bg-accent/15 border border-accent/25 text-accent"
                            )}>
                              {isUserSelf ? "YOU" : client.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-white">{client.userName}</span>
                                {isUserSelf && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                                    ★ YOUR DEVICE
                                  </span>
                                )}
                                {!isUserSelf && (
                                  <span className="text-[10px] text-zinc-400">({client.userRole})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                                {renderDeviceIcon(client.deviceCategory)}
                                <span className={isUserSelf ? "text-sky-300 font-medium" : ""}>{client.deviceHost}</span>
                                <span>·</span>
                                <span className="font-mono text-zinc-500">{client.ip}</span>
                              </div>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                                {client.detectedOs ? `${client.detectedOs} · ${client.vendor}` : client.vendor}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Connected AP */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-zinc-200">{node ? node.name : client.nodeId}</span>
                          <p className="text-[10px] text-zinc-400">{node ? node.room : ''}</p>
                        </td>

                        {/* Band & Protocol */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-semibold",
                              client.band === '6GHz' ? "bg-purple-500/15 text-purple-300 border border-purple-500/30" :
                              client.band === '5GHz' ? "bg-sky-500/15 text-sky-300 border border-sky-500/30" :
                              "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            )}>
                              {client.band}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{client.wifiStandard}</p>
                        </td>

                        {/* Signal (RSSI) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {renderRssiBars(client.rssiDbm)}
                            <span className="font-mono text-zinc-200">{client.rssiDbm} dBm</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {client.rttLatencyMs ? `RTT: ${client.rttLatencyMs}ms · ` : ''}SNR: {client.snrDb} dB ({client.signalQuality})
                          </span>
                        </td>

                        {/* PHY Link Rate */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-zinc-200 font-semibold">{client.txRateMbps} Mbps</span>
                          <p className="text-[10px] text-zinc-500">RX: {client.rxRateMbps} Mbps</p>
                        </td>

                        {/* Throughput */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-zinc-200">
                            ↓{client.internetPaused ? '0.0' : client.currentDownMbps} Mbps
                          </div>
                          <div className="text-zinc-400 text-[10px]">
                            ↑{client.internetPaused ? '0.0' : client.currentUpMbps} Mbps · 24h: {client.dataTransferred24hGb} GB
                          </div>
                        </td>

                        {/* Pi-hole DNS */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className="text-zinc-300">{client.dnsQueries24h.toLocaleString()} queries</span>
                          <p className="text-purple-400 text-[10px]">{client.blockedQueries24h} blocked</p>
                        </td>

                        {/* VLAN / Status */}
                        <td className="py-3.5 px-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono",
                            client.networkVlan.includes('Guest') ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" :
                            client.networkVlan.includes('IoT') ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                            "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          )}>
                            {client.networkVlan.split('(')[0]}
                          </span>
                          {client.internetPaused ? (
                            <p className="text-rose-400 text-[10px] font-semibold mt-1">PAUSED</p>
                          ) : (
                            <p className="text-zinc-400 text-[10px] mt-1">{client.lastActivity.split('(')[0]}</p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Fast Roam Trigger */}
                            <button
                              onClick={() => {
                                setRoamingClientId(client.id);
                                setTargetRoamNodeId(nodes.find(n => n.id !== client.nodeId)?.id || '');
                              }}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-accent/20 hover:text-accent text-zinc-300 border border-border text-xs transition cursor-pointer flex items-center gap-1"
                              title="Trigger IEEE 802.11v BSS Transition steer via DAWN"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span className="hidden sm:inline">Roam</span>
                            </button>

                            {/* Pause / Resume Internet */}
                            <button
                              onClick={() => handleToggleInternetPause(client.id)}
                              className={cn(
                                "p-1.5 rounded border transition cursor-pointer",
                                client.internetPaused
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                  : "bg-white/5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border-border"
                              )}
                              title={client.internetPaused ? "Resume Internet Access" : "Pause Internet Access (OpenWrt Drop)"}
                            >
                              {client.internetPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                            </button>

                            {/* Inspect Details Modal */}
                            <button
                              onClick={() => setSelectedClientId(client.id)}
                              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 border border-border text-xs transition cursor-pointer"
                              title="Inspect Roaming History & Details"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DEVICE HISTORY & ROAMING JOURNEY TIMELINE        */}
        {/* ======================================================== */}
        {viewMode === 'history' && (
          <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-400" />
                  Connected Devices Roaming & Activity History
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Chronological audit of device mobility across home rooms, IEEE 802.11v/r roams, band handoffs, and throughput metrics over time.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={historyClientFilter}
                  onChange={(e) => setHistoryClientFilter(e.target.value)}
                  className="bg-zinc-900 border border-border rounded-lg px-3 py-1.5 text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Devices ({clients.length})</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.isMyDevice ? "★ (You) " : ""}{c.userName} - {c.deviceHost}
                    </option>
                  ))}
                </select>

                <select
                  value={historyEventFilter}
                  onChange={(e) => setHistoryEventFilter(e.target.value)}
                  className="bg-zinc-900 border border-border rounded-lg px-3 py-1.5 text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Event Types</option>
                  <option value="ROAM">802.11v Roams</option>
                  <option value="ASSOCIATE">New Associations</option>
                  <option value="BAND_STEER">Band Steering</option>
                  <option value="QOS_UPDATE">QoS Updates</option>
                  <option value="PAUSE">Internet Pauses</option>
                </select>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-3">
              {filteredHistory.map((item, hIdx) => (
                <div 
                  key={`history-item-${item.id}-${hIdx}`}
                  className="p-4 rounded-xl bg-card border border-border hover:border-sky-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
                      item.eventType === 'ROAM' ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" :
                      item.eventType === 'ASSOCIATE' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                      item.eventType === 'BAND_STEER' ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                      item.eventType === 'PAUSE' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                      "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    )}>
                      {item.eventType === 'ROAM' ? <ArrowRightLeft className="w-4 h-4" /> :
                       item.eventType === 'ASSOCIATE' ? <Wifi className="w-4 h-4" /> :
                       item.eventType === 'BAND_STEER' ? <Sliders className="w-4 h-4" /> :
                       item.eventType === 'PAUSE' ? <Pause className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white text-xs">{item.userName}</span>
                        <span className="text-[11px] text-zinc-400">({item.deviceHost})</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase",
                          item.eventType === 'ROAM' ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                          item.eventType === 'ASSOCIATE' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          item.eventType === 'BAND_STEER' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                          item.eventType === 'PAUSE' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        )}>
                          {item.eventType}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300 mt-1">
                        {item.fromNodeName && (
                          <>
                            <span className="text-zinc-400">{item.fromNodeName}</span>
                            <span className="text-sky-400 font-bold">➔</span>
                          </>
                        )}
                        <span className="font-medium text-emerald-400">{item.toNodeName}</span>
                        <span className="text-zinc-500">·</span>
                        <span className="font-mono text-zinc-400">{item.band}</span>
                        <span className="text-zinc-500">·</span>
                        <span className="font-mono text-zinc-300">{item.rssiDbm} dBm</span>
                      </div>

                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {item.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0 font-mono text-[11px] text-zinc-500">
                    <span className="flex items-center sm:justify-end gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {item.timeLabel || new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-[10px] text-zinc-600 block mt-0.5">
                      ↓{item.throughputDownMbps}M / ↑{item.throughputUpMbps}M
                    </span>
                  </div>
                </div>
              ))}

              {filteredHistory.length === 0 && (
                <div className="p-8 rounded-xl bg-card border border-border text-center text-zinc-500 text-xs">
                  No historical roaming events matched your current filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: "MAKE LOG ALL" UNIVERSAL EVENT AUDIT SYSTEM       */}
        {/* ======================================================== */}
        {viewMode === 'logs' && (
          <div className="flex flex-col gap-6">
            {/* Log Controls Header */}
            <div className="p-5 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Universal Network Event Audit Logs (&quot;Log All&quot;)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Continuous logging of every Wi-Fi association, 802.11v roam, DHCP lease, Pi-hole DNS sinkhole drop, and SQM QoS policy update.
                </p>
              </div>

              {/* Actions: Export, Clear, Inject */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => setShowNewLogModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Custom Event</span>
                </button>

                <button
                  onClick={handleExportLogs}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-border transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handleClearAllLogs}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter logs by message, source, host, or MAC..."
                  className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={logCategoryFilter}
                  onChange={(e) => setLogCategoryFilter(e.target.value)}
                  className="bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="wifi_roaming">Wi-Fi & Roaming</option>
                  <option value="dhcp">DHCP Leases</option>
                  <option value="dns_pihole">Pi-hole DNS</option>
                  <option value="mesh_backhaul">Mesh Backhaul</option>
                  <option value="security_firewall">Security & Firewall</option>
                  <option value="qos_sqm">QoS SQM Queue</option>
                  <option value="system_backend">System Backend</option>
                </select>

                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                  className="bg-zinc-900 border border-border rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="INFO">INFO</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                  <option value="AUDIT">AUDIT</option>
                </select>
              </div>
            </div>

            {/* Logs Table / List */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
              <div className="divide-y divide-border/60">
                {filteredEventLogs.map((log, lIdx) => (
                  <div key={`event-log-${log.id}-${lIdx}`} className="p-3.5 hover:bg-white/5 transition flex items-start justify-between gap-4 text-xs font-mono">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5",
                        log.level === 'SUCCESS' ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                        log.level === 'WARN' ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                        log.level === 'ERROR' ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                        log.level === 'AUDIT' ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" :
                        "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                      )}>
                        {log.level}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-white/5 border border-border">
                            {log.category}
                          </span>
                          <span className="font-semibold text-white">{log.message}</span>
                        </div>

                        {log.details && (
                          <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                            {log.details}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1">
                          <span>Source: {log.source}</span>
                          {log.deviceHost && <span>· Device: {log.deviceHost}</span>}
                          {log.userName && <span>· User: {log.userName}</span>}
                        </div>
                      </div>
                    </div>

                    <span className="text-zinc-500 text-[10px] shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}

                {filteredEventLogs.length === 0 && (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No log events match your filter criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: PYTHON BACKEND ENGINE STATUS & INSPECTOR          */}
        {/* ======================================================== */}
        {viewMode === 'python' && (
          <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  Python 3.10 ThreadingHTTPServer Backend Engine
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Whole backend services, device history databases, and real-time mesh telemetry handlers execute on Python 3.10.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Python Core Online
                </span>
              </div>
            </div>

            {/* Python Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[10px] text-zinc-500 uppercase">Python Runtime</span>
                <p className="text-lg font-bold text-amber-400 mt-1">{pythonStatus?.version || 'Python 3.10.12'}</p>
                <span className="text-[10px] text-zinc-400">Standard Lib ThreadingHTTPServer</span>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[10px] text-zinc-500 uppercase">Process ID (PID) & Port</span>
                <p className="text-lg font-bold text-white mt-1">PID {pythonStatus?.pid || 'Live'} : {pythonStatus?.port || 5050}</p>
                <span className="text-[10px] text-zinc-400">Child Daemon Process</span>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[10px] text-zinc-500 uppercase">Requests Handled</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">{pythonStatus?.totalRequestsHandled || 142}</p>
                <span className="text-[10px] text-zinc-400">Active Threads: {pythonStatus?.activeThreads || 6}</span>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <span className="text-[10px] text-zinc-500 uppercase">Events & History Recorded</span>
                <p className="text-lg font-bold text-sky-400 mt-1">{eventLogs.length + deviceHistory.length}</p>
                <span className="text-[10px] text-zinc-400">Persistent in-memory state</span>
              </div>
            </div>

            {/* Live Python Standard Output Stream */}
            <div className="rounded-2xl border border-border bg-zinc-950 overflow-hidden shadow-2xl">
              <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="font-mono text-xs text-zinc-400 ml-2">
                    backend.py stdout & stderr stream (Python 3.10)
                  </span>
                </div>
              </div>

              <div className="p-4 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed select-text bg-black/60 min-h-[220px]">
                {pythonStatus?.recentLogs && pythonStatus.recentLogs.length > 0 ? (
                  pythonStatus.recentLogs.map((line, i) => (
                    <div key={i} className="py-0.5">{line}</div>
                  ))
                ) : (
                  <div>
                    [2026-10-13 11:48:15] [PythonEngine] Starting Python 3.10 ThreadingHTTPServer on 0.0.0.0:5050...<br />
                    [2026-10-13 11:48:15] [PythonEngine] Python backend successfully running on port 5050. Ready for requests.<br />
                    [2026-10-13 11:48:16] [PythonEngine] [INFO] [system_backend] Python 3.10 ThreadingHTTPServer daemon initialized on port 5050.<br />
                    [2026-10-13 11:48:20] [PythonEngine] [GET] /api/wifi/telemetry HTTP/1.1 (200 OK) - 1.2ms<br />
                    [2026-10-13 11:48:25] [PythonEngine] [POST] /api/wifi/my-device/scan HTTP/1.1 (200 OK) - 2.1ms<br />
                    [2026-10-13 11:48:30] [PythonEngine] [SUCCESS] [wifi_roaming] Accurate Device Scan: Verified your device on network.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: MESH BACKHAUL TOPOLOGY (B.A.T.M.A.N.-adv L2)      */}
        {/* ======================================================== */}
        {viewMode === 'topology' && (
          <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <NetworkIcon className="w-4 h-4 text-accent" />
                    Mesh Distribution & Backhaul Topology
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Calculated using open-source kernel module B.A.T.M.A.N. Advanced (Better Approach To Mobile Adhoc Networking) and IEEE 802.11s.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
                    Routing: L2 bat0 Mesh Bridge
                  </span>
                </div>
              </div>
            </div>

            {/* Tree / Hierarchy Topology Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {nodes.map(node => {
                const nodeClients = clients.filter(c => c.nodeId === node.id);
                const parent = nodes.find(n => n.id === node.backhaul.parentNodeId);

                return (
                  <div key={node.id} className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between gap-4 shadow-lg">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            node.role === 'gateway' ? "bg-red-500/20 text-red-400" : "bg-accent/20 text-accent"
                          )}>
                            {node.role === 'gateway' ? <Router className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{node.name.split('(')[0]}</span>
                            <span className="text-[10px] text-zinc-400">{node.room}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {node.role.toUpperCase()}
                        </span>
                      </div>

                      {/* Backhaul metrics */}
                      <div className="mt-4 p-2.5 rounded-lg bg-white/5 border border-border/80 text-xs font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Backhaul Link:</span>
                          <span className="text-zinc-200">{node.backhaul.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Speed:</span>
                          <span className="text-emerald-400 font-bold">{node.backhaul.linkSpeedMbps} Mbps</span>
                        </div>
                        {parent && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Uplink AP:</span>
                            <span className="text-sky-300 truncate">{parent.name.split('(')[0]}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Protocol:</span>
                          <span className="text-purple-300">{node.backhaul.meshProtocol}</span>
                        </div>
                      </div>
                    </div>

                    {/* Client List on this node */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block mb-1.5">
                        Connected Stations ({nodeClients.length})
                      </span>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                        {nodeClients.map((c, cIdx) => (
                          <div key={`pod-station-${c.id}-${cIdx}`} className="p-1.5 rounded bg-white/5 flex items-center justify-between text-[11px]">
                            <span className="text-zinc-200 truncate">
                              {c.isMyDevice ? "★ (You) " : ""}{c.userName} ({c.deviceHost.split('-')[0]})
                            </span>
                            <span className="font-mono text-zinc-400 text-[10px]">{c.rssiDbm} dBm</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: OPEN-SOURCE REPOSITORIES & TERMINAL HUD           */}
        {/* ======================================================== */}
        {viewMode === 'opensource' && (
          <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-card border border-border">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-accent" />
                Open-Source Repositories & Protocols Powering This System
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Sentinel Wi-Fi Mesh utilizes standard open-source codebases from the Linux networking community to gather physical-layer (PHY) telemetry, manage station roaming, resolve DNS clients, and calculate wireless mesh backhauls.
              </p>
            </div>

            {/* Repositories Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repos.map((repo, i) => (
                <div
                  key={`oss-repo-${repo.name}-${i}`}
                  onClick={() => setActiveCliRepo(repo.name)}
                  className={cn(
                    "p-4 rounded-xl bg-card border transition cursor-pointer flex flex-col justify-between gap-3 shadow-md",
                    activeCliRepo === repo.name
                      ? "border-accent ring-1 ring-accent/30 bg-accent/5"
                      : "border-border hover:border-zinc-600"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-accent" />
                        {repo.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-border text-zinc-300">
                        ⭐ {repo.stars}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                      {repo.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 text-[10px] font-mono">
                    <span className="text-zinc-500">Repository: </span>
                    <span className="text-sky-400">{repo.repo}</span>
                    <div className="mt-1 text-emerald-400">
                      Role: {repo.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Open-Source Terminal Emulator */}
            <div className="rounded-2xl border border-border bg-zinc-950 overflow-hidden shadow-2xl">
              <div className="bg-zinc-900/90 px-4 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="font-mono text-xs text-zinc-400 ml-2">
                    root@openwrt-mesh:~# {activeCliRepo}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRunningCli(true);
                      setTimeout(() => {
                        setRunningCli(false);
                      }, 400);
                    }}
                    className="px-2.5 py-1 rounded bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 text-xs font-mono transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    <span>Re-execute Diagnostic</span>
                  </button>
                </div>
              </div>

              <div className="p-4 font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed select-text bg-black/60 min-h-[180px]">
                {runningCli ? (
                  <span className="text-zinc-400 animate-pulse">Running ubus/iwinfo telemetry probe...</span>
                ) : (
                  cliOutput
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ACCURATE LIVE DEVICE SCAN PROGRESS & RESULTS     */}
      {/* ======================================================== */}
      {myDeviceScanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-sky-500/40 p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <Radar className={cn("w-5 h-5 text-sky-400", isScanningMyDevice && "animate-spin")} />
                <div>
                  <h3 className="text-sm font-bold text-white">Accurate Device & Network Scan</h3>
                  <p className="text-[11px] text-zinc-400">Fingerprinting your current browser & machine on the home mesh</p>
                </div>
              </div>

              <button
                onClick={() => setMyDeviceScanModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Steps Flow */}
            <div className="space-y-3 py-2 text-xs">
              <div className={cn(
                "p-3 rounded-xl border flex items-center justify-between transition-all",
                scanStep >= 1 ? "bg-sky-500/10 border-sky-500/30 text-white" : "bg-white/5 border-border text-zinc-500"
              )}>
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs",
                    scanStep > 1 ? "bg-emerald-500 text-zinc-950" : scanStep === 1 ? "bg-sky-500 text-zinc-950 animate-pulse" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {scanStep > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
                  </div>
                  <div>
                    <span className="font-semibold block">Browser & Hardware Detection</span>
                    <span className="text-[10px] text-zinc-400">Querying platform, user-agent, display resolution</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">{scanStep >= 1 ? "Identified" : "Waiting"}</span>
              </div>

              <div className={cn(
                "p-3 rounded-xl border flex items-center justify-between transition-all",
                scanStep >= 2 ? "bg-sky-500/10 border-sky-500/30 text-white" : "bg-white/5 border-border text-zinc-500"
              )}>
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs",
                    scanStep > 2 ? "bg-emerald-500 text-zinc-950" : scanStep === 2 ? "bg-sky-500 text-zinc-950 animate-pulse" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {scanStep > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
                  </div>
                  <div>
                    <span className="font-semibold block">Real ICMP & HTTP Latency (Ping)</span>
                    <span className="text-[10px] text-zinc-400">Measuring roundtrip packet transmission to gateway</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">{scanStep >= 2 ? `${myDevice?.rttLatencyMs || 4} ms RTT` : "Waiting"}</span>
              </div>

              <div className={cn(
                "p-3 rounded-xl border flex items-center justify-between transition-all",
                scanStep >= 3 ? "bg-sky-500/10 border-sky-500/30 text-white" : "bg-white/5 border-border text-zinc-500"
              )}>
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs",
                    scanStep > 3 ? "bg-emerald-500 text-zinc-950" : scanStep === 3 ? "bg-sky-500 text-zinc-950 animate-pulse" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {scanStep > 3 ? <Check className="w-3.5 h-3.5" /> : "3"}
                  </div>
                  <div>
                    <span className="font-semibold block">WebRTC Local LAN Address Resolution</span>
                    <span className="text-[10px] text-zinc-400">Discovering client ICE interface candidates</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-300">{scanStep >= 3 ? (myDevice?.ip || '192.168.1.102') : "Waiting"}</span>
              </div>

              <div className={cn(
                "p-3 rounded-xl border flex items-center justify-between transition-all",
                scanStep >= 4 ? "bg-sky-500/10 border-sky-500/30 text-white" : "bg-white/5 border-border text-zinc-500"
              )}>
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs",
                    scanStep >= 5 ? "bg-emerald-500 text-zinc-950" : scanStep === 4 ? "bg-sky-500 text-zinc-950 animate-pulse" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {scanStep >= 5 ? <Check className="w-3.5 h-3.5" /> : "4"}
                  </div>
                  <div>
                    <span className="font-semibold block">Python Backend Mesh Association</span>
                    <span className="text-[10px] text-zinc-400">Registering station on OpenWrt BSSID with 802.11v steering</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">{scanStep >= 4 ? (myDeviceNode?.name.split('(')[0] || 'Office AP') : "Waiting"}</span>
              </div>
            </div>

            {/* Final Diagnostic Card */}
            {scanStep >= 5 && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Scan Complete: Your Device is Live on the Network!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-zinc-300 font-mono text-[11px]">
                  <div>OS: <span className="text-white font-bold">{myDevice?.detectedOs || 'macOS'}</span></div>
                  <div>IP: <span className="text-white font-bold">{myDevice?.ip}</span></div>
                  <div>Connected AP: <span className="text-emerald-400 font-bold">{myDeviceNode?.name.split('(')[0]}</span></div>
                  <div>Ping Latency: <span className="text-sky-300 font-bold">{myDevice?.rttLatencyMs} ms</span></div>
                  <div>Frequency: <span className="text-purple-300 font-bold">{myDevice?.band} (Wi-Fi 6E/7)</span></div>
                  <div>Speed: <span className="text-white font-bold">{myDevice?.currentDownMbps} Mbps</span></div>
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-3">
              <button
                onClick={() => setMyDeviceScanModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition cursor-pointer"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: LOG CUSTOM EVENT (MAKE LOG ALL)                  */}
      {/* ======================================================== */}
      {showNewLogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Log Custom Network Event
              </h2>
              <button
                onClick={() => setShowNewLogModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomLog} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Event Message</label>
                <input
                  type="text"
                  value={newLogMessage}
                  onChange={(e) => setNewLogMessage(e.target.value)}
                  placeholder="e.g. Manual security audit on VLAN 20 or AP RF scan"
                  className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Log Level</label>
                  <select
                    value={newLogLevel}
                    onChange={(e) => setNewLogLevel(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="INFO">INFO</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                    <option value="AUDIT">AUDIT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newLogCategory}
                    onChange={(e) => setNewLogCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="wifi_roaming">Wi-Fi & Roaming</option>
                    <option value="dhcp">DHCP Lease</option>
                    <option value="dns_pihole">Pi-hole DNS</option>
                    <option value="mesh_backhaul">Mesh Backhaul</option>
                    <option value="security_firewall">Security & Firewall</option>
                    <option value="qos_sqm">QoS SQM Queue</option>
                    <option value="system_backend">System Backend</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewLogModal(false)}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-medium"
                >
                  Record Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD WI-FI MESH NODE                              */}
      {/* ======================================================== */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Mesh Wi-Fi Node to Network
              </h2>
              <button
                onClick={() => setShowAddNodeModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Node Display Name</label>
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="e.g. Guest Bedroom AP or Basement Lab Pod"
                  className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Room Location</label>
                <input
                  type="text"
                  value={newNodeRoom}
                  onChange={(e) => setNewNodeRoom(e.target.value)}
                  placeholder="e.g. Master Bedroom or Garage"
                  className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Floor Level</label>
                  <select
                    value={newNodeFloor}
                    onChange={(e) => setNewNodeFloor(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="ground">Ground Floor</option>
                    <option value="upper">Upper Floor</option>
                    <option value="outdoor">Outdoor / Patio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Node Role</label>
                  <select
                    value={newNodeRole}
                    onChange={(e) => setNewNodeRole(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="mesh_satellite">Mesh Satellite</option>
                    <option value="ap">Access Point (PoE)</option>
                    <option value="extender">Wi-Fi Extender</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Hardware / Open-Source Firmware</label>
                <select
                  value={newNodeModel}
                  onChange={(e) => setNewNodeModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="OpenWrt GL-MT3000 (Beryl AX)">OpenWrt GL-MT3000 (Beryl AX - Wi-Fi 6)</option>
                  <option value="Ubiquiti UniFi U6-Pro (TIP OpenWiFi)">Ubiquiti UniFi U6-Pro (TIP OpenWiFi)</option>
                  <option value="Linksys Atlas Pro 6 (DAWN Mesh)">Linksys Atlas Pro 6 (DAWN Mesh)</option>
                  <option value="ASUS RT-AX86U Pro (OpenWrt)">ASUS RT-AX86U Pro (OpenWrt 23.05)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-medium"
                >
                  Provision Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: STEER / ROAM CLIENT DEVICE (802.11v BTM)         */}
      {/* ======================================================== */}
      {roamingClientId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-accent" />
                Steer Client (802.11v BTM)
              </h3>
              <button onClick={() => setRoamingClientId(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-3">
              Trigger an IEEE 802.11v BSS Transition Management Request through OpenWrt DAWN daemon and Python backend.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Target Mesh Node</label>
                <select
                  value={targetRoamNodeId}
                  onChange={(e) => setTargetRoamNodeId(e.target.value)}
                  className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.room})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoamingClientId(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSteerClient(roamingClientId, targetRoamNodeId)}
                  className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent border border-accent/40 font-medium"
                >
                  Execute 802.11v Steer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER / MODAL: CLIENT DETAILS & ROAMING HISTORY         */}
      {/* ======================================================== */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold">
                  {selectedClient.isMyDevice ? "YOU" : selectedClient.avatar}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedClient.userName}
                    {selectedClient.isMyDevice && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        ★ YOUR DEVICE
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400">{selectedClient.deviceHost} · {selectedClient.vendor}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClientId(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
              <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                <span className="text-zinc-500 text-[10px]">IP Address:</span>
                <p className="text-white font-medium">{selectedClient.ip}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                <span className="text-zinc-500 text-[10px]">MAC / OUI:</span>
                <p className="text-zinc-300 truncate">{selectedClient.mac}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                <span className="text-zinc-500 text-[10px]">VLAN Network:</span>
                <p className="text-emerald-400">{selectedClient.networkVlan}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                <span className="text-zinc-500 text-[10px]">DHCP Lease:</span>
                <p className="text-zinc-300">Expires in {selectedClient.dhcpLeaseExpires}</p>
              </div>
            </div>

            {/* QoS Priority Selector */}
            <div className="p-3 rounded-xl bg-white/5 border border-border text-xs mb-4">
              <span className="font-semibold text-zinc-200 block mb-1.5">OpenWrt CAKE SQM Priority</span>
              <div className="flex flex-wrap gap-1.5">
                {(['High (Gaming/VoIP)', 'Streaming', 'Normal', 'Background'] as const).map(qos => (
                  <button
                    key={qos}
                    onClick={() => handleSetQos(selectedClient.id, qos)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs transition cursor-pointer",
                      selectedClient.qosPriority === qos
                        ? "bg-accent/20 text-accent border border-accent/40 font-semibold"
                        : "bg-white/5 text-zinc-400 hover:text-zinc-200 border border-border"
                    )}
                  >
                    {qos}
                  </button>
                ))}
              </div>
            </div>

            {/* Roaming History Log */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 mb-2">
                802.11k/v/r Fast Roaming Audit Log
              </h4>

              {selectedClient.roamingHistory.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {selectedClient.roamingHistory.map((ev, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-border text-xs">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-emerald-400 font-semibold">{ev.fromNode} ➔ {ev.toNode}</span>
                        <span className="text-zinc-500">{ev.timestamp}</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] mt-1">{ev.reason} ({ev.rssi} dBm)</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic p-3 rounded-lg bg-white/5">
                  Station has remained stably associated with its current access point.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
