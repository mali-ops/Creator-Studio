import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  Sliders,
  Bell,
  Lock,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout, deleteAccount, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const { theme, setTheme } = useTheme();

  const [defaultLang, setDefaultLang] = useState(user?.defaultLanguage || 'English');
  const [defaultTone, setDefaultTone] = useState(user?.defaultTone || 'Engaging & Authentic');
  const [temperature, setTemperature] = useState(0.7);

  // Notifications
  const [calendarAlerts, setCalendarAlerts] = useState(true);
  const [creditAlerts, setCreditAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  // Delete Account Confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      themePreference: theme,
      defaultLanguage: defaultLang,
      defaultTone,
    });
    success('Settings Updated', 'Your generation preferences and theme were saved.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toastError('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }
    setCurrentPw('');
    setNewPw('');
    success('Password Updated', 'Your security credentials have been updated.');
  };

  const handleDeleteAccount = () => {
    if (isAdmin) {
      toastError(
        'Action Forbidden: Superadmin Root Account',
        'Superadmin accounts are strictly immutable and protected by platform security policy. To manage or delete creator accounts, please use the Admin Control Panel.'
      );
      setDeleteConfirmOpen(false);
      return;
    }

    if (deleteInput !== 'DELETE MY ACCOUNT') {
      toastError('Confirmation Mismatch', 'Please type the exact confirmation phrase: DELETE MY ACCOUNT');
      return;
    }

    const res = deleteAccount();
    if (res.success) {
      success('Account Permanently Deleted', 'Your profile and workspace data have been completely wiped.');
    } else {
      toastError('Deletion Failed', res.message);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 text-[#17231C] animate-page-enter">
      <div className="border-b border-[#E1E7D9] pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] mb-1">
          <Settings className="w-3.5 h-3.5" />
          Module 17 · Preferences & Security
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Application Settings</h1>
        <p className="text-xs text-[#647168] mt-0.5">
          Configure appearance, AI model creativity temperature, notifications, and security protocols.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance & Theme */}
        <div className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#92B76B]" />
            Appearance & Visual Theme
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark Mode (Deep Forest)', icon: Moon },
              { id: 'light', label: 'Creator Editorial (Cream)', icon: Sun },
              { id: 'system', label: 'System Default', icon: Laptop },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id as any);
                    updateProfile({ themePreference: t.id as any });
                    success('Theme Applied', `Switched theme to ${t.label}.`);
                  }}
                  className={`p-3.5 rounded-2xl border text-center text-xs font-semibold flex flex-col items-center justify-center gap-2 transition-all ${
                    theme === t.id
                      ? 'bg-[#17231C] text-[#D9F36B] border-[#17231C] shadow-xs'
                      : 'bg-[#F7F8F2] border-[#E1E7D9] text-[#647168] hover:text-[#17231C] hover:border-[#17231C]/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Generation Preferences */}
        <form onSubmit={handleSavePreferences} className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#92B76B]" />
            Default AI Model & Generation Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Default Language</label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:border-[#17231C] focus:bg-[#FFFFFF] focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Urdu">Urdu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231C] mb-1.5">Default Tone</label>
              <input
                type="text"
                value={defaultTone}
                onChange={(e) => setDefaultTone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:border-[#17231C] focus:bg-[#FFFFFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#17231C]">
                Creativity & Temperature: <span className="font-mono text-[#92B76B] font-bold">{temperature}</span>
              </label>
              <span className="text-[11px] text-[#647168]">
                {temperature < 0.5 ? 'Conservative & Structured' : temperature > 0.8 ? 'Highly Creative & Varied' : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#17231C] cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#17231C] hover:bg-[#101612] text-[#D9F36B] transition-all shadow-xs"
            >
              Save Generation Defaults
            </button>
          </div>
        </form>

        {/* Notifications */}
        <div className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#17231C] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#92B76B]" />
            Notification Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] cursor-pointer hover:border-[#17231C]/30 transition-colors">
              <div>
                <div className="text-xs font-semibold text-[#17231C]">Publishing Reminders</div>
                <div className="text-[11px] text-[#647168]">In-app notifications 30 minutes before scheduled calendar posts</div>
              </div>
              <input
                type="checkbox"
                checked={calendarAlerts}
                onChange={(e) => setCalendarAlerts(e.target.checked)}
                className="rounded accent-[#17231C] w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9] cursor-pointer hover:border-[#17231C]/30 transition-colors">
              <div>
                <div className="text-xs font-semibold text-[#17231C]">Credit Balance Warning</div>
                <div className="text-[11px] text-[#647168]">Notify when remaining balance drops below 10 credits</div>
              </div>
              <input
                type="checkbox"
                checked={creditAlerts}
                onChange={(e) => setCreditAlerts(e.target.checked)}
                className="rounded accent-[#17231C] w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="p-6 rounded-3xl border border-rose-200 bg-rose-50/50 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h3>
          <p className="text-xs text-rose-900/80 leading-relaxed">
            Permanently delete your account and all associated brand voices, saved content items, and calendar schedules. If you are the owner of a team workspace, ownership must be transferred prior to deletion.
          </p>

          {deleteConfirmOpen ? (
            <div className="p-4 rounded-2xl bg-white border border-rose-200 space-y-3">
              <div className="text-xs text-rose-800">
                Type <strong className="font-mono text-rose-900">DELETE MY ACCOUNT</strong> to confirm:
              </div>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-3 py-2 text-xs bg-rose-50/40 border border-rose-300 rounded-xl text-rose-900 focus:outline-none focus:border-rose-600"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#647168] hover:text-[#17231C]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirm Permanent Deletion
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
