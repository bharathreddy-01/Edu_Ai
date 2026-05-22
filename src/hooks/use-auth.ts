"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

export function useAuth() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setState({
        user: data.session?.user ?? null,
        session: data.session,
        isLoading: false,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}
