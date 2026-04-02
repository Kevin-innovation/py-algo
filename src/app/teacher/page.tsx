import TeacherClassManager from '../../components/TeacherClassManager';
import TeacherRealtimeMonitor from '../../components/TeacherRealtimeMonitor';

export default function TeacherPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-4">Teacher Dashboard</h1>
      <p className="text-foreground-secondary mb-6">수업을 생성하거나 클래스 코드로 참여를 관리할 수 있습니다.</p>
      <TeacherClassManager />
      <div className="mt-6">
        <TeacherRealtimeMonitor />
      </div>
    </div>
  );
}
