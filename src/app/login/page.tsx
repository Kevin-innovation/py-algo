"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import { MONITORING_CONSENT_METADATA_KEY } from '../../lib/monitoring/policy';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const clientResult = createSupabaseBrowserClient();
    if (!clientResult.ok) {
      setError('Supabase configuration is missing.');
      setLoading(false);
      return;
    }

    const supabase = clientResult.data;
    const consentAt = new Date().toISOString();

    if (!consentChecked) {
      setError('모니터링 동의가 필요합니다.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const signInResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInResult.error) throw signInResult.error;

        const updateResult = await supabase.auth.updateUser({
          data: {
            [MONITORING_CONSENT_METADATA_KEY]: consentAt,
          },
        });
        if (updateResult.error) throw updateResult.error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              [MONITORING_CONSENT_METADATA_KEY]: consentAt,
            },
          },
        });
        if (error) throw error;
      }
      
      router.push('/teacher');
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-background items-center justify-center">
      <div className="bg-panel p-8 rounded-[var(--radius-lg)] w-96 shadow-sm border border-border">
        <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
          {isLogin ? '로그인' : '회원가입'}
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[var(--text-small)] text-foreground-secondary mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background text-foreground border border-border rounded-[var(--radius-md)] p-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-[var(--text-small)] text-foreground-secondary mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background text-foreground border border-border rounded-[var(--radius-md)] p-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <label className="flex items-start gap-2 text-[var(--text-small)] text-foreground-secondary">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5"
              required
            />
            <span>실시간 코드 모니터링 및 30일 로그 보관 정책에 동의합니다.</span>
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-[var(--radius-md)] font-medium transition-colors disabled:opacity-50"
          >
            {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[var(--text-small)] text-blue-500 hover:underline"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
