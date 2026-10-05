import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { generateContent } from '../services/api.ts';
import {
  Compass,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Layers,
  Zap,
} from 'lucide-react';
import { ContentPlan, ContentPlanDay, CalendarEntry } from '../types/index.ts';

export const PlannerPage: React.FC = () => {
  const { user, deductCredits } = useAuth();
  const { success, error: toastError } = useToast();

  const brandVoices = storage.getBrandVoices();

  // Guided Planner Inputs
  const [duration, setDuration] = useState<7 | 14 | 30>(7);
  const [industry, setIndustry] = useState(user?.industry || 'Tech & B2B SaaS');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['LinkedIn', 'Instagram']);
  const [frequency, setFrequency] = useState('Daily (1 post/day)');
  const [goals, setGoals] = useState('Audience Growth & Authority');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    const d = brandVoices.find((v) => v.isDefault);
    return d ? d.id : '';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ContentPlan | null>(null);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.creditsBalance < 2) {
      toastError('Insufficient Credits', 'Generating a multi-day plan requires 2 credits.');
      return;
    }

    const deducted = deductCredits(2);
    if (!deducted) return;

    setIsGenerating(true);
    const selectedVoice = brandVoices.find((v) => v.id === selectedVoiceId);

    try {
      const promptParams = {
        topic: `${duration}-Day Content Strategy Plan for ${industry}`,
        durationDays: duration,
        platforms: selectedPlatforms.join(', '),
        frequency,
        goals,
      };

      const result = await generateContent({
        toolId: 'content_ideas',
        params: promptParams,
        brandVoice: selectedVoice,
      });

      // Construct a structured plan matrix for the UI
      const matrix: ContentPlanDay[] = Array.from({ length: duration }).map((_, index) => {
        const dayNum = index + 1;
        const assignedPlatform = selectedPlatforms[index % selectedPlatforms.length] || 'LinkedIn';
        const pillars = ['Educational Breakdown', 'Contrarian Viewpoint', 'Case Study & Proof', 'Behind the Scenes', 'Listicle / Hacks'];
        const pillar = pillars[index % pillars.length];

        return {
          day: dayNum,
          platform: assignedPlatform,
          format: assignedPlatform === 'Instagram' ? 'Reel / Carousel' : 'Thought Leadership Post',
          pillar,
          conceptTitle: `Day ${dayNum}: ${pillar} regarding ${industry}`,
          hookIdea: `Hook for Day ${dayNum}: "The #1 reason beginners stall on this..."`,
          callToAction: 'Comment below or save this roadmap for reference.',
          transferredToCalendar: false,
        };
      });

      const newPlan: ContentPlan = {
        id: `plan_${Date.now()}`,
        userId: user.id,
        title: `${duration}-Day ${industry} Strategy Blueprint`,
        durationDays: duration,
        industry,
        goals: [goals],
        platforms: selectedPlatforms,
        planMatrix: matrix,
        createdAt: new Date().toISOString(),
      };

      storage.saveContentPlan(newPlan);
      setGeneratedPlan(newPlan);

      storage.logAIGeneration({
        id: `log_${Date.now()}`,
        userId: user.id,
        toolId: 'content_planner',
        modelUsed: result.modelUsed,
        provider: 'ai_engine',
        creditsDeducted: 2,
        executionMs: result.executionMs,
        status: 'success',
        createdAt: new Date().toISOString(),
      });

      success('Content Plan Generated!', `${duration} days mapped with AI Studio.`);
    } catch (err: any) {
      toastError('Plan Generation Failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTransferToCalendar = (dayItem: ContentPlanDay) => {
    if (!user) return;
    const targetDate = new Date(Date.now() + dayItem.day * 86400000).toISOString().split('T')[0];

    const newCalendarEntry: CalendarEntry = {
      id: `cal_${Date.now()}_${dayItem.day}`,
      userId: user.id,
      title: dayItem.conceptTitle,
      platform: dayItem.platform,
      category: dayItem.pillar,
      scheduledDate: targetDate,
      scheduledTime: '10:00',
      timezone: 'UTC',
      status: 'Idea',
      notes: `Format: ${dayItem.format}\nHook: ${dayItem.hookIdea}\nCTA: ${dayItem.callToAction}`,
      inAppReminder: true,
      createdAt: new Date().toISOString(),
    };

    storage.saveCalendarEntry(newCalendarEntry);

    // Update state to reflect transferred
    if (generatedPlan) {
      const updatedMatrix = generatedPlan.planMatrix.map((item) =>
        item.day === dayItem.day ? { ...item, transferredToCalendar: true } : item
      );
      setGeneratedPlan({ ...generatedPlan, planMatrix: updatedMatrix });
    }

    success('Transferred to Calendar!', `Scheduled for ${targetDate}`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-[#17231C] animate-page-enter">
      <div className="border-b border-[#E1E7D9] pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold mb-1">
          <Compass className="w-3.5 h-3.5" />
          Module 09 · Guided Content Planner
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
          Strategic Multi-Day Content Engine
        </h1>
        <p className="text-xs text-[#647168] mt-1 max-w-3xl leading-relaxed">
          Generate structured 7, 14, or 30-day editorial plans aligned with your content pillars. Transfer individual days directly to your publishing calendar with one click.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Planning Wizard Controls */}
        <div className="lg:col-span-4 space-y-4">
          <form onSubmit={handleGeneratePlan} className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1.5">Plan Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {([7, 14, 30] as const).map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDuration(days)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      duration === days
                        ? 'bg-[#17231C] text-[#F4F2E9] shadow-sm'
                        : 'bg-[#F7F8F2] border border-[#E1E7D9] text-[#647168] hover:text-[#17231C]'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">Target Platforms</label>
              <div className="grid grid-cols-2 gap-2">
                {['LinkedIn', 'Instagram', 'YouTube', 'TikTok', 'X'].map((p) => {
                  const sel = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                        sel
                          ? 'bg-[#17231C] text-[#F4F2E9] border-[#17231C]'
                          : 'bg-[#F7F8F2] border-[#E1E7D9] text-[#17231C] hover:border-[#17231C]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">Industry / Niche</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">Primary Objective</label>
              <select
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
              >
                <option value="Audience Growth & Authority">Audience Growth & Authority</option>
                <option value="Lead Generation & Product Sales">Lead Generation & Sales</option>
                <option value="High Discussion & Engagement">Discussion & Comments</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231C] mb-1">Brand Voice</label>
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
              >
                <option value="">Default Voice</option>
                {brandVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating || selectedPlatforms.length === 0}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#17231C]" />
                  Generating {duration}-Day Plan...
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  Generate {duration}-Day Roadmap (2 Credits)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Generated Plan Timeline Matrix */}
        <div className="lg:col-span-8 space-y-4">
          {generatedPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold font-display text-[#17231C]">{generatedPlan.title}</h3>
                  <div className="text-xs text-[#647168] mt-0.5">
                    {generatedPlan.durationDays} Days · {generatedPlan.platforms.join(', ')}
                  </div>
                </div>
                <div className="text-xs text-[#92B76B] font-mono font-bold">Ready for scheduling</div>
              </div>

              <div className="space-y-3">
                {generatedPlan.planMatrix.map((item) => (
                  <div
                    key={item.day}
                    className="p-5 rounded-2xl border border-[#E1E7D9] bg-[#FFFFFF] hover:border-[#17231C] transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#17231C] text-[#F4F2E9] font-mono font-bold text-xs flex items-center justify-center">
                          {item.day}
                        </span>
                        <span className="text-xs font-bold text-[#17231C]">{item.conceptTitle}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F7F8F2] text-[#17231C] border border-[#E1E7D9]">
                        {item.platform} · {item.format}
                      </span>
                    </div>

                    <p className="text-xs text-[#647168] pl-8 leading-relaxed font-sans">
                      <strong className="text-[#17231C]">Hook Angle:</strong> {item.hookIdea}
                    </p>

                    <div className="pt-2 pl-8 flex items-center justify-between border-t border-[#E1E7D9] text-xs">
                      <span className="text-[#647168] text-[11px]">Pillar: <strong>{item.pillar}</strong></span>

                      {item.transferredToCalendar ? (
                        <span className="text-emerald-700 text-xs flex items-center gap-1 font-mono font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled in Calendar
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTransferToCalendar(item)}
                          className="px-3 py-1 rounded-xl bg-[#F7F8F2] hover:bg-[#D9F36B] hover:text-[#17231C] text-[#17231C] text-xs font-bold border border-[#E1E7D9] transition-all flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          Transfer to Calendar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[460px] rounded-3xl border border-dashed border-[#E1E7D9] bg-[#FFFFFF]/70 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-[#17231C] flex items-center justify-center">
                <Compass className="w-6 h-6 text-[#92B76B]" />
              </div>
              <h3 className="text-base font-bold font-display text-[#17231C]">Generate Your Strategy Blueprint</h3>
              <p className="text-xs text-[#647168] max-w-sm leading-relaxed">
                Choose your duration (7, 14, or 30 days) and platforms on the left to create a full publishing calendar plan with our AI engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
