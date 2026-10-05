import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { storage, isOwnerUser, isAdminUser } from '../services/storage.ts';
import { MediaPhotoAsset } from '../types/index.ts';
import {
  Image,
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Download,
  Copy,
  Check,
  Shield,
  Crown,
  Lock,
  Eye,
  Sparkles,
  Info,
  Calendar,
  User,
  X,
} from 'lucide-react';

export const PhotosPage: React.FC = () => {
  const { user, isAdmin, isOwner } = useAuth();
  const { success, error: toastError } = useToast();

  const [photos, setPhotos] = useState<MediaPhotoAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [viewingPhoto, setViewingPhoto] = useState<MediaPhotoAsset | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // New Photo Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<MediaPhotoAsset['category']>('social');
  const [newNotes, setNewNotes] = useState('');

  const samplePresets = [
    { title: 'SaaS Dashboard Mockup', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', cat: 'product' as const },
    { title: 'Viral Strategy Infographic', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', cat: 'social' as const },
    { title: 'Tech Founder Brand Banner', url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80', cat: 'banner' as const },
    { title: 'AI Engineering Workflow', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', cat: 'profile' as const },
  ];

  const loadPhotos = () => {
    if (!user) return;
    const list = storage.getFilteredPhotoAssets(user);
    setPhotos(list);
  };

  useEffect(() => {
    loadPhotos();
  }, [user]);

  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch =
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;

    let matchesUser = true;
    if (selectedUserFilter === 'mine') {
      matchesUser = photo.userId === user?.id;
    } else if (selectedUserFilter === 'clients_only') {
      matchesUser = photo.userRole === 'creator' || photo.userRole === 'agency_owner';
    }

    return matchesSearch && matchesCategory && matchesUser;
  });

  const handleCreatePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newUrl.trim()) return;

    const newAsset: MediaPhotoAsset = {
      id: `photo_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      userRole: user.role,
      title: newTitle.trim(),
      url: newUrl.trim(),
      category: newCategory,
      dimensions: '1920x1080',
      fileSize: '1.2 MB',
      notes: newNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    storage.savePhotoAsset(newAsset);
    loadPhotos();
    setShowUploadModal(false);
    setNewTitle('');
    setNewUrl('');
    setNewNotes('');
    success('Photo Saved', 'Asset added to your media vault.');
  };

  const handleDeletePhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    if (!window.confirm('Are you sure you want to permanently delete this photo?')) return;

    const res = storage.deletePhotoAsset(id, user);
    if (res.success) {
      loadPhotos();
      if (viewingPhoto?.id === id) setViewingPhoto(null);
      success('Photo Deleted', res.message);
    } else {
      toastError('Delete Failed', res.message);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    success('URL Copied', 'Photo asset URL copied to clipboard.');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-[#17231C] dark:text-[#F4F2E9]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#1A251E] p-5 sm:p-6 rounded-3xl border border-[#E1E7D9] dark:border-[#27382D] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#17231C] dark:bg-[#24372A] text-[#D9F36B]">
              <Image className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#17231C] dark:text-[#FFFFFF]">
              Photos & Media Vault
            </h1>
          </div>
          <p className="text-xs text-[#647168] dark:text-[#8FA496] max-w-2xl leading-relaxed">
            Centralized media library for social carousels, video thumbnails, product graphics, and creative assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#17231C] dark:bg-[#24372A] hover:bg-[#101612] dark:hover:bg-[#2E4535] text-[#D9F36B] text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Strict Privacy Badge / Access Status */}
      <div className="p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 bg-white dark:bg-[#141C16] border-[#E1E7D9] dark:border-[#27382D]">
        <div className="flex items-center gap-2.5">
          {isOwner ? (
            <>
              <Crown className="w-4 h-4 text-[#D9F36B] shrink-0" />
              <div>
                <span className="font-bold text-[#17231C] dark:text-[#FFFFFF]">Platform Owner Full Visibility:</span>{' '}
                <span className="text-[#647168] dark:text-[#CAD7CE]">
                  You have full unconstrained access to inspect all client, administrator, and system visual assets.
                </span>
              </div>
            </>
          ) : isAdmin ? (
            <>
              <Shield className="w-4 h-4 text-[#92B76B] shrink-0" />
              <div>
                <span className="font-bold text-[#17231C] dark:text-[#FFFFFF]">Administrator Visibility:</span>{' '}
                <span className="text-[#647168] dark:text-[#CAD7CE]">
                  You can inspect Client photos and your own administrator photos. Private owner assets remain hidden.
                </span>
              </div>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-[#92B76B] shrink-0" />
              <div>
                <span className="font-bold text-[#17231C] dark:text-[#FFFFFF]">Client Isolated Privacy:</span>{' '}
                <span className="text-[#647168] dark:text-[#CAD7CE]">
                  Strict data isolation active. Only you can view your uploaded photos and generated media.
                </span>
              </div>
            </>
          )}
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F7F8F2] dark:bg-[#1C2820] text-[#17231C] dark:text-[#CAD7CE] shrink-0 border border-[#E1E7D9] dark:border-[#27382D]">
          {photos.length} Total Photos Visible
        </span>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#1A251E] p-3.5 rounded-2xl border border-[#E1E7D9] dark:border-[#27382D]">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#647168] dark:text-[#8FA496]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, owner, or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#F7F8F2] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] text-[#17231C] dark:text-[#FFFFFF] focus:outline-none focus:border-[#17231C] dark:focus:border-[#D9F36B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter photos by category"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#F7F8F2] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] text-[#17231C] dark:text-[#FFFFFF] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="social">Social Media</option>
            <option value="product">Product Graphics</option>
            <option value="banner">Banners</option>
            <option value="profile">Profile / Avatar</option>
            <option value="client_asset">Client Assets</option>
          </select>

          {/* Admin / Owner Scope Switcher */}
          {(isAdmin || isOwner) && (
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              aria-label="Filter photos by owner scope"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#F7F8F2] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] text-[#17231C] dark:text-[#FFFFFF] focus:outline-none"
            >
              <option value="all">All Visible Assets</option>
              <option value="clients_only">Client Photos Only</option>
              <option value="mine">My Uploads Only</option>
            </select>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] dark:bg-[#1A251E] rounded-3xl border border-[#E1E7D9] dark:border-[#27382D] p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F8F2] dark:bg-[#141C16] text-[#647168] dark:text-[#8FA496] flex items-center justify-center mx-auto">
            <Image className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17231C] dark:text-[#FFFFFF]">No photos found</h3>
            <p className="text-xs text-[#647168] dark:text-[#8FA496] mt-1 max-w-sm mx-auto">
              {searchQuery ? 'No images matched your search criteria.' : 'Upload your first visual asset to build your media vault.'}
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#17231C] dark:bg-[#24372A] text-[#D9F36B] text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setViewingPhoto(photo)}
              className="group bg-[#FFFFFF] dark:bg-[#1A251E] rounded-2xl border border-[#E1E7D9] dark:border-[#27382D] overflow-hidden hover:border-[#17231C] dark:hover:border-[#3E5C46] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col"
            >
              {/* Photo Thumbnail */}
              <div className="relative aspect-video w-full bg-[#141C16] overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#17231C]/80 text-[#D9F36B] backdrop-blur-xs">
                  {photo.category}
                </span>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-[#17231C]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white text-[#17231C] text-xs font-bold flex items-center gap-1 shadow-md">
                    <Eye className="w-3.5 h-3.5" />
                    Inspect
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-[#17231C] dark:text-[#FFFFFF] line-clamp-1 group-hover:text-[#92B76B] transition-colors">
                    {photo.title}
                  </h4>
                  {photo.notes && (
                    <p className="text-[11px] text-[#647168] dark:text-[#8FA496] line-clamp-1 mt-0.5">
                      {photo.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E1E7D9]/60 dark:border-[#27382D] flex items-center justify-between text-[10px] text-[#647168] dark:text-[#CAD7CE]">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <User className="w-3 h-3 text-[#92B76B] shrink-0" />
                    <span className="truncate font-medium">{photo.userName}</span>
                  </div>
                  <span className="font-mono text-[9px] shrink-0">{photo.dimensions || 'HD'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Photo Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 bg-[#17231C]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#1A251E] rounded-3xl border border-[#E1E7D9] dark:border-[#27382D] max-w-2xl w-full overflow-hidden shadow-2xl animate-modal-pop text-[#17231C] dark:text-[#F4F2E9]">
            <div className="relative aspect-video w-full bg-black">
              <img
                src={viewingPhoto.url}
                alt={viewingPhoto.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setViewingPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#D9F36B] text-[#101612]">
                      {viewingPhoto.category}
                    </span>
                    <span className="text-[11px] text-[#647168] dark:text-[#8FA496] font-mono">
                      {viewingPhoto.dimensions || '1920x1080'} • {viewingPhoto.fileSize || '1.2 MB'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#17231C] dark:text-[#FFFFFF]">
                    {viewingPhoto.title}
                  </h3>
                  {viewingPhoto.notes && (
                    <p className="text-xs text-[#647168] dark:text-[#CAD7CE] mt-1">
                      {viewingPhoto.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyUrl(viewingPhoto.url)}
                    className="p-2 rounded-xl border border-[#E1E7D9] dark:border-[#27382D] hover:bg-[#F7F8F2] dark:hover:bg-[#1C2820] text-xs font-semibold flex items-center gap-1.5"
                    title="Copy URL"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={viewingPhoto.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-[#E1E7D9] dark:border-[#27382D] hover:bg-[#F7F8F2] dark:hover:bg-[#1C2820] text-xs font-semibold"
                    title="Open Fullscreen"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {/* Delete button (Owner can delete; Admin can delete clients; Client can delete own) */}
                  <button
                    onClick={() => handleDeletePhoto(viewingPhoto.id)}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Creator details */}
              <div className="p-3 rounded-xl bg-[#F7F8F2] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#92B76B]" />
                  <span className="font-semibold text-[#17231C] dark:text-[#FFFFFF]">{viewingPhoto.userName}</span>
                  <span className="text-[#647168] dark:text-[#8FA496]">({viewingPhoto.userEmail})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#647168] dark:text-[#CAD7CE]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(viewingPhoto.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#17231C]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#1A251E] rounded-3xl border border-[#E1E7D9] dark:border-[#27382D] max-w-lg w-full p-6 shadow-2xl animate-modal-pop text-[#17231C] dark:text-[#F4F2E9] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7D9] dark:border-[#27382D]">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-[#92B76B]" />
                <h3 className="text-base font-bold text-[#17231C] dark:text-[#FFFFFF]">Upload Visual Asset</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-[#647168] hover:text-[#17231C] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePhoto} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647168] dark:text-[#CAD7CE] mb-1">
                  Photo Title / Headline
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Product Launch Hero Slide"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7F8F2] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] text-[#17231C] dark:text-[#FFFFFF] focus:outline-none focus:border-[#17231C] dark:focus:border-[#D9F36B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647168] dark:text-[#CAD7CE] mb-1">
                  Image Direct URL
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7F8F2] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] text-[#17231C] dark:text-[#FFFFFF] focus:outline-none focus:border-[#17231C] dark:focus:border-[#D9F36B]"
                />
              </div>

              {/* Sample Presets */}
              <div>
                <span className="block text-[10px] font-mono uppercase text-[#647168] dark:text-[#8FA496] mb-1.5">
                  Or pick a curated preset:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {samplePresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setNewTitle(preset.title);
                        setNewUrl(preset.url);
                        setNewCategory(preset.cat);
                      }}
                      className="p-2 rounded-xl border border-[#E1E7D9] dark:border-[#27382D] bg-[#F7F8F2] dark:bg-[#141C16] text-left hover:border-[#17231C] dark:hover:border-[#38523F] transition-all flex items-center gap-2"
                    >
                      <img src={preset.url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold truncate text-[#17231C] dark:text-[#FFFFFF]">{preset.title}</div>
                        <div className="text-[9px] text-[#647168] dark:text-[#8FA496] uppercase">{preset.cat}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647168] dark:text-[#CAD7CE] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7F8F2] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] text-[#17231C] dark:text-[#FFFFFF] focus:outline-none"
                  >
                    <option value="social">Social Media</option>
                    <option value="product">Product Graphics</option>
                    <option value="banner">Banner</option>
                    <option value="profile">Profile / Avatar</option>
                    <option value="client_asset">Client Asset</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#647168] dark:text-[#CAD7CE] mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g., Target: LinkedIn post"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F7F8F2] dark:bg-[#141C16] border border-[#E1E7D9] dark:border-[#27382D] text-[#17231C] dark:text-[#FFFFFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1E7D9] dark:border-[#27382D]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E1E7D9] dark:border-[#27382D] text-[#647168] dark:text-[#CAD7CE] hover:bg-[#F7F8F2] dark:hover:bg-[#1C2820]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#17231C] dark:bg-[#24372A] text-[#D9F36B] hover:bg-[#101612] dark:hover:bg-[#2E4535]"
                >
                  Save Photo Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
