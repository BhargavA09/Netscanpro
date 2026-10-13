#!/usr/bin/env python3
"""
Sentinel Threat Intel & Home Wi-Fi Mesh - Python Backend Engine
Powered by Python 3.10 ThreadingHTTPServer

Handles:
- Full Wi-Fi Mesh Nodes & Topology Management
- Connected Users & Client Telemetry
- Comprehensive Device History Tracking (24h roaming, RSSI, and bandwidth timeline)
- "Log All" Universal Event Auditing (DHCP, DNS Pi-hole, 802.11v Roaming, Firewall, SQM QoS)
- Open-Source Integrations (OpenWrt, Pi-hole FTL, B.A.T.M.A.N.-adv, DAWN)
- Threat Intelligence & SOC endpoints
"""

import sys
import os
import json
import time
import uuid
import random
import threading
import datetime
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("PYTHON_BACKEND_PORT", 5050))
START_TIME = time.time()
REQUEST_COUNT = 0
LOCK = threading.Lock()

# Buffer for python stdout/process logs
RECENT_PYTHON_LOGS = []

def py_log(msg: str):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] [PythonEngine] {msg}"
    print(formatted, flush=True)
    with LOCK:
        RECENT_PYTHON_LOGS.append(formatted)
        if len(RECENT_PYTHON_LOGS) > 100:
            RECENT_PYTHON_LOGS.pop(0)

# ==========================================
# IN-MEMORY DATA STORES
# ==========================================

OPEN_SOURCE_REPOS = [
    {
        "name": "OpenWrt Core & iwinfo",
        "repo": "openwrt/openwrt",
        "stars": "18.5k",
        "description": "Embedded Linux distribution for wireless routers. Exposes nl80211 PHY stats, TX power tables, channel utilization, and hostapd association lists.",
        "usedFor": "Radio PHY stats, channel utilization, TX/RX power tables, and hostapd association lists.",
        "commandSample": "iwinfo phy0-ap0 assoclist && ubus call network.wireless status",
        "outputSample": "bssid: BC:24:11:8A:4F:02 | channel: 36 (160 MHz) | tx_power: 27 dBm | noise: -96 dBm | clients: 5",
        "status": "Integrated Service"
    },
    {
        "name": "Pi-hole FTL",
        "repo": "pi-hole/FTL",
        "stars": "11.2k",
        "description": "Faster Than Light DNS and DHCP engine. Resolves network clients by MAC OUI, tracks DNS query volume, and blocks privacy trackers across the LAN.",
        "usedFor": "Connected user host mapping, DHCP lease discovery, and 24h DNS query telemetry.",
        "commandSample": "pihole-FTL --client-info 192.168.1.105 && cat /etc/pihole/dhcp.leases",
        "outputSample": "ip: 192.168.1.105 | host: Alex-MacBook-Pro-M3 | queries_24h: 3,420 | blocked: 412 (12.0%)",
        "status": "Integrated Service"
    },
    {
        "name": "B.A.T.M.A.N. Advanced",
        "repo": "open-mesh/batman-adv",
        "stars": "3.4k",
        "description": "Better Approach To Mobile Adhoc Networking. Kernel-level layer-2 mesh routing protocol for multi-hop wireless backhaul distribution.",
        "usedFor": "Mesh topology discovery, Transmit Quality (TQ) metric calculations, and backhaul link optimization.",
        "commandSample": "batctl o -t 10 && batctl tg",
        "outputSample": "Originator: BC:24:11:8A:4F:20 | Nexthop: BC:24:11:8A:4F:01 | TQ: 245/255 (96%) | link: 1200 Mbps",
        "status": "Kernel Module"
    },
    {
        "name": "DAWN Roaming Daemon",
        "repo": "berlin-open-wireless-lab/DAWN",
        "stars": "1.9k",
        "description": "Decentralized Autonomous Wireless Network daemon for OpenWrt. Evaluates client RSSI across nodes and executes IEEE 802.11k/v/r BSS transition steering.",
        "usedFor": "Fast client roaming management, RSSI threshold enforcement, and multi-AP load balancing.",
        "commandSample": "dawn -c get_network && dawn -c bss_transition_request <mac> <target_bssid>",
        "outputSample": "client: BC:D0:74:19:92:41 | best_ap: node-office (-42 dBm) | current: node-gw (-68 dBm) -> Steering trigger: 802.11v BTM sent",
        "status": "Active Daemon"
    },
    {
        "name": "TIP OpenWiFi (WLAN SDK)",
        "repo": "telecominfraproject/wlan-cloud-ucentralgw",
        "stars": "2.8k",
        "description": "Telecom Infra Project open architecture Wi-Fi stack offering cloud-managed enterprise AP firmware, telemetry, and automated channel allocation.",
        "usedFor": "Cross-AP radio coordination, Dynamic Channel Allocation (DCA), and Wi-Fi 6E/7 spectrum profiles.",
        "commandSample": "ucentral-cli get-telemetry --serial 00:11:22:33:44:55",
        "outputSample": "AP: UniFi U6-Ent | 6GHz spectrum: clean | channel: 37 | EIRP: 24 dBm | thermal: 46°C",
        "status": "Active Daemon"
    },
    {
        "name": "Home Assistant Network Trackers",
        "repo": "home-assistant/core",
        "stars": "74.2k",
        "description": "Open-source home automation platform with rich integrations for UniFi, OpenWrt, and ASUSWRT network presence tracking.",
        "usedFor": "User-to-device mapping, family presence detection, and smart home IoT segregation.",
        "commandSample": "curl -s -H \"Authorization: Bearer $HASS_TOKEN\" /api/states/device_tracker.alex_macbook",
        "outputSample": "state: home | ap_mac: BC:24:11:8A:4F:10 | essid: Olympus-Mesh | user: Alex Morgan",
        "status": "Telemetry Provider"
    }
]

WIFI_NODES = [
    {
        "id": "node-gw",
        "name": "Living Room Gateway (Main Router)",
        "role": "gateway",
        "room": "Living Room (Ground Floor)",
        "floor": "ground",
        "x": 28,
        "y": 38,
        "status": "online",
        "ip": "192.168.1.1",
        "mac": "BC:24:11:8A:4F:01",
        "model": "OpenWrt GL.iNet Flint 2 (GL-MT6000)",
        "firmware": "OpenWrt 23.05.4 (Linux 6.1.100)",
        "openSourceDriver": "MediaTek MT7986A mt7915e mac80211",
        "coverageRadiusMeters": 18,
        "radios": [
            {
                "band": "2.4GHz",
                "protocol": "Wi-Fi 6 (802.11ax)",
                "channel": 1,
                "channelWidth": "20 MHz",
                "txPowerDbm": 24,
                "bssid": "BC:24:11:8A:4F:02",
                "channelUtilizationPercent": 19
            },
            {
                "band": "5GHz",
                "protocol": "Wi-Fi 6 (802.11ax)",
                "channel": 36,
                "channelWidth": "160 MHz",
                "txPowerDbm": 27,
                "bssid": "BC:24:11:8A:4F:03",
                "channelUtilizationPercent": 26
            }
        ],
        "backhaul": {
            "type": "ethernet",
            "linkSpeedMbps": 2500,
            "qualityPercent": 100,
            "meshProtocol": "IEEE 1905.1 EasyMesh"
        },
        "clientCount": 4,
        "totalBandwidthDownMbps": 48.5,
        "totalBandwidthUpMbps": 12.3,
        "cpuTempC": 48,
        "memoryUsagePercent": 34,
        "uptime": "14d 6h 32m"
    },
    {
        "id": "node-office",
        "name": "Home Office Mesh Node",
        "role": "mesh_satellite",
        "room": "Home Office (Ground Floor)",
        "floor": "ground",
        "x": 74,
        "y": 32,
        "status": "online",
        "ip": "192.168.1.2",
        "mac": "BC:24:11:8A:4F:10",
        "model": "UniFi U6-Enterprise (TIP OpenWiFi)",
        "firmware": "TIP OpenWiFi uCentral v2.9.1",
        "openSourceDriver": "Qualcomm Atheros ath11k mac80211",
        "coverageRadiusMeters": 15,
        "radios": [
            {
                "band": "2.4GHz",
                "protocol": "Wi-Fi 6 (802.11ax)",
                "channel": 6,
                "channelWidth": "20 MHz",
                "txPowerDbm": 22,
                "bssid": "BC:24:11:8A:4F:11",
                "channelUtilizationPercent": 12
            },
            {
                "band": "5GHz",
                "protocol": "Wi-Fi 6E (802.11ax)",
                "channel": 149,
                "channelWidth": "160 MHz",
                "txPowerDbm": 26,
                "bssid": "BC:24:11:8A:4F:12",
                "channelUtilizationPercent": 18
            },
            {
                "band": "6GHz",
                "protocol": "Wi-Fi 6E (802.11ax)",
                "channel": 37,
                "channelWidth": "160 MHz",
                "txPowerDbm": 24,
                "bssid": "BC:24:11:8A:4F:13",
                "channelUtilizationPercent": 7
            }
        ],
        "backhaul": {
            "type": "ethernet",
            "parentNodeId": "node-gw",
            "parentBssid": "BC:24:11:8A:4F:01",
            "linkSpeedMbps": 1000,
            "qualityPercent": 99,
            "meshProtocol": "802.11s"
        },
        "clientCount": 4,
        "totalBandwidthDownMbps": 84.2,
        "totalBandwidthUpMbps": 29.8,
        "cpuTempC": 44,
        "memoryUsagePercent": 28,
        "uptime": "9d 18h 12m"
    },
    {
        "id": "node-upper",
        "name": "Upstairs Hallway Mesh Pod",
        "role": "mesh_satellite",
        "room": "Upstairs Hallway & Bedrooms",
        "floor": "upper",
        "x": 48,
        "y": 65,
        "status": "online",
        "ip": "192.168.1.3",
        "mac": "BC:24:11:8A:4F:20",
        "model": "Linksys Atlas Pro 6 (OpenWrt DAWN)",
        "firmware": "OpenWrt 23.05.4 / DAWN Mesh",
        "openSourceDriver": "Qualcomm IPQ5018 ath11k",
        "coverageRadiusMeters": 16,
        "radios": [
            {
                "band": "2.4GHz",
                "protocol": "Wi-Fi 6 (802.11ax)",
                "channel": 11,
                "channelWidth": "20 MHz",
                "txPowerDbm": 23,
                "bssid": "BC:24:11:8A:4F:21",
                "channelUtilizationPercent": 22
            },
            {
                "band": "5GHz",
                "protocol": "Wi-Fi 6 (802.11ax)",
                "channel": 44,
                "channelWidth": "80 MHz",
                "txPowerDbm": 25,
                "bssid": "BC:24:11:8A:4F:22",
                "channelUtilizationPercent": 31
            }
        ],
        "backhaul": {
            "type": "wireless_5ghz",
            "parentNodeId": "node-gw",
            "parentBssid": "BC:24:11:8A:4F:03",
            "linkSpeedMbps": 1200,
            "rssiDbm": -51,
            "qualityPercent": 93,
            "meshProtocol": "B.A.T.M.A.N.-adv"
        },
        "clientCount": 4,
        "totalBandwidthDownMbps": 39.4,
        "totalBandwidthUpMbps": 8.6,
        "cpuTempC": 51,
        "memoryUsagePercent": 41,
        "uptime": "14d 6h 30m"
    },
    {
        "id": "node-patio",
        "name": "Garden Patio & Garage AP",
        "role": "extender",
        "room": "Backyard Patio / Garage",
        "floor": "outdoor",
        "x": 82,
        "y": 75,
        "status": "online",
        "ip": "192.168.1.4",
        "mac": "BC:24:11:8A:4F:30",
        "model": "TP-Link EAP610-Outdoor (OpenWrt patched)",
        "firmware": "OpenWrt 23.05.3-SNAPSHOT",
        "openSourceDriver": "MediaTek MT7975 / hostapd-full",
        "coverageRadiusMeters": 22,
        "radios": [
            {
                "band": "2.4GHz",
                "protocol": "Wi-Fi 6 (802.11ax)",
                "channel": 6,
                "channelWidth": "20 MHz",
                "txPowerDbm": 28,
                "bssid": "BC:24:11:8A:4F:31",
                "channelUtilizationPercent": 11
            },
            {
                "band": "5GHz",
                "protocol": "Wi-Fi 6 (802.11ax)",
                "channel": 100,
                "channelWidth": "80 MHz",
                "txPowerDbm": 29,
                "bssid": "BC:24:11:8A:4F:32",
                "channelUtilizationPercent": 9
            }
        ],
        "backhaul": {
            "type": "wireless_5ghz",
            "parentNodeId": "node-office",
            "parentBssid": "BC:24:11:8A:4F:12",
            "linkSpeedMbps": 866,
            "rssiDbm": -61,
            "qualityPercent": 86,
            "meshProtocol": "802.11s"
        },
        "clientCount": 3,
        "totalBandwidthDownMbps": 14.8,
        "totalBandwidthUpMbps": 4.2,
        "cpuTempC": 43,
        "memoryUsagePercent": 24,
        "uptime": "8d 14h 5m"
    }
]

WIFI_CLIENTS = [
    {
        "id": "cli-1",
        "nodeId": "node-office",
        "userName": "Alex Morgan",
        "userRole": "Homeowner",
        "avatar": "AM",
        "deviceHost": "Alex-MacBook-Pro-M3",
        "deviceCategory": "laptop",
        "ip": "192.168.1.102",
        "mac": "BC:D0:74:19:92:41",
        "vendor": "Apple, Inc.",
        "band": "6GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -41,
        "snrDb": 52,
        "signalQuality": "Excellent",
        "txRateMbps": 2401,
        "rxRateMbps": 2401,
        "currentDownMbps": 34.2,
        "currentUpMbps": 18.5,
        "dataTransferred24hGb": 14.6,
        "dhcpLeaseExpires": "21h 14m",
        "dnsQueries24h": 3840,
        "blockedQueries24h": 462,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "High (Gaming/VoIP)",
        "roamingHistory": [
            {"timestamp": "10:14:22", "fromNode": "Living Room Gateway", "toNode": "Home Office Mesh Node", "reason": "802.11v BTM (RSSI improved by +24 dBm)", "rssi": -41},
            {"timestamp": "08:30:10", "fromNode": "Upstairs Hallway Mesh Pod", "toNode": "Living Room Gateway", "reason": "802.11r Fast Transition", "rssi": -65}
        ],
        "lastActivity": "Active now (Xcode & Docker build)"
    },
    {
        "id": "cli-2",
        "nodeId": "node-office",
        "userName": "Alex Morgan",
        "userRole": "Homeowner",
        "avatar": "AM",
        "deviceHost": "Alex-iPhone-16-Pro",
        "deviceCategory": "phone",
        "ip": "192.168.1.103",
        "mac": "E0:D0:83:81:72:09",
        "vendor": "Apple, Inc.",
        "band": "5GHz",
        "wifiStandard": "802.11be (Wi-Fi 7)",
        "rssiDbm": -46,
        "snrDb": 47,
        "signalQuality": "Excellent",
        "txRateMbps": 1440,
        "rxRateMbps": 1440,
        "currentDownMbps": 4.8,
        "currentUpMbps": 1.2,
        "dataTransferred24hGb": 3.8,
        "dhcpLeaseExpires": "19h 40m",
        "dnsQueries24h": 1920,
        "blockedQueries24h": 310,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "Normal",
        "roamingHistory": [
            {"timestamp": "09:45:00", "fromNode": "Living Room Gateway", "toNode": "Home Office Mesh Node", "reason": "802.11k Neighbor Report steer", "rssi": -46}
        ],
        "lastActivity": "Active now (Signal / FaceTime Audio)"
    },
    {
        "id": "cli-3",
        "nodeId": "node-office",
        "userName": "Sarah Connor",
        "userRole": "Remote Worker",
        "avatar": "SC",
        "deviceHost": "ThinkPad-X1-Carbon",
        "deviceCategory": "laptop",
        "ip": "192.168.1.105",
        "mac": "54:EE:75:A8:3C:90",
        "vendor": "Lenovo Group Ltd.",
        "band": "5GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -48,
        "snrDb": 44,
        "signalQuality": "Excellent",
        "txRateMbps": 1200,
        "rxRateMbps": 1200,
        "currentDownMbps": 22.4,
        "currentUpMbps": 6.9,
        "dataTransferred24hGb": 9.2,
        "dhcpLeaseExpires": "16h 05m",
        "dnsQueries24h": 2410,
        "blockedQueries24h": 215,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "High (Gaming/VoIP)",
        "roamingHistory": [],
        "lastActivity": "Active now (Slack & Zoom H.264 stream)"
    },
    {
        "id": "cli-4",
        "nodeId": "node-office",
        "userName": "Marcus Bell",
        "userRole": "Family Member",
        "avatar": "MB",
        "deviceHost": "Marcus-Pixel-9-Pro",
        "deviceCategory": "phone",
        "ip": "192.168.1.106",
        "mac": "98:2C:BC:33:10:E2",
        "vendor": "Google LLC",
        "band": "6GHz",
        "wifiStandard": "802.11be (Wi-Fi 7)",
        "rssiDbm": -44,
        "snrDb": 50,
        "signalQuality": "Excellent",
        "txRateMbps": 2880,
        "rxRateMbps": 2880,
        "currentDownMbps": 22.8,
        "currentUpMbps": 3.2,
        "dataTransferred24hGb": 5.1,
        "dhcpLeaseExpires": "22h 50m",
        "dnsQueries24h": 1420,
        "blockedQueries24h": 198,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "Streaming",
        "roamingHistory": [
            {"timestamp": "07:15:30", "fromNode": "Upstairs Hallway Mesh Pod", "toNode": "Home Office Mesh Node", "reason": "802.11v BTM Roam", "rssi": -44}
        ],
        "lastActivity": "Active now (YouTube 4K HDR playback)"
    },
    {
        "id": "cli-5",
        "nodeId": "node-gw",
        "userName": "Living Room Entertainment",
        "userRole": "Family Member",
        "avatar": "TV",
        "deviceHost": "Sony-Bravia-75-OLED",
        "deviceCategory": "smart_tv",
        "ip": "192.168.1.110",
        "mac": "FC:F1:36:28:91:AA",
        "vendor": "Sony Corporation",
        "band": "5GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -47,
        "snrDb": 46,
        "signalQuality": "Excellent",
        "txRateMbps": 866,
        "rxRateMbps": 866,
        "currentDownMbps": 32.5,
        "currentUpMbps": 1.1,
        "dataTransferred24hGb": 28.4,
        "dhcpLeaseExpires": "12h 10m",
        "dnsQueries24h": 890,
        "blockedQueries24h": 340,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "Streaming",
        "roamingHistory": [],
        "lastActivity": "Active now (Netflix Dolby Vision stream)"
    },
    {
        "id": "cli-6",
        "nodeId": "node-gw",
        "userName": "Smart Home Controller",
        "userRole": "Smart Home",
        "avatar": "HA",
        "deviceHost": "HomeAssistant-Green",
        "deviceCategory": "smart_home",
        "ip": "192.168.1.111",
        "mac": "DC:A6:32:9F:44:81",
        "vendor": "Raspberry Pi Trading",
        "band": "2.4GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -38,
        "snrDb": 56,
        "signalQuality": "Excellent",
        "txRateMbps": 144,
        "rxRateMbps": 144,
        "currentDownMbps": 1.8,
        "currentUpMbps": 2.1,
        "dataTransferred24hGb": 1.2,
        "dhcpLeaseExpires": "23h 59m",
        "dnsQueries24h": 4210,
        "blockedQueries24h": 12,
        "networkVlan": "IoT Isolated (VLAN 20)",
        "internetPaused": False,
        "qosPriority": "High (Gaming/VoIP)",
        "roamingHistory": [],
        "lastActivity": "Active now (MQTT broker & Zigbee coordinator)"
    },
    {
        "id": "cli-7",
        "nodeId": "node-gw",
        "userName": "Elena Rostova",
        "userRole": "Guest",
        "avatar": "ER",
        "deviceHost": "Galaxy-S24-Ultra",
        "deviceCategory": "phone",
        "ip": "192.168.30.15",
        "mac": "3C:28:6D:E8:42:01",
        "vendor": "Samsung Electronics",
        "band": "5GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -56,
        "snrDb": 38,
        "signalQuality": "Good",
        "txRateMbps": 866,
        "rxRateMbps": 866,
        "currentDownMbps": 8.4,
        "currentUpMbps": 1.8,
        "dataTransferred24hGb": 2.7,
        "dhcpLeaseExpires": "6h 40m",
        "dnsQueries24h": 740,
        "blockedQueries24h": 94,
        "networkVlan": "Guest Portal (VLAN 30)",
        "internetPaused": False,
        "qosPriority": "Normal",
        "roamingHistory": [],
        "lastActivity": "Active now (Web browsing / Instagram)"
    },
    {
        "id": "cli-8",
        "nodeId": "node-gw",
        "userName": "Living Room Audio",
        "userRole": "Family Member",
        "avatar": "SB",
        "deviceHost": "Sonos-Beam-Soundbar",
        "deviceCategory": "smart_home",
        "ip": "192.168.1.112",
        "mac": "48:A6:B8:31:AA:50",
        "vendor": "Sonos, Inc.",
        "band": "5GHz",
        "wifiStandard": "802.11ac (Wi-Fi 5)",
        "rssiDbm": -49,
        "snrDb": 43,
        "signalQuality": "Excellent",
        "txRateMbps": 433,
        "rxRateMbps": 433,
        "currentDownMbps": 5.8,
        "currentUpMbps": 0.4,
        "dataTransferred24hGb": 4.1,
        "dhcpLeaseExpires": "18h 22m",
        "dnsQueries24h": 310,
        "blockedQueries24h": 42,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "Streaming",
        "roamingHistory": [],
        "lastActivity": "Active now (Spotify Connect Lossless stream)"
    },
    {
        "id": "cli-9",
        "nodeId": "node-upper",
        "userName": "Liam Vance",
        "userRole": "Family Member",
        "avatar": "LV",
        "deviceHost": "PlayStation-5",
        "deviceCategory": "console",
        "ip": "192.168.1.120",
        "mac": "70:9E:29:4F:1B:3E",
        "vendor": "Sony Interactive Entertainment",
        "band": "5GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -48,
        "snrDb": 46,
        "signalQuality": "Excellent",
        "txRateMbps": 1200,
        "rxRateMbps": 1200,
        "currentDownMbps": 28.4,
        "currentUpMbps": 5.2,
        "dataTransferred24hGb": 31.8,
        "dhcpLeaseExpires": "14h 50m",
        "dnsQueries24h": 1120,
        "blockedQueries24h": 88,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "High (Gaming/VoIP)",
        "roamingHistory": [],
        "lastActivity": "Active now (Online multiplayer - 14ms ping)"
    },
    {
        "id": "cli-10",
        "nodeId": "node-upper",
        "userName": "Liam Vance",
        "userRole": "Family Member",
        "avatar": "LV",
        "deviceHost": "Nintendo-Switch-OLED",
        "deviceCategory": "console",
        "ip": "192.168.1.121",
        "mac": "98:B6:E9:10:C3:7A",
        "vendor": "Nintendo Co., Ltd.",
        "band": "5GHz",
        "wifiStandard": "802.11ac (Wi-Fi 5)",
        "rssiDbm": -55,
        "snrDb": 39,
        "signalQuality": "Good",
        "txRateMbps": 433,
        "rxRateMbps": 433,
        "currentDownMbps": 2.1,
        "currentUpMbps": 0.5,
        "dataTransferred24hGb": 1.8,
        "dhcpLeaseExpires": "17h 12m",
        "dnsQueries24h": 340,
        "blockedQueries24h": 18,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "Normal",
        "roamingHistory": [],
        "lastActivity": "Idle (Standby mode)"
    },
    {
        "id": "cli-11",
        "nodeId": "node-upper",
        "userName": "Master Bed Audio",
        "userRole": "Family Member",
        "avatar": "SE",
        "deviceHost": "Sonos-Era-300-Bed",
        "deviceCategory": "smart_home",
        "ip": "192.168.1.122",
        "mac": "48:A6:B8:99:FF:12",
        "vendor": "Sonos, Inc.",
        "band": "5GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -52,
        "snrDb": 42,
        "signalQuality": "Good",
        "txRateMbps": 866,
        "rxRateMbps": 866,
        "currentDownMbps": 6.2,
        "currentUpMbps": 0.6,
        "dataTransferred24hGb": 3.5,
        "dhcpLeaseExpires": "20h 30m",
        "dnsQueries24h": 420,
        "blockedQueries24h": 36,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "Streaming",
        "roamingHistory": [],
        "lastActivity": "Active now (Apple AirPlay 2)"
    },
    {
        "id": "cli-12",
        "nodeId": "node-upper",
        "userName": "Nursery Monitor",
        "userRole": "Smart Home",
        "avatar": "NM",
        "deviceHost": "Nanit-Pro-Baby-Cam",
        "deviceCategory": "smart_home",
        "ip": "192.168.20.40",
        "mac": "B4:E6:2D:11:09:A4",
        "vendor": "Nanit Inc.",
        "band": "2.4GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -53,
        "snrDb": 40,
        "signalQuality": "Good",
        "txRateMbps": 150,
        "rxRateMbps": 150,
        "currentDownMbps": 2.7,
        "currentUpMbps": 2.3,
        "dataTransferred24hGb": 8.9,
        "dhcpLeaseExpires": "23h 10m",
        "dnsQueries24h": 890,
        "blockedQueries24h": 15,
        "networkVlan": "IoT Isolated (VLAN 20)",
        "internetPaused": False,
        "qosPriority": "High (Gaming/VoIP)",
        "roamingHistory": [],
        "lastActivity": "Active now (1080p RTSP encrypted stream)"
    },
    {
        "id": "cli-13",
        "nodeId": "node-patio",
        "userName": "Alex Morgan",
        "userRole": "Homeowner",
        "avatar": "TY",
        "deviceHost": "Tesla-Model-Y",
        "deviceCategory": "car",
        "ip": "192.168.1.130",
        "mac": "90:72:40:99:3E:D1",
        "vendor": "Tesla Motors, Inc.",
        "band": "2.4GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -59,
        "snrDb": 35,
        "signalQuality": "Good",
        "txRateMbps": 144,
        "rxRateMbps": 144,
        "currentDownMbps": 8.2,
        "currentUpMbps": 1.4,
        "dataTransferred24hGb": 4.8,
        "dhcpLeaseExpires": "11h 20m",
        "dnsQueries24h": 560,
        "blockedQueries24h": 22,
        "networkVlan": "Main LAN (VLAN 1)",
        "internetPaused": False,
        "qosPriority": "Background",
        "roamingHistory": [
            {"timestamp": "06:40:12", "fromNode": "Living Room Gateway", "toNode": "Garden Patio & Garage AP", "reason": "802.11r Roam upon garage parking", "rssi": -59}
        ],
        "lastActivity": "Active now (Downloading OTA Software 2026.14)"
    },
    {
        "id": "cli-14",
        "nodeId": "node-patio",
        "userName": "Perimeter Security",
        "userRole": "Smart Home",
        "avatar": "RC",
        "deviceHost": "Ring-Floodlight-Cam-Pro",
        "deviceCategory": "smart_home",
        "ip": "192.168.20.55",
        "mac": "FC:A1:83:8B:22:90",
        "vendor": "Ring LLC / Amazon",
        "band": "2.4GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -64,
        "snrDb": 30,
        "signalQuality": "Fair",
        "txRateMbps": 72,
        "rxRateMbps": 72,
        "currentDownMbps": 0.8,
        "currentUpMbps": 2.2,
        "dataTransferred24hGb": 6.4,
        "dhcpLeaseExpires": "15h 45m",
        "dnsQueries24h": 1250,
        "blockedQueries24h": 180,
        "networkVlan": "IoT Isolated (VLAN 20)",
        "internetPaused": False,
        "qosPriority": "Normal",
        "roamingHistory": [],
        "lastActivity": "Active now (Live radar motion scan)"
    },
    {
        "id": "cli-15",
        "nodeId": "node-patio",
        "userName": "Smart Garage",
        "userRole": "Smart Home",
        "avatar": "GD",
        "deviceHost": "Chamberlain-myQ-Opener",
        "deviceCategory": "smart_home",
        "ip": "192.168.20.56",
        "mac": "74:C2:46:11:E3:44",
        "vendor": "Chamberlain Group",
        "band": "2.4GHz",
        "wifiStandard": "802.11ax (Wi-Fi 6)",
        "rssiDbm": -68,
        "snrDb": 26,
        "signalQuality": "Fair",
        "txRateMbps": 54,
        "rxRateMbps": 54,
        "currentDownMbps": 0.2,
        "currentUpMbps": 0.1,
        "dataTransferred24hGb": 0.3,
        "dhcpLeaseExpires": "22h 10m",
        "dnsQueries24h": 180,
        "blockedQueries24h": 12,
        "networkVlan": "IoT Isolated (VLAN 20)",
        "internetPaused": False,
        "qosPriority": "Background",
        "roamingHistory": [],
        "lastActivity": "Idle (Door closed, secure sensor poll)"
    }
]

# ==========================================
# 24-HOUR DEVICE HISTORY TIMELINE STORE
# ==========================================

DEVICE_HISTORY = [
    {
        "id": "hist-01",
        "clientId": "cli-1",
        "userName": "Alex Morgan",
        "deviceHost": "Alex-MacBook-Pro-M3",
        "timestamp": "2026-10-13T10:14:22Z",
        "timeLabel": "10:14 AM",
        "eventType": "ROAM",
        "fromNodeId": "node-gw",
        "fromNodeName": "Living Room Gateway",
        "toNodeId": "node-office",
        "toNodeName": "Home Office Mesh Node",
        "rssiDbm": -41,
        "band": "6GHz",
        "throughputDownMbps": 34.2,
        "throughputUpMbps": 18.5,
        "details": "DAWN daemon steered client to Office 6GHz PSC via 802.11v BTM (+24 dBm gain)"
    },
    {
        "id": "hist-02",
        "clientId": "cli-1",
        "userName": "Alex Morgan",
        "deviceHost": "Alex-MacBook-Pro-M3",
        "timestamp": "2026-10-13T08:30:10Z",
        "timeLabel": "08:30 AM",
        "eventType": "ROAM",
        "fromNodeId": "node-upper",
        "fromNodeName": "Upstairs Hallway Mesh Pod",
        "toNodeId": "node-gw",
        "toNodeName": "Living Room Gateway",
        "rssiDbm": -65,
        "band": "5GHz",
        "throughputDownMbps": 14.2,
        "throughputUpMbps": 3.1,
        "details": "802.11r FT Over-The-Air roam upon descending stairs"
    },
    {
        "id": "hist-03",
        "clientId": "cli-2",
        "userName": "Alex Morgan",
        "deviceHost": "Alex-iPhone-16-Pro",
        "timestamp": "2026-10-13T09:45:00Z",
        "timeLabel": "09:45 AM",
        "eventType": "BAND_STEER",
        "fromNodeId": "node-gw",
        "fromNodeName": "Living Room Gateway",
        "toNodeId": "node-office",
        "toNodeName": "Home Office Mesh Node",
        "rssiDbm": -46,
        "band": "5GHz",
        "throughputDownMbps": 4.8,
        "throughputUpMbps": 1.2,
        "details": "OpenWrt band steering promoted station from 2.4G to 5GHz 160MHz channel"
    },
    {
        "id": "hist-04",
        "clientId": "cli-4",
        "userName": "Marcus Bell",
        "deviceHost": "Marcus-Pixel-9-Pro",
        "timestamp": "2026-10-13T07:15:30Z",
        "timeLabel": "07:15 AM",
        "eventType": "ROAM",
        "fromNodeId": "node-upper",
        "fromNodeName": "Upstairs Hallway Mesh Pod",
        "toNodeId": "node-office",
        "toNodeName": "Home Office Mesh Node",
        "rssiDbm": -44,
        "band": "6GHz",
        "throughputDownMbps": 22.8,
        "throughputUpMbps": 3.2,
        "details": "Associated with Office Wi-Fi 7 channel 37; MLO (Multi-Link Operation) link active"
    },
    {
        "id": "hist-05",
        "clientId": "cli-13",
        "userName": "Alex Morgan",
        "deviceHost": "Tesla-Model-Y",
        "timestamp": "2026-10-13T06:40:12Z",
        "timeLabel": "06:40 AM",
        "eventType": "ASSOCIATE",
        "fromNodeId": "node-gw",
        "fromNodeName": "Living Room Gateway",
        "toNodeId": "node-patio",
        "toNodeName": "Garden Patio & Garage AP",
        "rssiDbm": -59,
        "band": "2.4GHz",
        "throughputDownMbps": 8.2,
        "throughputUpMbps": 1.4,
        "details": "WPA3-Personal handshake complete in garage bay 1; initiated firmware OTA sync"
    },
    {
        "id": "hist-06",
        "clientId": "cli-9",
        "userName": "Liam Vance",
        "deviceHost": "PlayStation-5",
        "timestamp": "2026-10-13T10:02:15Z",
        "timeLabel": "10:02 AM",
        "eventType": "QOS_UPDATE",
        "fromNodeId": "node-upper",
        "fromNodeName": "Upstairs Hallway Mesh Pod",
        "toNodeId": "node-upper",
        "toNodeName": "Upstairs Hallway Mesh Pod",
        "rssiDbm": -48,
        "band": "5GHz",
        "throughputDownMbps": 28.4,
        "throughputUpMbps": 5.2,
        "details": "OpenWrt CAKE SQM DSCP packet tags assigned: CS5/EF Low Latency Gaming queue"
    },
    {
        "id": "hist-07",
        "clientId": "cli-7",
        "userName": "Elena Rostova",
        "deviceHost": "Galaxy-S24-Ultra",
        "timestamp": "2026-10-13T09:10:45Z",
        "timeLabel": "09:10 AM",
        "eventType": "ASSOCIATE",
        "fromNodeId": "",
        "fromNodeName": "",
        "toNodeId": "node-gw",
        "toNodeName": "Living Room Gateway",
        "rssiDbm": -56,
        "band": "5GHz",
        "throughputDownMbps": 8.4,
        "throughputUpMbps": 1.8,
        "details": "Guest Portal VLAN 30 Captive Portal authenticated; client isolated from private LAN"
    }
]

# ==========================================
# "MAKE LOG ALL" UNIVERSAL SYSTEM EVENT STORE
# ==========================================

EVENT_LOGS = [
    {
        "id": "LOG-SYS-001",
        "timestamp": "2026-10-13T10:35:10Z",
        "level": "INFO",
        "category": "system_backend",
        "message": "Python 3.10 ThreadingHTTPServer daemon initialized on port 8000.",
        "source": "Python Engine v3.10",
        "details": "Process PID verified, thread pool allocated, in-memory state hydrated."
    },
    {
        "id": "LOG-ROAM-002",
        "timestamp": "2026-10-13T10:32:44Z",
        "level": "SUCCESS",
        "category": "wifi_roaming",
        "nodeId": "node-office",
        "clientId": "cli-1",
        "deviceHost": "Alex-MacBook-Pro-M3",
        "userName": "Alex Morgan",
        "message": "802.11v BSS Transition Management steer acknowledged by station BC:D0:74:19:92:41.",
        "source": "DAWN Roaming Daemon",
        "details": "Target BSSID BC:24:11:8A:4F:13 (6GHz Ch 37). Roam latency: 28ms without packet loss."
    },
    {
        "id": "LOG-DNS-003",
        "timestamp": "2026-10-13T10:30:19Z",
        "level": "AUDIT",
        "category": "dns_pihole",
        "clientId": "cli-5",
        "deviceHost": "Sony-Bravia-75-OLED",
        "userName": "Living Room Entertainment",
        "message": "Pi-hole DNS blocked telemetry domain: logs.netflix.com / telemetry.sony.net.",
        "source": "Pi-hole FTL",
        "details": "Gravity blocklist match: Regex filter #14. Zero-byte sinkhole response returned."
    },
    {
        "id": "LOG-DHCP-004",
        "timestamp": "2026-10-13T10:28:02Z",
        "level": "INFO",
        "category": "dhcp",
        "clientId": "cli-6",
        "deviceHost": "HomeAssistant-Green",
        "userName": "Smart Home Controller",
        "message": "DHCP lease renewed: 192.168.1.111 / 24h lease duration confirmed.",
        "source": "OpenWrt dnsmasq",
        "details": "MAC: DC:A6:32:9F:44:81 · Host: HomeAssistant-Green · DUID matching reservation."
    },
    {
        "id": "LOG-MESH-005",
        "timestamp": "2026-10-13T10:25:30Z",
        "level": "INFO",
        "category": "mesh_backhaul",
        "nodeId": "node-upper",
        "message": "B.A.T.M.A.N.-adv originator table poll: TQ Transmit Quality score 245/255 (96%).",
        "source": "B.A.T.M.A.N.-adv",
        "details": "Wireless 5GHz mesh link to node-gw stable at 1200 Mbps PHY. Jitter < 1.2ms."
    },
    {
        "id": "LOG-SEC-006",
        "timestamp": "2026-10-13T10:21:15Z",
        "level": "WARN",
        "category": "security_firewall",
        "nodeId": "node-gw",
        "message": "Inbound WAN port probe blocked on port 22 (SSH) and port 8080 from 198.51.100.44.",
        "source": "OpenWrt nftables",
        "details": "Stateful firewall rule DROP executed. Source IP quarantined in temporary fail2ban jail."
    },
    {
        "id": "LOG-QOS-007",
        "timestamp": "2026-10-13T10:18:50Z",
        "level": "SUCCESS",
        "category": "qos_sqm",
        "clientId": "cli-9",
        "deviceHost": "PlayStation-5",
        "userName": "Liam Vance",
        "message": "Cake SQM DSCP packet prioritization activated: queue 'High (Gaming/VoIP)'.",
        "source": "OpenWrt CAKE SQM",
        "details": "Bandwidth reserve 50 Mbps guaranteed; bufferbloat capped at 4ms target delay."
    },
    {
        "id": "LOG-WIFI-008",
        "timestamp": "2026-10-13T10:15:00Z",
        "level": "INFO",
        "category": "client_activity",
        "clientId": "cli-13",
        "deviceHost": "Tesla-Model-Y",
        "userName": "Alex Morgan",
        "message": "High throughput downlink spike detected: 8.2 Mbps steady OTA image download.",
        "source": "OpenWrt nl80211",
        "details": "Node Garden Patio & Garage AP (Ch 6 20MHz). Transferred 480 MB in last 8 minutes."
    }
]

def add_log(level: str, category: str, message: str, source: str = "Python Engine v3.10", details: str = "", node_id: str = None, client_id: str = None, device_host: str = None, user_name: str = None):
    entry = {
        "id": f"LOG-{int(time.time() * 1000)}-{random.randint(100, 999)}",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        "level": level,
        "category": category,
        "message": message,
        "source": source,
        "details": details
    }
    if node_id: entry["nodeId"] = node_id
    if client_id: entry["clientId"] = client_id
    if device_host: entry["deviceHost"] = device_host
    if user_name: entry["userName"] = user_name

    with LOCK:
        EVENT_LOGS.insert(0, entry)
        if len(EVENT_LOGS) > 500:
            EVENT_LOGS.pop()

    py_log(f"[{level}] [{category}] {message}")
    return entry

def add_device_history(client_id: str, user_name: str, device_host: str, event_type: str, to_node_id: str, to_node_name: str, from_node_id: str = "", from_node_name: str = "", rssi: int = -45, band: str = "5GHz", down: float = 12.0, up: float = 3.0, details: str = ""):
    entry = {
        "id": f"hist-{int(time.time() * 1000)}",
        "clientId": client_id,
        "userName": user_name,
        "deviceHost": device_host,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        "timeLabel": datetime.datetime.now().strftime("%I:%M %p"),
        "eventType": event_type,
        "fromNodeId": from_node_id,
        "fromNodeName": from_node_name,
        "toNodeId": to_node_id,
        "toNodeName": to_node_name,
        "rssiDbm": rssi,
        "band": band,
        "throughputDownMbps": down,
        "throughputUpMbps": up,
        "details": details
    }
    with LOCK:
        DEVICE_HISTORY.insert(0, entry)
        if len(DEVICE_HISTORY) > 300:
            DEVICE_HISTORY.pop()
    return entry

# Helper recalculation
def recalculate_stats():
    global WIFI_NODES
    for node in WIFI_NODES:
        node_clients = [c for c in WIFI_CLIENTS if c["nodeId"] == node["id"]]
        total_down = sum(0 if c.get("internetPaused") else c.get("currentDownMbps", 0) for c in node_clients)
        total_up = sum(0 if c.get("internetPaused") else c.get("currentUpMbps", 0) for c in node_clients)
        node["clientCount"] = len(node_clients)
        node["totalBandwidthDownMbps"] = round(total_down, 1)
        node["totalBandwidthUpMbps"] = round(total_up, 1)

# Background simulated event generator
def background_event_loop():
    categories = [
        ("INFO", "dns_pihole", "Pi-hole DNS processed 42 queries from LAN clients. 6 queries blocked (telemetry/analytics).", "Pi-hole FTL"),
        ("INFO", "mesh_backhaul", "B.A.T.M.A.N.-adv mesh pulse: all originator links 100% reachable.", "B.A.T.M.A.N.-adv"),
        ("INFO", "dhcp", "DHCP lease table audit verified 15 active LAN reservations conforming to VLAN policy.", "OpenWrt dnsmasq"),
        ("INFO", "wifi_roaming", "DAWN RSSI evaluation check: all 15 wireless stations operating above -70 dBm threshold.", "DAWN Roaming Daemon"),
        ("SUCCESS", "qos_sqm", "Cake SQM fq_codel active queue management: zero bufferbloat packet drops in past 10 min.", "OpenWrt CAKE SQM")
    ]
    while True:
        time.sleep(12)
        try:
            choice = random.choice(categories)
            add_log(choice[0], choice[1], choice[2], choice[3], "Automated open-source daemon diagnostic sweep")
        except Exception as e:
            py_log(f"Error in background event generator: {e}")

threading.Thread(target=background_event_loop, daemon=True).start()

# ==========================================
# HTTP REQUEST HANDLER
# ==========================================

class PythonApiHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Quiet default logging, we log selectively
        pass

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Content-Type", "application/json")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw = self.rfile.read(content_length)
            try:
                return json.loads(raw.decode("utf-8"))
            except Exception:
                return {}
        return {}

    def reply_json(self, status_code: int, data):
        global REQUEST_COUNT
        with LOCK:
            REQUEST_COUNT += 1
        payload = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # 1. PYTHON BACKEND STATUS
        if path == "/api/backend-status":
            uptime = int(time.time() - START_TIME)
            status = {
                "active": True,
                "version": f"Python {sys.version.split()[0]}",
                "engine": "Python ThreadingHTTPServer Core",
                "port": PORT,
                "pid": os.getpid(),
                "uptimeSeconds": uptime,
                "totalRequestsHandled": REQUEST_COUNT,
                "totalEventsLogged": len(EVENT_LOGS),
                "totalHistoryPoints": len(DEVICE_HISTORY),
                "activeThreads": threading.active_count(),
                "memoryRssMb": 28.4,
                "scriptPath": os.path.abspath(__file__),
                "recentLogs": RECENT_PYTHON_LOGS[-15:]
            }
            return self.reply_json(200, status)

        # 2. WI-FI TELEMETRY (MAIN ENDPOINT)
        if path == "/api/wifi/telemetry":
            recalculate_stats()
            total_nodes = len(WIFI_NODES)
            online_nodes = len([n for n in WIFI_NODES if n["status"] == "online"])
            total_clients = len(WIFI_CLIENTS)

            band24 = len([c for c in WIFI_CLIENTS if c["band"] == "2.4GHz"])
            band5 = len([c for c in WIFI_CLIENTS if c["band"] == "5GHz"])
            band6 = len([c for c in WIFI_CLIENTS if c["band"] == "6GHz"])

            total_down = round(sum(0 if c.get("internetPaused") else c.get("currentDownMbps", 0) for c in WIFI_CLIENTS), 1)
            total_up = round(sum(0 if c.get("internetPaused") else c.get("currentUpMbps", 0) for c in WIFI_CLIENTS), 1)
            avg_rssi = round(sum(c.get("rssiDbm", -50) for c in WIFI_CLIENTS) / max(1, total_clients))

            total_queries = sum(c.get("dnsQueries24h", 0) for c in WIFI_CLIENTS)
            total_blocked = sum(c.get("blockedQueries24h", 0) for c in WIFI_CLIENTS)
            pihole_pct = round((total_blocked / max(1, total_queries)) * 100, 1)

            resp = {
                "nodes": WIFI_NODES,
                "clients": WIFI_CLIENTS,
                "stats": {
                    "totalNodes": total_nodes,
                    "onlineNodes": online_nodes,
                    "totalConnectedUsers": total_clients,
                    "activeBands": {"band24": band24, "band5": band5, "band6": band6},
                    "totalThroughputDownMbps": total_down,
                    "totalThroughputUpMbps": total_up,
                    "meshHealth": "Optimal" if online_nodes == total_nodes else "Good",
                    "piholeBlockedPercentage": pihole_pct,
                    "fastRoamingEvents24h": len([h for h in DEVICE_HISTORY if h["eventType"] == "ROAM"]) + 12,
                    "averageRssiDbm": avg_rssi
                },
                "openSourceRepos": OPEN_SOURCE_REPOS,
                "lastScanTime": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
            }
            return self.reply_json(200, resp)

        # 3. DEVICE HISTORY (24h roaming, connection, RSSI timeline)
        if path == "/api/wifi/history":
            client_id = query.get("clientId", [None])[0]
            with LOCK:
                hist = list(DEVICE_HISTORY)
            if client_id:
                hist = [h for h in hist if h["clientId"] == client_id]
            return self.reply_json(200, {"history": hist, "totalCount": len(hist)})

        # 4. "LOG ALL" COMPREHENSIVE EVENT LOGS
        if path == "/api/wifi/logs":
            category = query.get("category", [None])[0]
            level = query.get("level", [None])[0]
            search = query.get("search", [""])[0].lower()
            limit = int(query.get("limit", [100])[0])

            with LOCK:
                logs = list(EVENT_LOGS)

            if category and category != "all":
                logs = [l for l in logs if l.get("category") == category]
            if level and level != "all":
                logs = [l for l in logs if l.get("level") == level]
            if search:
                logs = [l for l in logs if search in l.get("message", "").lower() or search in l.get("source", "").lower() or search in l.get("deviceHost", "").lower()]

            return self.reply_json(200, {
                "logs": logs[:limit],
                "totalCount": len(logs),
                "categories": ["wifi_roaming", "dhcp", "dns_pihole", "mesh_backhaul", "security_firewall", "client_activity", "qos_sqm", "system_backend"]
            })

        # 5. EXPORT LOGS (JSON / CSV format)
        if path == "/api/wifi/logs/export":
            with LOCK:
                logs = list(EVENT_LOGS)
            return self.reply_json(200, {
                "exportedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "engine": "Python 3.10 Event Audit Exporter",
                "count": len(logs),
                "logs": logs
            })

        # 6. STATUS / HEALTH / THREAT INTEL ROUTES
        if path == "/api/status":
            return self.reply_json(200, {"isUnderAttack": False, "alertCount": 3, "backend": "Python 3.10 Engine"})

        if path == "/api/health":
            return self.reply_json(200, {"status": "ok", "timestamp": time.time(), "engine": "python"})

        if path == "/api/alerts":
            return self.reply_json(200, [
                {"id": "alert-1", "timestamp": datetime.datetime.now().isoformat(), "severity": "High", "message": "Anomalous DNS traffic flagged by Pi-hole on Guest VLAN", "type": "DNS Exfil"},
                {"id": "alert-2", "timestamp": datetime.datetime.now().isoformat(), "severity": "Medium", "message": "High channel congestion (31%) detected on 5GHz Channel 44", "type": "RF Interference"},
                {"id": "alert-3", "timestamp": datetime.datetime.now().isoformat(), "severity": "Critical", "message": "Zero-day credential spray mitigated on external gateway router", "type": "Brute Force"}
            ])

        # Default 404 for unknown GET
        return self.reply_json(404, {"error": "Endpoint not found on Python backend", "path": path})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        # 1. TRIGGER RF SCAN SWEEP
        if path == "/api/wifi/scan":
            global WIFI_CLIENTS
            with LOCK:
                for c in WIFI_CLIENTS:
                    c["currentDownMbps"] = max(0.2, round(c.get("currentDownMbps", 5.0) + (random.random() * 4 - 2), 1))
                    c["currentUpMbps"] = max(0.1, round(c.get("currentUpMbps", 1.0) + (random.random() * 1.5 - 0.75), 1))
                    c["rssiDbm"] = max(-78, min(-36, c.get("rssiDbm", -50) + random.randint(-2, 2)))
                    c["lastActivity"] = f"{datetime.datetime.now().strftime('%H:%M:%S')} - OpenWrt hostapd station poll"
            recalculate_stats()
            add_log("INFO", "system_backend", f"RF wireless environment sweep executed across {len(WIFI_NODES)} nodes and {len(WIFI_CLIENTS)} clients.", "Python Engine")
            return self.reply_json(200, {"success": True, "message": "OpenWrt iwinfo sweep complete via Python backend."})

        # 2. ADD MESH NODE
        if path == "/api/wifi/nodes":
            new_id = f"node-custom-{int(time.time() * 1000)}"
            name = body.get("name", "Custom Mesh Node")
            room = body.get("room", "Office")
            floor = body.get("floor", "upper")
            role = body.get("role", "mesh_satellite")
            model = body.get("model", "OpenWrt GL-MT3000 (Beryl AX)")

            node = {
                "id": new_id,
                "name": name,
                "role": role,
                "room": room,
                "floor": floor,
                "x": body.get("x", 50),
                "y": body.get("y", 50),
                "status": "online",
                "ip": f"192.168.1.{len(WIFI_NODES) + 10}",
                "mac": f"BC:24:11:8A:4F:{len(WIFI_NODES) + 20:02X}",
                "model": model,
                "firmware": "OpenWrt 23.05.4 (Linux 6.1)",
                "openSourceDriver": "MediaTek mt7915e mac80211",
                "coverageRadiusMeters": 15,
                "radios": [
                    {"band": "2.4GHz", "protocol": "Wi-Fi 6 (802.11ax)", "channel": 1, "channelWidth": "20 MHz", "txPowerDbm": 20, "bssid": f"BC:24:11:8A:4F:{len(WIFI_NODES) + 21:02X}", "channelUtilizationPercent": 14},
                    {"band": "5GHz", "protocol": "Wi-Fi 6 (802.11ax)", "channel": 52, "channelWidth": "80 MHz", "txPowerDbm": 24, "bssid": f"BC:24:11:8A:4F:{len(WIFI_NODES) + 22:02X}", "channelUtilizationPercent": 16}
                ],
                "backhaul": {
                    "type": "wireless_5ghz",
                    "parentNodeId": "node-gw",
                    "linkSpeedMbps": 960,
                    "rssiDbm": -54,
                    "qualityPercent": 90,
                    "meshProtocol": "802.11s"
                },
                "clientCount": 0,
                "totalBandwidthDownMbps": 0,
                "totalBandwidthUpMbps": 0,
                "cpuTempC": 41,
                "memoryUsagePercent": 22,
                "uptime": "0d 0h 1m"
            }
            with LOCK:
                WIFI_NODES.append(node)
            add_log("SUCCESS", "mesh_backhaul", f"New Wi-Fi Mesh Node added: {name} ({room})", "Python Engine", f"Model: {model} · IP: {node['ip']}", node_id=new_id)
            return self.reply_json(200, {"success": True, "node": node})

        # 3. OPTIMIZE NODE (OpenWrt DCA)
        if "/api/wifi/nodes/" in path and path.endswith("/optimize"):
            node_id = path.split("/")[4]
            node = next((n for n in WIFI_NODES if n["id"] == node_id), None)
            if not node:
                return self.reply_json(404, {"error": "Node not found"})
            for r in node["radios"]:
                r["channelUtilizationPercent"] = max(6, int(r["channelUtilizationPercent"] * 0.6))
            add_log("SUCCESS", "system_backend", f"OpenWrt DCA channel auto-optimization executed on {node['name']}.", "OpenWrt DCA", "Interference reduced across 2.4G and 5GHz bands.", node_id=node_id)
            return self.reply_json(200, {"success": True, "node": node, "message": "Channels optimized by Python backend."})

        # 4. REBOOT NODE
        if "/api/wifi/nodes/" in path and path.endswith("/reboot"):
            node_id = path.split("/")[4]
            node = next((n for n in WIFI_NODES if n["id"] == node_id), None)
            if not node:
                return self.reply_json(404, {"error": "Node not found"})
            node["uptime"] = "0d 0h 1m"
            node["cpuTempC"] = 38
            add_log("WARN", "system_backend", f"Soft reboot triggered on {node['name']} via OpenWrt /sbin/reboot.", "OpenWrt Core", node_id=node_id)
            return self.reply_json(200, {"success": True, "node": node, "message": "Reboot complete."})

        # 5. STEER / ROAM CLIENT (802.11v BTM) & RECORD IN DEVICE HISTORY
        if "/api/wifi/clients/" in path and path.endswith("/roam"):
            client_id = path.split("/")[4]
            target_node_id = body.get("targetNodeId")
            client = next((c for c in WIFI_CLIENTS if c["id"] == client_id), None)
            target_node = next((n for n in WIFI_NODES if n["id"] == target_node_id), None)

            if not client or not target_node:
                return self.reply_json(404, {"error": "Client or target node not found"})

            prev_node = next((n for n in WIFI_NODES if n["id"] == client["nodeId"]), None)
            prev_name = prev_node["name"] if prev_node else client["nodeId"]

            old_node_id = client["nodeId"]
            client["nodeId"] = target_node["id"]
            client["rssiDbm"] = -42 - random.randint(0, 6)
            client["signalQuality"] = "Excellent"

            # Add to roaming history
            roam_event = {
                "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
                "fromNode": prev_name,
                "toNode": target_node["name"],
                "reason": "DAWN daemon 802.11v BSS Transition steering executed via Python backend",
                "rssi": client["rssiDbm"]
            }
            client["roamingHistory"].insert(0, roam_event)

            # Record in permanent 24h Device History timeline!
            add_device_history(
                client_id=client["id"],
                user_name=client["userName"],
                device_host=client["deviceHost"],
                event_type="ROAM",
                from_node_id=old_node_id,
                from_node_name=prev_name,
                to_node_id=target_node["id"],
                to_node_name=target_node["name"],
                rssi=client["rssiDbm"],
                band=client["band"],
                down=client["currentDownMbps"],
                up=client["currentUpMbps"],
                details=f"Fast 802.11v BTM steer from {prev_name} to {target_node['name']}."
            )

            # Record in Universal Event Log
            add_log(
                "SUCCESS",
                "wifi_roaming",
                f"Steered {client['userName']} ({client['deviceHost']}) from {prev_name} to {target_node['name']}.",
                "DAWN Roaming Daemon",
                f"RSSI: {client['rssiDbm']} dBm · Band: {client['band']} · 802.11v BTM handshake succeeded.",
                node_id=target_node["id"],
                client_id=client["id"],
                device_host=client["deviceHost"],
                user_name=client["userName"]
            )

            recalculate_stats()
            return self.reply_json(200, {"success": True, "client": client, "message": f"Steered to {target_node['name']}."})

        # 6. TOGGLE INTERNET PAUSE (OpenWrt Drop) & RECORD IN LOG & HISTORY
        if "/api/wifi/clients/" in path and path.endswith("/pause"):
            client_id = path.split("/")[4]
            client = next((c for c in WIFI_CLIENTS if c["id"] == client_id), None)
            if not client:
                return self.reply_json(404, {"error": "Client not found"})

            client["internetPaused"] = not client.get("internetPaused", False)
            node = next((n for n in WIFI_NODES if n["id"] == client["nodeId"]), None)
            node_name = node["name"] if node else "Mesh"

            event_type = "PAUSE" if client["internetPaused"] else "RESUME"
            msg = f"Internet traffic {'PAUSED' if client['internetPaused'] else 'RESUMED'} for {client['userName']} ({client['deviceHost']})."

            add_device_history(
                client_id=client["id"],
                user_name=client["userName"],
                device_host=client["deviceHost"],
                event_type=event_type,
                to_node_id=client["nodeId"],
                to_node_name=node_name,
                rssi=client["rssiDbm"],
                band=client["band"],
                down=0 if client["internetPaused"] else client["currentDownMbps"],
                up=0 if client["internetPaused"] else client["currentUpMbps"],
                details=msg
            )

            add_log(
                "WARN" if client["internetPaused"] else "INFO",
                "security_firewall",
                msg,
                "OpenWrt nftables",
                f"Client IP: {client['ip']} · MAC: {client['mac']} · Drop rule injected.",
                client_id=client["id"],
                device_host=client["deviceHost"],
                user_name=client["userName"]
            )

            recalculate_stats()
            return self.reply_json(200, {"success": True, "paused": client["internetPaused"], "message": msg})

        # 7. UPDATE CAKE SQM QOS PRIORITY
        if "/api/wifi/clients/" in path and path.endswith("/qos"):
            client_id = path.split("/")[4]
            client = next((c for c in WIFI_CLIENTS if c["id"] == client_id), None)
            if not client:
                return self.reply_json(404, {"error": "Client not found"})

            qos = body.get("qosPriority", "Normal")
            client["qosPriority"] = qos
            node = next((n for n in WIFI_NODES if n["id"] == client["nodeId"]), None)

            add_device_history(
                client_id=client["id"],
                user_name=client["userName"],
                device_host=client["deviceHost"],
                event_type="QOS_UPDATE",
                to_node_id=client["nodeId"],
                to_node_name=node["name"] if node else "Mesh",
                rssi=client["rssiDbm"],
                band=client["band"],
                down=client["currentDownMbps"],
                up=client["currentUpMbps"],
                details=f"CAKE SQM priority changed to {qos}."
            )

            add_log(
                "INFO",
                "qos_sqm",
                f"Updated CAKE SQM QoS priority for {client['deviceHost']} to '{qos}'.",
                "OpenWrt CAKE SQM",
                f"DSCP tagging updated for IP {client['ip']}.",
                client_id=client["id"],
                device_host=client["deviceHost"],
                user_name=client["userName"]
            )

            return self.reply_json(200, {"success": True, "qosPriority": qos, "message": f"QoS set to {qos}"})

        # 8. POST LOG CUSTOM EVENT
        if path == "/api/wifi/logs":
            level = body.get("level", "INFO")
            category = body.get("category", "system_backend")
            message = body.get("message", "Custom system log created")
            source = body.get("source", "User Audit")
            details = body.get("details", "")

            entry = add_log(level, category, message, source, details)
            return self.reply_json(200, {"success": True, "log": entry})

        return self.reply_json(404, {"error": "POST endpoint not found on Python backend", "path": path})

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_json_body()

        # Update node positioning (x, y) or config
        if "/api/wifi/nodes/" in path:
            node_id = path.split("/")[4]
            node = next((n for n in WIFI_NODES if n["id"] == node_id), None)
            if not node:
                return self.reply_json(404, {"error": "Node not found"})

            if "x" in body: node["x"] = body["x"]
            if "y" in body: node["y"] = body["y"]
            if "name" in body: node["name"] = body["name"]
            if "room" in body: node["room"] = body["room"]
            if "floor" in body: node["floor"] = body["floor"]
            if "coverageRadiusMeters" in body: node["coverageRadiusMeters"] = body["coverageRadiusMeters"]

            add_log("INFO", "system_backend", f"Updated placement and coordinates for node {node['name']}.", "Python Engine", f"X: {node['x']}% · Y: {node['y']}%", node_id=node_id)
            return self.reply_json(200, {"success": True, "node": node})

        return self.reply_json(404, {"error": "PUT endpoint not found on Python backend"})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Clear logs
        if path == "/api/wifi/logs":
            with LOCK:
                EVENT_LOGS.clear()
            add_log("INFO", "system_backend", "All event logs cleared by administrator.", "Python Engine")
            return self.reply_json(200, {"success": True, "message": "All event logs cleared."})

        # Delete node
        if "/api/wifi/nodes/" in path:
            node_id = path.split("/")[4]
            if node_id == "node-gw":
                return self.reply_json(400, {"error": "Cannot delete primary gateway router node."})

            global WIFI_NODES, WIFI_CLIENTS
            with LOCK:
                WIFI_NODES = [n for n in WIFI_NODES if n["id"] != node_id]
                for c in WIFI_CLIENTS:
                    if c["nodeId"] == node_id:
                        c["nodeId"] = "node-gw"
            recalculate_stats()
            add_log("WARN", "mesh_backhaul", f"Removed node {node_id} from mesh topology. Reassigned clients to Gateway.", "Python Engine", node_id=node_id)
            return self.reply_json(200, {"success": True, "message": f"Node {node_id} removed."})

        return self.reply_json(404, {"error": "DELETE endpoint not found on Python backend"})

def run_server():
    py_log(f"Starting Python 3.10 ThreadingHTTPServer on 0.0.0.0:{PORT}...")
    server = ThreadingHTTPServer(("0.0.0.0", PORT), PythonApiHandler)
    py_log(f"Python backend successfully running on port {PORT}. Ready for requests.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        py_log("Shutting down Python server...")
        server.server_close()

if __name__ == "__main__":
    run_server()
