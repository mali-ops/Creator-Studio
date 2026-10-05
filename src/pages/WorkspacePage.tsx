import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWorkspace } from '../context/WorkspaceContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { WorkspaceRole } from '../types/index.ts';
import {
  Users,
  Building2,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  Check,
  Clock,
  Lock,
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const {
    currentWorkspace,
    currentRole,
    members,
    invites,
    inviteMember,
    removeMember,
    canManageTeam,
  } = useWorkspace();
  const { success, error: toastError } = useToast();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.includes('@')) {
      toastError('Invalid Email', 'Please provide a valid teammate email address.');
      return;
    }

    inviteMember(inviteEmail.trim(), inviteRole);
    setInviteEmail('');
    setShowInviteModal(false);
    success('Invitation Dispatched', `Invitation sent to ${inviteEmail} as ${inviteRole}.`);
  };

  const handleRemove = (memberId: string, memberName: string) => {
    if (!canManageTeam) {
      toastError('Permission Denied', 'Only Owners and Admins can manage team members.');
      return;
    }
    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) return;
    removeMember(memberId);
    success('Member Removed', `${memberName} was removed from the workspace.`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#17231C] animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            Module 14 · Agency & Team Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">
            Workspace: {currentWorkspace?.name || 'Agency Space'}
          </h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Role-based collaboration with Owner, Admin, Editor, and Viewer permissions. Shared brand voices and client deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E1E7D9] text-[#17231C] shadow-2xs font-semibold">
            Your Role: <strong className="text-[#92B76B] uppercase">{currentRole}</strong>
          </div>

          {canManageTeam && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] flex items-center gap-1.5 shadow-2xs transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              Invite Teammate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Members */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-display text-[#17231C] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#92B76B]" />
              Workspace Members ({members.length})
            </h3>

            <div className="divide-y divide-[#E1E7D9]">
              {members.map((member) => (
                <div key={member.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#17231C] text-[#F4F2E9] flex items-center justify-center font-bold overflow-hidden text-xs">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                        member.fullName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-[#17231C] flex items-center gap-2">
                        {member.fullName}
                        {member.userId === user?.id && (
                          <span className="text-[10px] font-mono text-[#92B76B] font-bold">(You)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#647168]">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                        member.role === 'owner'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : member.role === 'admin'
                          ? 'bg-[#17231C] text-[#F4F2E9] border-[#17231C]'
                          : 'bg-[#F7F8F2] text-[#647168] border-[#E1E7D9]'
                      }`}
                    >
                      {member.role}
                    </span>

                    {canManageTeam && member.role !== 'owner' && member.userId !== user?.id && (
                      <button
                        onClick={() => handleRemove(member.id, member.fullName)}
                        className="p-1 text-[#647168] hover:text-rose-600 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations */}
          {invites.length > 0 && (
            <div className="p-6 sm:p-7 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
              <h3 className="text-sm font-bold font-display text-[#17231C] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending Invitations ({invites.length})
              </h3>

              <div className="divide-y divide-[#E1E7D9]">
                {invites.map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#17231C]">{inv.email}</div>
                      <div className="text-[11px] text-[#647168]">
                        Invited as <span className="uppercase font-mono font-bold text-[#17231C]">{inv.role}</span> by {inv.invitedByName || 'Admin'}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: RBAC Permission Matrix Guide */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#647168] flex items-center gap-2 font-bold">
              <Shield className="w-4 h-4 text-[#92B76B]" />
              Role Permission Matrix
            </h3>

            <div className="space-y-2.5 text-xs text-[#17231C]">
              <div className="p-3 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <div className="font-bold text-amber-800 uppercase font-mono text-[11px]">Owner</div>
                <div className="text-[11px] text-[#647168] mt-0.5">Full control over billing, plan upgrades, workspace deletion, and member roles.</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <div className="font-bold text-[#17231C] uppercase font-mono text-[11px]">Admin</div>
                <div className="text-[11px] text-[#647168] mt-0.5">Can invite members, manage client projects, and configure brand voices.</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <div className="font-bold text-[#17231C] uppercase font-mono text-[11px]">Editor</div>
                <div className="text-[11px] text-[#647168] mt-0.5">Can generate AI content, edit calendar entries, and save deliverables.</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F8F2] border border-[#E1E7D9]">
                <div className="font-bold text-[#647168] uppercase font-mono text-[11px]">Viewer</div>
                <div className="text-[11px] text-[#647168] mt-0.5">Read-only access to saved content and calendar schedules (ideal for clients).</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-[#17231C] animate-modal-pop">
            <h3 className="text-base font-bold font-display text-[#17231C] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#92B76B]" />
              Invite Teammate to Workspace
            </h3>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Teammate Email</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@agency.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                >
                  <option value="admin">Admin (Can invite and manage projects)</option>
                  <option value="editor">Editor (Can create and edit content)</option>
                  <option value="viewer">Viewer (Read-only review access)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E1E7D9]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#647168] hover:text-[#17231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] shadow-2xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
