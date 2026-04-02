"use client";

import { FormEvent, useEffect, useState } from 'react';

interface TeacherClass {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  join_code_expires_at: string | null;
}

interface EnrolledClassRecord {
  class_id: string;
  classes: TeacherClass | null;
}

interface ClassesPayload {
  teacherClasses: TeacherClass[];
  enrolledClasses: EnrolledClassRecord[];
}

const normalizeError = async (res: Response): Promise<string> => {
  try {
    const body = await res.json() as { error?: string };
    return body.error ?? '요청 처리 중 오류가 발생했습니다.';
  } catch {
    return '요청 처리 중 오류가 발생했습니다.';
  }
};

export default function TeacherClassManager() {
  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<ClassesPayload>({ teacherClasses: [], enrolledClasses: [] });

  const reload = async () => {
    const res = await fetch('/api/classes', { method: 'GET' });
    if (!res.ok) {
      setMessage(await normalizeError(res));
      return;
    }

    const payload = await res.json() as ClassesPayload;
    setData(payload);
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      void reload();
    });
  }, []);

  const handleCreateClass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: className }),
    });

    if (!res.ok) {
      setMessage(await normalizeError(res));
      setLoading(false);
      return;
    }

    setClassName('');
    setMessage('클래스를 생성했습니다.');
    await reload();
    setLoading(false);
  };

  const handleJoinClass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/classes/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ joinCode }),
    });

    if (!res.ok) {
      setMessage(await normalizeError(res));
      setLoading(false);
      return;
    }

    setJoinCode('');
    setMessage('클래스 참여가 완료되었습니다.');
    await reload();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={handleCreateClass} className="rounded-[var(--radius-lg)] border border-border bg-panel p-4 space-y-3">
          <h2 className="text-foreground font-semibold">클래스 생성</h2>
          <input
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            placeholder="클래스 이름"
            className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-foreground"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-accent px-4 text-[var(--text-body)] font-medium text-accent-foreground disabled:opacity-50"
          >
            생성하기
          </button>
        </form>

        <form onSubmit={handleJoinClass} className="rounded-[var(--radius-lg)] border border-border bg-panel p-4 space-y-3">
          <h2 className="text-foreground font-semibold">클래스 참여</h2>
          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            placeholder="클래스 코드"
            className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-foreground"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-border bg-panel-alt px-4 text-[var(--text-body)] font-medium text-foreground disabled:opacity-50"
          >
            참여하기
          </button>
        </form>
      </div>

      {message ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-panel px-3 py-2 text-[var(--text-small)] text-foreground-secondary">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[var(--radius-lg)] border border-border bg-panel p-4">
          <h3 className="text-foreground font-medium mb-3">내가 만든 클래스</h3>
          <ul className="space-y-2">
            {data.teacherClasses.map((item) => (
              <li key={item.id} className="rounded-[var(--radius-md)] border border-border bg-background p-3">
                <p className="text-foreground font-medium">{item.name}</p>
                <p className="text-[var(--text-small)] text-foreground-secondary">코드: {item.join_code}</p>
              </li>
            ))}
            {data.teacherClasses.length === 0 ? (
              <li className="text-[var(--text-small)] text-foreground-secondary">생성된 클래스가 없습니다.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-border bg-panel p-4">
          <h3 className="text-foreground font-medium mb-3">참여 중인 클래스</h3>
          <ul className="space-y-2">
            {data.enrolledClasses.map((item) => (
              <li key={item.class_id} className="rounded-[var(--radius-md)] border border-border bg-background p-3">
                <p className="text-foreground font-medium">{item.classes?.name ?? '알 수 없는 클래스'}</p>
                <p className="text-[var(--text-small)] text-foreground-secondary">코드: {item.classes?.join_code ?? '-'}</p>
              </li>
            ))}
            {data.enrolledClasses.length === 0 ? (
              <li className="text-[var(--text-small)] text-foreground-secondary">참여 중인 클래스가 없습니다.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
