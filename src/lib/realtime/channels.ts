export interface SessionEventChannelInput {
  classId: string;
  studentId: string;
}

export const buildClassScopeChannel = (classId: string): string => `teacher:class:${classId}`;

export const buildSessionEventChannel = ({ classId, studentId }: SessionEventChannelInput): string => (
  `${buildClassScopeChannel(classId)}:student:${studentId}`
);
