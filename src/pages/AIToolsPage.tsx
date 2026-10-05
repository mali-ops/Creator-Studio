import React, { useState, useEffect } from 'react';
import { AI_TOOLS, AIToolConfig, ToolId } from '../types/tools.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { generateContent } from '../services/api.ts';
import { adminConfig } from '../services/adminConfig.ts';
import { ToolForm } from '../components/ai/ToolForm.tsx';
import { GenerationOutput } from '../components/ai/GenerationOutput.tsx';
import {
  Sparkles,
  Search,
  MessageSquare,
  Clapperboard,
  Flame,
  Video,
  Heading,
  FileText,
  Lightbulb,
  Hash,
  MousePointerClick,
  UserCheck,
  Layers,
  Target,
  ShoppingBag,
  BookOpen,
  Repeat,
  ArrowLeft,
  Zap,
  Lock,
} from 'lucide-react';
import { CalendarEntry } from '../types/index.ts';

interface AIToolsPageProps {
  initialToolId?: string;
  onScheduleToCalendar?: (text: string) => void;
}

export const AIToolsPage: React.FC<AIToolsPageProps> = ({
  initialToolId,
  onScheduleToCalendar,
}) => {
  const { user, deductCredits, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [adminSettings, setAdminSettings] = useState(adminConfig.getSettings());

  useEffect(() => {
    return adminConfig.subscribe((updated) => setAdminSettings(updated));
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(() => {
    if (initialToolId && AI_TOOLS.some((t) => t.id === initialToolId)) {
      return initialToolId as ToolId;
    }
    return null;
  });

  // Tool Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<Record<string, any>>({});
  const [executionMetadata, setExecutionMetadata] = useState<{
    modelUsed: string;
    executionMs: number;
  }>({
    modelUsed: 'openai/gpt-oss-120b',
    executionMs: 390,
  });

  const brandVoices = storage.getBrandVoices();

  const iconMap: Record<string, any> = {
    MessageSquare,
    Sparkles,
    Clapperboard,
    Flame,
    Video,
    Heading,
    FileText,
    Lightbulb,
    Hash,
    MousePointerClick,
    UserCheck,
    Layers,
    Target,
    ShoppingBag,
    BookOpen,
    Repeat,
  };

  const categories = ['All', 'Social Media', 'Video & Scripts', 'Growth & Strategy', 'Sales & Copy'];

  const filteredTools = AI_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeTool = AI_TOOLS.find((t) => t.id === activeToolId);
  const activeToolCfg = activeTool ? adminSettings.tools[activeTool.id] : undefined;
  const activeToolCost = activeToolCfg?.creditCost ?? activeTool?.creditCost ?? 1;
  const isActiveToolEnabled = activeToolCfg?.enabled !== false;

  const handleGenerate = async (formData: Record<string, any>, brandVoice?: any) => {
    if (!activeTool) return;

    if (!isActiveToolEnabled) {
      toastError('Tool Disabled', 'This tool has been temporarily disabled by platform administration.');
      return;
    }

    if (!user || user.creditsBalance < activeToolCost) {
      toastError('Insufficient Credits', `This tool requires ${activeToolCost} credits.`);
      return;
    }

    const deducted = deductCredits(activeToolCost);
    if (!deducted) {
      toastError('Credit Error', 'Unable to deduct credits.');
      return;
    }

    setIsGenerating(true);
    setLastParams(formData);

    try {
      const result = await generateContent({
        toolId: activeTool.id,
        params: formData,
        brandVoice,
      });

      setGeneratedOutput(result.content);
      setExecutionMetadata({
        modelUsed: result.modelUsed,
        executionMs: result.executionMs,
      });

      storage.logAIGeneration({
        id: `log_${Date.now()}`,
        userId: user.id,
        toolId: activeTool.id,
        modelUsed: result.modelUsed,
        provider: 'ai_engine',
        creditsDeducted: activeToolCost,
        executionMs: result.executionMs,
        status: 'success',
        createdAt: new Date().toISOString(),
      });

      success(`${activeToolCfg?.name || activeTool.name} Generated!`, `Completed in ${result.executionMs}ms.`);
    } catch (err: any) {
      console.error(err);
      toastError('Generation Failed', err.message || 'Error occurred while generating.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCalendarSchedule = (text: string) => {
    if (!activeTool) return;
    const newEntry: CalendarEntry = {
      id: `cal_${Date.now()}`,
      userId: user?.id || 'usr_default',
      title: `${activeTool.name} Output`,
      platform: activeTool.platform,
      category: activeTool.category,
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime: '11:00',
      timezone: 'UTC',
      status: 'Draft',
      notes: text.slice(0, 250),
      inAppReminder: true,
      createdAt: new Date().toISOString(),
    };
    storage.saveCalendarEntry(newEntry);
    success('Scheduled to Calendar!', 'Added for tomorrow at 11:00 AM.');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-[#17231C] animate-page-enter">
      {/* If a tool is active, render active tool workspace */}
      {activeTool ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E1E7D9] pb-4">
            <button
              onClick={() => {
                setActiveToolId(null);
                setGeneratedOutput(null);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#647168] hover:text-[#17231C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all 16 tools
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-[#17231C] font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#92B76B]" />
              <span>Cost: {activeTool.creditCost} credit(s)</span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C] flex items-center gap-2.5">
              {React.createElement(iconMap[activeTool.icon] || Sparkles, { className: 'w-6 h-6 text-[#92B76B]' })}
              {activeTool.name}
            </h1>
            <p className="text-xs text-[#647168]">{activeTool.tagline}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
              <ToolForm
                tool={activeTool}
                brandVoices={brandVoices}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                userCredits={user?.creditsBalance ?? 0}
              />
            </div>

            <div className="lg:col-span-7">
              {generatedOutput ? (
                <GenerationOutput
                  content={generatedOutput}
                  toolId={activeTool.id}
                  modelUsed={executionMetadata.modelUsed}
                  executionMs={executionMetadata.executionMs}
                  onRegenerate={() => handleGenerate(lastParams)}
                  promptParams={lastParams}
                  onScheduleToCalendar={handleCalendarSchedule}
                />
              ) : (
                <div className="h-full min-h-[400px] rounded-3xl border border-dashed border-[#E1E7D9] bg-[#FFFFFF]/70 p-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#92B76B]" />
                  </div>
                  <h3 className="text-base font-bold font-display text-[#17231C]">{activeTool.name}</h3>
                  <p className="text-xs text-[#647168] max-w-sm leading-relaxed">
                    {activeTool.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Tools Directory Grid */
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              16 Specialized AI Content Generators
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C] tracking-tight">
              AI Tools Directory
            </h1>
            <p className="text-xs text-[#647168] max-w-2xl">
              Specialized, prompt-engineered models designed for each stage of creation. Every tool validates inputs, supports saved brand voices, and delivers production-grade results.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] rounded-2xl overflow-x-auto text-xs shadow-2xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#17231C] dark:bg-[#25392C] text-[#F4F2E9] dark:text-[#FFFFFF] shadow-sm border border-transparent dark:border-[#38523F]'
                      : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF] hover:bg-[#F7F8F2] dark:hover:bg-[#1D2B21]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-[#647168] absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#E1E7D9] rounded-xl text-[#17231C] placeholder-[#647168]/60 focus:border-[#17231C] focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Grid of 16 Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTools.map((tool) => {
              const Icon = iconMap[tool.icon] || Sparkles;
              const cfg = adminSettings.tools[tool.id];
              const cost = cfg?.creditCost ?? tool.creditCost ?? 1;
              const isEnabled = cfg?.enabled !== false;
              const toolName = cfg?.name || tool.name;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    if (!isEnabled) {
                      toastError('Tool Disabled', `${toolName} has been temporarily disabled by admin.`);
                      return;
                    }
                    setActiveToolId(tool.id);
                  }}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between group shadow-2xs ${
                    isEnabled
                      ? 'border-[#E1E7D9] bg-[#FFFFFF] hover:border-[#17231C] hover:shadow-md cursor-pointer hover:-translate-y-0.5'
                      : 'border-[#E1E7D9] bg-[#F7F8F2] opacity-75 cursor-not-allowed'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-[#92B76B]" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!isEnabled && (
                          <span className="text-[9px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Disabled
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#17231C] font-semibold bg-[#F7F8F2] px-2.5 py-1 rounded-full border border-[#E1E7D9]">
                          {cost} {cost === 1 ? 'Credit' : 'Credits'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-sm font-bold font-display ${isEnabled ? 'text-[#17231C] group-hover:text-[#92B76B]' : 'text-[#647168]'} transition-colors`}>
                        {toolName}
                      </h3>
                      <p className="text-[11px] text-[#647168] mt-1 line-clamp-2 leading-relaxed">
                        {tool.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#E1E7D9] flex items-center justify-between text-[11px] text-[#647168]">
                    <span>{tool.platform}</span>
                    <span className={`font-bold transition-transform ${isEnabled ? 'text-[#17231C] group-hover:translate-x-0.5' : 'text-[#647168]'}`}>
                      {isEnabled ? 'Open Tool →' : 'Locked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
