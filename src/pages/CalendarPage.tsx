import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { CalendarEntry, CalendarStatus } from '../types/index.ts';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Info,
  Bell,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { user, isAdmin, isOwner } = useAuth();
  const { success } = useToast();

  const [entries, setEntries] = useState<CalendarEntry[]>(() => storage.getCalendarEntries());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Privacy Isolation: Clients only see their own scheduled entries
  const visibleEntries = entries.filter((entry) => {
    if (!isAdmin && !isOwner && user && entry.userId !== user.id) {
      return false;
    }
    return true;
  });

  // New/Edit Event Form
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [category, setCategory] = useState('Thought Leadership');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [status, setStatus] = useState<CalendarStatus>('Draft');
  const [notes, setNotes] = useState('');
  const [inAppReminder, setInAppReminder] = useState(true);

  const platforms = ['Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'X', 'Facebook'];
  const categories = ['Thought Leadership', 'Tutorial & How-To', 'Storytelling', 'Promotion', 'Behind the Scenes'];
  const statuses: CalendarStatus[] = ['Idea', 'Draft', 'Ready', 'Published'];

  const handleOpenAdd = () => {
    setSelectedEntry(null);
    setTitle('');
    setPlatform('Instagram');
    setCategory('Thought Leadership');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setScheduledTime('10:00');
    setStatus('Draft');
    setNotes('');
    setInAppReminder(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: CalendarEntry) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setPlatform(entry.platform);
    setCategory(entry.category);
    setScheduledDate(entry.scheduledDate);
    setScheduledTime(entry.scheduledTime);
    setStatus(entry.status);
    setNotes(entry.notes || '');
    setInAppReminder(entry.inAppReminder);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const newOrUpdated: CalendarEntry = {
      id: selectedEntry ? selectedEntry.id : `cal_${Date.now()}`,
      userId: user.id,
      title: title.trim(),
      platform,
      category,
      scheduledDate,
      scheduledTime,
      timezone: 'UTC',
      status,
      notes,
      inAppReminder,
      publishedAt: status === 'Published' ? new Date().toISOString() : undefined,
      createdAt: selectedEntry ? selectedEntry.createdAt : new Date().toISOString(),
    };

    const updatedList = storage.saveCalendarEntry(newOrUpdated);
    setEntries(updatedList);
    setIsModalOpen(false);
    success(selectedEntry ? 'Post Updated' : 'Post Scheduled!', `"${title}" on ${scheduledDate}`);
  };

  const handleDelete = (id: string) => {
    const updatedList = storage.deleteCalendarEntry(id);
    setEntries(updatedList);
    setIsModalOpen(false);
    success('Event Deleted');
  };

  const handleQuickStatusChange = (entry: CalendarEntry, newStatus: CalendarStatus) => {
    const updated = storage.saveCalendarEntry({
      ...entry,
      status: newStatus,
      publishedAt: newStatus === 'Published' ? new Date().toISOString() : undefined,
    });
    setEntries(updated);
    success(`Status set to ${newStatus}`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#17231C] animate-page-enter">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            Module 08 · Content Calendar
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
            Publishing Calendar & Schedule
          </h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Organize campaigns, track execution statuses (Idea, Draft, Ready, Published), and manage in-app publishing reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View switcher */}
          <div className="flex items-center p-1 bg-[#FFFFFF] border border-[#E1E7D9] rounded-2xl text-xs shadow-2xs">
            {(['month', 'week', 'day'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-xl uppercase font-mono font-bold transition-colors ${
                  viewMode === m
                    ? 'bg-[#17231C] text-[#F4F2E9] shadow-sm'
                    : 'text-[#647168] hover:text-[#17231C]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] flex items-center gap-1.5 shadow-2xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Schedule Post
          </button>
        </div>
      </div>

      {/* Honest Social Publishing Notice */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E1E7D9] flex items-start gap-3 text-xs text-[#647168] shadow-2xs">
        <Info className="w-4 h-4 text-[#92B76B] shrink-0 mt-0.5" />
        <span>
          <strong className="text-[#17231C]">Publishing Architecture:</strong> Direct API background auto-posting requires platform business verification. Currently, manual publication tracking and in-app schedule reminders are fully active.
        </span>
      </div>

      {/* Calendar Grid / List View */}
      <div className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-[#647168]">
          <div className="font-bold text-[#17231C] text-sm font-display">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#17231C] font-semibold bg-[#F7F8F2] px-2.5 py-1 rounded-full border border-[#E1E7D9]">
              {visibleEntries.length} scheduled items
            </span>
          </div>
        </div>

        {visibleEntries.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#E1E7D9] rounded-2xl space-y-3 bg-[#F7F8F2]/50">
            <CalendarIcon className="w-8 h-8 text-[#647168] mx-auto" />
            <div className="text-xs text-[#647168]">Your calendar is currently clear.</div>
            <button
              onClick={handleOpenAdd}
              className="text-xs text-[#17231C] hover:underline font-bold"
            >
              Add your first scheduled post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl border border-[#E1E7D9] bg-[#F7F8F2] hover:border-[#17231C] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-[#17231C] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E1E7D9]">
                      {entry.platform}
                    </span>
                    <select
                      value={entry.status}
                      onChange={(e) => handleQuickStatusChange(entry, e.target.value as CalendarStatus)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border bg-[#FFFFFF] ${
                        entry.status === 'Published'
                          ? 'text-emerald-700 border-emerald-300'
                          : entry.status === 'Ready'
                          ? 'text-[#17231C] border-[#92B76B]'
                          : 'text-amber-700 border-amber-300'
                      }`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h3 className="text-sm font-bold font-display text-[#17231C] line-clamp-1">{entry.title}</h3>
                  {entry.notes && (
                    <p className="text-xs text-[#647168] line-clamp-2 leading-relaxed">{entry.notes}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E1E7D9] flex items-center justify-between text-xs text-[#647168]">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-[#647168]" />
                    <span>{entry.scheduledDate} · {entry.scheduledTime}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1 rounded text-[#647168] hover:text-[#17231C] hover:bg-[#FFFFFF]"
                      title="Edit entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded text-[#647168] hover:text-rose-600 hover:bg-[#FFFFFF]"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-[#17231C] animate-modal-pop">
            <h3 className="text-base font-bold font-display text-[#17231C]">
              {selectedEntry ? 'Edit Scheduled Item' : 'Schedule New Post'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Publish: 5 SaaS Lessons Reel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Time (UTC)</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Publishing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CalendarStatus)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Notes / Caption Preview</label>
                <textarea
                  rows={3}
                  placeholder="Optional script notes, hashtags, or reminder instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={inAppReminder}
                  onChange={(e) => setInAppReminder(e.target.checked)}
                  className="rounded border-[#E1E7D9] text-[#17231C] focus:ring-0"
                />
                <label htmlFor="reminder" className="text-xs text-[#647168] cursor-pointer">
                  Send in-app reminder alert 30 minutes prior
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E1E7D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#647168] hover:text-[#17231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] shadow-2xs"
                >
                  {selectedEntry ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
