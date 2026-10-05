import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import {
  User,
  Mail,
  Building,
  Globe,
  Download,
  ShieldCheck,
  Check,
  Camera,
  ExternalLink,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [company, setCompany] = useState(user?.company || '');
  const [country, setCountry] = useState(user?.country || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [creatorType, setCreatorType] = useState(user?.creatorType || 'Solo Creator & Founder');
  const [industry, setIndustry] = useState(user?.industry || 'Tech & B2B SaaS');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toastError('Name Required', 'Please enter your full name.');
      return;
    }

    updateProfile({
      fullName: fullName.trim(),
      avatarUrl: avatarUrl.trim(),
      company: company.trim(),
      country: country.trim(),
      bio: bio.trim(),
      creatorType,
      industry,
    });

    success('Profile Updated', 'Your creator identity and public details are saved.');
  };

  const handleExportData = () => {
    const rawData = storage.exportAllUserData();
    const blob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-studio-data-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Data Export Generated', 'Downloaded full JSON archive of your account data.');
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 text-[#17231C] animate-page-enter">
      <div className="border-b border-[#E1E7D9] pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] mb-1">
          <User className="w-3.5 h-3.5" />
          Module 16 · Profile & Portability
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Creator Identity & Account Data</h1>
        <p className="text-xs text-[#647168] mt-0.5">
          Manage your verified credentials, creator niche, and export your entire workspace content repository.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Avatar Card & Export */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#17231C]/15 bg-[#17231C] text-[#D9F36B] flex items-center justify-center font-bold text-2xl shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  fullName.charAt(0) || 'U'
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base text-[#17231C]">{user?.fullName}</h3>
              <p className="text-xs text-[#647168] mt-0.5">{user?.creatorType}</p>
            </div>

            <div className="pt-2 border-t border-[#E1E7D9] flex items-center justify-center gap-1.5 text-xs text-[#92B76B] font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Session</span>
            </div>
          </div>

          {/* Account Data Export */}
          <div className="p-5 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17231C] flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-[#92B76B]" />
              Data Portability
            </h4>
            <p className="text-xs text-[#647168] leading-relaxed">
              Export your entire account archive including brand voices, projects, saved content, versions, and calendar entries in standard JSON format.
            </p>
            <button
              onClick={handleExportData}
              className="w-full py-2.5 rounded-xl border border-[#E1E7D9] hover:border-[#17231C] text-xs font-semibold text-[#17231C] bg-[#F7F8F2] hover:bg-[#FFFFFF] transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Complete Archive
            </button>
          </div>
        </div>

        {/* Right: Profile Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-[#17231C] mb-2">Edit Creator Details</h3>

            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#647168] absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#647168] cursor-not-allowed font-mono"
                />
              </div>
              <span className="text-[11px] text-[#647168] mt-1 block">Verified identity provider address</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Full Display Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Company / Studio</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Apex Studio"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Country / Region</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., United States"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Creator Archetype</label>
                <input
                  type="text"
                  value={creatorType}
                  onChange={(e) => setCreatorType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Industry / Niche</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Biography / Personal Mission</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly state your creative focus and channels..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] shadow-xs transition-all"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
