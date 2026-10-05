import React, { useState } from 'react';
import {
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Download,
  Edit3,
  Eye,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.tsx';
import { storage } from '../../services/storage.ts';
import { ContentItem } from '../../types/index.ts';

interface GenerationOutputProps {
  content: string;
  toolId: string;
  modelUsed?: string;
  executionMs?: number;
  onRegenerate?: () => void;
  onContentChange?: (newContent: string) => void;
  promptParams?: Record<string, any>;
  onScheduleToCalendar?: (text: string) => void;
}

export const GenerationOutput: React.FC<GenerationOutputProps> = ({
  content,
  toolId,
  modelUsed = 'llama-3.3-70b-versatile',
  executionMs = 650,
  onRegenerate,
  onContentChange,
  promptParams = {},
  onScheduleToCalendar,
}) => {
  const { success, info } = useToast();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState(content);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  React.useEffect(() => {
    setEditableText(content);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    setCopied(true);
    success('Copied to Clipboard!', 'Your generated content is ready to paste.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableText(e.target.value);
    if (onContentChange) onContentChange(e.target.value);
  };

  const handleExport = (format: 'md' | 'txt' | 'json') => {
    let blob: Blob;
    let filename = `creator-studio-${toolId}-${Date.now()}`;

    if (format === 'json') {
      const data = {
        tool: toolId,
        model: modelUsed,
        content: editableText,
        promptParams,
        exportedAt: new Date().toISOString(),
      };
      blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      filename += '.json';
    } else if (format === 'md') {
      blob = new Blob([editableText], { type: 'text/markdown' });
      filename += '.md';
    } else {
      blob = new Blob([editableText], { type: 'text/plain' });
      filename += '.txt';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    info(`Exported as .${format}`);
  };

  const handleSaveToLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    const user = storage.getUser();
    const words = editableText.trim().split(/\s+/).filter(Boolean).length;
    const chars = editableText.length;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem: ContentItem = {
      id: `cnt_${Date.now()}`,
      userId: user.id,
      projectId: selectedProjectId || undefined,
      title: saveTitle.trim() || `${toolId.replace(/_/g, ' ')} draft`,
      toolId,
      platform: promptParams.platform || 'Cross-Platform',
      contentType: toolId,
      generatedOutput: editableText,
      promptParams,
      isFavorite: false,
      tags: tags.length ? tags : ['Generated', toolId],
      wordCount: words,
      characterCount: chars,
      versionsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveContentItem(newItem);
    success('Saved to Content Library!', `Organized under "${newItem.title}"`);
    setShowSaveModal(false);
  };

  const wordCount = editableText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editableText.length;
  const projects = storage.getProjects();

  return (
    <div className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs overflow-hidden flex flex-col text-[#17231C]">
      {/* Output Toolbar */}
      <div className="px-5 py-3.5 border-b border-[#E1E7D9] bg-[#F7F8F2] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Execution Metadata */}
        <div className="flex items-center gap-3 text-[#647168] font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-[#17231C] font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#92B76B]" />
            AI Studio · {modelUsed?.replace(/groq/gi, 'Neural Engine') || 'Neural AI'}
          </span>
          <span>·</span>
          <span>{executionMs}ms</span>
          <span>·</span>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
              isEditing
                ? 'bg-[#17231C] text-[#F4F2E9] border-[#17231C]'
                : 'text-[#647168] hover:text-[#17231C] border-[#E1E7D9] hover:bg-[#FFFFFF]'
            }`}
            title="Toggle Edit mode"
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isEditing ? 'Preview' : 'Edit'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 px-2.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] hover:bg-[#F7F8F2] text-[#17231C] text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#92B76B]" /> : <Copy className="w-3.5 h-3.5 text-[#647168]" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={() => {
              setSaveTitle(`${toolId.replace(/_/g, ' ')} - ${new Date().toLocaleDateString()}`);
              setShowSaveModal(true);
            }}
            className="p-1.5 px-2.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] hover:bg-[#F7F8F2] text-[#17231C] text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Save into persistent library"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#92B76B]" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {onScheduleToCalendar && (
            <button
              onClick={() => onScheduleToCalendar(editableText)}
              className="p-1.5 px-2.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] hover:bg-[#F7F8F2] text-[#17231C] text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Add to Content Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-[#92B76B]" />
              <span className="hidden sm:inline">Schedule</span>
            </button>
          )}

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1.5 px-2.5 rounded-xl border border-[#c5e452] bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
              title="Regenerate with AI"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          {/* Export dropdown */}
          <div className="relative group">
            <button
              className="p-1.5 px-2 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] text-[#647168] hover:text-[#17231C] hover:bg-[#F7F8F2] text-xs flex items-center gap-1"
              title="Export file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col w-36 bg-[#FFFFFF] border border-[#E1E7D9] rounded-2xl shadow-xl py-1 z-20 animate-modal-pop">
              <button
                onClick={() => handleExport('md')}
                className="px-3.5 py-2 text-left text-xs text-[#17231C] hover:bg-[#F7F8F2] font-medium"
              >
                Markdown (.md)
              </button>
              <button
                onClick={() => handleExport('txt')}
                className="px-3.5 py-2 text-left text-xs text-[#17231C] hover:bg-[#F7F8F2] font-medium"
              >
                Plain Text (.txt)
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-3.5 py-2 text-left text-xs text-[#17231C] hover:bg-[#F7F8F2] font-medium"
              >
                JSON Payload (.json)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 overflow-y-auto max-h-[600px] bg-[#FFFFFF]">
        {isEditing ? (
          <textarea
            value={editableText}
            onChange={handleTextChange}
            rows={14}
            className="w-full bg-[#F7F8F2] border border-[#E1E7D9] rounded-2xl p-4 text-xs font-mono text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed resize-y"
            placeholder="Edit generated content here..."
          />
        ) : (
          <div className="prose max-w-none text-xs sm:text-sm leading-relaxed text-[#17231C] whitespace-pre-wrap font-sans selection:bg-[#D9F36B] selection:text-[#17231C]">
            {editableText}
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-[#17231C] animate-modal-pop">
            <h3 className="text-base font-bold text-[#17231C] flex items-center gap-2 font-display">
              <Bookmark className="w-4 h-4 text-[#92B76B]" />
              Save to Content Library
            </h3>
            <form onSubmit={handleSaveToLibrary} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Title</label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">
                  Assign to Project (Optional)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                >
                  <option value="">No Project (Standalone Item)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.platform || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Campaign, Viral, Q4, Launch"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E1E7D9]">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#647168] hover:text-[#17231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] shadow-2xs"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
