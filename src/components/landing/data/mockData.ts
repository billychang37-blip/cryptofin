

export type CryptoAsset = any;
export type ActivityItem = any;
export type BentoFeature = any;
export type Testimonial = any;





export const CRYPTO_ASSETS: CryptoAsset[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 94280.5,
    change24h: 3.42,
    balance: 0.842,
    valueUsd: 79384.18,
    icon: '₿',
    sparkline: [89000, 90200, 91500, 90800, 92400, 93800, 94280],
    network: 'Bitcoin'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3418.2,
    change24h: 5.14,
    balance: 12.45,
    valueUsd: 42556.59,
    icon: 'Ξ',
    sparkline: [3100, 3180, 3240, 3210, 3350, 3390, 3418],
    network: 'Ethereum'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    price: 184.75,
    change24h: 8.65,
    balance: 85.0,
    valueUsd: 15703.75,
    icon: '◎',
    sparkline: [162, 168, 171, 169, 176, 180, 184.7],
    network: 'Solana'
  },
  {
    id: 'sui',
    name: 'Sui Network',
    symbol: 'SUI',
    price: 3.84,
    change24h: 12.3,
    balance: 1350.0,
    valueUsd: 5184.0,
    icon: '💧',
    sparkline: [3.1, 3.25, 3.4, 3.35, 3.6, 3.75, 3.84],
    network: 'Sui'
  }
]

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'swap',
    title: 'Swapped ETH for USDC',
    subtitle: 'Uniswap v4 Routing • Gas 11 Gwei',
    amount: '+8,545.20 USDC',
    status: 'completed',
    timestamp: '2 mins ago',
    fiatValue: '$8,545.20'
  },
  {
    id: 'act-2',
    type: 'stake',
    title: 'Staked Solana Validator',
    subtitle: '7.85% APY • Auto-compounding',
    amount: '85.0 SOL',
    status: 'completed',
    timestamp: '1 hour ago',
    fiatValue: '$15,703.75'
  },
  {
    id: 'act-3',
    type: 'receive',
    title: 'Received from Cold Wallet',
    subtitle: 'Taproot Address • 3 Confirmations',
    amount: '+0.15 BTC',
    status: 'completed',
    timestamp: '3 hours ago',
    fiatValue: '$14,142.00'
  }
]

export const BENTO_FEATURES: BentoFeature[] = [
  {
    id: 'speed',
    category: 'trading',
    title: 'Sub-Second Multi-Chain Execution',
    description: 'Proprietary smart order routing across 14 networks. Best rates, zero front-running (MEV-protected), and zero invisible markup.',
    tag: 'Execution Engine',
    note: 'zero MEV, zero slippage surprises :)',
    noteRotation: '-rotate-2'
  },
  {
    id: 'security',
    category: 'security',
    title: 'Biometric Self-Custody with Zero Anxiety',
    description: 'Secured by Apple FaceID, TouchID, and Multi-Party Computation (MPC). No 24-word seed phrase vulnerabilities, full hardware isolation.',
    tag: 'Institutional Security',
    note: 'your keys, your financial sovereignty',
    noteRotation: 'rotate-1'
  },
  {
    id: 'fiat',
    category: 'card',
    title: 'Instant Apple Pay & Global Virtual Card',
    description: 'Spend crypto anywhere Mastercard is accepted. Convert stablecoins directly to local fiat at POS with 0% foreign transaction fees.',
    tag: 'Everyday Banking',
    note: 'tap to pay worldwide',
    noteRotation: '-rotate-1'
  },
  {
    id: 'clarity',
    category: 'wallet',
    title: 'Considered Feeds & Real-Time Net Worth',
    description: 'An app that respects your attention. Clean typography, customizable widgets, and instant PnL breakdowns across tokens, DeFi yield, and NFTs.',
    tag: 'Interface Craft',
    note: 'no fluff, just clean numbers',
    noteRotation: 'rotate-2'
  }
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Alex Vance',
    handle: '@alexvance_xyz',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'DeFi Strategist & Angel',
    comment: 'Most crypto apps look like spaceship cockpits designed in 2017. CRYPTOFIN is the first wallet that feels like a Dieter Rams industrial product. Lightning fast, zero visual garbage.',
    verified: true
  },
  {
    id: 'test-2',
    name: 'Elena Rostova',
    handle: '@elena_web3',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    role: 'Founding Partner, BlockScale',
    comment: 'The instant Apple Pay integration and the MPC biometric login made this my daily driver. I downloaded it 2 months ago and uninstalled 3 other banking apps.',
    verified: true
  },
  {
    id: 'test-3',
    name: 'Marcus Chen',
    handle: '@mchen_capital',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Quantitative Trader',
    comment: 'Sub-second multi-chain swaps with zero slippage leaks. The mobile UI is unmatched—feels like the HelloDotta design philosophy brought to life in finance.',
    verified: true
  }
]
