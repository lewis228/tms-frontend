import type { ReactNode } from "react";

import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";

export type DetailTab = {
  value: string;
  label: string; // 이미 t(...) 처리된 문자열을 전달한다
  content: ReactNode;
};

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode; // 상태 배지
  meta?: ReactNode; // 요약 메타 행 (route / date / equipment 등)
  actions?: ReactNode; // 우측 액션 버튼들
  tabs: DetailTab[];
  defaultTab?: string;
};

/**
 * Turvo 스타일 상세 레이아웃 — 상단 SummaryHeader + 하단 Tabs.
 * Shipment(컨테이너) / D-O 상세 등 탭 기반 상세 페이지의 공통 골격.
 * presentational only (데이터 훅 없음) — 호출부가 탭 content 를 조립해 전달.
 */
export default function DetailLayout({
  title,
  subtitle,
  badge,
  meta,
  actions,
  tabs,
  defaultTab,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* ── Summary Header ── */}
      <div className="bg-card flex flex-col gap-3 rounded-xl border p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              {badge}
            </div>
            {subtitle && (
              <div className="text-muted-foreground text-sm">{subtitle}</div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {meta && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            {meta}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue={defaultTab ?? tabs[0]?.value}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTab key={tab.value} value={tab.value} className="flex-none">
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsPanel key={tab.value} value={tab.value}>
            {tab.content}
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  );
}
