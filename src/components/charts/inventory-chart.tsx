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

export interface InventoryDatum {
  label: string;
  count: number;
}

const INVENTORY_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-5)"];

/** Admin dashboard: properties vs flats vs active advertisements. */
export function InventoryChart({ data }: { data: InventoryDatum[] }) {
  const summary = data
    .map((entry) => `${entry.label} ${entry.count}`)
    .join(", ");

  return (
    <div>
      <ChartSummary label={`Inventory: ${summary}.`} />
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
              dataKey="label"
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
              {data.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={INVENTORY_COLORS[index % INVENTORY_COLORS.length]}
                />
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
        Properties hold flats; active advertisements are the published listings
        tenants can apply to.
      </p>
    </div>
  );
}
