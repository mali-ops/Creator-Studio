import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { storage } from '../services/storage.ts';
import { adminConfig } from '../services/adminConfig.ts';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Calendar,
  Layers,
  Repeat,
  Plus,
  FolderKanban,
  BookmarkCheck,
  TrendingUp,
  Clock,
  Copy,
  Check,
  RotateCw,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, toolId?: string) => void;
  onOpenPricing: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenPricing }) => {
  const { user, isAdmin } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const projects = storage.getProjects().slice(0, 3);
  const contentItems = storage.getContentItems().slice(0, 3);
  const calendarEntries = storage.getCalendarEntries().slice(0, 3);
  const settings = adminConfig.getSettings();

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const quickTools = [
    { id: 'caption_generator', label: 'AI Caption', desc: 'Hooks, body & CTA copy' },
    { id: 'hook_generator', label: 'Viral Hooks', desc: '5 psychological openers' },
    { id: 'reel_script', label: 'Reel Script', desc: 'Visual cues & voiceover' },
    { id: 'carousel_generator', label: 'Carousel Slides', desc: 'Slide-by-slide guide' },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto text-[#17231C]">
      {/* Welcome Editorial Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#101612] text-[#F4F2E9] border border-[#26372D] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D9F36B]">
            <span className="w-2 h-2 rounded-full bg-[#D9F36B] animate-pulse" />
            {isAdmin
              ? 'ADMINISTRATOR PRIVILEGES · FULL PLATFORM ACCESS'
              : `${(user?.planTier || 'PRO').toUpperCase()} PLAN · FULL STUDIO ACCESS`}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F4F2E9] tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Creator'}
          </h1>
          <p className="text-xs sm:text-sm text-[#BECABE] leading-relaxed">
            Your studio is ready. All 16 AI content creation tools are active and ready.
          </p>
        </div>

        {/* Quick Launch Studio CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('studio')}
            className="px-6 py-3 rounded-full text-xs font-bold bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-[#c5e452]"
          >
            <Sparkles className="w-4 h-4 fill-[#17231C]" />
            Open Content Studio
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits Balance with Admin Managed Indicator */}
        <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#647168] font-semibold">Credits Balance</span>
            <span className="w-2 h-2 rounded-full bg-[#92B76B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#17231C] mt-1 flex items-baseline justify-between tabular-nums">
            <span>{user?.creditsBalance ?? 50}</span>
            <button
              onClick={onOpenPricing}
              className="text-[10px] font-sans font-semibold text-[#92B76B] hover:underline"
            >
              Top Up
            </button>
          </div>
          <div className="text-[10px] text-[#647168] mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#92B76B]" />
            <span>Credits Managed by Admin</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
          <span className="text-[11px] text-[#647168] font-semibold">Saved Assets</span>
          <div className="text-2xl font-bold font-mono text-[#17231C] mt-1 tabular-nums">
            {storage.getContentItems().length}
          </div>
          <div className="text-[10px] text-[#647168] mt-1">In persistent library</div>
        </div>

        <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
          <span className="text-[11px] text-[#647168] font-semibold">Active Brand Voices</span>
          <div className="text-2xl font-bold font-mono text-[#92B76B] mt-1 tabular-nums">
            {storage.getBrandVoices().length}
          </div>
          <div className="text-[10px] text-[#647168] mt-1">Configured tones</div>
        </div>

        <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
          <span className="text-[11px] text-[#647168] font-semibold">Scheduled Posts</span>
          <div className="text-2xl font-bold font-mono text-[#17231C] mt-1 tabular-nums">
            {storage.getCalendarEntries().length}
          </div>
          <div className="text-[10px] text-[#647168] mt-1">On calendar roadmap</div>
        </div>
      </div>

      {/* Quick Launch Tool Shortcuts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#647168]">
            Quick Launch Generators
          </h2>
          <button
            onClick={() => onNavigate('tools')}
            className="text-xs font-bold text-[#17231C] hover:text-[#92B76B] flex items-center gap-1 transition-colors"
          >
            View all 16 AI Tools <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onNavigate('tools', tool.id)}
              className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] hover:border-[#17231C] cursor-pointer transition-all hover:scale-[1.01] shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#17231C] group-hover:text-[#92B76B] transition-colors">
                  {tool.label}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#647168] group-hover:text-[#17231C] transition-colors" />
              </div>
              <p className="text-xs text-[#647168] leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Recent Projects & Saved Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E7D9]">
            <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#92B76B]" />
              Active Projects & Campaigns
            </h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-semibold text-[#647168] hover:text-[#17231C]"
            >
              Manage Projects →
            </button>
          </div>

          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#647168]">
                No projects yet. Create your first campaign folder!
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onNavigate('projects')}
                  className="p-4 rounded-2xl border border-[#E1E7D9] bg-[#F7F8F2] hover:border-[#17231C] cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#17231C]">{proj.name}</h4>
                    <p className="text-[11px] text-[#647168] mt-0.5 line-clamp-1">{proj.description}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FFFFFF] text-[#17231C] border border-[#E1E7D9]">
                    {proj.platform}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Saved Content Snippets */}
        <div className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E7D9]">
            <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-[#92B76B]" />
              Recent Saved Library
            </h3>
            <button
              onClick={() => onNavigate('saved-content')}
              className="text-xs font-semibold text-[#647168] hover:text-[#17231C]"
            >
              View Full Library →
            </button>
          </div>

          <div className="space-y-3">
            {contentItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#647168]">
                No saved content yet. Generate your first post in Content Studio!
              </div>
            ) : (
              contentItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-[#E1E7D9] bg-[#F7F8F2] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#17231C]">{item.title}</span>
                    <button
                      onClick={() => handleCopy(item.id, item.generatedOutput)}
                      className="text-[11px] text-[#647168] hover:text-[#17231C] flex items-center gap-1 font-semibold"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#92B76B]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#647168] line-clamp-2 leading-relaxed">
                    {item.generatedOutput}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
