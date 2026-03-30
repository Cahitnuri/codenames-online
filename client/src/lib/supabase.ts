import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

// ─── Auth helpers ──────────────────────────────────────────────

export interface SupabaseProfile {
  id: string;
  name: string;
  avatarId: string;
  email: string;
}

/** Sign up with email + password, stores name+avatar in user_metadata */
export async function signUp(
  email: string,
  password: string,
  name: string,
  avatarId: string,
): Promise<{ profile: SupabaseProfile; error: null } | { profile: null; error: string }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, avatarId } },
  });

  if (error || !data.user) {
    return { profile: null, error: error?.message ?? 'Kayıt başarısız' };
  }

  return {
    profile: {
      id: data.user.id,
      name,
      avatarId,
      email: data.user.email ?? email,
    },
    error: null,
  };
}

/** Sign in with email + password */
export async function signIn(
  email: string,
  password: string,
): Promise<{ profile: SupabaseProfile; error: null } | { profile: null; error: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { profile: null, error: error?.message ?? 'Giriş başarısız' };
  }

  const meta = data.user.user_metadata as { name?: string; avatarId?: string };
  return {
    profile: {
      id: data.user.id,
      name: meta.name ?? data.user.email?.split('@')[0] ?? 'Kullanıcı',
      avatarId: meta.avatarId ?? 'kedi',
      email: data.user.email ?? email,
    },
    error: null,
  };
}

/** Sign out */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** Returns current session profile, or null */
export async function getSessionProfile(): Promise<SupabaseProfile | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;

  const meta = user.user_metadata as { name?: string; avatarId?: string };
  return {
    id: user.id,
    name: meta.name ?? user.email?.split('@')[0] ?? 'Kullanıcı',
    avatarId: meta.avatarId ?? 'kedi',
    email: user.email ?? '',
  };
}
