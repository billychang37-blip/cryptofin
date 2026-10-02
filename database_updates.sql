-- Run this in your Supabase SQL Editor
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS from_address TEXT,
ADD COLUMN IF NOT EXISTS tx_hash TEXT;
