-- Run this in your Supabase SQL Editor
ALTER TABLE wallets
ADD COLUMN IF NOT EXISTS usdt_erc20_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdt_trc20_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdt_bep20_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdt_sol_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdt_matic_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdt_avax_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdc_erc20_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdc_bep20_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdc_solana_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdc_matic_balance numeric DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS usdc_avax_balance numeric DEFAULT 0.00;
