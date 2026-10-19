"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Box, Download, X, Search, Loader2 } from "lucide-react";
import Link from "next/link";
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
  const [processing, setProcessing] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<{ url: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/kyc', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.requests) {
          setRequests(data.requests);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (applicationId: string, userId: string, action: 'approve' | 'reject') => {
    if (!window.confirm(`Are you sure you want to ${action} this KYC request?`)) return;
    
    setProcessing(applicationId);
    
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, userId, action })
      });
      if (res.ok) {
        const targetStatus = action === 'approve' ? 'approved' : 'rejected';
        setRequests(prev => prev.map(r => r.id === applicationId ? { ...r, status: targetStatus } : r));
        toast.success(`KYC request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      } else {
        toast.error("Action failed.");
      }
    } catch (err) {
      toast.error("Error processing action.");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this KYC application?")) return;
    try {
      const res = await fetch(`/api/admin/kyc?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
        toast.success("Record deleted");
      } else {
        toast.error("Failed to delete record");
      }
    } catch (e) {
      toast.error("Error deleting record");
    }
  };

  // Direct single-click download via Blob (no redirect to another page)
  const downloadImageDirectly = async (imageUrl: string, name: string) => {
    if (!imageUrl) return;
    setIsDownloading(true);
    try {
      toast.info("Downloading document image...");
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `KYC_${name.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Document downloaded successfully.");
    } catch (err) {
      // Fallback
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `KYC_${name.replace(/\s+/g, '_')}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (activeTab !== 'all' && req.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const username = (req.profiles?.full_name || req.profiles?.email || '').toLowerCase();
        const email = (req.profiles?.email || '').toLowerCase();
        const uid = (req.profiles?.walletId || '').toLowerCase();
        const country = (req.country || '').toLowerCase();
        const docNum = (req.document_number || '').toLowerCase();
        const docType = (req.document_type || '').toLowerCase();

        return username.includes(q) || email.includes(q) || uid.includes(q) || country.includes(q) || docNum.includes(q) || docType.includes(q);
      }
      return true;
    });
  }, [requests, activeTab, searchQuery]);

  if (loading) return <div className="p-10 text-center font-bold text-gray-600">Loading KYC requests...</div>;

  return (
    <div className="p-4 md:p-6 bg-white min-h-full font-sans max-w-full">
      
      {/* Top Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-300 mb-6 pb-1 gap-2">
        <div className="flex items-center">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-[13px] font-bold uppercase tracking-wide border border-gray-300 border-b-0 ${activeTab === 'all' ? 'text-gray-800 bg-white' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
          >
            Manage KYC ({requests.length})
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-[13px] font-bold uppercase tracking-wide ml-1 border border-b-0 ${activeTab === 'pending' ? 'bg-[#1a8cff] text-white border-[#1a8cff]' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}`}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 text-[13px] font-bold uppercase tracking-wide ml-1 border border-b-0 ${activeTab === 'approved' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}`}
          >
            Approved ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 text-[13px] font-bold uppercase tracking-wide ml-1 border border-b-0 ${activeTab === 'rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'}`}
          >
            Rejected ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search KYC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f9f9f9] border border-gray-300 rounded text-xs pl-8 pr-3 py-1.5 outline-none focus:border-[#1a8cff]"
          />
        </div>
      </div>

      <h1 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider">MANAGE KYC -</h1>

      {/* Main Panel Wrapper */}
      <div className="border border-gray-300 rounded shadow-sm bg-white overflow-hidden max-w-full">
        
        {/* Blue Header */}
        <div className="bg-[#1a8cff] px-4 py-3 flex items-center justify-between text-white border-b-[4px] border-black">
          <div className="flex items-center">
            <Box className="w-5 h-5 mr-3" />
            <h2 className="text-sm font-bold tracking-widest uppercase">Manage KYC</h2>
          </div>
          <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded">
            Showing {filteredRequests.length} records
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f0f0f0] text-gray-800 uppercase tracking-wider border-b border-gray-300 font-bold">
                <th className="py-2.5 px-3 border-r border-gray-300 w-12 text-center">#</th>
                <th className="py-2.5 px-3 border-r border-gray-300">Username</th>
                <th className="py-2.5 px-3 border-r border-gray-300">Issuing Country</th>
                <th className="py-2.5 px-3 border-r border-gray-300">Card Type</th>
                <th className="py-2.5 px-3 border-r border-gray-300">ID Number</th>
                <th className="py-2.5 px-3 border-r border-gray-300">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 font-bold">No records found.</td>
                </tr>
              ) : (
                filteredRequests.map((req, index) => {
                  const username = req.profiles?.full_name || req.profiles?.email || 'User';
                  const isProcessing = processing === req.id;

                  return (
                    <tr key={req.id} className="border-b border-gray-200 hover:bg-gray-50">
                      
                      {/* # and delete */}
                      <td className="py-2.5 px-3 border-r border-gray-200 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-500">
                          <span>{index + 1}</span>
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      
                      {/* Username */}
                      <td className="py-2.5 px-3 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <Edit className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <Link href={`/admin/members/${req.user_id}`} className="text-blue-600 hover:underline font-bold block truncate">
                              {username}
                            </Link>
                            {req.profiles?.walletId && (
                              <span className="text-[10px] text-gray-400 font-mono">UID: {req.profiles.walletId}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Issuing Country */}
                      <td className="py-2.5 px-3 border-r border-gray-200 text-gray-700 whitespace-nowrap">
                        {req.country || 'N/A'}
                      </td>
                      
                      {/* Card Type */}
                      <td className="py-2.5 px-3 border-r border-gray-200 text-gray-700 capitalize whitespace-nowrap">
                        {req.document_type || 'National ID Card'}
                      </td>
                      
                      {/* ID Number */}
                      <td className="py-2.5 px-3 border-r border-gray-200 text-gray-700 font-mono whitespace-nowrap">
                        {req.document_number || 'N/A'}
                      </td>

                      {/* Status & View Image */}
                      <td className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {req.image_url ? (
                            <button 
                              onClick={() => setImageModal({ url: req.image_url, name: username })}
                              className="text-blue-600 hover:underline font-bold text-[12px]"
                            >
                              View Image
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[12px]">No Image</span>
                          )}
                          
                          {req.status === 'approved' ? (
                            <span className="bg-green-500 text-white font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                              Approved
                            </span>
                          ) : req.status === 'rejected' ? (
                            <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                              Rejected
                            </span>
                          ) : (
                            <span className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                              Pending
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3 font-bold text-[13px]">
                          {isProcessing ? (
                            <Loader2 size={14} className="animate-spin text-blue-600" />
                          ) : req.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleAction(req.id, req.user_id, 'approve')}
                                className="text-green-600 hover:underline"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleAction(req.id, req.user_id, 'reject')}
                                className="text-red-600 hover:underline"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              {req.status !== 'approved' && (
                                <button 
                                  onClick={() => handleAction(req.id, req.user_id, 'approve')}
                                  className="text-green-600 hover:underline text-xs"
                                >
                                  Approve
                                </button>
                              )}
                              {req.status !== 'rejected' && (
                                <button 
                                  onClick={() => handleAction(req.id, req.user_id, 'reject')}
                                  className="text-red-600 hover:underline text-xs"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Image Modal */}
      {imageModal && (
        <div 
          onClick={() => setImageModal(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-5 max-w-3xl w-full max-h-[90vh] flex flex-col relative shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button 
              onClick={() => setImageModal(null)} 
              className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Document Preview</h3>
                <p className="text-xs text-gray-500">{imageModal.name}'s Verification Document</p>
              </div>

              {/* Direct single-click download */}
              <button 
                onClick={() => downloadImageDirectly(imageModal.url, imageModal.name)}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-[#1a8cff] text-white px-4 py-2 rounded font-bold hover:bg-blue-600 transition-colors text-xs shadow-sm disabled:opacity-60"
              >
                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isDownloading ? "Downloading..." : "Download Image"}</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-100 rounded border border-gray-200 flex items-center justify-center min-h-[380px] p-2">
              <img src={imageModal.url} alt="Document" className="max-w-full max-h-[65vh] object-contain rounded" />
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
