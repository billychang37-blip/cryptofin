-- SQL Migration to add separate balance columns for all network variants
-- Run this in your Supabase SQL Editor

ALTER TABLE wallets
ADD COLUMN IF NOT EXISTS usdt_erc20_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdt_trc20_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdt_bep20_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdt_sol_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdt_matic_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdt_avax_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdc_bep20_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdc_solana_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS usdt_erc20_address TEXT,
ADD COLUMN IF NOT EXISTS usdt_bep20_address TEXT,
ADD COLUMN IF NOT EXISTS usdc_bep20_address TEXT,
ADD COLUMN IF NOT EXISTS usdt_trc20_address TEXT,
ADD COLUMN IF NOT EXISTS usdc_solana_address TEXT;

-- Optional: Copy existing generic balances over to the network-specific columns if they are 0
-- UPDATE wallets SET usdt_erc20_balance = usdt_balance WHERE usdt_erc20_balance = 0;
-- UPDATE wallets SET usdt_trc20_balance = usdt_balance WHERE usdt_trc20_balance = 0;
