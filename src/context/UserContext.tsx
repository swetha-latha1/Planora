'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  timezone: string;
  avatarEmoji: string;
  createdAt: string;
}

interface UserCtx {
  user: UserProfile | null;
  updateProfile: (data: { name?: string; bio?: string; timezone?: string; avatarEmoji?: string }) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const UserContext = createContext<UserCtx>({ user: null, updateProfile: async () => {}, updatePassword: async () => ({ error: null }) });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const buildProfile = (session: any): UserProfile | null => {
    if (!session?.user) return null;
    const u = session.user;
    const meta = u.user_metadata ?? {};
    const name = meta.full_name || meta.name || u.email?.split('@')[0] || 'User';
    return {
      id: u.id,
      email: u.email ?? '',
      name: meta.display_name || name,
      avatar: (meta.display_name || name).charAt(0).toUpperCase(),
      bio: meta.bio || '',
      timezone: meta.timezone || 'Asia/Kolkata',
      avatarEmoji: meta.avatar_emoji || '🧑💻',
      createdAt: u.created_at ?? '',
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(buildProfile(session)));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(buildProfile(session)));
    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (data: { name?: string; bio?: string; timezone?: string; avatarEmoji?: string }) => {
    const meta: Record<string, string> = {};
    if (data.name !== undefined)        meta.display_name = data.name;
    if (data.bio !== undefined)         meta.bio = data.bio;
    if (data.timezone !== undefined)    meta.timezone = data.timezone;
    if (data.avatarEmoji !== undefined) meta.avatar_emoji = data.avatarEmoji;
    const { data: updated } = await supabase.auth.updateUser({ data: meta });
    if (updated.user) setUser(buildProfile({ user: updated.user }));
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  };

  return (
    <UserContext.Provider value={{ user, updateProfile, updatePassword }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext).user;
}

export function useUserActions() {
  const ctx = useContext(UserContext);
  return { updateProfile: ctx.updateProfile, updatePassword: ctx.updatePassword };
}
