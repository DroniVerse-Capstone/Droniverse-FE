"use client";

import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

type BarLayout = "horizontal" | "vertical";

type AppBarChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  xDataKey: keyof TData | string;
  yDataKey: keyof TData | string;
  className?: string;
  chartClassName?: string;
  layout?: BarLayout;
  yAxisWidth?: number;
  barColor?: string;
  barColors?: string[];
  barRadius?: [number, number, number, number];
  xTickColor?: string;
  yTickColor?: string;
  gridColor?: string;
  xTickFormatter?: (value: unknown) => string;
  yTickFormatter?: (value: unknown) => string;
  customYAxisTick?: unknown;
  tooltipFormatter?: (value: unknown) => [React.ReactNode, React.ReactNode] | React.ReactNode;
  tooltipLabelFormatter?: (label: unknown, payload: unknown) => React.ReactNode;
  margin?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
};

export default function AppBarChart<TData extends Record<string, unknown>>({
  data,
  xDataKey,
  yDataKey,
  className,
  chartClassName,
  layout = "vertical",
  yAxisWidth = 160,
  barColor = "#34D399",
  barColors,
  barRadius = [0, 6, 6, 0],
  xTickColor = "#BFC6D0",
  yTickColor = "#BFC6D0",
  gridColor = "#404448",
  xTickFormatter,
  yTickFormatter,
  customYAxisTick,
  tooltipFormatter,
  tooltipLabelFormatter,
  margin = { top: 8, right: 12, left: 12, bottom: 8 },
}: AppBarChartProps<TData>) {
  return (
    <div className={cn("h-72", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} layout={layout} margin={margin} className={chartClassName}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />

          <XAxis
            type={layout === "vertical" ? "number" : "category"}
            dataKey={layout === "horizontal" ? String(xDataKey) : undefined}
            tick={{ fill: xTickColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={xTickFormatter as ((value: string) => string) | undefined}
          />

          <YAxis
            type={layout === "vertical" ? "category" : "number"}
            dataKey={layout === "vertical" ? String(yDataKey) : undefined}
            width={layout === "vertical" ? yAxisWidth : undefined}
            tick={
              (customYAxisTick as React.ComponentProps<typeof YAxis>["tick"]) ?? {
                fill: yTickColor,
                fontSize: 11,
              }
            }
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickFormatter as ((value: string) => string) | undefined}
          />

          <Tooltip
            formatter={tooltipFormatter as ((value: unknown) => React.ReactNode) | undefined}
            labelFormatter={tooltipLabelFormatter as ((label: unknown, payload: unknown) => React.ReactNode) | undefined}
            contentStyle={{
              background: "#1E2227",
              border: "1px solid #404448",
              color: "#F6F8FA",
              borderRadius: 8,
            }}
          />

          <Bar
            dataKey={layout === "vertical" ? String(xDataKey) : String(yDataKey)}
            fill={barColor}
            radius={barRadius}
          >
            {barColors?.length
              ? data.map((_, index) => (
                  <Cell key={`bar-cell-${index}`} fill={barColors[index % barColors.length]} />
                ))
              : null}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
