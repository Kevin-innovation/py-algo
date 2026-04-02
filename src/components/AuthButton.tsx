"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { useStore } from '../store/useStore';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const setAuthenticated = useStore((state) => state.setAuthenticated);

  useEffect(() => {
    const clientResult = createSupabaseBrowserClient();
    if (!clientResult.ok) {
      queueMicrotask(() => {
        setLoading(false);
      });
      return;
    }

    const supabase = clientResult.data;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuthenticated]);

  const handleLogout = async () => {
    const clientResult = createSupabaseBrowserClient();
    if (!clientResult.ok) return;

    await clientResult.data.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return <div className="w-16 h-9 animate-pulse bg-panel rounded-[var(--radius-md)]"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/teacher"
          className="text-[var(--text-small)] text-foreground-secondary hover:text-foreground transition-colors"
        >
          대시보드
        </Link>
        <button
          onClick={handleLogout}
          className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-panel px-3 text-[var(--text-body)] font-medium text-foreground shadow-sm transition-colors hover:bg-panel-alt"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-panel px-3 text-[var(--text-body)] font-medium text-foreground shadow-sm transition-colors hover:bg-panel-alt"
    >
      로그인
    </Link>
  );
}
