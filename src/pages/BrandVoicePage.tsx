import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { generateContent } from '../services/api.ts';
import { BrandVoice } from '../types/index.ts';
import {
  Volume2,
  Plus,
  Trash2,
  Check,
  Star,
  Sparkles,
  Loader2,
  Play,
  ShieldAlert,
} from 'lucide-react';

export const BrandVoicePage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [voices, setVoices] = useState<BrandVoice[]>(() => storage.getBrandVoices());
  const [selectedVoice, setSelectedVoice] = useState<BrandVoice | null>(() => voices[0] || null);

  // Form State for Editing/Creating
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAudience, setFormAudience] = useState('');
  const [formPersonality, setFormPersonality] = useState('');
  const [formTone, setFormTone] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formForbidden, setFormForbidden] = useState('');
  const [formExampleWriting, setFormExampleWriting] = useState('');
  const [formLanguage, setFormLanguage] = useState('English');

  // Interactive Live Voice Test
  const [testTopic, setTestTopic] = useState('Why simplicity wins in product design');
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleStartCreate = () => {
    setSelectedVoice(null);
    setFormName('');
    setFormDescription('');
    setFormAudience('Software founders and modern creators');
    setFormPersonality('Direct, intellectually honest, and high-conviction');
    setFormTone('Authoritative & Conversational');
    setFormKeywords('leverage, systems, first principles, clarity');
    setFormForbidden('game-changer, synergy, revolutionize, guru');
    setFormExampleWriting('Simplicity is hard. Anyone can add features; the master removes what does not compound.');
    setFormLanguage('English');
    setIsEditing(true);
  };

  const handleStartEdit = (voice: BrandVoice) => {
    setSelectedVoice(voice);
    setFormName(voice.name);
    setFormDescription(voice.description || '');
    setFormAudience(voice.targetAudience);
    setFormPersonality(voice.personality);
    setFormTone(voice.tone);
    setFormKeywords(voice.keywords.join(', '));
    setFormForbidden(voice.forbiddenWords.join(', '));
    setFormExampleWriting(voice.exampleWriting || '');
    setFormLanguage(voice.preferredLanguage);
    setIsEditing(true);
  };

  const handleSaveVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !user) return;

    const newVoice: BrandVoice = {
      id: selectedVoice ? selectedVoice.id : `bv_${Date.now()}`,
      userId: user.id,
      name: formName.trim(),
      description: formDescription.trim(),
      targetAudience: formAudience.trim(),
      personality: formPersonality.trim(),
      tone: formTone.trim(),
      keywords: formKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      forbiddenWords: formForbidden.split(',').map((k) => k.trim()).filter(Boolean),
      exampleWriting: formExampleWriting.trim(),
      preferredLanguage: formLanguage,
      isDefault: selectedVoice ? selectedVoice.isDefault : voices.length === 0,
      createdAt: selectedVoice ? selectedVoice.createdAt : new Date().toISOString(),
    };

    const updated = storage.saveBrandVoice(newVoice);
    setVoices(updated);
    setSelectedVoice(newVoice);
    setIsEditing(false);
    success(selectedVoice ? 'Brand Voice Updated' : 'Brand Voice Created');
  };

  const handleDeleteVoice = (id: string) => {
    const updated = storage.deleteBrandVoice(id);
    setVoices(updated);
    setSelectedVoice(updated[0] || null);
    setIsEditing(false);
    success('Brand Voice Deleted');
  };

  const handleSetDefault = (id: string) => {
    const target = voices.find((v) => v.id === id);
    if (!target) return;
    const updated = storage.saveBrandVoice({ ...target, isDefault: true });
    setVoices(updated);
    success(`"${target.name}" is now your default brand voice.`);
  };

  const handleTestVoice = async () => {
    if (!selectedVoice) return;
    setIsTestingVoice(true);
    setTestResult(null);

    try {
      const res = await generateContent({
        toolId: 'caption_generator',
        params: {
          topic: testTopic,
          platform: 'LinkedIn',
          length: 'Short',
        },
        brandVoice: selectedVoice,
      });

      setTestResult(res.content);
      success('Voice Test Complete!', `Rendered in ${res.executionMs}ms.`);
    } catch (err: any) {
      toastError('Voice Test Failed', err.message);
    } finally {
      setIsTestingVoice(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#17231C] animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold mb-1">
            <Volume2 className="w-3.5 h-3.5" />
            Module 11 · Brand Voice Profiles
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
            Brand Voice & Persona Engine
          </h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Calibrate custom personalities, banned words, and writing samples to ensure the 16 AI tools never produce generic copy.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] flex items-center gap-1.5 shadow-2xs transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Create Brand Voice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Brand Voices List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-[#647168] mb-2 font-semibold">
            Configured Voices ({voices.length})
          </div>

          {voices.map((voice) => (
            <div
              key={voice.id}
              onClick={() => {
                setSelectedVoice(voice);
                setIsEditing(false);
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedVoice?.id === voice.id
                  ? 'bg-[#17231C] border-[#17231C] text-[#F4F2E9] shadow-md'
                  : 'bg-[#FFFFFF] border-[#E1E7D9] hover:border-[#17231C] text-[#17231C] shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm font-display">{voice.name}</span>
                {voice.isDefault && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${selectedVoice?.id === voice.id ? 'bg-[#D9F36B] text-[#17231C]' : 'bg-[#F7F8F2] text-[#17231C] border border-[#E1E7D9]'}`}>
                    Default
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 line-clamp-1 ${selectedVoice?.id === voice.id ? 'text-[#BECABE]' : 'text-[#647168]'}`}>
                {voice.targetAudience}
              </p>
              <div className={`text-[11px] mt-2 font-mono ${selectedVoice?.id === voice.id ? 'text-[#D9F36B]' : 'text-[#647168]'}`}>
                Tone: {voice.tone}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Selected Voice Details & Interactive Preview */}
        <div className="lg:col-span-8">
          {isEditing ? (
            /* Editing / Creating Form */
            <div className="p-6 sm:p-7 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
              <h3 className="text-base font-bold font-display text-[#17231C]">
                {selectedVoice ? `Edit "${selectedVoice.name}"` : 'Create New Brand Voice'}
              </h3>

              <form onSubmit={handleSaveVoice} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Brand Profile Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Tech Visionary Founder"
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Target Audience</label>
                  <input
                    type="text"
                    required
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value)}
                    placeholder="Who are you speaking to? e.g., Senior designers, B2B executives"
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17231C] mb-1">Tone Archetype</label>
                    <input
                      type="text"
                      required
                      value={formTone}
                      onChange={(e) => setFormTone(e.target.value)}
                      placeholder="e.g., Authoritative yet approachable"
                      className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17231C] mb-1">Language</label>
                    <select
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">
                    Mandatory Keywords to Embody (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formKeywords}
                    onChange={(e) => setFormKeywords(e.target.value)}
                    placeholder="e.g., leverage, systems, compound growth, velocity"
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Forbidden Words (Negative Constraints)
                  </label>
                  <input
                    type="text"
                    value={formForbidden}
                    onChange={(e) => setFormForbidden(e.target.value)}
                    placeholder="e.g., synergy, game-changer, revolutionary, secret sauce"
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-rose-200 rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-rose-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-[#647168] mt-1">
                    These words are strictly prohibited in all outputs generated using this voice profile.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Writing Style Reference Sample</label>
                  <textarea
                    rows={3}
                    value={formExampleWriting}
                    onChange={(e) => setFormExampleWriting(e.target.value)}
                    placeholder="Paste a paragraph of authentic text you wrote that best captures your preferred rhythm and sentence structure..."
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E1E7D9]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-[#647168] hover:text-[#17231C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] shadow-2xs"
                  >
                    Save Voice Profile
                  </button>
                </div>
              </form>
            </div>
          ) : selectedVoice ? (
            /* Selected Voice Overview & Interactive Test */
            <div className="space-y-6">
              <div className="p-6 sm:p-7 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E1E7D9] pb-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-[#17231C]">{selectedVoice.name}</h2>
                    <p className="text-xs text-[#647168] mt-0.5">{selectedVoice.description || 'Configured Brand Voice'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!selectedVoice.isDefault && (
                      <button
                        onClick={() => handleSetDefault(selectedVoice.id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-[#17231C] hover:bg-[#FFFFFF] transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleStartEdit(selectedVoice)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#F4F2E9] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVoice(selectedVoice.id)}
                      className="p-1.5 rounded-xl text-[#647168] hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-[#647168] font-bold mb-1">Target Audience</div>
                    <div className="text-[#17231C] font-medium">{selectedVoice.targetAudience}</div>
                  </div>
                  <div>
                    <div className="text-[#647168] font-bold mb-1">Tone of Voice</div>
                    <div className="text-[#17231C] font-medium">{selectedVoice.tone}</div>
                  </div>
                  <div>
                    <div className="text-[#647168] font-bold mb-1">Core Keywords</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedVoice.keywords.map((k) => (
                        <span key={k} className="px-2 py-0.5 rounded-full bg-[#F7F8F2] text-[#17231C] border border-[#E1E7D9] font-mono text-[10px] font-semibold">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-rose-700 font-bold mb-1">Forbidden Words (Strict Ban)</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedVoice.forbiddenWords.map((fw) => (
                        <span key={fw} className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[10px] border border-rose-200 font-semibold">
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedVoice.exampleWriting && (
                  <div className="pt-3 border-t border-[#E1E7D9]">
                    <div className="text-[#647168] text-xs font-bold mb-1">Writing Style Reference:</div>
                    <blockquote className="text-xs text-[#17231C] italic border-l-2 border-[#D9F36B] pl-3 leading-relaxed bg-[#F7F8F2] p-2.5 rounded-r-xl">
                      "{selectedVoice.exampleWriting}"
                    </blockquote>
                  </div>
                )}
              </div>

              {/* Interactive Test Brand Voice */}
              <div className="p-6 sm:p-7 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#92B76B]" />
                    <h3 className="text-sm font-bold font-display text-[#17231C]">Test "{selectedVoice.name}" with AI Studio</h3>
                  </div>
                  <span className="text-[11px] font-mono text-[#647168]">Live Voice Preview</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testTopic}
                    onChange={(e) => setTestTopic(e.target.value)}
                    placeholder="Enter a test topic..."
                    className="flex-1 px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  />
                  <button
                    onClick={handleTestVoice}
                    disabled={isTestingVoice || !testTopic.trim()}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-2xs"
                  >
                    {isTestingVoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-[#17231C]" />}
                    Preview Output
                  </button>
                </div>

                {testResult && (
                  <div className="p-4 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] text-xs text-[#17231C] whitespace-pre-wrap leading-relaxed font-sans">
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
