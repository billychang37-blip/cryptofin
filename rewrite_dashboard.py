import re

with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_asset_order = """  const assetOrder = [
    { id: 'main', name: 'Main Wallet (Fiat USD)' },
    { id: 'eth', name: 'Ethereum' },
    { id: 'usdt_erc20', name: 'USDT (ERC20)' },
    { id: 'usdt_trc20', name: 'USDT (TRC20)' },
    { id: 'usdt_bep20', name: 'USDT (BEP20)' },
    { id: 'usdc_solana', name: 'USDC (Solana)' },
    { id: 'usdc_bep20', name: 'USDC (BEP20)' },
    { id: 'bnb', name: 'BNB' },
    { id: 'trx', name: 'TRX' },
    { id: 'btc', name: 'BTC' },
    { id: 'aave', name: 'AAVE' },
    { id: 'sol', name: 'SOL' }
  ];"""

new_asset_order = """  const assetOrder = [
    { id: 'btc', name: 'Bitcoin (BTC)' },
    { id: 'eth', name: 'Ethereum (ETH)' },
    { id: 'usdt_erc20', name: 'USDT (ERC20)' },
    { id: 'usdt_trc20', name: 'USDT (TRC20)' },
    { id: 'usdt_bep20', name: 'USDT (BEP20)' },
    { id: 'usdc_solana', name: 'USDC (Solana)' },
    { id: 'usdc_bep20', name: 'USDC (BEP20)' },
    { id: 'bnb', name: 'BNB (BEP20)' },
    { id: 'sol', name: 'Solana (SOL)' },
    { id: 'trx', name: 'Tron (TRX)' }
  ];"""

content = content.replace(old_asset_order, new_asset_order)

old_format = """  const formatCryptoAmount = (amt: number, id: string) => {
    if (id === 'main') return `$${amt.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    let symbol = id.split('_')[0].toUpperCase();
    if (amt === 0) return `0.000 ${symbol}`;
    return `${amt.toLocaleString('en-US', {maximumFractionDigits: 6})} ${symbol}`;
  };"""

new_format = """  const formatCryptoAmount = (amt: number, id: string) => {
    let symbol = id.split('_')[0].toUpperCase();
    if (amt === 0) return `0.000 ${symbol}`;
    return `${amt.toLocaleString('en-US', {maximumFractionDigits: 6})} ${symbol}`;
  };"""

content = content.replace(old_format, new_format)

old_agg = """        txs.forEach((tx: any) => {
          const txTime = new Date(tx.created_at).getTime();
          const amt = Number(tx.amount) || 0;
          const isToday = txTime >= startOfDay;
          const isThisMonth = txTime >= startOfMonth;
          
          let w = (tx.wallet_used || 'main').toLowerCase();
          // Normalize legacy/mismatched wallets
          if (w === 'usdt') w = 'usdt_erc20';
          if (w === 'usdc') w = 'usdc_solana';
          
          if (!todayAgg[w]) {
            todayAgg[w] = {d: 0, w: 0};
            monthAgg[w] = {d: 0, w: 0};
            // Add to assetOrder dynamically if it's a completely new wallet type
            if (!assetOrder.find(a => a.id === w)) {
              assetOrder.push({ id: w, name: w.toUpperCase() });
            }
          }

          if (tx.type === 'deposit') {
            if (isToday) todayAgg[w].d += amt;
            if (isThisMonth) monthAgg[w].d += amt;
          } else if (tx.type === 'transfer' || tx.type === 'crypto_transfer' || tx.type === 'withdrawal') {
            if (isToday) todayAgg[w].w += amt;
            if (isThisMonth) monthAgg[w].w += amt;
          }
        });"""

new_agg = """        txs.forEach((tx: any) => {
          // Only count successful transactions for dashboard sums
          if (tx.status !== 'completed' && tx.status !== 'approved') return;

          const txTime = new Date(tx.created_at).getTime();
          const amt = Number(tx.amount) || 0;
          const isToday = txTime >= startOfDay;
          const isThisMonth = txTime >= startOfMonth;
          
          let w = (tx.currency || tx.wallet_used || 'btc').toLowerCase();
          
          if (!todayAgg[w]) {
            todayAgg[w] = {d: 0, w: 0};
            monthAgg[w] = {d: 0, w: 0};
          }

          if (tx.type === 'deposit' || tx.type === 'crypto_deposit' || tx.type === 'admin_deposit') {
            if (isToday) todayAgg[w].d += amt;
            if (isThisMonth) monthAgg[w].d += amt;
          } else if (tx.type === 'transfer' || tx.type === 'crypto_transfer' || tx.type === 'withdrawal') {
            if (isToday) todayAgg[w].w += amt;
            if (isThisMonth) monthAgg[w].w += amt;
          }
        });"""

content = content.replace(old_agg, new_agg)

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
