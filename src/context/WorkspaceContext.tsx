import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, WorkspaceMember, WorkspaceInvite, WorkspaceRole } from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { useAuth } from './AuthContext.tsx';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentRole: WorkspaceRole;
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, description?: string) => Workspace;
  inviteMember: (email: string, role: WorkspaceRole) => void;
  removeMember: (memberId: string) => void;
  canEdit: boolean;
  canManageTeam: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);

  useEffect(() => {
    const list = storage.getWorkspaces();
    setWorkspaces(list);
    if (list.length > 0) {
      setCurrentWorkspace(list[0]);
      setMembers(storage.getWorkspaceMembers(list[0].id));
      setInvites(storage.getWorkspaceInvites(list[0].id));
    }
  }, [user]);

  const switchWorkspace = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (ws) {
      setCurrentWorkspace(ws);
      setMembers(storage.getWorkspaceMembers(ws.id));
      setInvites(storage.getWorkspaceInvites(ws.id));
    }
  };

  const createWorkspace = (name: string, description?: string): Workspace => {
    if (!user) throw new Error('Must be logged in to create workspace');
    const newWs: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      ownerId: user.id,
      role: 'owner',
      membersCount: 1,
      creditsPool: 300,
      createdAt: new Date().toISOString(),
    };
    const updated = storage.saveWorkspace(newWs);
    setWorkspaces(updated);
    setCurrentWorkspace(newWs);

    // Add owner as member
    const ownerMember: WorkspaceMember = {
      id: `wm_${Date.now()}`,
      workspaceId: newWs.id,
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: 'owner',
      avatarUrl: user.avatarUrl,
      joinedAt: new Date().toISOString(),
    };
    storage.addWorkspaceMember(ownerMember);
    setMembers([ownerMember]);

    return newWs;
  };

  const inviteMember = (email: string, role: WorkspaceRole) => {
    if (!currentWorkspace || !user) return;
    const invite: WorkspaceInvite = {
      id: `inv_${Date.now()}`,
      workspaceId: currentWorkspace.id,
      email,
      role,
      invitedBy: user.id,
      invitedByName: user.fullName,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updated = storage.createWorkspaceInvite(invite);
    setInvites(updated.filter((i) => i.workspaceId === currentWorkspace.id));
  };

  const removeMember = (memberId: string) => {
    storage.removeWorkspaceMember(memberId);
    if (currentWorkspace) {
      setMembers(storage.getWorkspaceMembers(currentWorkspace.id));
    }
  };

  // Find user's role in the current workspace
  const currentMember = members.find((m) => m.userId === user?.id);
  const currentRole: WorkspaceRole = currentMember ? currentMember.role : currentWorkspace?.role || 'owner';

  const canEdit = currentRole === 'owner' || currentRole === 'admin' || currentRole === 'editor';
  const canManageTeam = currentRole === 'owner' || currentRole === 'admin';

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        currentRole,
        members,
        invites,
        switchWorkspace,
        createWorkspace,
        inviteMember,
        removeMember,
        canEdit,
        canManageTeam,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};
