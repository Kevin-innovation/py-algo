"use client";

import { useEffect, useMemo, useState } from 'react';

import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import { buildClassScopeChannel } from '../lib/realtime/channels';

interface SessionEventRow {
  id: string;
  session_id: string;
  student_id: string;
  class_id: string;
  sequence_number: number;
  payload: { diff?: string };
  created_at: string;
}

interface ClassSummary {
  id: string;
  name: string;
}

interface ClassesPayload {
  teacherClasses: ClassSummary[];
  enrolledClasses: Array<{ class_id: string; classes: ClassSummary | null }>;
}

export default function TeacherRealtimeMonitor() {
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [events, setEvents] = useState<SessionEventRow[]>([]);
  const [status, setStatus] = useState<'idle' | 'connected' | 'reconnecting' | 'stale' | 'error'>('idle');
  const [classOptions, setClassOptions] = useState<ClassSummary[]>([]);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const [reconnectStartedAt, setReconnectStartedAt] = useState<number | null>(null);
  const [reconnectElapsedSeconds, setReconnectElapsedSeconds] = useState<number | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const trimmedClassId = classId.trim();
  const trimmedStudentId = studentId.trim();

  const channelName = useMemo(
    () => (trimmedClassId ? buildClassScopeChannel(trimmedClassId) : null),
    [trimmedClassId],
  );

  useEffect(() => {
    const loadClasses = async () => {
      const res = await fetch('/api/classes', { method: 'GET' });
      if (!res.ok) {
        setStatus('error');
        setDiagnostic('클래스 목록을 불러오지 못했습니다. 잠시 후 다시 시도하세요.');
        return;
      }

      const payload = await res.json() as ClassesPayload;
      const fromTeacher = payload.teacherClasses;
      const fromEnrollment = payload.enrolledClasses
        .map((item) => item.classes)
        .filter((item): item is ClassSummary => Boolean(item));

      const uniqueById = new Map<string, ClassSummary>();
      [...fromTeacher, ...fromEnrollment].forEach((item) => {
        uniqueById.set(item.id, item);
      });

      const nextOptions = Array.from(uniqueById.values());
      setClassOptions(nextOptions);
      if (nextOptions.length === 0) {
        setStatus('idle');
        setDiagnostic('접근 가능한 클래스가 없습니다.');
        return;
      }

      if (!trimmedClassId && nextOptions[0]) {
        setClassId(nextOptions[0].id);
      }

      setDiagnostic(null);
    };

    void loadClasses();
  }, [trimmedClassId]);

  useEffect(() => {
    if (!trimmedClassId || !channelName) {
      queueMicrotask(() => {
        setStatus('idle');
        setDiagnostic('모니터링할 클래스를 선택하세요.');
      });
      return;
    }

    const allowed = classOptions.some((item) => item.id === trimmedClassId);
    if (!allowed) {
      queueMicrotask(() => {
        setStatus('error');
        setDiagnostic('선택한 클래스에 대한 접근 권한이 없습니다.');
      });
      return;
    }

    const clientResult = createSupabaseBrowserClient();
    if (!clientResult.ok) {
      queueMicrotask(() => {
        setStatus('error');
        setDiagnostic(clientResult.error.message);
      });
      return;
    }

    const client = clientResult.data;
    queueMicrotask(() => {
      setStatus('reconnecting');
      setDiagnostic('실시간 스트림에 연결 중입니다...');
    });

    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_events',
          filter: `class_id=eq.${trimmedClassId}`,
        },
        (payload) => {
          const row = payload.new as SessionEventRow;
          if (trimmedStudentId && row.student_id !== trimmedStudentId) return;

          setLastEventAt(Date.now());
          setStatus('connected');
          setDiagnostic(null);
          setEvents((prev) => [row, ...prev].slice(0, 50));
        },
      )
      .subscribe((state) => {
        if (state === 'SUBSCRIBED') {
          setReconnectStartedAt(null);
          setReconnectElapsedSeconds(null);
          setStatus('connected');
          setDiagnostic(null);
          return;
        }

        if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT' || state === 'CLOSED') {
          setReconnectStartedAt((prev) => {
            if (prev !== null) return prev;
            setReconnectElapsedSeconds(0);
            return Date.now();
          });
          setStatus('reconnecting');
          setDiagnostic('연결이 끊겼습니다. 자동으로 재연결을 시도합니다.');
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [channelName, classOptions, retryNonce, trimmedClassId, trimmedStudentId]);

  useEffect(() => {
    if (!lastEventAt) return;

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - lastEventAt;
      if (elapsed >= 10000) {
        setStatus((prev) => {
          if (prev !== 'connected') return prev;
          setDiagnostic('최근 10초 동안 이벤트가 없어 stale 상태입니다.');
          return 'stale';
        });
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [lastEventAt]);

  useEffect(() => {
    if (reconnectStartedAt === null) return;

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - reconnectStartedAt;
      setReconnectElapsedSeconds(Math.floor(elapsed / 1000));
      if (elapsed >= 30_000) {
        setStatus('error');
        setDiagnostic('재연결 시간이 30초를 초과했습니다. 다시 시도해 주세요.');
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [reconnectStartedAt]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case 'connected':
        return 'LIVE';
      case 'reconnecting':
        return 'RECONNECTING';
      case 'stale':
        return 'STALE';
      case 'error':
        return 'ERROR';
      default:
        return 'IDLE';
    }
  }, [status]);

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
  };

  const handleRetry = () => {
    setReconnectStartedAt(null);
    setReconnectElapsedSeconds(null);
    setStatus('reconnecting');
    setDiagnostic('연결을 다시 시도합니다...');
    setRetryNonce((prev) => prev + 1);
  };

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-panel p-4 space-y-3">
      <h3 className="text-foreground font-medium">실시간 학생 이벤트 모니터</h3>

      <div className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2">
        <p className="text-[var(--text-small)] text-foreground-secondary">
          상태: <span className="text-foreground font-medium">{statusLabel}</span>
        </p>
        <p className="text-[var(--text-small)] text-foreground-secondary">마지막 이벤트 수신: {formatTimestamp(lastEventAt)}</p>
        <p className="text-[var(--text-small)] text-foreground-secondary">
          재연결 경과: {reconnectElapsedSeconds === null ? '-' : `${reconnectElapsedSeconds}s`}
        </p>
        {diagnostic ? <p className="mt-1 text-[var(--text-small)] text-foreground">진단: {diagnostic}</p> : null}
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <select
          value={classId}
          onChange={(event) => setClassId(event.target.value)}
          className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-foreground"
        >
          {classOptions.length === 0 ? <option value="">접근 가능한 클래스 없음</option> : null}
          {classOptions.map((item) => (
            <option key={item.id} value={item.id}>{item.name} ({item.id})</option>
          ))}
        </select>
        <input
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          placeholder="(선택) studentId"
          className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-foreground"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-panel-alt px-4 text-[var(--text-small)] font-medium text-foreground"
        >
          재연결 시도
        </button>
      </div>

      <ul className="space-y-2 max-h-72 overflow-auto">
        {events.map((event) => (
          <li key={event.id} className="rounded-[var(--radius-md)] border border-border bg-background p-3">
            <p className="text-[var(--text-small)] text-foreground-secondary">{event.created_at}</p>
            <p className="text-foreground text-[var(--text-small)]">
              session={event.session_id} / student={event.student_id} / seq={event.sequence_number}
            </p>
            <pre className="mt-1 text-[var(--text-small)] text-foreground-secondary whitespace-pre-wrap">{event.payload?.diff ?? ''}</pre>
          </li>
        ))}
        {events.length === 0 ? (
          <li className="text-[var(--text-small)] text-foreground-secondary">아직 수신된 이벤트가 없습니다.</li>
        ) : null}
      </ul>
    </section>
  );
}
