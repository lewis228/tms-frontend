import DriverScheduleGantt from "@/components/dispatch/driver-schedule-gantt";

export default function DriverSchedulePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">기사 스케줄 (Driver Schedule)</h1>
      <p className="text-xs text-muted-foreground">
        bar 클릭 → Leg 수정 모달. 색상: PENDING(회색) · IN_TRANSIT(파랑) · COMPLETED(초록) · FAILED(빨강).
      </p>
      <DriverScheduleGantt />
    </div>
  );
}
