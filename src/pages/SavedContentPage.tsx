import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { ContentItem, ContentVersion } from '../types/index.ts';
import {
  BookmarkCheck,
  Search,
  Star,
  Copy,
  Check,
  Trash2,
  History,
  Edit3,
  Download,
  Calendar,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface SavedContentPageProps {
  onScheduleToCalendar?: (text: string) => void;
}

export const SavedContentPage: React.FC<SavedContentPageProps> = ({ onScheduleToCalendar }) => {
  const { user, isAdmin, isOwner } = useAuth();
  const { success } = useToast();

  const [items, setItems] = useState<ContentItem[]>(() => storage.getContentItems());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(() => items[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Detail View State
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [copied, setCopied] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const versions = selectedItemId ? storage.getContentVersions(selectedItemId) : [];

  React.useEffect(() => {
    if (selectedItem) {
      setEditText(selectedItem.generatedOutput);
      setEditTitle(selectedItem.title);
      setIsEditing(false);
    }
  }, [selectedItemId]);

  const filteredItems = items.filter((item) => {
    // Privacy Isolation: Clients can only see their own content/photos
    if (!isAdmin && !isOwner && user && item.userId !== user.id) {
      return false;
    }
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.generatedOutput.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'All' || item.platform === selectedPlatform;
    const matchesFav = !onlyFavorites || item.isFavorite;
    return matchesSearch && matchesPlatform && matchesFav;
  });

  const handleCopy = () => {
    if (!selectedItem) return;
    navigator.clipboard.writeText(editText);
    setCopied(true);
    success('Copied to Clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (!selectedItem) return;
    const words = editText.trim().split(/\s+/).filter(Boolean).length;
    const updated = storage.saveContentItem({
      ...selectedItem,
      title: editTitle,
      generatedOutput: editText,
      wordCount: words,
      characterCount: editText.length,
    });
    setItems(updated);
    setIsEditing(false);
    success('Changes Saved', 'A new version snapshot was recorded in history.');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this content item?')) return;
    const updated = storage.deleteContentItem(id);
    setItems(updated);
    setSelectedItemId(updated[0]?.id || null);
    success('Content Item Removed');
  };

  const handleToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storage.toggleFavoriteContent(id);
    setItems(updated);
  };

  const handleRestoreVersion = (v: ContentVersion) => {
    setEditText(v.output);
    setShowVersionModal(false);
    success(`Restored Version #${v.versionNumber}`);
  };

  const handleExport = (format: 'md' | 'txt' | 'json') => {
    if (!selectedItem) return;
    let blob: Blob;
    let name = `${selectedItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    if (format === 'json') {
      blob = new Blob([JSON.stringify(selectedItem, null, 2)], { type: 'application/json' });
      name += '.json';
    } else {
      blob = new Blob([editText], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
      name += format === 'md' ? '.md' : '.txt';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    success(`Exported as .${format}`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#17231C] animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold mb-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Module 13 · Saved Content & Version History
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">Persistent Content Library</h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Search, edit, audit revisions, and export your entire repository of generated and hand-crafted copy.
          </p>
        </div>

        <div className="text-xs font-mono text-[#647168]">
          Total Items: <strong className="text-[#17231C]">{items.length}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Filterable List Shelf */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#647168] absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#E1E7D9] rounded-xl text-[#17231C] placeholder-[#647168]/60 focus:outline-none focus:border-[#17231C] shadow-2xs"
              />
            </div>
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
                onlyFavorites
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-[#FFFFFF] border-[#E1E7D9] text-[#647168] hover:text-[#17231C]'
              }`}
              title="Show only favorites"
            >
              <Star className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E1E7D9] bg-[#FFFFFF]/70 rounded-2xl text-xs text-[#647168]">
                No matching content found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedItemId === item.id
                      ? 'bg-[#17231C] border-[#17231C] text-[#F4F2E9] shadow-md'
                      : 'bg-[#FFFFFF] border-[#E1E7D9] hover:border-[#17231C] text-[#17231C] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold truncate max-w-[200px]">
                      {item.title}
                    </span>
                    <button
                      onClick={(e) => handleToggleFav(item.id, e)}
                      className="text-[#647168] hover:text-amber-500 p-0.5"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          item.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${selectedItemId === item.id ? 'text-[#BECABE]' : 'text-[#647168]'}`}>
                    {item.generatedOutput}
                  </p>
                  <div className={`flex items-center justify-between text-[10px] font-mono mt-2 pt-1.5 border-t ${selectedItemId === item.id ? 'border-[#26372D]' : 'border-[#E1E7D9]'}`}>
                    <span className={selectedItemId === item.id ? 'text-[#D9F36B] font-bold' : 'text-[#92B76B] font-semibold'}>{item.platform}</span>
                    <span className={selectedItemId === item.id ? 'text-[#BECABE]' : 'text-[#647168]'}>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Detailed View & Revision History */}
        <div className="lg:col-span-8">
          {selectedItem ? (
            <div className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs overflow-hidden flex flex-col text-[#17231C]">
              {/* Header Bar */}
              <div className="p-5 border-b border-[#E1E7D9] bg-[#F7F8F2] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="px-3 py-1.5 text-base font-bold bg-[#FFFFFF] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:outline-none focus:border-[#17231C]"
                    />
                  ) : (
                    <h2 className="text-base font-bold font-display text-[#17231C]">{selectedItem.title}</h2>
                  )}
                  <div className="flex items-center gap-3 text-xs font-mono text-[#647168]">
                    <span className="text-[#92B76B] font-bold">{selectedItem.platform}</span>
                    <span>·</span>
                    <span>{selectedItem.wordCount} words</span>
                    <span>·</span>
                    <span>{selectedItem.characterCount} chars</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowVersionModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] hover:bg-[#F7F8F2] text-[#17231C] text-xs font-bold flex items-center gap-1.5"
                    title="Inspect revision history"
                  >
                    <History className="w-3.5 h-3.5 text-[#92B76B]" />
                    <span>History ({versions.length})</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-[#647168] hover:text-[#17231C] text-xs"
                    title="Copy content"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#92B76B]" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452]"
                    >
                      Save Version
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-[#647168] hover:text-[#17231C] text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  <div className="relative group">
                    <button className="p-2 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-[#647168] hover:text-[#17231C] text-xs">
                      <Download className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col w-36 bg-[#FFFFFF] border border-[#E1E7D9] rounded-2xl shadow-xl py-1 z-20 text-xs">
                      <button onClick={() => handleExport('md')} className="px-3.5 py-2 text-left text-[#17231C] hover:bg-[#F7F8F2] font-medium">
                        Markdown (.md)
                      </button>
                      <button onClick={() => handleExport('txt')} className="px-3.5 py-2 text-left text-[#17231C] hover:bg-[#F7F8F2] font-medium">
                        Plain Text (.txt)
                      </button>
                      <button onClick={() => handleExport('json')} className="px-3.5 py-2 text-left text-[#17231C] hover:bg-[#F7F8F2] font-medium">
                        JSON (.json)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(selectedItem.id)}
                    className="p-2 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-[#647168] hover:text-rose-600 text-xs"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {isEditing ? (
                  <textarea
                    rows={12}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-4 bg-[#F7F8F2] border border-[#E1E7D9] rounded-2xl text-xs sm:text-sm font-mono text-[#17231C] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#17231C] leading-relaxed"
                  />
                ) : (
                  <div className="prose max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-[#17231C]">
                    {editText}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="p-4 border-t border-[#E1E7D9] bg-[#F7F8F2] flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#647168] font-semibold">Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.tags.map((t) => (
                    <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#17231C] border border-[#E1E7D9] text-xs font-mono font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-[#E1E7D9] bg-[#FFFFFF]/70 rounded-3xl text-xs text-[#647168]">
              Select an item from the library to inspect or edit.
            </div>
          )}
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-[#17231C] animate-modal-pop">
            <div className="flex items-center justify-between border-b border-[#E1E7D9] pb-3">
              <h3 className="text-base font-bold font-display text-[#17231C] flex items-center gap-2">
                <History className="w-4 h-4 text-[#92B76B]" />
                Revision History
              </h3>
              <button onClick={() => setShowVersionModal(false)} className="text-xs text-[#647168] hover:text-[#17231C] font-semibold">
                Close
              </button>
            </div>

            {versions.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#647168]">
                No earlier revisions recorded yet. Revisions are saved whenever you edit content.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-4 rounded-2xl border border-[#E1E7D9] bg-[#F7F8F2] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#17231C] font-bold">
                        Version #{ver.versionNumber}
                      </span>
                      <span className="text-[11px] text-[#647168]">
                        {new Date(ver.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#647168] line-clamp-2 font-mono">
                      {ver.output}
                    </p>
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#647168]">{ver.changeSummary}</span>
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        className="text-xs text-[#17231C] hover:underline font-bold"
                      >
                        Restore This Version
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
