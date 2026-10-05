import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { Sparkles, ArrowRight, ArrowLeft, Check, SkipForward } from 'lucide-react';
import { BrandVoice } from '../types/index.ts';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { user, completeOnboarding } = useAuth();
  const { success } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Onboarding form state
  const [creatorType, setCreatorType] = useState('Solo Creator & Founder');
  const [industry, setIndustry] = useState('Tech & B2B SaaS');
  const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>(['Instagram', 'LinkedIn']);
  const [contentGoals, setContentGoals] = useState<string[]>(['Audience Growth', 'Authority Building']);

  // Brand Voice setup
  const [brandName, setBrandName] = useState(user?.company || 'My Brand');
  const [targetAudience, setTargetAudience] = useState('Creators, entrepreneurs, and ambitious professionals');
  const [tone, setTone] = useState('Engaging & Authentic');
  const [keywords, setKeywords] = useState('systems, leverage, consistency, growth');
  const [language, setLanguage] = useState('English');

  const creatorTypes = [
    { title: 'Solo Creator & Founder', desc: 'Building audience and personal brand around products' },
    { title: 'Marketing Agency / Consultant', desc: 'Managing multi-client social calendars and campaigns' },
    { title: 'E-Commerce & DTC Brand', desc: 'Product storytelling, ad copy, and customer conversion' },
    { title: 'B2B Operator / Executive', desc: 'Thought leadership, recruiting, and company narrative' },
    { title: 'Freelance Copywriter', desc: 'Producing high-volume deliverables across platforms' },
  ];

  const industries = [
    'Tech & B2B SaaS',
    'Creator Economy & Media',
    'Finance & Investing',
    'Fitness & Health',
    'Design & Creative',
    'Real Estate & Architecture',
    'Education & Coaching',
    'E-Commerce & Retail',
  ];

  const platformsList = ['Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'X', 'Facebook'];

  const goalsList = [
    'Audience Growth',
    'Authority & Trust',
    'Lead Generation',
    'High Engagement',
    'Course / Product Sales',
    'Recruiting & Networking',
  ];

  const togglePlatform = (p: string) => {
    setPreferredPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const toggleGoal = (g: string) => {
    setContentGoals((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const handleFinish = () => {
    if (!user) return;

    // 1. Create initial default brand voice profile
    const brandVoice: BrandVoice = {
      id: `bv_${Date.now()}`,
      userId: user.id,
      name: brandName || 'Primary Brand Voice',
      targetAudience,
      personality: 'Clear, high-conviction, and helpful',
      tone,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      forbiddenWords: ['synergy', 'game-changer', 'revolutionize'],
      preferredLanguage: language,
      isDefault: true,
      createdAt: new Date().toISOString(),
    };
    storage.saveBrandVoice(brandVoice);

    // 2. Complete onboarding profile
    completeOnboarding({
      creatorType,
      industry,
      preferredPlatforms,
      contentGoals,
      defaultLanguage: language,
      defaultTone: tone,
    });

    success('Onboarding Completed!', 'Your personalized workspace is configured.');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F7F8F2] flex flex-col justify-center items-center p-4 py-12 text-[#17231C] animate-page-enter">
      <div className="max-w-2xl w-full bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl shadow-xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
        {/* Step progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#647168] font-mono">
            <span>STEP {currentStep} OF {totalSteps}</span>
            <span className="font-bold text-[#17231C]">{Math.round((currentStep / totalSteps) * 100)}% COMPLETE</span>
          </div>
          <div className="w-full h-2 bg-[#F7F8F2] border border-[#E1E7D9] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#92B76B] to-[#D9F36B] transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Creator Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1">What best describes your creator role?</h2>
              <p className="text-xs text-[#647168]">We will calibrate default templates and prompt suggestions to match your scale.</p>
            </div>

            <div className="space-y-2.5">
              {creatorTypes.map((type) => (
                <div
                  key={type.title}
                  onClick={() => setCreatorType(type.title)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                    creatorType === type.title
                      ? 'bg-[#17231C] border-[#17231C] text-white shadow-xs'
                      : 'bg-[#F7F8F2] border-[#E1E7D9] text-[#17231C] hover:border-[#17231C]/30'
                  }`}
                >
                  <div>
                    <div className={`text-sm font-semibold ${creatorType === type.title ? 'text-white' : 'text-[#17231C]'}`}>{type.title}</div>
                    <div className={`text-xs mt-0.5 ${creatorType === type.title ? 'text-[#BECABE]' : 'text-[#647168]'}`}>{type.desc}</div>
                  </div>
                  {creatorType === type.title && <Check className="w-4 h-4 text-[#D9F36B] shrink-0 mt-1" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Industry */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1">What is your primary industry or niche?</h2>
              <p className="text-xs text-[#647168]">Select the domain where you produce the majority of your content.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setIndustry(ind)}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    industry === ind
                      ? 'bg-[#17231C] border-[#17231C] text-[#D9F36B] shadow-xs'
                      : 'bg-[#F7F8F2] border-[#E1E7D9] text-[#17231C] hover:border-[#17231C]/30'
                  }`}
                >
                  <span>{ind}</span>
                  {industry === ind && <Check className="w-3.5 h-3.5 text-[#D9F36B]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Preferred Platforms */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1">Where do you publish most often?</h2>
              <p className="text-xs text-[#647168]">Choose all channels you actively create for (multi-select).</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {platformsList.map((p) => {
                const selected = preferredPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`p-4 rounded-2xl border text-center text-xs font-semibold transition-all flex flex-col items-center justify-center gap-2 ${
                      selected
                        ? 'bg-[#17231C] border-[#17231C] text-[#D9F36B] shadow-xs'
                        : 'bg-[#F7F8F2] border-[#E1E7D9] text-[#17231C] hover:border-[#17231C]/30'
                    }`}
                  >
                    <span>{p}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-[#D9F36B]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Content Goals */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1">What are your top content goals?</h2>
              <p className="text-xs text-[#647168]">This configures default calls to action and storytelling angles.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalsList.map((g) => {
                const selected = contentGoals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      selected
                        ? 'bg-[#17231C] border-[#17231C] text-[#D9F36B] shadow-xs'
                        : 'bg-[#F7F8F2] border-[#E1E7D9] text-[#17231C] hover:border-[#17231C]/30'
                    }`}
                  >
                    <span>{g}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-[#D9F36B]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Initial Brand Voice Setup */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1">Set Up Your First Brand Voice</h2>
              <p className="text-xs text-[#647168]">
                This profile will automatically guide the 16 AI tools to produce distinct, on-brand content.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1">Brand Name / Project Handle</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  placeholder="e.g., Apex Labs / Sarah Vance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1">Target Audience Persona</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  placeholder="e.g., Solo SaaS founders and digital product marketers"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231C] mb-1">Default Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  >
                    <option value="Engaging & Authentic">Engaging & Authentic</option>
                    <option value="Authoritative & Direct">Authoritative & Direct</option>
                    <option value="Witty & Conversational">Witty & Conversational</option>
                    <option value="Educational & Step-by-Step">Educational & Step-by-Step</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231C] mb-1">Primary Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1">
                  Core Keywords to Embody (Comma-separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  placeholder="e.g., systems, first principles, clarity, momentum"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-6 border-t border-[#E1E7D9] flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((p) => p - 1)}
                className="px-4 py-2 text-xs font-semibold text-[#647168] hover:text-[#17231C] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-3.5 py-1.5 text-xs text-[#647168] hover:text-[#17231C] flex items-center gap-1 transition-colors"
              >
                <SkipForward className="w-3 h-3" />
                Skip Wizard
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep((p) => p + 1)}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] flex items-center gap-1.5 shadow-xs transition-all"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] flex items-center gap-2 shadow-xs transition-all"
              >
                Complete Setup & Enter Studio
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
