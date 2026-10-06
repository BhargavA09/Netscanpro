import React, { useState, useEffect, useRef } from 'react';
import { fetchJson } from '../lib/api';
import { CollabDocument, CollabUser, ChatMessage } from '../types';
import { cn } from '../lib/utils';
import { 
  Users, 
  MessageSquare, 
  Send, 
  FileText, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  Edit3, 
  Wifi, 
  WifiOff, 
  Tag, 
  CornerDownRight,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';

const PALETTE = [
  '#00ff41', // Sentinel Matrix
  '#38bdf8', // Cyber Cyan
  '#a855f7', // Hacker Purple
  '#f43f5e', // Flame Red
  '#f59e0b', // Core Amber
  '#10b981'  // Emerald Eco
];

export function Collaboration() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>('incident-report-1');
  const [docContent, setDocContent] = useState<string>('');
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string>('System');
  const [activeUsers, setActiveUsers] = useState<CollabUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // User Config (cached in localStorage or randomized)
  const [username, setUsername] = useState<string>(() => {
    const saved = localStorage.getItem('collab_username');
    if (saved) return saved;
    const list = ['Analyst_Echo', 'Operator_Zeta', 'SecOps_Prime', 'Hunter_Delta', 'CISO_Cyber'];
    return list[Math.floor(Math.random() * list.length)] + '_' + Math.floor(Math.random() * 90 + 10);
  });
  
  const [userColor, setUserColor] = useState<string>(() => {
    const saved = localStorage.getItem('collab_color');
    if (saved) return saved;
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return color;
  });

  const socketRef = useRef<WebSocket | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Save config changes
  const saveUserConfig = (name: string, color: string) => {
    setUsername(name);
    setUserColor(color);
    localStorage.setItem('collab_username', name);
    localStorage.setItem('collab_color', color);
    setShowConfig(false);

    // Rejoin the session under the new identity
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'join',
        documentId: currentDocId,
        username: name,
        color
      }));
    }
  };

  // Fetch initial list of collaborative documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await fetchJson<any[]>('/api/collab/documents');
      setDocuments(docs);
      if (docs.length > 0 && !currentDocId) {
        setCurrentDocId(docs[0].id);
      }
    } catch (e) {
      console.error('Error fetching collaborative documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    return () => {
      // Clean up sockets
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Set up WebSocket connection whenever the active document or connection credentials change
  useEffect(() => {
    if (!currentDocId) return;

    // Connect to WebSocket
    const connectSocket = () => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws-collab`;
      
      console.log(`Connecting to Collaboration Socket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('Socket connection established.');
        setConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Join room
        ws.send(JSON.stringify({
          type: 'join',
          documentId: currentDocId,
          username,
          color: userColor
        }));
      };

      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch (e) {
          return;
        }

        switch (msg.type) {
          case 'init': {
            setDocContent(msg.content);
            setChatMessages(msg.chatHistory || []);
            break;
          }
          case 'edit': {
            if (msg.documentId === currentDocId) {
              setLastUpdatedBy(msg.updatedBy || 'System');
              
              // Simple caret-preserving content update
              if (textareaRef.current) {
                const start = textareaRef.current.selectionStart;
                const end = textareaRef.current.selectionEnd;
                setDocContent(msg.content);
                
                // Let React update the virtual DOM first, then restore caret
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.selectionStart = start;
                    textareaRef.current.selectionEnd = end;
                  }
                }, 0);
              } else {
                setDocContent(msg.content);
              }
            }
            break;
          }
          case 'presence_update': {
            setActiveUsers(msg.users || []);
            break;
          }
          case 'chat': {
            setChatMessages(prev => {
              const result = [...prev, msg.message];
              return result.length > 100 ? result.slice(1) : result;
            });
            break;
          }
        }
      };

      ws.onclose = () => {
        console.log('Socket connection closed. Retrying soon...');
        setConnected(false);
        setActiveUsers([]);
        
        // Auto-reconnection logic
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectSocket();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('Socket error encountered:', err);
        ws.close();
      };
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [currentDocId]);

  // Handle local text modifications in text area
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDocContent(val);
    setLastUpdatedBy(username);

    // Send edits immediately for perfect real-time synchronization
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'edit',
        documentId: currentDocId,
        content: val
      }));
    }
  };

  // Cursor offset change triggers
  const handleSelectionOrFocus = () => {
    if (!textareaRef.current || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;

    socketRef.current.send(JSON.stringify({
      type: 'cursor',
      documentId: currentDocId,
      cursor: {
        selectionStart: start,
        selectionEnd: end
      }
    }));
  };

  // Scroll to bottom of real-time chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const sendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({
      type: 'chat',
      documentId: currentDocId,
      text: chatInput.trim()
    }));
    setChatInput('');
  };

  // Fast-macro phrases for incident response
  const handleMacroClick = (phrase: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({
      type: 'chat',
      documentId: currentDocId,
      text: `[SOC QuickNote]: ${phrase}`
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Presence Bar */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 border border-accent/20 rounded-lg">
            <Users className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm flex items-center gap-2">
              SOC Collaboration Chamber
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono",
                connected ? "bg-accent/10 text-accent border border-accent/30" : "bg-critical/10 text-critical border border-critical/30"
              )}>
                {connected ? <Wifi className="w-3 h-3 text-accent animate-pulse" /> : <WifiOff className="w-3 h-3" />}
                {connected ? 'REAL-TIME ONLINE' : 'CONNECTION FAILED'}
              </span>
            </h3>
            <p className="text-zinc-500 text-xs font-mono uppercase mt-0.5 tracking-wider">
              Secure WebSocket Sync Node
            </p>
          </div>
        </div>

        {/* Presence Avatars */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex -space-x-2 overflow-hidden">
            {activeUsers.map((user) => (
              <div 
                key={user.id} 
                className="w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-black uppercase shadow-lg transition-transform hover:-translate-y-1 cursor-help"
                style={{ backgroundColor: user.color || '#94a3b8' }}
                title={`${user.username} (Active)`}
              >
                {user.username.substring(0, 2)}
              </div>
            ))}
            {activeUsers.length === 0 && (
              <div className="text-zinc-500 font-mono text-xs italic">Awaiting teammates...</div>
            )}
          </div>
          
          <div className="h-6 w-px bg-border" />

          {/* User Profile Config Trigger */}
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-border text-white text-xs font-mono rounded-lg transition-all flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: userColor }} />
            {username} (EDIT)
          </button>
        </div>
      </div>

      {/* User settings modal overlay */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4">
            <h4 className="text-white font-medium text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Configure Collaboration Profile
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">SOC Operator Name</label>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5">Operator Presence Color</label>
                <div className="flex items-center gap-3">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => setUserColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all shrink-0",
                        userColor === c ? "border-white scale-110 shadow-lg" : "border-transparent scale-100 hover:scale-105"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 text-zinc-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button 
                onClick={() => saveUserConfig(username, userColor)}
                className="px-4 py-1.5 bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent text-xs font-mono rounded"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Document Select & Work Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Document list tab headers */}
          <div className="bg-card border border-border p-2 rounded-xl flex items-center gap-2 overflow-x-auto">
            {loading ? (
              <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin mx-auto my-1" />
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setCurrentDocId(doc.id)}
                  className={cn(
                    "px-4 py-2 text-xs font-mono rounded-lg transition-all border outline-none shrink-0 flex items-center gap-2",
                    currentDocId === doc.id
                      ? "bg-accent/10 border-accent/30 text-accent font-bold"
                      : "bg-transparent border-transparent text-zinc-400 hover:text-white"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {doc.title}
                </button>
              ))
            )}
          </div>

          {/* Collaborative Notepad Editor */}
          <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden h-[600px]">
            <div className="px-6 py-4 border-b border-border bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-white font-medium text-xs">Live Collaborative Notepad (Markdown Support)</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2 bg-black/20 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" />
                Last updated by: <span className="text-accent">{lastUpdatedBy}</span>
              </div>
            </div>

            <div className="flex-1 p-6 relative">
              <textarea
                id="collab-textarea"
                ref={textareaRef}
                value={docContent}
                onChange={handleContentChange}
                onSelect={handleSelectionOrFocus}
                onKeyUp={handleSelectionOrFocus}
                onFocus={handleSelectionOrFocus}
                spellCheck={false}
                placeholder="# Collaborative Document Space..."
                className="w-full h-full bg-transparent text-zinc-300 font-mono text-xs leading-relaxed resize-none focus:outline-none whitespace-pre-wrap select-text caret-accent"
              />
            </div>

            <div className="px-6 py-2 border-t border-border bg-black/20 text-[9px] font-mono text-zinc-500 uppercase flex items-center justify-between">
              <span>Sync Mode: Last-Write-Wins (LWW) Collision Guard</span>
              <span>Lines: {docContent.split('\n').length} | Characters: {docContent.length}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Collaboration Chat Sidebar */}
        <div className="space-y-6 flex flex-col h-full">
          <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden h-[676px]">
            {/* Chat header */}
            <div className="p-6 border-b border-border bg-white/5 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" />
              <div>
                <h4 className="text-white font-medium text-xs">Chamber Chat logs</h4>
                <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5 tracking-wider">
                  Secure broadcast channel
                </p>
              </div>
            </div>

            {/* Chat message display area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg) => {
                const isSystem = msg.sender === 'System';
                const isSelf = msg.sender === username;

                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col space-y-1.5 transition-all text-xs",
                      isSystem && "items-center text-center",
                      isSelf ? "items-end" : "items-start"
                    )}
                  >
                    {!isSystem && (
                      <span 
                        className="text-[9px] font-mono font-bold flex items-center gap-1.5"
                        style={{ color: msg.color }}
                      >
                        {msg.sender}
                        {isSelf && <span className="text-zinc-600 font-normal">(You)</span>}
                      </span>
                    )}

                    <div 
                      className={cn(
                        "p-3 rounded-lg max-w-[85%] font-sans leading-relaxed break-words",
                        isSystem 
                          ? "bg-zinc-900/40 text-zinc-500 font-mono text-[10px] uppercase border border-border/20 py-1 px-4 my-1 rounded-full text-center"
                          : isSelf 
                            ? "bg-accent/10 border border-accent/20 text-accent"
                            : "bg-white/5 border border-border/40 text-zinc-300"
                      )}
                    >
                      {msg.text}
                    </div>

                    <span className="text-[8px] font-mono text-zinc-600">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-[10px] text-center p-6 space-y-2 uppercase">
                  <BookOpen className="w-8 h-8 opacity-20" />
                  <p>Broadcast channel empty.</p>
                  <p className="text-zinc-700 text-[8px]">Type below to sync with team</p>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Macro panel */}
            <div className="px-4 py-3 bg-zinc-950/40 border-t border-border flex flex-wrap gap-1.5">
              <button 
                onClick={() => handleMacroClick("Investigating alerts now...")}
                className="text-[9px] font-mono bg-white/5 hover:bg-white/10 text-zinc-400 py-1 px-2 rounded border border-border/40 transition-all uppercase"
              >
                + Investigating
              </button>
              <button 
                onClick={() => handleMacroClick("Containment confirmed!")}
                className="text-[9px] font-mono bg-white/5 hover:bg-white/10 text-zinc-400 py-1 px-2 rounded border border-border/40 transition-all uppercase"
              >
                + Contained
              </button>
              <button 
                onClick={() => handleMacroClick("Blocklist successfully updated.")}
                className="text-[9px] font-mono bg-white/5 hover:bg-white/10 text-zinc-400 py-1 px-2 rounded border border-border/40 transition-all uppercase"
              >
                + Rules Updated
              </button>
            </div>

            {/* Chat form control */}
            <form onSubmit={sendChatMessage} className="p-4 border-t border-border bg-white/5 flex items-center gap-2">
              <input 
                type="text"
                placeholder={connected ? "Enter message to sync..." : "Connecting to chat..."}
                disabled={!connected}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white/5 border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent disabled:opacity-40 font-sans"
              />
              <button 
                type="submit"
                disabled={!connected || !chatInput.trim()}
                className="p-2 bg-accent/20 hover:bg-accent/30 disabled:hover:bg-accent/20 border border-accent/40 rounded-lg text-accent disabled:opacity-40 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
