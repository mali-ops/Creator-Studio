import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { generateContent } from '../services/api.ts';
import { GenerationOutput } from '../components/ai/GenerationOutput.tsx';
import {
  Wand2,
  Sparkles,
  Zap,
  Loader2,
  RefreshCw,
  Sliders,
  History,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { BrandVoice, CalendarEntry } from '../types/index.ts';

interface ContentStudioPageProps {
  onScheduleToCalendar?: (text: string) => void;
  prefilledPrompt?: {
    topic?: string;
    platform?: string;
    contentType?: string;
  };
}

export const ContentStudioPage: React.FC<ContentStudioPageProps> = ({
  onScheduleToCalendar,
  prefilledPrompt,
}) => {
  const { user, deductCredits, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const brandVoices = storage.getBrandVoices();

  // Form State
  const [platform, setPlatform] = useState(prefilledPrompt?.platform || 'Instagram');
  const [contentType, setContentType] = useState(prefilledPrompt?.contentType || 'Social Media Caption');
  const [topic, setTopic] = useState(prefilledPrompt?.topic || '');
  const [targetAudience, setTargetAudience] = useState('');
  const [objective, setObjective] = useState('High Engagement & Comments');
  const [tone, setTone] = useState('Engaging & Authentic');
  const [language, setLanguage] = useState(user?.defaultLanguage || 'English');
  const [length, setLength] = useState('Medium (150-250 words)');
  const [keywords, setKeywords] = useState('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    const def = brandVoices.find((v) => v.isDefault);
    return def ? def.id : '';
  });

  // Generation execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [executionMetadata, setExecutionMetadata] = useState<{
    modelUsed: string;
    executionMs: number;
  }>({
    modelUsed: 'openai/gpt-oss-120b',
    executionMs: 380,
  });

  // Recent Studio History
  const [historyItems, setHistoryItems] = useState<
    Array<{ id: string; topic: string; content: string; date: string }>
  >([]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      toastError('Missing Topic', 'Please describe the core message or topic for your content.');
      return;
    }

    if (!user || user.creditsBalance < 1) {
      toastError('Insufficient Credits', 'Please upgrade or top up your account.');
      return;
    }

    const deducted = deductCredits(1);
    if (!deducted) {
      toastError('Credit Deduction Failed', 'Unable to deduct generation credits.');
      return;
    }

    setIsGenerating(true);
    const selectedVoice = brandVoices.find((v) => v.id === selectedVoiceId);

    try {
      const result = await generateContent({
        toolId: 'caption_generator',
        params: {
          platform,
          contentType,
          topic,
          targetAudience,
          objective,
          tone: selectedVoice?.tone || tone,
          length,
          keywords,
        },
        brandVoice: selectedVoice,
        language,
      });

      setGeneratedOutput(result.content);
      setExecutionMetadata({
        modelUsed: result.modelUsed,
        executionMs: result.executionMs,
      });

      // Save to recent session history
      setHistoryItems((prev) => [
        {
          id: `hist_${Date.now()}`,
          topic,
          content: result.content,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 5),
      ]);

      // Log generation record
      storage.logAIGeneration({
        id: `log_${Date.now()}`,
        userId: user.id,
        toolId: 'universal_content_studio',
        modelUsed: result.modelUsed,
        provider: 'ai_engine',
        creditsDeducted: 1,
        executionMs: result.executionMs,
        status: 'success',
        createdAt: new Date().toISOString(),
      });

      success('Content Generated!', `Completed in ${result.executionMs}ms`);
    } catch (err: any) {
      console.error(err);
      toastError('Generation Failed', err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCalendarSchedule = (text: string) => {
    const newEntry: CalendarEntry = {
      id: `cal_${Date.now()}`,
      userId: user?.id || 'usr_default',
      title: topic || 'Scheduled Studio Content',
      platform,
      category: 'General',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime: '10:00',
      timezone: 'UTC',
      status: 'Draft',
      notes: text.slice(0, 200),
      inAppReminder: true,
      createdAt: new Date().toISOString(),
    };
    storage.saveCalendarEntry(newEntry);
    success('Added to Content Calendar!', `Scheduled for tomorrow at 10:00 AM.`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-[#17231C] animate-page-enter">
      {/* Top Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#92B76B] font-semibold mb-1">
            <Wand2 className="w-3.5 h-3.5" />
            Universal AI Content Studio · Neural Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
            Full-Featured Creation Workspace
          </h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Calibrate every parameter from audience persona to negative keywords, then generate production-ready assets.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#647168] font-mono">
          <Zap className="w-4 h-4 text-[#D9F36B] fill-[#17231C]" />
          <span>Balance: <strong className="text-[#17231C] font-bold">{user?.creditsBalance ?? 0}</strong> credits</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Configuration Form */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
            {/* Platform & Content Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] mb-1">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] rounded-xl text-[#17231C] dark:text-[#F4F2E9] focus:bg-white dark:focus:bg-[#202E24] focus:border-[#17231C] focus:outline-none font-medium"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="X">X (Twitter)</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Cross-Platform">Cross-Platform</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] mb-1">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] rounded-xl text-[#17231C] dark:text-[#F4F2E9] focus:bg-white dark:focus:bg-[#202E24] focus:border-[#17231C] focus:outline-none font-medium"
                >
                  <option value="Social Media Caption">Social Caption</option>
                  <option value="Viral Hook Set">Viral Hook Set</option>
                  <option value="Short-Form Video Script">Short Video Script</option>
                  <option value="Carousel Slide Plan">Carousel Plan</option>
                  <option value="High-Converting Ad Copy">Ad Copy</option>
                  <option value="Thought Leadership Essay">Thought Leadership</option>
                </select>
              </div>
            </div>

            {/* Brand Voice Injection */}
            <div>
              <label className="block text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] mb-1">Brand Voice</label>
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] rounded-xl text-[#17231C] dark:text-[#F4F2E9] focus:bg-white dark:focus:bg-[#202E24] focus:border-[#17231C] focus:outline-none font-medium"
              >
                <option value="">No Brand Voice (Generic Assistant)</option>
                {brandVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic / Prompt */}
            <div>
              <label className="block text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] mb-1">
                Topic / Core Message <span className="text-[#92B76B]">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                required
                placeholder="e.g., Why most founders burn out on social media and how to build a 60-minute daily production routine..."
                className="w-full px-3 py-2 text-xs bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] rounded-xl text-[#17231C] dark:text-[#F4F2E9] placeholder-[#647168]/60 focus:bg-white dark:focus:bg-[#202E24] focus:border-[#17231C] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Target Audience & Objective */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] mb-1">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Indie founders"
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] rounded-xl text-[#17231C] dark:text-[#F4F2E9] focus:bg-white dark:focus:bg-[#202E24] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] mb-1">Objective</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] rounded-xl text-[#17231C] dark:text-[#F4F2E9] focus:bg-white dark:focus:bg-[#202E24] focus:border-[#17231C] focus:outline-none font-medium"
                >
                  <option value="High Engagement & Comments">Comments & Discussion</option>
                  <option value="Audience Growth & Shares">Shares & Virality</option>
                  <option value="Direct Lead Conversion">Lead Generation</option>
                  <option value="Industry Authority">Authority & Trust</option>
                </select>
              </div>
            </div>

            {/* Tone & Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] mb-1">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] rounded-xl text-[#17231C] dark:text-[#F4F2E9] focus:bg-white dark:focus:bg-[#202E24] focus:border-[#17231C] focus:outline-none font-medium"
                >
                  <option value="Engaging & Authentic">Engaging & Authentic</option>
                  <option value="Authoritative & Direct">Authoritative & Direct</option>
                  <option value="Witty & Conversational">Witty & Conversational</option>
                  <option value="Inspiring & Story-Led">Inspiring & Story-Led</option>
                  <option value="Urgent & Direct-Response">Urgent & Direct-Response</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] mb-1">Output Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] rounded-xl text-[#17231C] dark:text-[#F4F2E9] focus:bg-white dark:focus:bg-[#202E24] focus:border-[#17231C] focus:outline-none font-medium"
                >
                  <option value="Short (<100 words)">Short (&lt;100 words)</option>
                  <option value="Medium (150-250 words)">Medium (150-250 words)</option>
                  <option value="Long (300+ words)">Long (300+ words)</option>
                </select>
              </div>
            </div>

            {/* Language & Keywords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-white focus:border-[#17231C] focus:outline-none font-medium"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Include Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., leverage, systems"
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-white focus:border-[#17231C] focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating || !user || user.creditsBalance < 1}
                className="w-full py-3.5 rounded-full text-xs font-bold bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] shadow-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 border border-[#c5e452]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#17231C]" />
                    Generating with AI Engine...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-[#17231C]" />
                    Generate Content (1 Credit)
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Session History Shelf */}
          {historyItems.length > 0 && (
            <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17231C]">
                <History className="w-3.5 h-3.5 text-[#92B76B]" />
                <span>Session Generations ({historyItems.length})</span>
              </div>
              <div className="space-y-1.5">
                {historyItems.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setGeneratedOutput(h.content)}
                    className="w-full text-left p-2.5 rounded-xl bg-[#F7F8F2] hover:bg-[#E1E7D9]/50 border border-[#E1E7D9] text-xs flex items-center justify-between text-[#17231C] transition-colors"
                  >
                    <span className="truncate max-w-[200px] font-semibold">{h.topic}</span>
                    <span className="text-[10px] font-mono text-[#647168]">{h.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Generation Output Workspace */}
        <div className="lg:col-span-7 flex flex-col">
          {generatedOutput ? (
            <GenerationOutput
              content={generatedOutput}
              toolId="studio_generator"
              modelUsed={executionMetadata.modelUsed}
              executionMs={executionMetadata.executionMs}
              onRegenerate={() => handleGenerate()}
              promptParams={{ platform, contentType, topic }}
              onScheduleToCalendar={handleCalendarSchedule}
            />
          ) : (
            <div className="h-full min-h-[460px] rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-[#92B76B]" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#17231C]">Your Workspace Is Ready</h3>
              <p className="text-xs text-[#647168] max-w-sm leading-relaxed">
                Configure your platform, topic, and brand voice on the left, then click Generate to create scroll-stopping content powered by our AI Engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
