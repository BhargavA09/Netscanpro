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

