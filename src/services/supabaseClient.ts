import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase (configured in .env or Vercel dashboard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isCloudConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Singleton Supabase Client Instance
 * Defaults to null if credentials are not configured yet, falling back to Local-First mode.
 */
export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Authentication Helper Functions
 */
export async function authSignUp(email: string, password?: string) {
  if (!supabase) {
    return { user: null, error: new Error('Cloud backend not connected. Using local offline mode.') };
  }

  if (password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    return { user: data.user, session: data.session, error };
  } else {
    // Passwordless Magic Link / OTP
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { data, error };
  }
}

export async function authSignIn(email: string, password?: string) {
  if (!supabase) {
    return { user: null, error: new Error('Cloud backend not connected. Using local offline mode.') };
  }

  if (password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { user: data.user, session: data.session, error };
  } else {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { data, error };
  }
}

export async function authSignOut() {
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCloudSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
