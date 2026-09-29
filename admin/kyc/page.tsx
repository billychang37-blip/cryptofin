"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
const supabase = createClient();
import { Trash2, Edit, Box, Download, X } from "lucide-react";
import Link from "next/link";

export default function AdminKycPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<string | null>(null);
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
    }
    setLoading(false);
  };

  const handleAction = async (transactionId: string, userId: string, action: 'approve' | 'reject') => {
    if (!window.confirm(`Are you sure you want to ${action} this KYC request?`)) return;
    
    setProcessing(transactionId);
    
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, userId, action })
      });
      if (res.ok) {
        fetchRequests();
      } else {
        alert("Action failed.");
      }
    } catch (err) {
      alert("Error processing action.");
    }
    
    setProcessing(null);
  };

  const downloadImage = (base64: string, name: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `KYC_${name.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading KYC requests...</div>;

  return (
    <div className="p-6 bg-white min-h-full font-sans">
      
      {/* Top Tabs */}
      <div className="flex border-b border-gray-300 mb-6 pb-1">
        <button className="px-4 py-2 text-[13px] font-bold text-gray-700 bg-white border border-gray-300 border-b-0 uppercase tracking-wide">
          Manage KYC
        </button>
        <button className="px-4 py-2 text-[13px] font-bold text-white bg-[#1a8cff] uppercase tracking-wide ml-1">
          KYC Upload
        </button>
      </div>

      <h1 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider">MANAGE KYC -</h1>

      {/* Main Panel Wrapper */}
      <div className="border border-gray-300 rounded shadow-sm bg-white overflow-hidden">
        
        {/* Blue Header */}
        <div className="bg-[#1a8cff] px-4 py-3 flex items-center text-white border-b-[4px] border-black">
          <Box className="w-5 h-5 mr-3" />
          <h2 className="text-sm font-bold tracking-widest uppercase">Manage KYC</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f0f0f0] text-gray-800 uppercase tracking-wider border-b border-gray-300 font-bold">
                <th className="py-2 px-3 border-r border-gray-300 w-12 text-center">#</th>
                <th className="py-2 px-3 border-r border-gray-300">Username</th>
                <th className="py-2 px-3 border-r border-gray-300">Issuing Country</th>
                <th className="py-2 px-3 border-r border-gray-300">Card Type</th>
                <th className="py-2 px-3 border-r border-gray-300">ID Number</th>
                <th className="py-2 px-3 border-r border-gray-300">Status</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500 font-bold">No records found.</td>
                </tr>
              ) : (
                requests.map((req, index) => {
                  let docType = "N/A";
                  let docData = "";
                  let country = "N/A";
                  let idNum = "N/A";
                  
                  try {
                    const parsed = JSON.parse(req.description);
                    docType = parsed.documentType || "N/A";
                    docData = parsed.documentData || "";
                    country = parsed.issuingCountry || "N/A";
                    idNum = parsed.idNumber || "N/A";
                  } catch (e) {}

                  const username = `${req.profiles?.first_name} ${req.profiles?.last_name}`.trim();
                  
                  return (
                    <tr key={req.id} className="border-b border-gray-200 hover:bg-gray-50">
                      
                      <td className="py-2 px-3 border-r border-gray-200 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>{index + 1}</span>
                          <Trash2 className="w-4 h-4 text-gray-600 cursor-not-allowed opacity-50" />
                        </div>
                      </td>
                      
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4 text-gray-600" />
                          <Link href={`/admin/members/${req.user_id}`} className="text-blue-600 hover:underline font-bold">
                            {username || req.profiles?.email || 'User'}
                          </Link>
                        </div>
                      </td>

                      <td className="py-2 px-3 border-r border-gray-200 text-gray-700">{country}</td>
                      
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-700 capitalize">
                        {docType === 'id' ? 'National ID Card' : docType.replace('_', ' ')}
                      </td>
                      
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-700 font-mono">
                        {idNum}
                      </td>

                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="flex items-center gap-4">
                          {docData ? (
                            <button 
                              onClick={() => setImageModal(docData)}
                              className="text-blue-600 hover:underline font-bold text-[12px]"
                            >
                              View Image
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[12px]">No Image</span>
                          )}
                          
                          {req.status === 'completed' ? (
                            <span className="bg-green-500 text-white font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                              Approved
                            </span>
                          ) : req.status === 'failed' ? (
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

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-3 font-bold text-[13px]">
                          {req.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleAction(req.id, req.user_id, 'approve')}
                                disabled={processing === req.id}
                                className="text-green-600 hover:underline disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleAction(req.id, req.user_id, 'reject')}
                                disabled={processing === req.id}
                                className="text-blue-600 hover:underline disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-300 cursor-not-allowed">Approve</span>
                              <span className="text-gray-300 cursor-not-allowed">Reject</span>
                            </>
                          )}
                        </div>
                      </td>
                      
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] flex flex-col relative">
            <button 
              onClick={() => setImageModal(null)} 
              className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Document Preview</h3>
              <button 
                onClick={() => downloadImage(imageModal, 'document')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" /> Download
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 rounded border border-gray-200 flex items-center justify-center min-h-[400px]">
              <img src={imageModal} alt="Document" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

