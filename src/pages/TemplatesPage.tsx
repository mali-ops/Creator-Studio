import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { TemplateItem } from '../types/index.ts';
import {
  Layers,
  Search,
  Star,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

interface TemplatesPageProps {
  onUseTemplate: (template: TemplateItem) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onUseTemplate }) => {
  const { isAdmin } = useAuth();
  const { success } = useToast();

  const [templates, setTemplates] = useState<TemplateItem[]>(() => storage.getTemplates());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin New Template Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newToolId, setNewToolId] = useState('caption_generator');
  const [newPlatform, setNewPlatform] = useState('LinkedIn');
  const [newCategory, setNewCategory] = useState<'Sales' | 'Educational' | 'Storytelling' | 'Promotional' | 'Trending Formats'>('Educational');
  const [newSampleOutput, setNewSampleOutput] = useState('');

  const platforms = ['All', 'LinkedIn', 'Instagram', 'YouTube', 'TikTok', 'X'];

  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All' || t.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storage.toggleFavoriteTemplate(id);
    setTemplates(updated);
  };

  const handleCopySample = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Sample Output Copied');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storage.deleteTemplate(id);
    setTemplates(updated);
    success('Template Removed');
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTmpl: TemplateItem = {
      id: `tmpl_${Date.now()}`,
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newDesc.trim(),
      toolId: newToolId,
      platform: newPlatform,
      category: newCategory,
      sampleInput: { topic: newTitle },
      sampleOutput: newSampleOutput || 'Sample content output...',
      isGlobal: true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = storage.saveTemplate(newTmpl);
    setTemplates(updated);
    setShowAddModal(false);
    success('Template Added to Global Library');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#17231C] animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold mb-1">
            <Layers className="w-3.5 h-3.5" />
            Module 10 · Template Library
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
            Proven Copywriting & Hook Templates
          </h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Battle-tested frameworks for high engagement across social platforms. Launch directly into the studio.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-[#17231C] text-[#F4F2E9] hover:bg-[#101612] flex items-center gap-1.5 shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5 text-[#D9F36B]" />
            Add Global Template
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] rounded-2xl overflow-x-auto text-xs shadow-2xs">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedPlatform === p
                  ? 'bg-[#17231C] dark:bg-[#25392C] text-[#F4F2E9] dark:text-[#FFFFFF] shadow-sm border border-transparent dark:border-[#38523F]'
                  : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#1D2B21]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#647168] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#E1E7D9] rounded-xl text-[#17231C] placeholder-[#647168]/60 focus:border-[#17231C] focus:outline-none transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] hover:border-[#17231C] transition-all flex flex-col justify-between space-y-4 group shadow-2xs hover:-translate-y-0.5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#17231C] font-semibold px-2.5 py-0.5 rounded-full bg-[#F7F8F2] border border-[#E1E7D9]">
                  {tmpl.platform} · {tmpl.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleToggleFavorite(tmpl.id, e)}
                    className="p-1 text-[#647168] hover:text-amber-500 transition-colors"
                    title="Favorite template"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        tmpl.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteTemplate(tmpl.id, e)}
                      className="p-1 text-[#647168] hover:text-rose-600 transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold font-display text-[#17231C] group-hover:text-[#92B76B] transition-colors">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-[#647168] mt-1 leading-relaxed line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-xs text-[#17231C] font-mono leading-relaxed relative">
                <div className="text-[10px] text-[#647168] uppercase tracking-wider mb-1 font-sans font-semibold">
                  Example Output:
                </div>
                <div className="line-clamp-3 text-[11px]">{tmpl.sampleOutput}</div>
                <button
                  onClick={(e) => handleCopySample(tmpl.id, tmpl.sampleOutput, e)}
                  className="absolute top-2.5 right-2.5 p-1 text-[#647168] hover:text-[#17231C]"
                  title="Copy sample"
                >
                  {copiedId === tmpl.id ? (
                    <Check className="w-3.5 h-3.5 text-[#92B76B]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E1E7D9] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#647168]">
                {tmpl.usageCount} creators used
              </span>

              <button
                onClick={() => onUseTemplate(tmpl)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02]"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-[#17231C] animate-modal-pop">
            <h3 className="text-base font-bold font-display text-[#17231C]">Add Global Template (Admin)</h3>
            <form onSubmit={handleAddTemplate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Template Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., 3-Act Contrarian Story"
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Briefly explain what psychological trigger this template uses..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Platform</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                  >
                    {['LinkedIn', 'Instagram', 'YouTube', 'TikTok', 'X'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                  >
                    <option value="Educational">Educational</option>
                    <option value="Sales">Sales</option>
                    <option value="Storytelling">Storytelling</option>
                    <option value="Trending Formats">Trending Formats</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Sample Output</label>
                <textarea
                  rows={4}
                  required
                  value={newSampleOutput}
                  onChange={(e) => setNewSampleOutput(e.target.value)}
                  placeholder="Paste an example generated output demonstrating the template..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E1E7D9]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#647168] hover:text-[#17231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] shadow-2xs"
                >
                  Save Global Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
