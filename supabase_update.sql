-- Add recovery_phrase and pin_hash to profiles table safely
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS recovery_phrase TEXT UNIQUE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pin_hash TEXT;
