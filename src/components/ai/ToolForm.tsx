import React, { useState } from 'react';
import { AIToolConfig } from '../../types/tools.ts';
import { BrandVoice } from '../../types/index.ts';
import { Sparkles, Loader2, Zap } from 'lucide-react';

interface ToolFormProps {
  tool: AIToolConfig;
  brandVoices: BrandVoice[];
  onGenerate: (formValues: Record<string, any>, selectedVoice?: BrandVoice) => void;
  isGenerating: boolean;
  userCredits: number;
}

export const ToolForm: React.FC<ToolFormProps> = ({
  tool,
  brandVoices,
  onGenerate,
  isGenerating,
  userCredits,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    tool.fields.forEach((f) => {
      initial[f.name] = f.defaultValue || '';
    });
    return initial;
  });

  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    const defaultVoice = brandVoices.find((v) => v.isDefault);
    return defaultVoice ? defaultVoice.id : '';
  });

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeVoice = brandVoices.find((v) => v.id === selectedVoiceId);
    onGenerate(formData, activeVoice);
  };

  const hasEnoughCredits = userCredits >= tool.creditCost;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Brand Voice Selector */}
      {brandVoices.length > 0 && (
        <div className="p-3.5 rounded-2xl border border-[#E1E7D9] bg-[#F7F8F2] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-xs font-bold text-[#17231C]">Apply Brand Voice Profile</label>
            <p className="text-[11px] text-[#647168]">Injects tone, audience, and negative constraints</p>
          </div>
          <select
            value={selectedVoiceId}
            onChange={(e) => setSelectedVoiceId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:border-[#17231C] focus:outline-none font-medium"
          >
            <option value="">No Brand Voice (Default General)</option>
            {brandVoices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.isDefault ? '(Default)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dynamic Fields */}
      <div className="space-y-4">
        {tool.fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <label className="block text-xs font-bold text-[#17231C]">
              {field.label}
              {field.required && <span className="text-[#92B76B] ml-1">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                required={field.required}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] placeholder-[#647168]/60 focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed transition-all"
              />
            ) : field.type === 'select' ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none transition-all font-medium"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] placeholder-[#647168]/60 focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none transition-all"
              />
            )}

            {field.helpText && <p className="text-[11px] text-[#647168]">{field.helpText}</p>}
          </div>
        ))}
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E1E7D9]">
        <div className="flex items-center gap-1.5 text-xs text-[#647168] font-mono">
          <Zap className="w-3.5 h-3.5 text-[#92B76B]" />
          <span>Cost: <strong>{tool.creditCost}</strong> {tool.creditCost === 1 ? 'Credit' : 'Credits'}</span>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !hasEnoughCredits}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
            hasEnoughCredits
              ? 'bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] active:scale-[0.98]'
              : 'bg-[#F7F8F2] text-[#647168] border border-[#E1E7D9] cursor-not-allowed'
          } ${isGenerating ? 'opacity-80 cursor-wait' : ''}`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#17231C]" />
              Generating with AI Engine...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-[#17231C]" />
              Generate Content
            </>
          )}
        </button>
      </div>

      {!hasEnoughCredits && (
        <p className="text-xs text-rose-600 text-right font-medium">
          Insufficient credits ({userCredits} remaining). Please upgrade your plan or wait for credit reload.
        </p>
      )}
    </form>
  );
};
