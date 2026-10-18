"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Download, 
  RefreshCw, 
  Loader2, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  X
} from 'lucide-react';
import { AssetIcon } from '@/components/dashboard/AssetIcon';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 25;

export default function TransactionsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const supabase = createClient();
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});

  // Filter & Search states
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 1. Fetch Prices for Accurate USD Conversion
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        const p = await res.json();
        setPrices(p);
      } catch (e) {
        setPrices({ USDT: 1.00, USDC: 1.00, ETH: 3450, BTC: 64500, TRX: 0.15, BNB: 600, SOL: 145, AVAX: 25, MATIC: 0.45 });
      }
    };
    fetchPrices();
  }, []);

  // 2. Fetch Transactions
  const fetchTransactions = async (pageIndex: number, isReset: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const from = pageIndex * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      const newTxs = data || [];
      if (newTxs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      if (isReset) {
        setTransactions(newTxs);
      } else {
        setTransactions(prev => [...prev, ...newTxs]);
      }
    } catch (e: any) {
      console.error("Failed to fetch transactions:", e);
      toast.error("Failed to load transactions history");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setHasMore(true);
    fetchTransactions(0, true);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(0);
    setHasMore(true);
    await fetchTransactions(0, true);
    toast.success("Transactions updated");
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchTransactions(nextPage, false);
  };

  // Helper: Get Price
  const getAssetPrice = (currency: string) => {
    const base = (currency || 'ETH').split('_')[0].toUpperCase();
    if (base.includes('USD')) return 1.00;
    return prices[base] || 0;
  };

  // 3. Financial Metrics Calculation
  const metrics = useMemo(() => {
    let totalInflowUsd = 0;
    let totalOutflowUsd = 0;
    let completedCount = 0;

    transactions.forEach(tx => {
      const p = getAssetPrice(tx.currency);
      const absAmount = Math.abs(tx.amount || 0);
      const usdVal = absAmount * p;

      const isDeposit = tx.type === 'deposit' || tx.type === 'crypto_deposit' || tx.amount > 0;

      if (tx.status === 'completed') {
        completedCount++;
        if (isDeposit) {
          totalInflowUsd += usdVal;
        } else {
          totalOutflowUsd += usdVal;
        }
      }
    });

    return {
      inflow: totalInflowUsd,
      outflow: totalOutflowUsd,
      totalCount: transactions.length,
      completedCount
    };
  }, [transactions, prices]);

  // 4. Filtering Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type Filter
      const isDeposit = tx.type === 'deposit' || tx.type === 'crypto_deposit' || tx.amount > 0;
      const isTransfer = tx.type === 'transfer' || tx.metadata?.method === 'internal';
      const isWithdrawal = !isDeposit && !isTransfer;

      if (filterType === 'deposit' && !isDeposit) return false;
      if (filterType === 'withdrawal' && !isWithdrawal) return false;
      if (filterType === 'transfer' && !isTransfer) return false;

      // Status Filter
      if (filterStatus !== 'all') {
        const s = (tx.status || 'pending').toLowerCase();
        if (filterStatus === 'pending' && !(s === 'pending' || s === 'processing')) return false;
        if (filterStatus === 'completed' && s !== 'completed') return false;
        if (filterStatus === 'failed' && !(s === 'failed' || s === 'rejected')) return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const currency = (tx.currency || '').toLowerCase();
        const hash = (tx.tx_hash || tx.id || '').toLowerCase();
        const toAddr = (tx.to_address || '').toLowerCase();
        const fromAddr = (tx.from_address || '').toLowerCase();
        const desc = (tx.description || '').toLowerCase();

        const matches = 
          currency.includes(q) || 
          hash.includes(q) || 
          toAddr.includes(q) || 
          fromAddr.includes(q) || 
          desc.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [transactions, filterType, filterStatus, searchQuery]);

  // 5. Functional CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    try {
      const headers = ["Transaction ID", "Date (UTC)", "Type", "Asset", "Amount", "USD Equivalent", "Status", "Counterparty Address", "Tx Hash"];
      const rows = transactions.map(tx => {
        const p = getAssetPrice(tx.currency);
        const absAmt = Math.abs(tx.amount || 0);
        const usdVal = (absAmt * p).toFixed(2);
        const isDeposit = tx.type === 'deposit' || tx.amount > 0;
        const typeStr = isDeposit ? 'Deposit' : (tx.metadata?.method === 'internal' ? 'Internal Transfer' : 'Withdrawal');
        const counterparty = tx.to_address || tx.from_address || 'N/A';
        const dateStr = new Date(tx.created_at).toISOString();

        return [
          `"${tx.id}"`,
          `"${dateStr}"`,
          `"${typeStr}"`,
          `"${tx.currency}"`,
          `"${isDeposit ? '+' : '-'}${absAmt}"`,
          `"$${usdVal}"`,
          `"${tx.status || 'pending'}"`,
          `"${counterparty}"`,
          `"${tx.tx_hash || 'N/A'}"`
        ].join(",");
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      const dateTag = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `cryptofin-transactions-${dateTag}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${transactions.length} transactions as CSV`);
    } catch (e) {
      toast.error("Failed to export transactions");
    }
  };

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 pt-[max(env(safe-area-inset-top),1.5rem)] md:pt-[max(env(safe-area-inset-top),2rem)] animate-in fade-in duration-300 pb-36 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Transaction History</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
              Live Ledger
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Real-time multi-chain activity, transfers, and receipts.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
              isDark 
                ? 'bg-[#18181b] border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Refresh Transactions"
          >
            <RefreshCw size={17} className={isRefreshing ? "animate-spin text-[#10b981]" : ""} />
          </button>

          <button 
            onClick={handleExportCSV}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-all shadow-sm ${
              isDark 
                ? 'bg-[#18181b] border-white/10 text-neutral-200 hover:text-white hover:border-white/20' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Download size={16} className="text-[#10b981]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        
        {/* Inflow Card */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#141416] border-white/5 shadow-md' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Total Inflow (Received)
            </span>
            <div className="w-8 h-8 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[#10b981]">
            ${metrics.inflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-[12px] mt-1 font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            Confirmed deposits & credits
          </div>
        </div>

        {/* Outflow Card */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#141416] border-white/5 shadow-md' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Total Outflow (Sent)
            </span>
            <div className="w-8 h-8 rounded-full bg-neutral-500/10 text-neutral-400 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ${metrics.outflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-[12px] mt-1 font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            Transfers and withdrawals
          </div>
        </div>

        {/* Total Activity */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-[#141416] border-white/5 shadow-md' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Total Recorded Transactions
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {metrics.totalCount}
          </div>
          <div className={`text-[12px] mt-1 font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            {metrics.completedCount} completed successfully
          </div>
        </div>

      </div>

      {/* Control Bar: Search & Filters */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isDark ? 'bg-[#141416] border-white/5' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input 
            type="text"
            placeholder="Search by asset, address, tx hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-10 pr-9 py-2.5 text-sm font-medium outline-none transition-all ${
              isDark 
                ? 'bg-[#1c1c1f] text-white border border-white/10 focus:border-[#10b981] placeholder:text-neutral-500' 
                : 'bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#10b981] placeholder:text-slate-400'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'deposit', label: 'Received' },
            { id: 'withdrawal', label: 'Sent' },
            { id: 'transfer', label: 'Transfers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-[#10b981] text-black shadow-sm'
                  : isDark
                    ? 'bg-[#1c1c1f] text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Status Dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold outline-none border transition-all cursor-pointer ${
              isDark 
                ? 'bg-[#1c1c1f] text-neutral-300 border-white/10 focus:border-[#10b981]' 
                : 'bg-slate-100 text-slate-700 border-slate-200 focus:border-[#10b981]'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>

      </div>

      {/* Transactions Feed */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#141416] border-white/5' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#10b981] mb-3" size={32} />
            <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Loading your transaction records...
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-neutral-800/80 text-neutral-400' : 'bg-slate-100 text-slate-400'
            }`}>
              <Wallet size={28} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No transactions found
            </h3>
            <p className={`text-sm max-w-sm mb-6 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? "No transactions match your current search and filter settings."
                : "You have not completed any transactions on Cryptofin yet."}
            </p>
            {searchQuery || filterType !== 'all' || filterStatus !== 'all' ? (
              <button
                onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterStatus('all'); }}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700 transition"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard/wallet')}
                className="px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#0ea371] text-black font-bold text-sm transition shadow-sm"
              >
                Explore Wallet
              </button>
            )}
          </div>
        ) : (
          <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
            {filteredTransactions.map((tx) => {
              const isDeposit = tx.type === 'deposit' || tx.type === 'crypto_deposit' || tx.amount > 0;
              const isTransfer = tx.type === 'transfer' || tx.metadata?.method === 'internal';
              const absAmount = Math.abs(tx.amount || 0);
              const assetBase = (tx.currency || 'ETH').split('_')[0].toUpperCase();
              const price = getAssetPrice(tx.currency);
              const usdVal = (absAmount * price).toFixed(2);

              const status = (tx.status || 'pending').toLowerCase();
              const isCompleted = status === 'completed';
              const isFailed = status === 'failed' || status === 'rejected';
              const isProcessing = status === 'pending' || status === 'processing';

              let title = 'Transaction';
              if (isTransfer) {
                title = isDeposit ? 'Received Internal Transfer' : 'Sent Internal Transfer';
              } else if (isDeposit) {
                title = `Received ${assetBase}`;
              } else {
                title = `Sent ${assetBase}`;
              }

              const counterparty = tx.to_address || tx.from_address || (isTransfer ? 'Internal User' : 'External Wallet');
              const shortCounterparty = counterparty.length > 18 
                ? `${counterparty.slice(0, 6)}...${counterparty.slice(-4)}` 
                : counterparty;

              return (
                <div
                  key={tx.id}
                  onClick={() => router.push(`/dashboard/transactions/${tx.id}`)}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left: Icon & Title info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <AssetIcon symbol={assetBase} size="md" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        isDark ? 'border-[#141416]' : 'border-white'
                      } ${
                        isDeposit 
                          ? 'bg-[#10b981] text-black' 
                          : isTransfer 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-neutral-600 text-white'
                      }`}>
                        {isDeposit ? (
                          <ArrowDownLeft size={11} strokeWidth={2.5} />
                        ) : isTransfer ? (
                          <ArrowLeftRight size={10} strokeWidth={2.5} />
                        ) : (
                          <ArrowUpRight size={11} strokeWidth={2.5} />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-[14.5px] truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {title}
                        </span>
                        {tx.currency && tx.currency.includes('_') && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isDark ? 'bg-white/10 text-neutral-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {tx.currency.split('_')[1]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span>{formatSmartDate(tx.created_at)}</span>
                        <span>•</span>
                        <span 
                          onClick={(e) => handleCopy(e, counterparty, 'Address')}
                          className="font-mono hover:text-[#10b981] transition flex items-center gap-1 cursor-pointer"
                          title="Click to copy"
                        >
                          {shortCounterparty}
                          <Copy size={11} className="opacity-60 hover:opacity-100" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Status */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="flex flex-col items-end">
                      <div className={`font-bold text-[15px] font-mono tracking-tight ${
                        isDeposit ? 'text-[#10b981]' : (isDark ? 'text-white' : 'text-slate-900')
                      }`}>
                        {isDeposit ? '+' : '-'}{absAmount.toFixed(4)} {assetBase}
                      </div>
                      <div className={`text-[12px] font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                        ≈ ${usdVal} USD
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="hidden sm:flex flex-col items-end w-28">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                          <CheckCircle2 size={12} />
                          Completed
                        </span>
                      ) : isProcessing ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <AlertTriangle size={12} />
                          Failed
                        </span>
                      )}
                    </div>

                    <ChevronRight size={18} className="text-neutral-500 opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Pagination: Load More */}
      {!loading && transactions.length > 0 && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95 shadow-sm ${
              isDark
                ? 'bg-[#18181b] border border-white/10 text-white hover:bg-neutral-800'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {loadingMore ? <Loader2 size={16} className="animate-spin text-[#10b981]" /> : null}
            {loadingMore ? 'Loading more transactions...' : 'Load Older Transactions'}
          </button>
        </div>
      )}

    </div>
  );
}

function formatSmartDate(dateString: string): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  
  const d = new Date(date); d.setHours(0,0,0,0);
  const n = new Date(now); n.setHours(0,0,0,0);
  
  const diffTime = n.getTime() - d.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  if (diffDays < 7) return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${timeStr}`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}