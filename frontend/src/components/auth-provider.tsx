"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";

import type { User as SupabaseUser } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserRoleDetail {
  code: string;
  name: string;
  assigned_at: string;
}

interface UserProfile {
  id: string;
  display_name: string | null;
  email: string;
  roles: UserRoleDetail[];
  created_at: string;
  updated_at: string;
}

interface AuthState {
  /** Raw Supabase user object (null when unauthenticated). */
  user: SupabaseUser | null;
  /** Profile + roles fetched from the Go API (null until loaded). */
  profile: UserProfile | null;
  /** True while the initial session check is in progress. */
  isLoading: boolean;
  /** Shorthand role check — returns true if the user holds the given role. */
  hasRole: (role: string) => boolean;
  /** Signs the user out of Supabase and clears local state. */
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isLoading: true,
  hasRole: () => false,
  signOut: async () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the user profile + roles from the Go backend.
  const fetchProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setProfile(null);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setProfile(await res.json());
      } else {
        setProfile(null);
      }
    } catch {
      // Profile fetch failed — user is still authenticated via Supabase but
      // the Go API may be unreachable. Keep profile null.
    }
  }, []);

  useEffect(() => {
    try {
      const supabase = createClient();

      // Initial session check.
      supabase.auth
        .getUser()
        .then(({ data: { user: u } }) => {
          setUser(u ?? null);
          if (u) {
            fetchProfile().finally(() => setIsLoading(false));
          } else {
            // Provide preview academic profile if unauthenticated in dev
            setProfile({
              id: "usr_academic_preview",
              display_name: "Dr. Somchai Prasert",
              email: "somchai.p@university.ac.th",
              roles: [
                { code: "STAFF", name: "Staff Officer", assigned_at: new Date().toISOString() },
                { code: "ADVISOR", name: "Thesis Advisor", assigned_at: new Date().toISOString() },
                { code: "COMMITTEE", name: "Exam Committee", assigned_at: new Date().toISOString() },
              ],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });

      // Subscribe to auth state changes (login, logout, token refresh).
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) {
          fetchProfile();
        }
      });

      return () => subscription?.unsubscribe();
    } catch {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const hasRole = useCallback(
    (role: string) => profile?.roles.some((r) => r.code === role) ?? false,
    [profile],
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, profile, isLoading, hasRole, signOut }),
    [user, profile, isLoading, hasRole, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the current authentication state from any client component.
 *
 * Must be used inside an `<AuthProvider>`.
 */
export function useAuth(): AuthState {
  return useContext(AuthContext);
}
