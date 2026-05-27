'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string; // first letter of name
}

const UserContext = createContext<UserProfile | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const buildProfile = (session: any): UserProfile | null => {
    if (!session?.user) return null;
    const u = session.user;
    const name =
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      u.email?.split('@')[0] ||
      'User';
    return {
      id: u.id,
      email: u.email ?? '',
      name,
      avatar: name.charAt(0).toUpperCase(),
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(buildProfile(session));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(buildProfile(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
