export const MASTER_WALLETS = {};

export const CRYPTO_ASSETS = [
  // Bitcoin Ecosystem
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  
  // Ethereum Ecosystem
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-slate-200', bg: 'bg-slate-800' },
  { id: 'USDT', name: 'USDT (ERC-20)', icon: '₮', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'USDC', name: 'USDC (ERC-20)', icon: 'USDC', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  
  // Binance Ecosystem
  { id: 'BNB', name: 'BNB', icon: 'BNB', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'USDT_BNB', name: 'USDT (BEP-20)', icon: '₮', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'USDC_BNB', name: 'USDC (BEP-20)', icon: 'USDC', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  
  // Solana Ecosystem
  { id: 'SOL', name: 'Solana', icon: '◎', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'USDT_SOL', name: 'USDT (Solana)', icon: '₮', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'USDC_SOL', name: 'USDC (Solana)', icon: 'USDC', color: 'text-blue-500', bg: 'bg-blue-500/10' },

  // Tron Ecosystem
  { id: 'TRX', name: 'Tron', icon: '♦', color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'USDT_TRX', name: 'USDT (TRC-20)', icon: '₮', color: 'text-primary', bg: 'bg-primary/10' },

  // Polygon Ecosystem
  { id: 'MATIC', name: 'Polygon', icon: 'POL', color: 'text-purple-600', bg: 'bg-purple-600/10' },
  { id: 'USDT_MATIC', name: 'USDT (Polygon)', icon: '₮', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'USDC_MATIC', name: 'USDC (Polygon)', icon: 'USDC', color: 'text-blue-500', bg: 'bg-blue-500/10' },

  // Avalanche Ecosystem
  { id: 'AVAX', name: 'Avalanche', icon: 'AVAX', color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'USDT_AVAX', name: 'USDT (Avalanche)', icon: '₮', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'USDC_AVAX', name: 'USDC (Avalanche)', icon: 'USDC', color: 'text-blue-500', bg: 'bg-blue-500/10' }
];

export const DEFAULT_VISIBLE_ASSETS = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'TRX'];
