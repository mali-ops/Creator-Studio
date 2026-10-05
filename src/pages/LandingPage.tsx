import React, { useState } from 'react';
import {
  ArrowRight,
  Zap,
  Sparkles,
  Check,
  Copy,
  Clock,
  Share2,
  Calendar,
  Volume2,
  Repeat,
  Users,
  BarChart3,
  Flame,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';
import { generateContent } from '../services/api.ts';
import { adminConfig } from '../services/adminConfig.ts';

interface LandingPageProps {
  onStartCreating: () => void;
  onExploreTools: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onExploreTools,
  onOpenAuth,
  onNavigateTab,
}) => {
  const { copyToClipboard } = useToast();

  // Hero Preview Tab
  const [heroPlatform, setHeroPlatform] = useState<'instagram' | 'linkedin' | 'youtube'>('linkedin');
  const [heroPromptInput, setHeroPromptInput] = useState(
    'Key lessons from building our 0 to $100k ARR agency without ads'
  );
  const [isHeroGenerating, setIsHeroGenerating] = useState(false);
  const [heroOutputText, setHeroOutputText] = useState(
    `Most agencies believe client acquisition is their bottleneck. After analyzing 40+ client pipelines, 85% of early revenue leaks come from a simpler problem: slow time-to-first-value.\n\nHere are 3 structural shifts we deployed:\n1. Replaced 14-page onboarding decks with a 90-second loom and instant shared notion canvas.\n2. Built our content engine around 1 core thematic thesis per month.\n3. Standardized weekly performance memos instead of chaotic 60-minute status meetings.\n\nQuestion for founders: What is your agency's fastest path to delivering milestone 1?`
  );

  // Interactive Demo Section (3 Preloaded Prompts)
  const preloadedPrompts = [
    {
      title: 'Eco-Friendly Coffee Brand',
      prompt: 'Launch announcement for an eco-friendly specialty coffee brand focusing on single-origin, compostable pods.',
      toolId: 'caption_generator',
      platform: 'Instagram',
    },
    {
      title: 'Software Engineer Branding',
      prompt: 'Personal branding tip for aspiring software engineers on how public building accelerates career opportunities.',
      toolId: 'caption_generator',
      platform: 'LinkedIn',
    },
    {
      title: 'Creative Agency Behind-the-Scenes',
      prompt: 'Behind-the-scenes video hook and script outline for a boutique creative agency redesigning an iconic brand.',
      toolId: 'reel_script',
      platform: 'YouTube',
    },
  ];

  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [demoPrompt, setDemoPrompt] = useState(preloadedPrompts[0].prompt);
  const [demoOutput, setDemoOutput] = useState(
    `☕ The coffee you love shouldn't come at the cost of our soil.\n\nMeet the Horizon Blend: 100% shade-grown, ethically sourced from single-origin cooperatives in Huila, packaged in certified marine-degradable pods that disappear in home compost within 90 days.\n\nNo microplastics. Zero compromise on crema.\n\nPre-orders are open for batch 01 today. First 500 orders include a hand-thrown ceramic tasting cup.\n\n👇 Tap the link in bio for your morning ritual upgrade.\n\n#SpecialtyCoffee #SustainableLiving #SingleOrigin #ZeroWasteKitchen #EcoConscious`
  );
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoExecutionMs, setDemoExecutionMs] = useState(380);

  // Template Category Filter
  const [templateFilter, setTemplateFilter] = useState<'All' | 'Social' | 'Video' | 'Strategy'>('All');
  const [selectedTemplateModal, setSelectedTemplateModal] = useState<any | null>(null);

  // Annual vs Monthly Pricing Toggle
  const [annualBilling, setAnnualBilling] = useState(true);

  // System settings from Admin Config
  const [settings, setSettings] = useState(adminConfig.getSettings());

  React.useEffect(() => {
    return adminConfig.subscribe((updated) => setSettings(updated));
  }, []);

  // Run Hero generation
  const handleRunHeroGeneration = async () => {
    setIsHeroGenerating(true);
    try {
      const toolId =
        heroPlatform === 'instagram'
          ? 'caption_generator'
          : heroPlatform === 'linkedin'
          ? 'caption_generator'
          : 'youtube_script';
      const res = await generateContent({
        toolId,
        params: {
          topic: heroPromptInput,
          platform: heroPlatform === 'instagram' ? 'Instagram' : heroPlatform === 'linkedin' ? 'LinkedIn' : 'YouTube',
          tone: 'Direct & Authoritative',
        },
      });
      if (res.content) {
        setHeroOutputText(res.content);
      }
    } catch {
      // Fallback preview
      setHeroOutputText(
        `Generated perspective for: "${heroPromptInput}"\n\n1. Establish clear differentiation through high-intent output.\n2. Iterate rapidly based on audience feedback.\n3. Scale systematic publishing cadence.`
      );
    } finally {
      setIsHeroGenerating(false);
    }
  };

  // Run Demo generation
  const handleRunDemoPreset = async (index: number) => {
    setActivePresetIndex(index);
    const item = preloadedPrompts[index];
    setDemoPrompt(item.prompt);
    setIsDemoLoading(true);
    const start = Date.now();
    try {
      const res = await generateContent({
        toolId: item.toolId,
        params: {
          topic: item.prompt,
          platform: item.platform,
          tone: 'Engaging & Authentic',
        },
      });
      setDemoOutput(res.content);
      setDemoExecutionMs(Date.now() - start);
    } catch {
      setDemoOutput(`Sample output tailored for: ${item.title}\n\nHigh conversion content generated via ultra-fast neural AI engine with brand voice integration.`);
      setDemoExecutionMs(Date.now() - start);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const platforms = [
    { name: 'Instagram', format: 'Reels, Carousels & Micro-Captions', icon: '01' },
    { name: 'TikTok', format: 'High-Retention Video Hooks & Scripts', icon: '02' },
    { name: 'LinkedIn', format: 'Executive Essays & Slide Decks', icon: '03' },
    { name: 'YouTube', format: 'Video Scripts, SEO Meta & Chapters', icon: '04' },
    { name: 'X / Twitter', format: 'Viral Threads & Short Takes', icon: '05' },
    { name: 'Facebook', format: 'Community Posts & Ad Copy', icon: '06' },
    { name: 'Threads', format: 'Conversational Micro-Thoughts', icon: '07' },
    { name: 'Pinterest', format: 'Pin Titles & Organic Descriptions', icon: '08' },
  ];

  const templates = [
    {
      id: 't1',
      title: 'Contrarian Industry Hot-Take',
      category: 'Social',
      platform: 'LinkedIn',
      desc: 'Challenge conventional wisdom to ignite healthy debate and high comment engagement.',
      previewText: 'Unpopular opinion: Most productivity advice is designed to make you feel busy, not effective.\n\nHere are 3 rules we threw away...',
    },
    {
      id: 't2',
      title: '60-Second Product Teardown Reel',
      category: 'Video',
      platform: 'Instagram',
      desc: 'Fast-paced visual script breaking down why a specific product or workflow succeeded.',
      previewText: '[0:00-0:03] "Here is why nobody is talking about the biggest UX win of 2026..."\n[0:04-0:20] The breakdown...',
    },
    {
      id: 't3',
      title: '30-Day Omnichannel Calendar Plan',
      category: 'Strategy',
      platform: 'Cross-Platform',
      desc: 'Systematic schedule balancing educational value, personal brand building, and conversion CTAs.',
      previewText: 'Week 1: Foundations & Core Thesis\nWeek 2: Case Studies & Social Proof\nWeek 3: Tactical Breakdowns\nWeek 4: Direct Conversion...',
    },
    {
      id: 't4',
      title: 'High-Converting Problem-Agitate-Solve Ad',
      category: 'Social',
      platform: 'Facebook',
      desc: 'Direct response copy that isolates the customer bottleneck and presents the clear solution.',
      previewText: 'Tired of spending 12 hours every Sunday rewriting captions for Monday morning? Meet the automated workspace...',
    },
    {
      id: 't5',
      title: 'Educational Carousel Framework',
      category: 'Social',
      platform: 'Instagram',
      desc: 'Slide-by-slide structure that boosts saves, shares, and algorithmic distribution.',
      previewText: 'Slide 1: Hook Headline\nSlide 2-7: 5 Modular Steps\nSlide 8: Summary Cheat Sheet\nSlide 9: Clear CTA Save & Follow',
    },
    {
      id: 't6',
      title: 'YouTube Deep-Dive Video Outline',
      category: 'Video',
      platform: 'YouTube',
      desc: 'Structured long-form chapter roadmap with retention hooks at minute 3, 7, and 12.',
      previewText: 'Cold Open Hook -> Title Sequence -> Problem Definition -> Tactical Walkthrough -> Bonus Framework -> Closing CTA',
    },
  ];

  const filteredTemplates =
    templateFilter === 'All'
      ? templates
      : templates.filter((t) => t.category === templateFilter);

  return (
    <div className="bg-[#F7F8F2] text-[#17231C] selection:bg-[#D9F36B] selection:text-[#17231C]">
      {/* Dynamic Announcement Banner from Admin Config */}
      {settings.showAnnouncement && (
        <aside aria-label="Announcement" className="bg-[#17231C] text-[#F4F2E9] py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b border-[#26372D] animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#D9F36B] animate-pulse" />
          <span>{settings.announcementText}</span>
          <button
            onClick={() => onOpenAuth('register')}
            className="text-[11px] text-[#D9F36B] font-bold underline hover:opacity-90 ml-1 inline-flex items-center gap-0.5"
          >
            Get Started <ArrowRight className="w-3 h-3" />
          </button>
        </aside>
      )}

      {/* ------------------------------------------------------------------------
          01 HERO SECTION
      ------------------------------------------------------------------------ */}
      <section className="pt-10 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-12">
          {/* Metadata Kicker (Anti-slop clean text) */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-semibold text-[#647168] mb-6 text-center">
            <span>{settings.siteName}</span>
            <span aria-hidden="true">·</span>
            <span>Ultra-Fast Neural Inference</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>16 Specialized AI Tools</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="text-[#92B76B] font-bold">16 AI Creation Tools Online</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[#17231C] dark:text-[#FFFFFF] font-display leading-[1.1] mb-5 sm:mb-6">
            {settings.heroHeadline}
          </h1>

          <p className="text-base sm:text-xl text-[#647168] dark:text-[#CAD7CE] max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
            {settings.heroSubheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onStartCreating}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm bg-[#D9F36B] hover:bg-[#c6e255] text-[#101612] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 border border-[#c5e452] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-[#101612] text-[#101612]" />
              Start Creating Now
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreTools}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-semibold text-sm bg-[#FFFFFF] dark:bg-[#1A251E] border border-[#E1E7D9] dark:border-[#27382D] hover:border-[#17231C] dark:hover:border-[#92B76B] text-[#17231C] dark:text-[#F4F2E9] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Explore Tools
              <ChevronRight className="w-4 h-4 text-[#647168] dark:text-[#CAD7CE]" />
            </button>
          </div>
        </div>

        {/* Hero Visual: Studio in Action + High-Fidelity Editorial Still */}
        <div className="mt-8 sm:mt-12 rounded-3xl border border-[#E1E7D9] dark:border-[#27382D] bg-[#FFFFFF] dark:bg-[#141C16] shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Interactive Studio Preview Pane */}
            <div className="lg:col-span-7 p-4 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E1E7D9] dark:border-[#27382D]">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[#E1E7D9] dark:border-[#27382D]">
                  <div className="text-xs font-semibold text-[#647168] dark:text-[#CAD7CE] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#92B76B]" />
                    <span>Live Studio Simulation</span>
                  </div>

                  {/* Platform Segmented Switcher */}
                  <div className="flex items-center gap-1 p-1 bg-[#F7F8F2] dark:bg-[#1A251E] rounded-lg border border-transparent dark:border-[#27382D] overflow-x-auto max-w-full">
                    {[
                      { id: 'linkedin', label: 'LinkedIn Post' },
                      { id: 'instagram', label: 'Instagram Caption' },
                      { id: 'youtube', label: 'YouTube Script' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setHeroPlatform(tab.id as any)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                          heroPlatform === tab.id
                            ? 'bg-[#17231C] dark:bg-[#25392C] text-[#F4F2E9] dark:text-[#FFFFFF] shadow-sm'
                            : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Input Field */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#17231C] mb-1.5">
                    Creative Brief / Core Topic
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={heroPromptInput}
                      onChange={(e) => setHeroPromptInput(e.target.value)}
                      placeholder="Enter a topic or creative angle..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs text-[#17231C] focus:bg-white focus:outline-none focus:border-[#17231C] pr-24 transition-colors"
                    />
                    <button
                      onClick={handleRunHeroGeneration}
                      disabled={isHeroGenerating}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#17231C] hover:bg-[#101612] text-[#F4F2E9] text-[11px] font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      {isHeroGenerating ? (
                        <span>Generating...</span>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-[#D9F36B]" />
                          Run
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Preview Display */}
                <div>
                  <div className="flex items-center justify-between text-xs text-[#647168] mb-1.5">
                    <span>Generated Output Preview</span>
                    <span className="font-mono tabular-nums text-[11px]">
                      {heroOutputText.length} characters · ~{Math.round(heroOutputText.split(/\s+/).length)} words
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={heroOutputText}
                    onChange={(e) => setHeroOutputText(e.target.value)}
                    className="w-full p-4 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-xs font-sans text-[#17231C] leading-relaxed resize-none focus:bg-white focus:outline-none focus:border-[#17231C]"
                  />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E1E7D9] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#647168]">
                  <span>Model: openai/gpt-oss-120b</span>
                  <span aria-hidden="true">·</span>
                  <span>Inference: ~390ms</span>
                </div>
                <button
                  onClick={() => copyToClipboard(heroOutputText, 'Content Copied to Clipboard')}
                  className="px-3.5 py-1.5 rounded-lg border border-[#E1E7D9] hover:border-[#17231C] text-xs font-semibold text-[#17231C] flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </button>
              </div>
            </div>

            {/* Editorial Imagery & Value Column */}
            <div className="lg:col-span-5 relative bg-[#101612] text-[#F4F2E9] p-8 flex flex-col justify-between overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="text-xs font-semibold text-[#D9F36B] tracking-wider uppercase">
                  Engineered for Creators
                </div>
                <h3 className="text-2xl font-bold font-display text-[#F4F2E9] leading-snug">
                  Precision output crafted for audience engagement.
                </h3>
                <p className="text-xs text-[#BECABE] leading-relaxed">
                  Every tool uses structured prompt architecture, customized tone controls, and negative constraints to prevent generic AI fluff.
                </p>
              </div>

              {/* High-Fidelity Studio Image Asset */}
              <div className="my-6 rounded-2xl overflow-hidden border border-[#26372D] shadow-inner aspect-video relative group">
                <img
                  src="/src/assets/images/hero_creator_editorial_1790343252008.jpg"
                  alt="High-end content creator editorial desk"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="relative z-10 pt-4 border-t border-[#26372D] flex items-center justify-between text-xs text-[#BECABE]">
                <span>16 AI Modules</span>
                <span aria-hidden="true">·</span>
                <span>Custom Brand Voice</span>
                <span aria-hidden="true">·</span>
                <span>Content Calendar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          02 SUPPORTED PLATFORMS
      ------------------------------------------------------------------------ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E7D9]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#647168] mb-2">Omnichannel Reach</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
            Tailored algorithms for every major distribution platform.
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] hover:border-[#17231C] transition-all hover:shadow-sm"
            >
              <div className="text-xs font-mono font-bold text-[#92B76B] mb-2">{p.icon}</div>
              <h3 className="font-bold text-[#17231C] text-sm mb-1">{p.name}</h3>
              <p className="text-xs text-[#647168] leading-relaxed">{p.format}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          03 INTERACTIVE LIVE DEMO (3 PRELOADED PROMPTS)
      ------------------------------------------------------------------------ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#101612] text-[#F4F2E9] p-8 sm:p-12 shadow-2xl border border-[#26372D]">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D9F36B] block mb-2">
              Interactive Test Drive
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-[#F4F2E9] leading-tight">
              Test live AI generation directly in your browser.
            </h2>
            <p className="text-xs sm:text-sm text-[#BECABE] mt-2">
              Select one of the three preloaded prompts or test with your own custom input.
            </p>
          </div>

          {/* 3 Preloaded Prompt Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {preloadedPrompts.map((item, idx) => (
              <button
                key={item.title}
                onClick={() => handleRunDemoPreset(idx)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  activePresetIndex === idx
                    ? 'bg-[#202E25] border-[#D9F36B] text-[#F4F2E9]'
                    : 'bg-[#19241E] border-[#26372D] text-[#BECABE] hover:border-[#92B76B]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#F4F2E9]">{item.title}</span>
                  <span className="text-[10px] text-[#D9F36B] uppercase">{item.platform}</span>
                </div>
                <p className="text-[11px] line-clamp-2 text-[#BECABE]">{item.prompt}</p>
              </button>
            ))}
          </div>

          {/* Demo Generation Output View */}
          <div className="rounded-2xl bg-[#19241E] border border-[#26372D] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#26372D] pb-3 text-xs text-[#BECABE]">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#F4F2E9]">
                  {preloadedPrompts[activePresetIndex].title}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#D9F36B]">{demoExecutionMs}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(demoOutput, 'Demo Copied')}
                  className="px-3 py-1 rounded-lg bg-[#202E25] hover:bg-[#29392F] text-[#F4F2E9] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#26372D]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Output
                </button>
                <button
                  onClick={onStartCreating}
                  className="px-3 py-1 rounded-lg bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  Open in Studio
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {isDemoLoading ? (
              <div className="py-12 text-center text-xs text-[#BECABE] flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#D9F36B] animate-ping" />
                <span>Generating high-engagement content via AI Engine...</span>
              </div>
            ) : (
              <div className="text-xs font-mono text-[#F4F2E9] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto pr-2">
                {demoOutput}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          04 6 CORE FEATURE SECTIONS
      ------------------------------------------------------------------------ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#647168] mb-2">Complete SaaS Suite</p>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#17231C]">
            Six integrated pillars for consistent creative output.
          </h2>
        </div>

        {/* Feature 1: Multi-Platform AI Generation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-[#92B76B] font-mono">01. Multi-Platform Generation</span>
            <h3 className="text-3xl font-bold font-display text-[#17231C]">
              16 Dedicated AI Tools. Zero Generic Prompts.
            </h3>
            <p className="text-sm text-[#647168] leading-relaxed">
              Every generator is engineered with domain-specific formulas: viral hooks, 60-second video scripts, educational carousels, and high-converting ad copy. Customize tone, language, and audience constraints with instant preview.
            </p>
            <ul className="space-y-2 text-xs font-medium text-[#17231C]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#92B76B]" />
                Hooks, scripts, captions, and carousel slide frameworks
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#92B76B]" />
                Configurable output lengths and strategic hashtag clusters
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#92B76B]" />
                Inference in under 500ms powered by ultra-fast neural architecture
              </li>
            </ul>
            <button
              onClick={onExploreTools}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#17231C] hover:text-[#92B76B] transition-colors pt-2"
            >
              Browse all 16 AI Tools <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <span className="font-bold text-[#17231C] block mb-1">Viral Hooks</span>
                <span className="text-[#647168] text-[11px]">Pattern-interrupt openers for Shorts and Reels</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <span className="font-bold text-[#17231C] block mb-1">Video Scripts</span>
                <span className="text-[#647168] text-[11px]">Timestamps, B-roll cues, and narrative pacing</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <span className="font-bold text-[#17231C] block mb-1">Carousel Slides</span>
                <span className="text-[#647168] text-[11px]">Multi-slide high-retention frameworks</span>
              </div>
              <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <span className="font-bold text-[#17231C] block mb-1">Ad Copywriter</span>
                <span className="text-[#647168] text-[11px]">PAS, AIDA, and direct response variations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Brand Voice Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 rounded-3xl overflow-hidden border border-[#E1E7D9] shadow-sm aspect-4/3 relative group">
            <img
              src="/src/assets/images/brand_voice_visual_1790343263075.jpg"
              alt="Brand strategy tools and bespoke typography"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="order-1 lg:order-2 space-y-5">
            <span className="text-xs font-bold text-[#92B76B] font-mono">02. Brand Voice Intelligence</span>
            <h3 className="text-3xl font-bold font-display text-[#17231C]">
              Your Distinct Personality. Enforced in Every Output.
            </h3>
            <p className="text-sm text-[#647168] leading-relaxed">
              Standard AI sounds cookie-cutter because it lacks identity. Creator Studio lets you define exact brand profiles with target audiences, personality traits, signature keywords, and banned buzzwords.
            </p>
            <ul className="space-y-2 text-xs font-medium text-[#17231C]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#92B76B]" />
                Enforce forbidden words (e.g. "synergy", "game-changer", "unleash")
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#92B76B]" />
                Manage multiple client brand profiles in one workspace
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#92B76B]" />
                Built-in Brand Voice playground with real-time test runs
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: One-Click Content Repurposing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-[#92B76B] font-mono">03. Content Repurposing</span>
            <h3 className="text-3xl font-bold font-display text-[#17231C]">
              Turn One 1,000-Word Essay into 8 Platform-Native Assets.
            </h3>
            <p className="text-sm text-[#647168] leading-relaxed">
              Stop recreating the wheel. Paste a newsletter, video transcript, or blog post. Our repurposing engine automatically fragments it into a 5-tweet thread, 60-second Reel script, LinkedIn essay, and carousel outline.
            </p>
            <ul className="space-y-2 text-xs font-medium text-[#17231C]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#92B76B]" />
                Preserve core narrative while adapting to platform conventions
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#92B76B]" />
                Supports text paste and safe markdown file uploads
              </li>
            </ul>
          </div>

          <div className="rounded-3xl overflow-hidden border border-[#E1E7D9] shadow-sm aspect-4/3 relative group">
            <img
              src="/src/assets/images/repurpose_studio_visual_1790343276221.jpg"
              alt="Multi-device creative repurposing layout"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Feature 4: Content Planning & Scheduling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E1E7D9] pb-3 text-xs">
              <span className="font-bold text-[#17231C]">March Editorial Calendar</span>
              <span className="text-[#647168]">18 Posts Scheduled</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#17231C] block">LinkedIn Thought Leadership</span>
                  <span className="text-[#647168] text-[11px]">Scheduled for Tomorrow · 9:00 AM</span>
                </div>
                <span className="text-[11px] font-bold text-[#92B76B]">Ready</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#17231C] block">Instagram Product Teaser Reel</span>
                  <span className="text-[#647168] text-[11px]">Scheduled for Friday · 3:00 PM</span>
                </div>
                <span className="text-[11px] font-bold text-[#17231C]">Draft</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <span className="text-xs font-bold text-[#92B76B] font-mono">04. Planning & Scheduling</span>
            <h3 className="text-3xl font-bold font-display text-[#17231C]">
              Never Stare at a Blank Editorial Calendar Again.
            </h3>
            <p className="text-sm text-[#647168] leading-relaxed">
              Generate 7, 14, or 30-day comprehensive content campaigns. Organize items into Month, Week, and Day views, track status from Idea to Published, and export plans directly to CSV.
            </p>
          </div>
        </div>

        {/* Feature 5: Agency & Team Workspaces */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-[#92B76B] font-mono">05. Agency & Team Workspaces</span>
            <h3 className="text-3xl font-bold font-display text-[#17231C]">
              Multi-Client Segregation. Team Permissions.
            </h3>
            <p className="text-sm text-[#647168] leading-relaxed">
              Manage client retainers without cross-contaminating brand assets or saved drafts. Role-based permissions (Owner, Admin, Editor, Viewer) ensure seamless client approvals.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-[#E1E7D9] shadow-sm aspect-4/3 relative group">
            <img
              src="/src/assets/images/agency_team_visual_1790343288381.jpg"
              alt="Design studio sprint and client moodboards"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Feature 6: Real-Time Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <span className="text-xl font-bold text-[#17231C] font-mono tabular-nums">1,482</span>
                <span className="text-[11px] text-[#647168] block mt-0.5">Posts Generated</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <span className="text-xl font-bold text-[#17231C] font-mono tabular-nums">380ms</span>
                <span className="text-[11px] text-[#647168] block mt-0.5">Avg Latency</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <span className="text-xl font-bold text-[#92B76B] font-mono tabular-nums">98.4%</span>
                <span className="text-[11px] text-[#647168] block mt-0.5">Approval Rate</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <span className="text-xs font-bold text-[#92B76B] font-mono">06. Performance Analytics</span>
            <h3 className="text-3xl font-bold font-display text-[#17231C]">
              Transparent Metrics. Quota Governance.
            </h3>
            <p className="text-sm text-[#647168] leading-relaxed">
              Track content volume per platform, token usage breakdown, tool popularity, and credit balances with full transparency.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          05 TEMPLATES SHOWCASE
      ------------------------------------------------------------------------ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E7D9]">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#647168] mb-1">
              Curated Starting Points
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
              Production-ready templates for high engagement.
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FFFFFF] dark:bg-[#141C16] rounded-xl border border-[#E1E7D9] dark:border-[#27382D]">
            {['All', 'Social', 'Video', 'Strategy'].map((cat) => (
              <button
                key={cat}
                onClick={() => setTemplateFilter(cat as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  templateFilter === cat
                    ? 'bg-[#17231C] dark:bg-[#25392C] text-[#F4F2E9] dark:text-[#FFFFFF] shadow-sm'
                    : 'text-[#647168] dark:text-[#CAD7CE] hover:text-[#17231C] dark:hover:text-[#FFFFFF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] hover:border-[#17231C] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#647168] mb-3">
                  <span>{t.platform}</span>
                  <span className="font-semibold text-[#17231C]">{t.category}</span>
                </div>
                <h3 className="font-bold text-[#17231C] text-base mb-2">{t.title}</h3>
                <p className="text-xs text-[#647168] leading-relaxed mb-4">{t.desc}</p>
              </div>

              <div className="pt-4 border-t border-[#E1E7D9] flex items-center justify-between">
                <button
                  onClick={() => setSelectedTemplateModal(t)}
                  className="text-xs font-semibold text-[#647168] hover:text-[#17231C] transition-colors"
                >
                  Preview Blueprint
                </button>
                <button
                  onClick={onStartCreating}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F7F8F2] hover:bg-[#17231C] text-[#17231C] hover:text-[#F4F2E9] text-xs font-bold transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          06 PRICING PREVIEW
      ------------------------------------------------------------------------ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E7D9]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#647168] mb-2">
            Transparent Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#17231C] mb-4">
            Predictable plans for every stage of growth.
          </h2>
          <p className="text-xs sm:text-sm text-[#647168]">
            Scale your content creation with fast AI inference and robust brand voices. Cancel anytime.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-2 p-1 mt-6 bg-[#FFFFFF] rounded-full border border-[#E1E7D9]">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !annualBilling ? 'bg-[#17231C] text-[#F4F2E9]' : 'text-[#647168]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                annualBilling ? 'bg-[#17231C] text-[#F4F2E9]' : 'text-[#647168]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] text-[#D9F36B] font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {settings.pricingPlans.map((plan) => {
            const price = annualBilling ? `$${plan.annualPrice}` : `$${plan.monthlyPrice}`;
            const period = '/month';

            return (
              <div
                key={plan.id}
                className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
                  plan.highlight
                    ? 'bg-[#101612] text-[#F4F2E9] border-[#26372D] shadow-xl relative'
                    : 'bg-[#FFFFFF] text-[#17231C] border-[#E1E7D9]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#D9F36B]/20 text-[#719129] border border-[#D9F36B]/40">
                      Full Access
                    </span>
                    {plan.highlight && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9F36B]">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <p className={`text-xs mb-4 ${plan.highlight ? 'text-[#BECABE]' : 'text-[#647168]'}`}>
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold font-display">{price}</span>
                    <span className={`text-xs ${plan.highlight ? 'text-[#BECABE]' : 'text-[#647168]'}`}>
                      {period}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#92B76B] font-semibold mb-4">
                    Official Stripe Subscription · Cancel Anytime
                  </div>

                  <div
                    className={`text-xs font-semibold py-1.5 px-3 rounded-xl mb-6 ${
                      plan.highlight ? 'bg-[#202E25] text-[#D9F36B]' : 'bg-[#F7F8F2] text-[#17231C]'
                    }`}
                  >
                    {plan.creditsPerMonth.toLocaleString()} Credits / mo
                  </div>

                  <ul className="space-y-2.5 text-xs">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 ${plan.highlight ? 'text-[#D9F36B]' : 'text-[#92B76B]'}`} />
                        <span className={plan.highlight ? 'text-[#BECABE]' : 'text-[#647168]'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-inherit">
                  <button
                    onClick={onStartCreating}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition-all ${
                      plan.highlight
                        ? 'bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C]'
                        : 'bg-[#17231C] hover:bg-[#101612] text-[#F4F2E9]'
                    }`}
                  >
                    Select {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          07 TESTIMONIALS & TRUST
      ------------------------------------------------------------------------ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E7D9]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#647168] mb-2">
            Verified Creator Outcomes
          </p>
          <h2 className="text-3xl font-bold font-display text-[#17231C]">
            Trusted by creators producing 50,000+ monthly impressions.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'Creator Studio cut my newsletter-to-Reels repurposing time from 4 hours every Monday to 35 minutes. The negative keyword filters prevent all the usual AI clichés.',
              author: 'Elena Rostova',
              role: 'Growth Strategist & Tech Creator',
              audience: '68,000 followers on LinkedIn',
              metric: '+340% organic impressions in 60 days',
            },
            {
              quote:
                'Our agency handles 12 client retainer accounts. Having segregated brand voice profiles with custom tonality controls ensures our copywriters stay on brand every single sprint.',
              author: 'Marcus Vance',
              role: 'Founder, Signal & Oak Creative Agency',
              audience: 'Managing 12 B2B Client Accounts',
              metric: 'Saved 16 billable hours per week',
            },
            {
              quote:
                'The script generator with camera cues and timestamped hooks is phenomenal. My average YouTube Shorts retention spiked from 42% to 68% on the first four tests.',
              author: 'Devon Park',
              role: 'Solo Developer & Creator',
              audience: '42,000 subscribers on YouTube',
              metric: 'Retention increased to 68%',
            },
          ].map((item) => (
            <div
              key={item.author}
              className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E1E7D9] flex flex-col justify-between"
            >
              <div>
                <p className="text-xs text-[#17231C] leading-relaxed mb-6 italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E1E7D9]">
                <div className="text-xs font-bold text-[#17231C]">{item.author}</div>
                <div className="text-[11px] text-[#647168]">{item.role}</div>
                <div className="text-[11px] font-semibold text-[#92B76B] mt-1">{item.metric}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------------
          08 FINAL CALL TO ACTION
      ------------------------------------------------------------------------ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-[#101612] text-[#F4F2E9] border border-[#26372D] relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#F4F2E9] mb-4">
            Ready to upgrade your content engine?
          </h2>
          <p className="text-xs sm:text-sm text-[#BECABE] max-w-xl mx-auto mb-8 leading-relaxed">
            Join the creators and marketing teams building consistent organic momentum with ultra-fast AI precision.
          </p>
          <button
            onClick={onStartCreating}
            className="px-8 py-4 rounded-full font-bold text-sm bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-[#17231C]" />
            Start Creating Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Template Preview Modal */}
      {selectedTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 border border-[#E1E7D9] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7D9]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#92B76B]">
                  {selectedTemplateModal.platform} · {selectedTemplateModal.category}
                </span>
                <h3 className="text-base font-bold text-[#17231C] mt-0.5">
                  {selectedTemplateModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTemplateModal(null)}
                className="text-xs text-[#647168] hover:text-[#17231C]"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#647168]">{selectedTemplateModal.desc}</p>

            <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#E1E7D9] text-xs font-mono text-[#17231C] whitespace-pre-wrap leading-relaxed">
              {selectedTemplateModal.previewText}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTemplateModal(null)}
                className="px-4 py-2 rounded-lg border border-[#E1E7D9] text-xs font-semibold text-[#17231C]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedTemplateModal(null);
                  onStartCreating();
                }}
                className="px-4 py-2 rounded-lg bg-[#D9F36B] text-[#17231C] text-xs font-bold"
              >
                Load into Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
