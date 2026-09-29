"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface SecurityContextType {
  isLocked: boolean;
  requiresSetup: boolean;
  isLoading: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
}

const SecurityContext = createContext<SecurityContextType>({
  isLocked: false,
  requiresSetup: true, // Default to true for safety
  isLoading: true,     // Default to true so we wait
  unlock: async () => false,
  lock: () => {},
});

export const useSecurity = () => useContext(SecurityContext);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading immediately
  const [pinHash, setPinHash] = useState<string | null>(null);
  
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // We are removing the automatic 5-minute idle timer because it aggressively
  // locks the user out when they don't want to be locked. 
  // Users can still be locked out manually if the `lock()` function is called.
  
  // INITIAL CHECK
  useEffect(() => {
    const checkSecurity = async () => {
      setIsLoading(true); // Start checking
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // If no user is logged in, stop checking
        if (!user) {
             setIsLoading(false);
             return;
        }

        // 🛑 THE LOOP BREAKER
        // We query 'id' because user_security is linked 1:1 with auth.users
        const { data, error } = await supabase
          .from('profiles')
          .select('pin_hash')
          .eq('id', user.id) // ✅ Matches the Primary Key 'id'
          .maybeSingle();

        if (error) {
            console.error("Security Context Error:", error);
        }

        // If no data or no hash, they need setup
        if (!data || !data.pin_hash) {
          console.log("Security: Setup Required");
          setRequiresSetup(true);
        } else {
          console.log("Security: Setup Complete");
          setRequiresSetup(false);
          setPinHash(data.pin_hash);
        }
      } catch (e) {
        console.error("Security check failed", e);
      } finally {
        setIsLoading(false); // <--- Done checking
      }
    };

    checkSecurity();
  }, [pathname]);

  const unlock = async (inputPin: string) => {
    if (!inputPin) return false;
    try {
        const res = await fetch('/api/security/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: inputPin })
        });
        const data = await res.json();
        if (data.success) {
            setIsLocked(false);
            return true;
        }
    } catch (e) {
        console.error("Unlock failed", e);
    }
    return false;
  };

  const lock = () => setIsLocked(true);

  return (
    <SecurityContext.Provider value={{ isLocked, requiresSetup, isLoading, unlock, lock }}>
      {children}
    </SecurityContext.Provider>
  );
}

