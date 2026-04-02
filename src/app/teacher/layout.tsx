import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerContext } from '../../lib/supabase/server';
import { getSupabaseCookies } from '../../lib/supabase/cookies';
import AuthButton from '../../components/AuthButton';
import ThemeToggle from '../../components/ThemeToggle';
import { enforceMonitoringConsent } from '../../lib/monitoring/policy';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookies = await getSupabaseCookies();
  const contextResult = createSupabaseServerContext(cookies);

  if (!contextResult.ok) {
    redirect('/login');
  }

  const sessionResult = await contextResult.data.readSession();

  if (!sessionResult.ok) {
    redirect('/login');
  }

  const consentDecision = enforceMonitoringConsent(sessionResult.data.user.user_metadata);
  if (!consentDecision.ok) {
    redirect('/login?reason=consent-required');
  }

  return (
    <div className="flex h-full bg-background overflow-hidden flex-col w-full">
      <div className="h-[var(--spacing-header)] bg-header border-b border-border flex items-center px-6 justify-between shrink-0">
        <h1 className="text-foreground font-semibold text-[var(--text-section-title)] tracking-tight flex items-baseline gap-2">
          <span><span className="text-orange-500">DLAB</span> <span className="text-blue-500">Py</span>Algo</span>
          <span className="text-[var(--text-small)] font-medium text-foreground-secondary tracking-normal">teacher dashboard</span>
        </h1>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 bg-panel-alt p-1 rounded-[var(--radius-md)] border border-border">
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-[var(--radius-sm)] px-3 text-[var(--text-body)] text-foreground-secondary transition-colors hover:bg-panel hover:text-foreground"
            >
              에디터
            </Link>
          </nav>
          <div className="w-px h-4 bg-border"></div>
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
