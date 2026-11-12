'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth as authApi, User, setToken, clearToken } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'STAFF'];

export type DashboardType = 'member' | 'investor' | 'admin';

/** Returns the correct home path for a given role after login. */
export function dashboardPathForRole(role: string): string {
  if (role === 'INVESTOR') return '/investor/dashboard';
  if (STAFF_ROLES.includes(role)) return '/admin';
  return '/dashboard';
}

/** Which dashboard area a role is allowed to use. */
export function dashboardTypeForRole(role: string): DashboardType {
  if (role === 'INVESTOR') return 'investor';
  if (STAFF_ROLES.includes(role)) return 'admin';
  return 'member';
}

/**
 * A profile needs onboarding until the backend flags it complete (set by
 * POST /auth/complete-profile). We deliberately do NOT infer this from
 * role === 'STUDENT', otherwise real students would be stuck in onboarding forever.
 * Staff accounts are provisioned by admins and never go through onboarding.
 */
export function needsOnboarding(user: User): boolean {
  if (STAFF_ROLES.includes(user.role)) return false;
  return !user.onboarding_completed;
}

/** Where a freshly authenticated user should land. */
export function postAuthPath(user: User): string {
  return needsOnboarding(user) ? '/onboarding' : dashboardPathForRole(user.role);
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<string>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<{ needsVerification: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-fetch the profile from the backend; returns the fresh user (or null if signed out). */
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (accessToken: string): Promise<User> => {
    setToken(accessToken);
    try {
      const profile = await authApi.me();
      setUser(profile);
      return profile;
    } catch {
      clearToken();
      setUser(null);
      throw new Error('Failed to load profile');
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    return loadProfile(session.access_token);
  }, [loadProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        loadProfile(session.access_token)
          .catch(() => undefined)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return; // handled by getSession() above
      if (session?.access_token) {
        // Keep the API token fresh on TOKEN_REFRESHED / SIGNED_IN / PASSWORD_RECOVERY / USER_UPDATED.
        // Deferred so we never await Supabase calls inside this callback.
        setTimeout(() => { loadProfile(session.access_token).catch(() => undefined); }, 0);
      } else {
        clearToken();
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  /** Sign in with email/password. Returns the path the caller should redirect to. */
  const signInWithEmail = async (email: string, password: string): Promise<string> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await loadProfile(data.session!.access_token);
    return postAuthPath(profile);
  };

  /**
   * Sign up with email/password.
   * first/last name travel in user_metadata; the backend reads them when it auto-creates
   * the profile on first authenticated request, so no extra PATCH is needed here.
   */
  const signUpWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ needsVerification: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;

    // Email confirmation enabled → no session yet; the verification link lands on /auth/callback.
    if (!data.session) return { needsVerification: true };

    // Confirmation disabled → logged in immediately. Creates the profile (with names) server-side;
    // the register page then sends the user to /onboarding to pick a role.
    await loadProfile(data.session.access_token);
    return { needsVerification: false };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  /** Sends the Supabase password-recovery email. The link lands on /reset-password. */
  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  /** Sets a new password for the current (recovery) session. */
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGitHub,
        sendPasswordReset, updatePassword, signOut, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
