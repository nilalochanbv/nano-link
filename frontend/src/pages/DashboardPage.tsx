import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { useToast } from '../contexts/ToastContext';
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  X,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UrlRecord {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  clickCount: number;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'clickCount'>('createdAt');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  
  const [selectedUrl, setSelectedUrl] = useState<UrlRecord | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ shortUrl: string; qrDataUrl: string } | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);

  // Form states
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  const [editLongUrl, setEditLongUrl] = useState('');
  const [editCustomAlias, setEditCustomAlias] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Queries
  const { data: urlsData, isLoading, isError } = useQuery({
    queryKey: ['urls'],
    queryFn: async () => {
      const res = await api.get('/urls');
      return res.data.data.urls as UrlRecord[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/urls', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      toast('Link Shortened!', 'Short link created successfully.', 'success');
      setIsCreateOpen(false);
      resetCreateForm();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to shorten URL';
      toast('Error shortening link', msg, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.patch(`/urls/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      toast('Link Updated!', 'Short link details modified.', 'success');
      setIsEditOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update URL';
      toast('Error updating link', msg, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/urls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      toast('Link Deleted', 'Short link deleted successfully.', 'success');
    },
    onError: (err: any) => {
      toast('Error deleting link', err.response?.data?.message || 'Failed to delete.', 'error');
    },
  });

  // Action helpers
  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5001';

  const handleCopy = (id: string, codeOrAlias: string) => {
    const url = `${backendBaseUrl}/r/${codeOrAlias}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast('Copied!', 'Short URL copied to clipboard.', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFetchQr = async (urlRecord: UrlRecord) => {
    setSelectedUrl(urlRecord);
    setIsQrOpen(true);
    setIsLoadingQr(true);
    setQrCodeData(null);
    try {
      const code = urlRecord.customAlias || urlRecord.shortCode;
      const res = await api.get(`/qr/${code}`);
      setQrCodeData(res.data.data);
    } catch (err) {
      toast('QR Code Error', 'Failed to retrieve QR code image.', 'error');
      setIsQrOpen(false);
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeData) return;
    const link = document.createElement('a');
    link.href = qrCodeData.qrDataUrl;
    link.download = `qr-${selectedUrl?.customAlias || selectedUrl?.shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Downloaded', 'QR Code saved to device.', 'success');
  };

  const handleOpenEdit = (urlRecord: UrlRecord) => {
    setSelectedUrl(urlRecord);
    setEditLongUrl(urlRecord.originalUrl);
    setEditCustomAlias(urlRecord.customAlias || '');
    setEditExpiryDate(urlRecord.expiryDate ? new Date(urlRecord.expiryDate).toISOString().slice(0, 16) : '');
    setEditIsActive(urlRecord.isActive);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;
    
    createMutation.mutate({
      originalUrl: longUrl,
      customAlias: customAlias || null,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUrl) return;

    updateMutation.mutate({
      id: selectedUrl.id,
      payload: {
        originalUrl: editLongUrl,
        customAlias: editCustomAlias || null,
        expiryDate: editExpiryDate ? new Date(editExpiryDate).toISOString() : null,
        isActive: editIsActive,
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this short URL? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const resetCreateForm = () => {
    setLongUrl('');
    setCustomAlias('');
    setExpiryDate('');
  };

  // Filter and sort computation
  const filteredUrls = (urlsData || []).filter((url) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      url.originalUrl.toLowerCase().includes(searchString) ||
      url.shortCode.toLowerCase().includes(searchString) ||
      (url.customAlias && url.customAlias.toLowerCase().includes(searchString));

    const matchesStatus =
      filterActive === 'all' ||
      (filterActive === 'active' && url.isActive) ||
      (filterActive === 'inactive' && !url.isActive);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.clickCount - a.clickCount;
  });

  // Aggregate Stats (computed or from service)
  const totalLinks = urlsData?.length || 0;
  const activeLinks = urlsData?.filter((u) => u.isActive).length || 0;
  const totalClicks = urlsData?.reduce((acc, u) => acc + u.clickCount, 0) || 0;
  
  let mostPopularLink: UrlRecord | null = null;
  if (urlsData && urlsData.length > 0) {
    mostPopularLink = urlsData.reduce((prev, current) =>
      prev.clickCount > current.clickCount ? prev : current
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Links</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Shorten, brand, and track redirection metrics.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-sm px-5 py-3 flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/15 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Link
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Links', value: totalLinks, icon: Link2, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Total Clicks', value: totalClicks, icon: ArrowUpDown, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Active Links', value: activeLinks, icon: Sparkles, color: 'text-amber-500 bg-amber-500/10' },
          {
            label: 'Top Link Clicks',
            value: mostPopularLink ? mostPopularLink.clickCount : 0,
            subtext: mostPopularLink ? `/${mostPopularLink.customAlias || mostPopularLink.shortCode}` : 'None',
            icon: QrCode,
            color: 'text-rose-500 bg-rose-500/10'
          },
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${c.color} shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{c.label}</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold">{c.value}</h3>
                  {c.subtext && (
                    <span className="text-xs text-slate-405 dark:text-slate-450 font-semibold truncate max-w-[100px]" title={c.subtext}>
                      {c.subtext}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Actions Panel */}
      <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400" />
          <input
            type="text"
            placeholder="Search links, aliases or shortcodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs py-2 px-3 focus:outline-none"
            >
              <option value="createdAt">Sort: Created Date</option>
              <option value="clickCount">Sort: Total Clicks</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs py-2 px-3 focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="active">Status: Active</option>
            <option value="inactive">Status: Inactive</option>
          </select>
        </div>
      </div>

      {/* Links List / Table */}
      <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent"></div>
            <p className="text-xs">Loading links...</p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-rose-500 font-semibold text-sm">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Failed to retrieve URLs.
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center max-w-sm mx-auto">
            <Link2 className="h-10 w-10 text-indigo-500/40 mb-4 bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-full box-content" />
            <h3 className="font-bold text-base">No links found</h3>
            <p className="text-xs text-slate-505 dark:text-slate-450 mt-1">
              Shorten links or clear your current query filters to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Original Destination</th>
                  <th className="py-4 px-6">Short Link</th>
                  <th className="py-4 px-6 text-center">Clicks</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {filteredUrls.map((url) => {
                  const displayCode = url.customAlias || url.shortCode;
                  const shortUrlLink = `${backendBaseUrl}/r/${displayCode}`;
                  return (
                    <tr key={url.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-850/20 transition-colors">
                      {/* Destination URL */}
                      <td className="py-4 px-6 max-w-xs md:max-w-sm lg:max-w-md">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-850 dark:text-slate-200 truncate" title={url.originalUrl}>
                            {url.originalUrl}
                          </span>
                          <span className="text-xs text-slate-450 mt-1">
                            Created: {new Date(url.createdAt).toLocaleDateString()}
                            {url.expiryDate && ` • Expires: ${new Date(url.expiryDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      </td>

                      {/* Short Link */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-650 dark:text-indigo-400">
                          <a
                            href={shortUrlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            /{displayCode}
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        </div>
                      </td>

                      {/* Clicks */}
                      <td className="py-4 px-6 text-center font-bold text-slate-800 dark:text-slate-200">
                        {url.clickCount}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            url.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {url.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Copy */}
                          <button
                            onClick={() => handleCopy(url.id, displayCode)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                            title="Copy link"
                          >
                            {copiedId === url.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </button>

                          {/* QR */}
                          <button
                            onClick={() => handleFetchQr(url)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600"
                            title="Preview QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(url)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600"
                            title="Edit Link"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(url.id)}
                            className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600"
                            title="Delete link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE LINK MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-5">
                <h3 className="font-bold text-lg">Shorten a new link</h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Destination URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://github.com/google/gemini"
                    className="w-full rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-605"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Custom Alias (Optional)
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-l-xl text-xs font-semibold text-slate-500 border-y border-l border-slate-200 dark:border-slate-800">
                      /r/
                    </span>
                    <input
                      type="text"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      placeholder="my-cool-link"
                      className="flex-1 rounded-r-xl px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-605"
                    />
                  </div>
                  <p className="text-[10px] text-slate-450 mt-1">Alphanumeric, hyphens, and underscores allowed.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400" />
                    <input
                      type="datetime-local"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-605"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl border border-slate-205 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center gap-2"
                  >
                    {createMutation.isPending && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    Create Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT LINK MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4 mb-5">
                <h3 className="font-bold text-lg">Edit short URL settings</h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Original Destination URL
                  </label>
                  <input
                    type="url"
                    required
                    value={editLongUrl}
                    onChange={(e) => setEditLongUrl(e.target.value)}
                    placeholder="https://github.com/google/gemini"
                    className="w-full rounded-xl px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-605"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Custom Alias
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-l-xl text-xs font-semibold text-slate-505 border-y border-l border-slate-200 dark:border-slate-800">
                      /r/
                    </span>
                    <input
                      type="text"
                      value={editCustomAlias}
                      onChange={(e) => setEditCustomAlias(e.target.value)}
                      placeholder="my-cool-link"
                      className="flex-1 rounded-r-xl px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-605"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Expiration Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400" />
                    <input
                      type="datetime-local"
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                      className="w-full rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-605"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActiveCheck" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Active Link (Allows redirections)
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-850 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-xl border border-slate-205 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center gap-2"
                  >
                    {updateMutation.isPending && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR CODE PREVIEW MODAL */}
      <AnimatePresence>
        {isQrOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQrOpen(false)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center"
            >
              <button
                onClick={() => setIsQrOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="font-bold text-lg mb-4 text-center">QR Code Preview</h3>

              {isLoadingQr ? (
                <div className="h-48 w-48 flex items-center justify-center border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-950 dark:border-slate-800">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                </div>
              ) : qrCodeData ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white shadow-md">
                    <img
                      src={qrCodeData.qrDataUrl}
                      alt="QR Code Representation"
                      className="h-48 w-48 block"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-505 dark:text-slate-450 uppercase">Link URL</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[280px]">
                      {qrCodeData.shortUrl}
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadQr}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white py-3 font-semibold text-xs transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download PNG
                  </button>
                </div>
              ) : (
                <div className="text-xs text-rose-500 font-semibold">
                  Failed to fetch QR details.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
