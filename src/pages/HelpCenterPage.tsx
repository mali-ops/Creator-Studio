import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { SupportTicket, SupportMessage } from '../types/index.ts';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Plus,
  Clock,
  CheckCircle2,
  FileQuestion,
  BookOpen,
  LifeBuoy,
} from 'lucide-react';

export const HelpCenterPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'faqs' | 'guides' | 'tickets'>('faqs');

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const all = storage.getSupportTickets();
    return user ? all.filter((t) => t.userId === user.id) : [];
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New Ticket Form State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'General' | 'AI Generation' | 'Billing & Credits' | 'Bug Report' | 'Feature Request'>('AI Generation');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [ticketMessage, setTicketMessage] = useState('');

  // Reply state
  const [replyMessage, setReplyMessage] = useState('');

  const faqs = [
    {
      q: 'How does the AI inference engine work?',
      a: 'We run optimized neural models server-side with ultra-low latency architecture. API keys are kept strictly on the backend, meaning your client browser never exposes secrets.',
    },
    {
      q: 'How do Brand Voice negative constraints work?',
      a: 'When you specify forbidden words in your Brand Voice profile, the backend prompt engine compiles them into strict negative constraints, ensuring the AI model never uses those terms in generated copy.',
    },
    {
      q: 'Can I transfer generated content to my calendar?',
      a: 'Yes! Both the Universal AI Content Studio, individual tools, and the Guided Content Planner have a "Transfer to Calendar" action that schedules posts with custom categories and in-app reminders.',
    },
    {
      q: 'How are AI generation credits deducted?',
      a: 'Standard tools (e.g. captions, hooks, titles) cost 1 credit per execution. Multi-slide carousels, full YouTube outlines, and content repurposing cost 2 credits. Quotas are checked server-side before execution.',
    },
    {
      q: 'Can I export my content library?',
      a: 'Yes. You can export individual items as Markdown (.md), Plain Text (.txt), or JSON (.json), or download your entire account archive from the Profile & Portability page.',
    },
  ];

  const guides = [
    {
      title: 'Prompt Engineering for High-Converting Hooks',
      readTime: '3 min read',
      snippet: 'Learn how to construct contrarian angles, curiosity gaps, and pain point triggers that stop feed scrolling in under 2 seconds.',
    },
    {
      title: 'Repurposing a 1,000-Word Blog into 5 Assets',
      readTime: '4 min read',
      snippet: 'A step-by-step masterclass on breaking down an essay into a LinkedIn carousel, a 30s Reel script, and a viral 4-tweet thread.',
    },
    {
      title: 'Managing Client Agency Workspaces',
      readTime: '5 min read',
      snippet: 'Configure Owner, Admin, Editor, and Viewer roles to share deliverables with clients without exposing internal prompt templates.',
    },
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim() || !user) return;

    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      subject: ticketSubject.trim(),
      category: ticketCategory,
      priority: ticketPriority,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          ticketId: `tkt_${Date.now()}`,
          senderId: user.id,
          senderName: user.fullName,
          message: ticketMessage.trim(),
          isAdminReply: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const updated = storage.saveSupportTicket(newTicket);
    setTickets(updated.filter((t) => t.userId === user.id));
    setShowNewTicketModal(false);
    setTicketSubject('');
    setTicketMessage('');
    success('Support Ticket Submitted', `Ticket #${newTicket.id.slice(-6)} created. Our team will review it.`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket || !user) return;

    const newMsg: SupportMessage = {
      id: `msg_${Date.now()}`,
      ticketId: selectedTicket.id,
      senderId: user.id,
      senderName: user.fullName,
      message: replyMessage.trim(),
      isAdminReply: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      updatedAt: new Date().toISOString(),
      messages: [...selectedTicket.messages, newMsg],
    };

    const all = storage.saveSupportTicket(updatedTicket);
    setTickets(all.filter((t) => t.userId === user.id));
    setSelectedTicket(updatedTicket);
    setReplyMessage('');
    success('Reply Added');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 text-[#17231C] animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Module 19 · Help Center & Support
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Knowledge Base & Support Desk</h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Read tool guides, browse public FAQs, or submit a support ticket to our technical engineering team.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#FFFFFF] border border-[#E1E7D9] rounded-2xl text-xs shadow-2xs">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'faqs' ? 'bg-[#17231C] text-[#D9F36B] shadow-xs' : 'text-[#647168] hover:text-[#17231C]'
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'guides' ? 'bg-[#17231C] text-[#D9F36B] shadow-xs' : 'text-[#647168] hover:text-[#17231C]'
            }`}
          >
            Guides
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === 'tickets' ? 'bg-[#17231C] text-[#D9F36B] shadow-xs' : 'text-[#647168] hover:text-[#17231C]'
              }`}
            >
              My Tickets ({tickets.length})
            </button>
          )}
        </div>
      </div>

      {/* FAQS TAB */}
      {activeTab === 'faqs' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-[#647168]">Everything you need to know about the platform, models, and workflows.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] overflow-hidden transition-all shadow-2xs hover:border-[#17231C]/30"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm font-semibold hover:text-[#92B76B]"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#92B76B]" /> : <ChevronDown className="w-4 h-4 text-[#647168]" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#647168] leading-relaxed border-t border-[#E1E7D9] pt-3.5 bg-[#F7F8F2]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GUIDES TAB */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((g) => (
            <div key={g.title} className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-3">
              <div className="text-[11px] font-mono text-[#92B76B] font-bold">{g.readTime}</div>
              <h3 className="font-bold text-base">{g.title}</h3>
              <p className="text-xs text-[#647168] leading-relaxed">{g.snippet}</p>
              <div className="pt-2">
                <span className="text-xs text-[#17231C] font-bold hover:underline cursor-pointer">
                  Read Full Tutorial →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUPPORT TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#92B76B]" />
              Your Support Tickets ({tickets.length})
            </h2>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Open New Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tickets List */}
            <div className="lg:col-span-5 space-y-2">
              {tickets.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#E1E7D9] rounded-2xl text-xs text-[#647168]">
                  You have no open support tickets.
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      selectedTicket?.id === t.id
                        ? 'bg-[#F7F8F2] border-[#17231C] shadow-xs'
                        : 'bg-[#FFFFFF] border-[#E1E7D9] hover:border-[#17231C]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold truncate max-w-[200px]">{t.subject}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold ${
                          t.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'In Progress'
                            ? 'bg-[#D9F36B]/20 text-[#17231C] border-[#17231C]/20'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#647168] line-clamp-1">
                      Category: {t.category} · Priority: {t.priority}
                    </div>
                    <div className="text-[10px] font-mono text-[#647168] pt-1 border-t border-[#E1E7D9]">
                      Last update: {new Date(t.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ticket Conversation View */}
            <div className="lg:col-span-7">
              {selectedTicket ? (
                <div className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-5">
                  <div className="border-b border-[#E1E7D9] pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base">{selectedTicket.subject}</h3>
                      <div className="text-xs text-[#647168] mt-0.5">
                        Category: {selectedTicket.category} · Status: <span className="text-[#92B76B] font-bold">{selectedTicket.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {selectedTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                          m.isAdminReply
                            ? 'bg-[#D9F36B]/10 border-[#92B76B]/30 ml-4'
                            : 'bg-[#F7F8F2] border-[#E1E7D9] mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#647168]">
                          <span className={m.isAdminReply ? 'text-[#17231C] font-bold' : 'text-[#647168]'}>
                            {m.senderName} {m.isAdminReply ? '(Staff)' : ''}
                          </span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{m.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!replyMessage.trim()}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] disabled:opacity-40 flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center border border-dashed border-[#E1E7D9] rounded-3xl text-xs text-[#647168] bg-[#FFFFFF]">
                  Select a support ticket to inspect responses or add follow-ups.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#17231C]">Submit New Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Question on Brand Voice negative constraints"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17231C] mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  >
                    <option value="AI Generation">AI Generation</option>
                    <option value="Billing & Credits">Billing & Credits</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17231C] mb-1">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1">Message Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the issue or question in detail..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-3.5 py-2 text-xs text-[#647168] hover:text-[#17231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] shadow-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
