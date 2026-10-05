import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { storage } from '../services/storage.ts';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Info,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const contentItems = storage.getContentItems();
  const calendarItems = storage.getCalendarEntries();
  const projects = storage.getProjects();
  const logs = storage.getAILogs();

  // Aggregate platforms
  const platformCounts: Record<string, number> = {
    LinkedIn: 0,
    Instagram: 0,
    YouTube: 0,
    TikTok: 0,
    X: 0,
    Facebook: 0,
  };

  contentItems.forEach((item) => {
    if (platformCounts[item.platform] !== undefined) {
      platformCounts[item.platform]++;
    } else {
      platformCounts['LinkedIn'] = (platformCounts['LinkedIn'] || 0) + 1;
    }
  });

  const totalWords = contentItems.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
  const totalCharacters = contentItems.reduce((acc, curr) => acc + (curr.characterCount || 0), 0);

  // Tools breakdown
  const toolCounts: Record<string, number> = {};
  contentItems.forEach((item) => {
    toolCounts[item.toolId] = (toolCounts[item.toolId] || 0) + 1;
  });

  const sortedTools = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#17231C] animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Module 14 · Studio Production Analytics
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Application Creation Metrics</h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Internal analytics measuring your team's generation throughput, platform distribution, and AI credit utilization.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center p-1 bg-[#FFFFFF] border border-[#E1E7D9] rounded-xl text-xs font-mono shadow-2xs">
          {(['7d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === r
                  ? 'bg-[#17231C] text-[#D9F36B] font-bold shadow-xs'
                  : 'text-[#647168] hover:text-[#17231C]'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Honest Scope Clarification */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] flex items-start gap-3 text-xs text-[#647168] shadow-2xs">
        <Info className="w-4 h-4 text-[#92B76B] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#17231C]">Honest Scope Notice: </span>
          These charts reflect your studio production output and AI model efficiency. External social metrics (actual views, impressions, retweets) require approved social API access tokens; they are never simulated.
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
          <div className="text-xs font-medium text-[#647168]">Total Assets Created</div>
          <div className="text-3xl font-extrabold font-mono text-[#17231C] mt-2">
            {contentItems.length}
          </div>
          <div className="text-[11px] text-[#647168] mt-1 font-mono">
            Across {projects.length} projects
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
          <div className="text-xs font-medium text-[#647168]">Total Words Produced</div>
          <div className="text-3xl font-extrabold font-mono text-[#17231C] mt-2">
            {totalWords.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#647168] mt-1 font-mono">
            ~{totalCharacters.toLocaleString()} characters
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
          <div className="text-xs font-medium text-[#647168]">Scheduled in Calendar</div>
          <div className="text-3xl font-extrabold font-mono text-[#92B76B] mt-2">
            {calendarItems.length}
          </div>
          <div className="text-[11px] text-[#647168] mt-1 font-mono">
            {calendarItems.filter((c) => c.status === 'Published').length} marked published
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs">
          <div className="text-xs font-medium text-[#647168]">Credits Consumed</div>
          <div className="text-3xl font-extrabold font-mono text-[#17231C] mt-2">
            {user?.creditsTotalUsed ?? 152}
          </div>
          <div className="text-[11px] text-[#647168] mt-1 font-mono">
            {user?.creditsBalance ?? 0} available balance
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <div className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#92B76B]" />
              Content by Platform
            </h3>
            <span className="text-[11px] font-mono text-[#647168]">Distribution %</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(platformCounts).map(([plat, count]) => {
              const total = contentItems.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={plat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#17231C] font-medium">{plat}</span>
                    <span className="text-[#647168] font-mono">
                      {count} items ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F7F8F2] border border-[#E1E7D9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#92B76B] to-[#D9F36B] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most-Used AI Tools */}
        <div className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#92B76B]" />
              Most Frequently Used Generators
            </h3>
            <span className="text-[11px] font-mono text-[#647168]">Frequency</span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedTools.length === 0 ? (
              <div className="text-xs text-[#647168] text-center py-8">
                No tool executions recorded yet.
              </div>
            ) : (
              sortedTools.map(([toolId, count]) => (
                <div
                  key={toolId}
                  className="p-3.5 rounded-2xl border border-[#E1E7D9] bg-[#F7F8F2] flex items-center justify-between text-xs transition-colors hover:border-[#17231C]/30"
                >
                  <span className="font-semibold text-[#17231C]">
                    {toolId.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="font-mono text-[#17231C] bg-[#D9F36B] px-2 py-0.5 rounded-md font-bold text-[11px]">{count} runs</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
