// status 별 D/O 분포 도넛 (recharts).
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { DeliveryStatus } from "@/types";

const COLOR: Record<DeliveryStatus, string> = {
  PLANNING: "#94a3b8",
  DISPATCHED: "#3b82f6",
  YARD_STAGED: "#f59e0b",
  FINAL_DELIVERY: "#8b5cf6",
  EMPTY_STAGED: "#f97316",
  COMPLETED: "#22c55e",
};

export default function StatusDonut({
  data,
}: {
  data: { status: DeliveryStatus; count: number }[];
}) {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const filtered = data.filter((d) => d.count > 0);

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="h-64 w-full lg:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
            >
              {filtered.map((d) => (
                <Cell key={d.status} fill={COLOR[d.status]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} 건`, name]}
              contentStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1 text-sm lg:w-1/2">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div key={d.status} className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: COLOR[d.status] }}
              />
              <span className="flex-1 font-mono text-xs">{d.status}</span>
              <span className="font-medium">{d.count}</span>
              <span className="text-xs text-muted-foreground">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
