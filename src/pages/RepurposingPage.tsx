import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { generateContent } from '../services/api.ts';
import { storage } from '../services/storage.ts';
import { GenerationOutput } from '../components/ai/GenerationOutput.tsx';
import {
  Repeat,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  Info,
  Loader2,
  Check,
} from 'lucide-react';
import { CalendarEntry } from '../types/index.ts';

interface RepurposingPageProps {
  onScheduleToCalendar?: (text: string) => void;
}

export const RepurposingPage: React.FC<RepurposingPageProps> = ({ onScheduleToCalendar }) => {
  const { user, deductCredits } = useAuth();
  const { success, error: toastError } = useToast();

  const [sourceText, setSourceText] = useState('');
  const [targetFormat, setTargetFormat] = useState('BlogToLinkedIn');
  const [toneAdaptation, setToneAdaptation] = useState('Preserve');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [repurposedOutput, setRepurposedOutput] = useState<string | null>(null);
  const [executionMetadata, setExecutionMetadata] = useState<{
    modelUsed: string;
    executionMs: number;
  }>({
    modelUsed: 'llama-3.3-70b-versatile',
    executionMs: 600,
  });

  const conversionOptions = [
    { id: 'BlogToLinkedIn', label: 'Blog / Article → LinkedIn Thought Leadership', desc: 'Synthesizes insights into high-engagement B2B copy with hook and bulleted takeaways.' },
    { id: 'TranscriptToReel', label: 'Raw Transcript → 30s Reel Video Script', desc: 'Extracts the single most powerful punchline into visual cues, voiceover, and text overlay.' },
    { id: 'PostToCarousel', label: 'Long Caption → 7-Slide Carousel Outline', desc: 'Divides thoughts into slide-by-slide cover, educational points, and summary slide.' },
    { id: 'ArticleToXThread', label: 'Article / Essay → 5-Tweet Viral X Thread', desc: 'Turns comprehensive essays into punchy, interconnected tweet threads.' },
    { id: 'FullPack', label: 'Full Multi-Platform Omnipresence Pack', desc: 'Generates LinkedIn post, X thread, and short video script simultaneously.' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toastError('Invalid File Type', 'Please upload a clean text file (.txt or .md).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toastError('File Too Large', 'Text file size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawContent = (event.target?.result as string) || '';
      // Defensive sanitization: strip null bytes and clamp length to 50,000 characters
      const sanitizedContent = rawContent.replace(/\0/g, '').substring(0, 50000);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80);

      setSourceText(sanitizedContent);
      setUploadedFileName(safeFileName);
      success('File Loaded', `${safeFileName} imported (${sanitizedContent.length} characters).`);
    };
    reader.readAsText(file);
  };

  const handleRepurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) {
      toastError('Empty Source', 'Please paste text or upload a text file to repurpose.');
      return;
    }

    if (!user || user.creditsBalance < 2) {
      toastError('Insufficient Credits', 'Content Repurposing requires 2 credits.');
      return;
    }

    const deducted = deductCredits(2);
    if (!deducted) return;

    setIsGenerating(true);

    try {
      const result = await generateContent({
        toolId: 'content_repurposer',
        params: {
          sourceContent: sourceText,
          targetFormat,
          toneAdaptation,
        },
      });

      setRepurposedOutput(result.content);
      setExecutionMetadata({
        modelUsed: result.modelUsed,
        executionMs: result.executionMs,
      });

      storage.logAIGeneration({
        id: `log_${Date.now()}`,
        userId: user.id,
        toolId: 'content_repurposer',
        modelUsed: result.modelUsed,
        provider: 'ai_engine',
        creditsDeducted: 2,
        executionMs: result.executionMs,
        status: 'success',
        createdAt: new Date().toISOString(),
      });

      success('Content Repurposed!', `Delivered in ${result.executionMs}ms.`);
    } catch (err: any) {
      toastError('Repurposing Failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCalendarSchedule = (text: string) => {
    const newEntry: CalendarEntry = {
      id: `cal_${Date.now()}`,
      userId: user?.id || 'usr_default',
      title: 'Repurposed Content Asset',
      platform: 'Cross-Platform',
      category: 'Repurposed',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime: '14:00',
      timezone: 'UTC',
      status: 'Draft',
      notes: text.slice(0, 250),
      inAppReminder: true,
      createdAt: new Date().toISOString(),
    };
    storage.saveCalendarEntry(newEntry);
    success('Scheduled to Calendar!', 'Added for tomorrow at 2:00 PM.');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#17231C] animate-page-enter">
      <div className="border-b border-[#E1E7D9] pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold mb-1">
          <Repeat className="w-3.5 h-3.5" />
          Module 07 · Multi-Format Content Repurposer
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
          Cross-Platform Content Transformer
        </h1>
        <p className="text-xs text-[#647168] mt-1 max-w-3xl leading-relaxed">
          Convert one high-effort blog post, interview transcript, or newsletter into 5 platform-native assets.
        </p>
      </div>

      {/* Honest Transcript Integration Notice */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] flex items-start gap-3 text-xs text-[#647168] shadow-2xs">
        <Info className="w-4 h-4 text-[#92B76B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#17231C]">Transparent Ingestion: </strong>
          Paste text or upload clean text files directly. Note that live YouTube extraction requires third-party API keys configured in the server environment; raw text ensures instantaneous zero-latency transformation.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input & Source */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleRepurpose} className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#17231C]">Original Source Text</label>
                <label className="text-[11px] text-[#17231C] hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                  <UploadCloud className="w-3.5 h-3.5 text-[#92B76B]" />
                  Upload .txt / .md
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedFileName && (
                <div className="mb-2 p-2 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9] text-[11px] text-[#17231C] flex items-center justify-between font-mono">
                  <span>📄 {uploadedFileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName(null);
                      setSourceText('');
                    }}
                    className="text-[#647168] hover:text-[#17231C]"
                  >
                    Clear
                  </button>
                </div>
              )}

              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={7}
                placeholder="Paste your article, meeting notes, speech transcript, or newsletter issue here..."
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-2xl text-[#17231C] placeholder-[#647168]/60 focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed transition-all"
              />
              <div className="text-[10px] text-[#647168] text-right mt-1 font-mono">
                {sourceText.length} characters · {sourceText.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1.5">
                Target Conversion Format
              </label>
              <div className="space-y-2">
                {conversionOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setTargetFormat(opt.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      targetFormat === opt.id
                        ? 'bg-[#17231C] text-[#F4F2E9] border-[#17231C] shadow-sm'
                        : 'bg-[#F7F8F2] border-[#E1E7D9] text-[#17231C] hover:border-[#17231C]'
                    }`}
                  >
                    <div className="font-bold">{opt.label}</div>
                    <div className={`text-[11px] mt-0.5 ${targetFormat === opt.id ? 'text-[#BECABE]' : 'text-[#647168]'}`}>
                      {opt.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">Tone Adaptation</label>
              <select
                value={toneAdaptation}
                onChange={(e) => setToneAdaptation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
              >
                <option value="Preserve">Preserve Original Voice</option>
                <option value="Punchy">Make More Punchy & Contrarian</option>
                <option value="Professional">Make More Professional & Data-Driven</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !sourceText.trim()}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#17231C]" />
                  Repurposing via AI Engine...
                </>
              ) : (
                <>
                  <Repeat className="w-4 h-4" />
                  Repurpose Content (2 Credits)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Before-and-After Comparison & Output */}
        <div className="lg:col-span-7 flex flex-col">
          {repurposedOutput ? (
            <GenerationOutput
              content={repurposedOutput}
              toolId="content_repurposer"
              modelUsed={executionMetadata.modelUsed}
              executionMs={executionMetadata.executionMs}
              onRegenerate={() => handleRepurpose({ preventDefault: () => {} } as any)}
              onScheduleToCalendar={handleCalendarSchedule}
            />
          ) : (
            <div className="h-full min-h-[460px] rounded-3xl border border-dashed border-[#E1E7D9] bg-[#FFFFFF]/70 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] flex items-center justify-center">
                <Repeat className="w-6 h-6 text-[#92B76B]" />
              </div>
              <h3 className="text-base font-bold font-display text-[#17231C]">Before & After Transformation</h3>
              <p className="text-xs text-[#647168] max-w-sm leading-relaxed">
                Paste your content on the left to see the instant platform-native conversion with character and hook calibration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
