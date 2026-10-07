"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_TICK, CHART_TOOLTIP_STYLE, ChartSummary } from "./chart-config";

export interface RoleCount {
  role: "ADMIN" | "OWNER" | "MANAGER" | "TENANT";
  count: number;
}

const ROLE_COLORS: Record<RoleCount["role"], string> = {
  ADMIN: "var(--chart-4)",
  OWNER: "var(--chart-2)",
  MANAGER: "var(--chart-3)",
  TENANT: "var(--chart-1)",
};

/** Admin dashboard: accounts per role, next to the platform total. */
export function UsersByRoleChart({
  data,
  total,
}: {
  data: RoleCount[];
  total: number;
}) {
  const summary = data
    .map((entry) => `${entry.role} ${entry.count}`)
    .join(", ");

  return (
    <div>
      <ChartSummary
        label={`Users by role: ${summary}. ${total} accounts in total.`}
      />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 24, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="role"
              tick={CHART_TICK}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={CHART_TICK}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.role} fill={ROLE_COLORS[entry.role]} />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                fill="var(--foreground)"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {total} accounts in total
      </p>
    </div>
  );
}
