import { describe, expect, it } from 'vitest';

import { buildClassScopeChannel, buildSessionEventChannel } from './channels';

describe('realtime channel naming', () => {
  it('builds class scoped channel name', () => {
    expect(buildClassScopeChannel('class-1')).toBe('teacher:class:class-1');
  });

  it('builds class+student scoped session channel name', () => {
    expect(buildSessionEventChannel({ classId: 'class-1', studentId: 'student-9' })).toBe(
      'teacher:class:class-1:student:student-9',
    );
  });
});
