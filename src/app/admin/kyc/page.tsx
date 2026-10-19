"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  ExternalLink, 
  Eye, 
  Trash2, 
  X, 
  Loader2, 
  User, 
  Copy,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface KycRequest {
  id: string;
  user_id: string;
  country: string;
  document_type: string;
  document_number: string;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    walletId?: string;
    avatar_url?: string;
  };
}

export default function AdminKycPage() {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/kyc', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.requests) {
          setRequests(data.requests);
        }
      } else {
        toast.error("Failed to load KYC applications");
      }
    } catch (err) {
      console.error("KYC fetch error:", err);
      toast.error("Error loading KYC requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (applicationId: string, userId: string, action: 'approve' | 'reject' | 'pending') => {
    const actionLabel = action === 'approve' ? 'approve' : action === 'reject' ? 'reject' : 'reset';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this KYC application?`)) return;

    setProcessingId(applicationId);

    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, userId, action })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const targetStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';
        // Optimistic state update so there's zero UI lag
        setRequests(prev => prev.map(req => req.id === applicationId ? { ...req, status: targetStatus } : req));
        toast.success(`KYC application ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'updated'} successfully`);
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err) {
      toast.error("Error processing KYC action");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this KYC application record?")) return;

    try {
      const res = await fetch(`/api/admin/kyc?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
        toast.success("Application deleted");
      } else {
        toast.error("Failed to delete application");
      }
    } catch (e) {
      toast.error("Error deleting application");
    }
  };

  const downloadImage = (url: string, username: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `KYC_${username.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // Filtered List
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Status Filter
      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = (req.profiles?.full_name || '').toLowerCase();
        const email = (req.profiles?.email || '').toLowerCase();
        const uid = (req.profiles?.walletId || '').toLowerCase();
        const docNum = (req.document_number || '').toLowerCase();
        const country = (req.country || '').toLowerCase();
        const docType = (req.document_type || '').toLowerCase();

        const match = 
          fullName.includes(q) || 
          email.includes(q) || 
          uid.includes(q) || 
          docNum.includes(q) || 
          country.includes(q) || 
          docType.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  return (
    <div className="flex-1 w-full bg-[#f4f6f9] min-h-screen text-[#1a1a1a] p-6 lg:p-8 font-sans overflow-y-auto pb-28">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <FileCheck size={26} className="text-blue-600" />
            KYC Verification Applications
          </h1>
          <p className="text-[14px] text-neutral-500 mt-1">
            Review and manage submitted user identity documents and approval statuses.
          </p>
        </div>

        <button
          onClick={() => fetchRequests(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm self-start md:self-auto"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin text-blue-600" : ""} />
          <span>Refresh Applications</span>
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Total Applications</span>
            <span className="text-2xl font-black text-[#1a1a1a]">{metrics.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Awaiting Review</span>
            <span className="text-2xl font-black text-amber-500">{metrics.pending}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Approved & Verified</span>
            <span className="text-2xl font-black text-emerald-600">{metrics.approved}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1">Rejected</span>
            <span className="text-2xl font-black text-red-500">{metrics.rejected}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
            <XCircle size={20} />
          </div>
        </div>

      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Name, Email, UID, Doc Number, Country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fcfcfc] border border-gray-200 text-[#1a1a1a] text-sm rounded-lg pl-10 pr-9 py-2 outline-none focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All', count: metrics.total },
            { id: 'pending', label: 'Pending', count: metrics.pending },
            { id: 'approved', label: 'Approved', count: metrics.approved },
            { id: 'rejected', label: 'Rejected', count: metrics.rejected }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Main Table / Applications List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
            <p className="text-sm font-medium text-gray-500">Loading KYC applications...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <FileCheck size={26} />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">No KYC Applications Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? "No applications match your current search and filter criteria." 
                : "No users have submitted KYC verification requests yet."}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f9fafb] text-gray-600 uppercase tracking-wider border-b border-gray-200 font-bold text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Issuing Country</th>
                  <th className="py-3.5 px-4">Document Details</th>
                  <th className="py-3.5 px-4">Document Proof</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req, index) => {
                  const username = req.profiles?.full_name || req.profiles?.email || 'User';
                  const uid = req.profiles?.walletId || 'N/A';
                  const isProcessing = processingId === req.id;

                  return (
                    <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                      
                      {/* # and Delete */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-400">
                          <span className="font-mono text-xs">{index + 1}</span>
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="p-1 hover:text-red-500 transition"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-blue-200">
                            {req.profiles?.avatar_url ? (
                              <img src={req.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              username.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link 
                              href={`/admin/members/${req.user_id}`} 
                              className="font-bold text-gray-900 hover:text-blue-600 transition truncate block"
                            >
                              {username}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                              <span className="truncate">{req.profiles?.email}</span>
                              <span>•</span>
                              <span 
                                onClick={() => handleCopy(uid, 'UID')}
                                className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded hover:underline cursor-pointer"
                                title="Click to copy UID"
                              >
                                UID: {uid}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="py-4 px-4 font-medium text-gray-800">
                        {req.country || 'N/A'}
                      </td>

                      {/* Document Details */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-gray-900 block text-[13px]">
                            {req.document_type || 'ID Card'}
                          </span>
                          <span 
                            onClick={() => handleCopy(req.document_number, 'Doc Number')}
                            className="font-mono text-[12px] text-gray-500 hover:text-blue-600 cursor-pointer flex items-center gap-1 mt-0.5"
                            title="Click to copy"
                          >
                            {req.document_number || 'N/A'}
                            <Copy size={11} className="opacity-50 hover:opacity-100" />
                          </span>
                        </div>
                      </td>

                      {/* Image Thumbnail & Preview */}
                      <td className="py-4 px-4">
                        {req.image_url ? (
                          <div className="flex items-center gap-2">
                            <div 
                              onClick={() => setImageModalUrl(req.image_url)}
                              className="w-14 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-blue-500 transition relative group shrink-0"
                            >
                              <img src={req.image_url} alt="KYC Document" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <Eye size={14} className="text-white" />
                              </div>
                            </div>
                            <button
                              onClick={() => setImageModalUrl(req.image_url)}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              View Photo
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No document image</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-gray-500 text-xs font-medium whitespace-nowrap">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {req.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={11} /> Approved
                          </span>
                        ) : req.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <XCircle size={11} /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 font-bold text-xs">
                          {isProcessing ? (
                            <Loader2 size={16} className="animate-spin text-blue-600 mx-auto" />
                          ) : (
                            <>
                              {req.status !== 'approved' && (
                                <button
                                  onClick={() => handleAction(req.id, req.user_id, 'approve')}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                                >
                                  Approve
                                </button>
                              )}
                              
                              {req.status !== 'rejected' && (
                                <button
                                  onClick={() => handleAction(req.id, req.user_id, 'reject')}
                                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
                                >
                                  Reject
                                </button>
                              )}

                              {req.status !== 'pending' && (
                                <button
                                  onClick={() => handleAction(req.id, req.user_id, 'pending')}
                                  className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                  title="Reset to Pending"
                                >
                                  Reset
                                </button>
                              )}
                            </>
                          )}
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

      {/* Document Image Modal */}
      {imageModalUrl && (
        <div 
          onClick={() => setImageModalUrl(null)}
          className="fixed inset-0 bg-black/85 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-4xl w-full max-h-[92vh] flex flex-col relative shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Document Verification Preview</h3>
                <p className="text-xs text-gray-500">Government identification proof submitted by user</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadImage(imageModalUrl, 'document')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                >
                  <Download size={14} /> Download
                </button>
                <a
                  href={imageModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                >
                  <ExternalLink size={14} /> New Tab
                </a>
                <button
                  onClick={() => setImageModalUrl(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-auto bg-[#0a0a0a] rounded-xl flex items-center justify-center p-4 min-h-[420px]">
              <img 
                src={imageModalUrl} 
                alt="KYC Document Preview" 
                className="max-w-full max-h-[68vh] object-contain rounded shadow" 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
