import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage } from '../services/storage.ts';
import { Project, ContentItem, CalendarEntry } from '../types/index.ts';
import {
  FolderKanban,
  Plus,
  Search,
  Trash2,
  Archive,
  Layers,
  Calendar,
  ExternalLink,
  Edit2,
  Copy,
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigateToStudio?: (prefilledTopic: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigateToStudio }) => {
  const { user, isAdmin, isOwner } = useAuth();
  const { success } = useToast();

  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => projects[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectPlatform, setProjectPlatform] = useState('Cross-Platform');
  const [clientName, setClientName] = useState('');
  const [colorCode, setColorCode] = useState('#06b6d4');
  const [brandVoiceId, setBrandVoiceId] = useState('');

  const brandVoices = storage.getBrandVoices();
  const allContent = storage.getContentItems();
  const allCalendar = storage.getCalendarEntries();

  const filteredProjects = projects.filter(
    (p) => {
      // Privacy Isolation: Clients can only see their own projects
      if (!isAdmin && !isOwner && user && p.userId !== user.id) {
        return false;
      }
      return (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectContent = allContent.filter((c) => c.projectId === selectedProjectId);
  const projectCalendar = allCalendar.filter((c) => c.projectId === selectedProjectId);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !user) return;

    const newProj: Project = {
      id: `proj_${Date.now()}`,
      userId: user.id,
      name: projectName.trim(),
      description: projectDesc.trim(),
      platform: projectPlatform,
      clientName: clientName.trim() || undefined,
      colorCode,
      brandVoiceId: brandVoiceId || undefined,
      isArchived: false,
      itemsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = storage.saveProject(newProj);
    setProjects(updated);
    setSelectedProjectId(newProj.id);
    setShowModal(false);
    setProjectName('');
    setProjectDesc('');
    setClientName('');
    success('Project Created', `"${newProj.name}" is now active.`);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const updated = storage.deleteProject(id);
    setProjects(updated);
    setSelectedProjectId(updated[0]?.id || null);
    success('Project Deleted');
  };

  const handleArchiveProject = (proj: Project) => {
    const updated = storage.saveProject({ ...proj, isArchived: !proj.isArchived });
    setProjects(updated);
    success(proj.isArchived ? 'Project Restored' : 'Project Archived');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#17231C] animate-page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E7D9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#92B76B] font-semibold mb-1">
            <FolderKanban className="w-3.5 h-3.5" />
            Module 12 · Projects & Client Folders
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#17231C]">Project Workspaces</h1>
          <p className="text-xs text-[#647168] mt-0.5">
            Organize campaigns by client, product line, or channel. Group saved assets and calendar schedules.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] flex items-center gap-1.5 shadow-2xs transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Projects Shelf */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#647168] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#E1E7D9] rounded-xl text-[#17231C] placeholder-[#647168]/60 focus:outline-none focus:border-[#17231C] shadow-2xs"
            />
          </div>

          <div className="space-y-2">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between shadow-2xs ${
                  selectedProjectId === p.id
                    ? 'bg-[#17231C] border-[#17231C] text-[#F4F2E9] shadow-md'
                    : 'bg-[#FFFFFF] border-[#E1E7D9] hover:border-[#17231C] text-[#17231C]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.colorCode || '#92B76B' }}
                    />
                    <span className="font-bold text-xs truncate max-w-[180px]">
                      {p.name}
                    </span>
                  </div>
                  <div className={`text-[11px] ${selectedProjectId === p.id ? 'text-[#BECABE]' : 'text-[#647168]'}`}>
                    {p.clientName ? `Client: ${p.clientName}` : p.platform}
                  </div>
                </div>

                <div className="text-[10px] font-mono">
                  {p.isArchived && <span className="text-amber-500 font-bold">[Archived]</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Project Workspace Detail */}
        <div className="lg:col-span-8">
          {selectedProject ? (
            <div className="space-y-6">
              <div className="p-6 sm:p-7 rounded-3xl border border-[#E1E7D9] bg-[#FFFFFF] shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E1E7D9] pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-10 rounded-full"
                      style={{ backgroundColor: selectedProject.colorCode || '#92B76B' }}
                    />
                    <div>
                      <h2 className="text-xl font-bold font-display text-[#17231C]">{selectedProject.name}</h2>
                      <p className="text-xs text-[#647168]">{selectedProject.description || 'No description provided.'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleArchiveProject(selectedProject)}
                      className="p-2 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-[#647168] hover:text-[#17231C]"
                      title={selectedProject.isArchived ? 'Restore' : 'Archive'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(selectedProject.id)}
                      className="p-2 rounded-xl border border-[#E1E7D9] bg-[#F7F8F2] text-[#647168] hover:text-rose-600"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-[#647168]">
                  <span>Platform: <strong className="text-[#17231C]">{selectedProject.platform || 'General'}</strong></span>
                  <span>·</span>
                  <span>Client: <strong className="text-[#17231C]">{selectedProject.clientName || 'Internal'}</strong></span>
                  <span>·</span>
                  <span>Created: <strong className="text-[#17231C]">{new Date(selectedProject.createdAt).toLocaleDateString()}</strong></span>
                </div>
              </div>

              {/* Linked Content Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#647168] flex items-center gap-1.5 font-bold">
                    <Layers className="w-3.5 h-3.5 text-[#92B76B]" />
                    Linked Content Assets ({projectContent.length})
                  </h3>
                  {onNavigateToStudio && (
                    <button
                      onClick={() => onNavigateToStudio(selectedProject.name)}
                      className="text-xs text-[#17231C] hover:underline flex items-center gap-1 font-bold"
                    >
                      Generate for this project →
                    </button>
                  )}
                </div>

                {projectContent.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#E1E7D9] bg-[#FFFFFF]/70 rounded-2xl text-xs text-[#647168]">
                    No content saved to this project yet. Assign content items during generation.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectContent.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-[#E1E7D9] bg-[#FFFFFF] flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-[#17231C]">{item.title}</div>
                          <div className="text-[11px] text-[#647168] line-clamp-1 mt-0.5">{item.generatedOutput}</div>
                        </div>
                        <span className="text-[10px] font-mono text-[#17231C] font-semibold px-2.5 py-0.5 rounded-full bg-[#F7F8F2] border border-[#E1E7D9]">
                          {item.platform}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Calendar Entries */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#647168] flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#92B76B]" />
                  Scheduled Milestones ({projectCalendar.length})
                </h3>

                {projectCalendar.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[#E1E7D9] bg-[#FFFFFF]/70 rounded-2xl text-xs text-[#647168]">
                    No scheduled calendar entries linked to this project.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectCalendar.map((cal) => (
                      <div
                        key={cal.id}
                        className="p-3.5 rounded-xl border border-[#E1E7D9] bg-[#FFFFFF] flex items-center justify-between text-xs shadow-2xs"
                      >
                        <span className="font-bold text-[#17231C]">{cal.title}</span>
                        <div className="flex items-center gap-3 font-mono text-[11px] text-[#647168]">
                          <span>{cal.scheduledDate}</span>
                          <span className="text-[#17231C] font-bold">{cal.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-[#E1E7D9] bg-[#FFFFFF]/70 rounded-3xl text-xs text-[#647168]">
              Select or create a project to inspect its linked assets.
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101612]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E1E7D9] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-[#17231C] animate-modal-pop">
            <h3 className="text-base font-bold font-display text-[#17231C]">Create New Project Folder</h3>
            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Q4 Product Launch Campaign"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Briefly state project objectives..."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Client Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Acme Corp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231C] mb-1">Platform Focus</label>
                  <select
                    value={projectPlatform}
                    onChange={(e) => setProjectPlatform(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F7F8F2] border border-[#E1E7D9] rounded-xl text-[#17231C] focus:bg-[#FFFFFF] focus:border-[#17231C] focus:outline-none font-medium"
                  >
                    <option value="Cross-Platform">Cross-Platform</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231C] mb-1">Color Marker</label>
                <div className="flex gap-2">
                  {['#92B76B', '#D9F36B', '#17231C', '#3b82f6', '#ec4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorCode(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        colorCode === c ? 'scale-110 border-[#17231C]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E1E7D9]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#647168] hover:text-[#17231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#D9F36B] hover:bg-[#c6e255] text-[#17231C] border border-[#c5e452] shadow-2xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
