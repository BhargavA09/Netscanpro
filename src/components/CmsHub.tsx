import React, { useState, useEffect, useRef } from 'react';
import { fetchJson } from '../lib/api';
import { CmsItem, CmsContentType, CmsPublicationStatus } from '../types';
import { cn } from '../lib/utils';
import { 
  FileText, 
  FilePlus, 
  Upload, 
  Folder, 
  Tag, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Inbox, 
  Search, 
  Sparkles, 
  BookOpen, 
  Image as ImageIcon, 
  FileCode, 
  AlertCircle, 
  X, 
  Archive, 
  User, 
  Calendar,
  Layers,
  FileCheck,
  RefreshCw,
  FolderOpen,
  EyeOff
} from 'lucide-react';

const CATEGORIES = [
  'Threat Intel',
  'APT Campaigns',
  'Malware Analysis',
  'Vulnerability',
  'SOC Guides',
  'Incident Response',
  'Policy'
];

const SUGGESTED_TAGS = [
  'Ransomware',
  'Zero-Day',
  'C2 Server',
  'Phishing',
  'Active Directory',
  'IoT',
  'Kerberos',
  'Linux',
  'Cloud Security',
  'Social Engineering'
];

export function CmsHub() {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CmsItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Input fields for creation/editing
  const [formTitle, setFormTitle] = useState<string>('');
  const [formType, setFormType] = useState<CmsContentType>('article');
  const [formCategory, setFormCategory] = useState<string>('Threat Intel');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [useCustomCategory, setUseCustomCategory] = useState<boolean>(false);
  const [formContent, setFormContent] = useState<string>('');
  const [formSummary, setFormSummary] = useState<string>('');
  const [formStatus, setFormStatus] = useState<CmsPublicationStatus>('Draft');
  const [formAuthor, setFormAuthor] = useState<string>('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  // File Upload states
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | undefined>(undefined);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | undefined>(undefined);
  const [uploadedMimeType, setUploadedMimeType] = useState<string | undefined>(undefined);
  const [fileDragging, setFileDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState<boolean>(true);

  // Fetch all items from server on mount
  const loadItems = async (selectIdAfterLoad?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJson<CmsItem[]>('/api/cms/items');
      // Sort items by creation time descending
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(sorted);
      
      if (selectIdAfterLoad) {
        const matching = sorted.find(x => x.id === selectIdAfterLoad);
        if (matching) {
          setSelectedItem(matching);
        } else if (sorted.length > 0) {
          setSelectedItem(sorted[0]);
        }
      } else if (sorted.length > 0 && !selectedItem) {
        setSelectedItem(sorted[0]);
      }
    } catch (err: any) {
      console.error('Error loading CMS items:', err);
      setError(err.message || 'Failed to fetch directory items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Update form values when selectedItem changes
  useEffect(() => {
    if (selectedItem && !isCreating && !isEditing) {
      // Just viewing, synchronize values in case edit gets clicked
      resetFormWithItem(selectedItem);
    }
  }, [selectedItem]);

  const resetFormWithItem = (item: CmsItem) => {
    setFormTitle(item.title);
    setFormType(item.type);
    
    if (CATEGORIES.includes(item.category)) {
      setFormCategory(item.category);
      setUseCustomCategory(false);
      setCustomCategory('');
    } else {
      setFormCategory('Other');
      setUseCustomCategory(true);
      setCustomCategory(item.category);
    }

    setFormContent(item.content);
    setFormSummary(item.summary);
    setFormStatus(item.status);
    setFormAuthor(item.author);
    setFormTags(item.tags || []);
    
    setUploadedFileUrl(item.fileUrl);
    setUploadedFileName(item.fileName);
    setUploadedFileSize(item.fileSize);
    setUploadedMimeType(item.mimeType);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    // Fresh default values
    setFormTitle('');
    setFormType('article');
    setFormCategory('Threat Intel');
    setCustomCategory('');
    setUseCustomCategory(false);
    setFormContent('');
    setFormSummary('');
    setFormStatus('Draft');
    
    // Attempt to grab current operator name
    const storedUser = localStorage.getItem('collab_username');
    setFormAuthor(storedUser || 'SOC Administrator');
    
    setFormTags([]);
    setTagInput('');
    setUploadedFileUrl(undefined);
    setUploadedFileName(undefined);
    setUploadedFileSize(undefined);
    setUploadedMimeType(undefined);
  };

  const handleStartEdit = () => {
    if (!selectedItem) return;
    resetFormWithItem(selectedItem);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setIsCreating(false);
    if (selectedItem) {
      resetFormWithItem(selectedItem);
    }
  };

  // Tag list helpers
  const handleAddTag = (tagText: string) => {
    const trimmed = tagText.trim();
    if (trimmed && !formTags.includes(trimmed)) {
      setFormTags([...formTags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setFormTags(formTags.filter((_, idx) => idx !== indexToRemove));
  };

  // Convert uploaded files to base64 DataURLs dynamically in the browser
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploadedFileUrl(result);
      setUploadedFileName(file.name);
      
      // Calculate scannable file units
      const sizeBytes = file.size;
      let okSize = '';
      if (sizeBytes < 1024) {
        okSize = `${sizeBytes} B`;
      } else if (sizeBytes < 1024 * 1024) {
        okSize = `${(sizeBytes / 1024).toFixed(1)} KB`;
      } else {
        okSize = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
      }
      setUploadedFileSize(okSize);
      setUploadedMimeType(file.type || 'application/octet-stream');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragging(true);
  };

  const handleDragLeave = () => {
    setFileDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileUrl(undefined);
    setUploadedFileName(undefined);
    setUploadedFileSize(undefined);
    setUploadedMimeType(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submit (POST or PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Title is a required parameter.");
      return;
    }
    if (!formContent.trim()) {
      alert("Content text cannot be left blank.");
      return;
    }

    try {
      setSaving(true);
      const finalCategory = useCustomCategory ? customCategory.trim() : formCategory;
      if (!finalCategory) {
        alert("Please specify a category.");
        setSaving(false);
        return;
      }

      const payload = {
        title: formTitle.trim(),
        type: formType,
        category: finalCategory,
        content: formContent.trim(),
        summary: formSummary.trim(),
        status: formStatus,
        author: formAuthor.trim() || "SOC Administrator",
        tags: formTags,
        fileUrl: uploadedFileUrl,
        fileName: uploadedFileName,
        fileSize: uploadedFileSize,
        mimeType: uploadedMimeType
      };

      let savedItem: CmsItem;

      if (isCreating) {
        savedItem = await fetchJson<CmsItem>('/api/cms/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setIsCreating(false);
        setSelectedItem(savedItem);
      } else {
        if (!selectedItem) return;
        savedItem = await fetchJson<CmsItem>(`/api/cms/items/${selectedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setIsEditing(false);
        setSelectedItem(savedItem);
      }

      // Reload whole list and select saved item
      await loadItems(savedItem.id);
    } catch (err: any) {
      console.error('Error saving CMS item:', err);
      alert(err.message || "Failed to commit changes in database store.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    const confirmMessage = `Are you sure you want to completely erase the publication: "${selectedItem.title}"? This cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setSaving(true);
      await fetchJson<{ success: boolean }>(`/api/cms/items/${selectedItem.id}`, {
        method: 'DELETE'
      });
      setSelectedItem(null);
      await loadItems();
    } catch (err: any) {
      console.error('Error deleting CMS item:', err);
      alert(err.message || 'Could not purge item from records list.');
    } finally {
      setSaving(false);
    }
  };

  // Filter & Search List logic
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const getStatusBadgeClass = (status: CmsPublicationStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-accent/10 border-accent/30 text-accent';
      case 'Under Review':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
      case 'Draft':
        return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400';
      case 'Archived':
        return 'bg-violet-500/10 border-violet-500/30 text-violet-400';
      default:
        return 'bg-zinc-700 text-zinc-300';
    }
  };

  const getContentTypeBadge = (type: CmsContentType) => {
    switch (type) {
      case 'article':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/45 px-2 py-0.5 rounded border border-cyan-500/20">
            <FileText className="w-3 h-3" />
            ARTICLE
          </span>
        );
      case 'document':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/45 px-2 py-0.5 rounded border border-amber-500/20">
            <FolderOpen className="w-3 h-3" />
            DOCUMENT
          </span>
        );
      case 'multimedia':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-950/45 px-2 py-0.5 rounded border border-purple-500/20">
            <ImageIcon className="w-3 h-3" />
            MULTIMEDIA
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Title Banner */}
      <div className="bg-gradient-to-r from-card to-zinc-900 border border-border p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Threat Intelligence CMS Hub
          </h2>
          <p className="text-zinc-500 text-xs mt-1">
            Publish threat briefings, deploy response playbooks, structure hardening documents, and review multimedia infosec assets in a real-time intelligence network.
          </p>
        </div>
        <button
          onClick={handleStartCreate}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 disabled:bg-white/5 disabled:text-zinc-500 border border-accent/40 rounded-lg text-accent text-xs font-mono transition-all uppercase cursor-pointer shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          Create New Briefing
        </button>
      </div>

      {/* Main double column Workspace GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar pane: search, filter criteria, and briefings listings */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            
            {/* Search items bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search CMS library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-accent font-mono placeholder-zinc-600"
              />
            </div>

            {/* Quick multi-filters */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-1">Type</label>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded p-1.5 text-[10px] text-white font-mono focus:outline-none"
                >
                  <option value="all">ALL</option>
                  <option value="article">Article</option>
                  <option value="document">Document</option>
                  <option value="multimedia">Media</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-1">Category</label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded p-1.5 text-[10px] text-white font-mono focus:outline-none"
                >
                  <option value="all">ALL</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-mono text-zinc-500 uppercase mb-1">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded p-1.5 text-[10px] text-white font-mono focus:outline-none"
                >
                  <option value="all">ALL</option>
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Review</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Library catalog scrollview */}
          <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden max-h-[600px]">
            <div className="px-4 py-3 border-b border-border bg-white/5 flex items-center justify-between">
              <span className="text-white text-xs font-mono font-medium">Catalog Items ({filteredItems.length})</span>
              <button 
                onClick={() => loadItems()} 
                className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-all"
                title="Reload library list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {loading && items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent" />
                  <span className="text-[10px] font-mono uppercase">Syncing server volumes...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-600 font-mono text-xs uppercase text-center p-4">
                  <Inbox className="w-8 h-8 opacity-20 mb-2" />
                  <span>No matching assets found</span>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setIsEditing(false);
                        setIsCreating(false);
                      }}
                      className={cn(
                        "w-full text-left p-4 transition-all hover:bg-white/5 flex flex-col gap-2.5 outline-none border-l-2",
                        isSelected 
                          ? "bg-accent/5 border-l-accent" 
                          : "border-l-transparent text-zinc-400"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                          {item.category}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-mono border font-medium",
                          getStatusBadgeClass(item.status)
                        )}>
                          {item.status}
                        </span>
                      </div>

                      <h4 className={cn(
                        "text-xs font-bold leading-snug line-clamp-2",
                        isSelected ? "text-white" : "text-zinc-300"
                      )}>
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-zinc-500 line-clamp-2">
                        {item.summary || "No editorial briefing notes summary provided."}
                      </p>

                      <div className="flex items-center justify-between gap-4 pt-1 w-full text-[10px] font-mono text-zinc-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-600" />
                          <span className="truncate max-w-[80px]">{item.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getContentTypeBadge(item.type)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Workspace pane: Interactive view or CRUD editor form */}
        <div className="lg:col-span-8 flex flex-col h-full">
          
          {error && (
            <div className="mb-4 p-4 bg-critical/10 border border-critical/30 rounded-xl flex items-center gap-3 text-critical text-xs">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW briefs or FORM edits */}
          {isEditing || isCreating ? (
            
            /* INTERACTIVE CMS FORM BLOCK */
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              
              {/* Form title bar */}
              <div className="px-6 py-4 border-b border-border bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-accent" />
                  <span className="text-white font-medium text-xs">
                    {isCreating ? 'CREATE INTEL ASSET' : `EDIT ASSET: ${selectedItem?.title}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-mono border border-border rounded uppercase transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1 bg-accent/20 hover:bg-accent/30 text-accent text-[10px] font-mono border border-accent/40 rounded uppercase transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                </div>
              </div>

              {/* Form panel body */}
              <div className="p-6 space-y-4 max-h-[750px] overflow-y-auto">
                
                {/* 1. Title entry */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Briefing Title (Required)</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Tactical Brief: Zero-Day Target Exploits in Domain Controllers"
                    className="w-full bg-white/5 border border-border rounded-lg p-3 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>

                {/* 2. Side-by-Side Type & Category selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Content Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as CmsContentType)}
                      className="w-full bg-white/5 border border-border rounded-lg p-2.5 text-xs text-white uppercase focus:outline-none focus:border-accent"
                    >
                      <option value="article">Article briefing</option>
                      <option value="document">Document Manual</option>
                      <option value="multimedia">Multimedia Asset</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Status Phase</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as CmsPublicationStatus)}
                      className="w-full bg-white/5 border border-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Classification Category</label>
                    {!useCustomCategory ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={formCategory}
                          onChange={(e) => {
                            if (e.target.value === 'Other') {
                              setUseCustomCategory(true);
                              setFormCategory('Other');
                            } else {
                              setFormCategory(e.target.value);
                            }
                          }}
                          className="flex-1 bg-white/5 border border-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="Other">Add Custom Category...</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Category Name"
                          className="flex-1 bg-white/5 border border-border rounded-lg p-2 text-xs text-white focus:outline-none focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUseCustomCategory(false);
                            setFormCategory(CATEGORIES[0]);
                          }}
                          className="px-2.5 py-2 hover:bg-white/5 border border-border text-zinc-400 text-xs font-mono rounded-lg uppercase"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Short summary briefing */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Executive Summary Brief (Lists & Cards)</label>
                  <input
                    type="text"
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Provide a 1-2 sentence high-level overview of the intel briefings."
                    className="w-full bg-white/5 border border-border rounded-lg p-3 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>

                {/* 4. DRAG AND DROP FILE UPLOADER */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5">
                    Attached Asset File / Document / Multimedia
                  </label>
                  
                  {uploadedFileUrl ? (
                    /* Display uploaded payload brief details */
                    <div className="border border-accent/30 bg-accent/5 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-accent/10 rounded-lg text-accent border border-accent/20">
                          {uploadedMimeType?.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-accent animate-pulse" />
                          ) : (
                            <FileText className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-xs font-mono font-medium truncate max-w-[280px] md:max-w-md">
                            {uploadedFileName}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">
                            {uploadedFileSize} | {uploadedMimeType}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-white/15 text-zinc-500 hover:text-white rounded border border-transparent hover:border-border transition-all"
                        title="Remove uploaded attachment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Blank upload stage drag block */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2.5",
                        fileDragging 
                          ? "border-accent bg-accent/5" 
                          : "border-border hover:border-zinc-700 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Upload className={cn("w-6 h-6", fileDragging ? "text-accent animate-bounce" : "text-zinc-500")} />
                      <div>
                        <p className="text-zinc-300 text-xs font-semibold">
                          Drag and Drop or Click to Upload Content
                        </p>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase mt-1 tracking-wider">
                          Supports Markdown Docs, Infographics (PNG/JPG), PDF standards
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Rich Body Content text field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase">Briefing Content (Markdown Supported)</label>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5" /> HTML codes / standard paragraphs ok
                    </span>
                  </div>
                  <textarea
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Enter full body details, analysis data, technical mitigations here..."
                    className="w-full h-64 bg-white/5 border border-border rounded-lg p-4 text-xs font-mono leading-relaxed text-zinc-300 focus:outline-none focus:border-accent resize-y"
                  />
                </div>

                {/* 6. Tags selection list */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Strategic Threat Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {formTags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-mono">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(idx)}
                          className="hover:bg-zinc-700 rounded-full p-0.5 text-zinc-500 hover:text-white transition-all focus:outline-none"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="Type a tag & press Enter"
                      className="flex-1 bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(tagInput)}
                      className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono rounded-lg border border-border transition-all uppercase"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-2 text-[9px] font-mono text-zinc-500 uppercase flex items-center flex-wrap gap-1.5">
                    <span>Quick Recommendations:</span>
                    {SUGGESTED_TAGS.filter(x => !formTags.includes(x)).slice(0, 5).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="text-[9px] text-zinc-400 hover:text-accent font-mono lowercase hover:underline"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Author signing */}
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">SOC Author Sign-Off</label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g., Lead analyst name"
                    className="w-full bg-white/5 border border-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                  />
                </div>

              </div>

              {/* Form operations footer */}
              <div className="p-6 border-t border-border bg-white/5 flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Pressing Draft saves local records to server memory
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-5 py-2 hover:bg-white/5 text-zinc-300 border border-border rounded-lg text-xs font-mono transition-all uppercase"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-accent/20 hover:bg-accent/30 text-accent font-bold border border-accent/40 rounded-lg text-xs font-mono transition-all uppercase disabled:opacity-50"
                  >
                    {saving ? 'Processing DB...' : 'Publish / Update'}
                  </button>
                </div>
              </div>

            </form>

          ) : selectedItem ? (
            
            /* PRIMARY VIEW INTERACTIVE READ / MULTIMEDIA ASSET BOARD */
            <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden h-full">
              
              {/* Header toolbars */}
              <div className="px-6 py-4 border-b border-border bg-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full truncate">
                  <div className="p-2 bg-accent/10 rounded border border-accent/20">
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-border/40">
                        {selectedItem.category}
                      </span>
                      {getContentTypeBadge(selectedItem.type)}
                    </div>
                    <span className="text-zinc-500 text-[10px] font-mono mt-0.5 uppercase block">
                      ID: {selectedItem.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-border rounded-lg uppercase transition-all flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Asset
                  </button>
                  <button
                    onClick={handleDeleteItem}
                    className="px-4 py-1.5 hover:bg-critical/10 text-zinc-400 hover:text-critical border border-transparent hover:border-critical/20 rounded-lg text-xs font-mono uppercase transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* View contents scroll pane */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[700px]">
                
                {/* Categorization with dynamic status pill */}
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="space-y-1">
                    <h3 className="text-white text-lg font-bold">
                      {selectedItem.title}
                    </h3>
                    <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-600" />
                        Created by <strong className="text-zinc-300">{selectedItem.author}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                        {new Date(selectedItem.createdAt).toLocaleDateString()} at {new Date(selectedItem.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded text-xs font-mono border font-medium uppercase shrink-0",
                    getStatusBadgeClass(selectedItem.status)
                  )}>
                    {selectedItem.status}
                  </span>
                </div>

                {/* Short card overview quote */}
                <div className="bg-zinc-900/60 border border-border rounded-xl p-4 text-xs font-mono leading-relaxed text-zinc-400">
                  <span className="text-[9px] text-zinc-600 block uppercase font-bold tracking-widest mb-1">
                    Executive Intelligence Summary:
                  </span>
                  {selectedItem.summary || "No editorial briefing notes summary provided."}
                </div>

                {/* Multimedia preview section if file exists */}
                {selectedItem.fileUrl && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Attached Media Payload
                    </span>

                    {/* Check if attachment is image */}
                    {selectedItem.mimeType?.startsWith('image/') ? (
                      <div className="border border-border/60 bg-black/40 rounded-xl overflow-hidden p-3 flex flex-col items-center">
                        <img 
                          src={selectedItem.fileUrl} 
                          alt={selectedItem.fileName || "Infographic payload preview"} 
                          referrerPolicy="no-referrer"
                          className="max-h-72 object-contain rounded-lg border border-border"
                        />
                        <div className="mt-2 w-full text-center text-[10px] font-mono text-zinc-500 uppercase tracking-wide flex items-center justify-between px-2">
                          <span>{selectedItem.fileName}</span>
                          <span>{selectedItem.fileSize}</span>
                        </div>
                      </div>
                    ) : (
                      /* If file is document / pdf manuals */
                      <div className="bg-zinc-900 border border-border/80 px-5 py-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-accent/10 rounded-lg text-accent border border-accent/20">
                            <FileCheck className="w-6 h-6 text-accent animate-pulse" />
                          </div>
                          <div>
                            <p className="text-white text-xs font-mono font-bold">
                              {selectedItem.fileName || "SECURE_DOCUMENT_CAPSULE.pdf"}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">
                              {selectedItem.fileSize || "Unknown bytes"} | {selectedItem.mimeType || "application/octet-stream"}
                            </p>
                          </div>
                        </div>
                        <a 
                          href={selectedItem.fileUrl} 
                          download={selectedItem.fileName || "intelligence_guide"}
                          className="px-4 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent text-xs font-mono rounded-lg transition-all uppercase"
                        >
                          Download Manual
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Main Markdown document content preview */}
                <div className="border-t border-border pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Intelligence Analysis Body
                    </span>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-[9px] font-mono text-zinc-500 hover:text-white uppercase flex items-center gap-1"
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Plain Source Layout
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Render Clean Layout
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-white/5 border border-border/60 rounded-xl p-5 md:p-6 overflow-x-auto">
                    {showPreview ? (
                      /* Clean styled readable structure replacing markdown with clean block renderings */
                      <div className="prose prose-invert max-w-none text-xs font-sans text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {selectedItem.content}
                      </div>
                    ) : (
                      /* Raw source for security technicians */
                      <pre className="text-amber-500 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
                        {selectedItem.content}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Displaying tag associations */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="border-t border-border/60 pt-4 flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Tags:</span>
                    {selectedItem.tags.map((tag) => (
                      <span key={tag} className="bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-mono text-[10px] py-0.5 px-2.5 rounded hover:text-white cursor-pointer transition-all">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

              </div>

              {/* Status footer banner */}
              <div className="border-t border-border bg-black/20 px-6 py-2.5 text-[9px] font-mono text-zinc-600 uppercase flex items-center justify-between">
                <span>Repository status: Verified in Threatintel Cluster</span>
                <span>Last updated at: {new Date(selectedItem.updatedAt).toLocaleTimeString()}</span>
              </div>

            </div>
          ) : (
            /* Selected item is null and no edit/creation state */
            <div className="bg-card border border-border rounded-xl flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-500 space-y-3 uppercase font-mono">
              <FolderOpen className="w-12 h-12 opacity-15 text-accent animate-pulse" />
              <div>
                <h4 className="text-zinc-400 text-xs font-bold font-mono">No intelligence item selected</h4>
                <p className="text-[10px] text-zinc-600 mt-1 lowercase font-mono">
                  Browse catalog list or click "+ Create New Briefing" above
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
