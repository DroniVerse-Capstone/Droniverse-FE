"use client";

import React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

type AppAreaChartProps<TData extends Record<string, unknown>> = {
  data: TData[];
  xDataKey: keyof TData | string;
  yDataKey: keyof TData | string;
  className?: string;
  chartClassName?: string;
  strokeColor?: string;
  gradientId?: string;
  gradientStartOpacity?: number;
  gradientEndOpacity?: number;
  xTickColor?: string;
  yTickColor?: string;
  gridColor?: string;
  yTickFormatter?: (value: unknown) => string;
  xTickFormatter?: (value: unknown) => string;
  tooltipFormatter?: (value: unknown) => [React.ReactNode, React.ReactNode] | React.ReactNode;
  tooltipLabelFormatter?: (label: unknown) => React.ReactNode;
};

export default function AppAreaChart<TData extends Record<string, unknown>>({
  data,
  xDataKey,
  yDataKey,
  className,
  chartClassName,
  strokeColor = "#15A7FA",
  gradientId = "app-area-gradient",
  gradientStartOpacity = 0.45,
  gradientEndOpacity = 0.04,
  xTickColor = "#BFC6D0",
  yTickColor = "#BFC6D0",
  gridColor = "#404448",
  yTickFormatter,
  xTickFormatter,
  tooltipFormatter,
  tooltipLabelFormatter,
}: AppAreaChartProps<TData>) {
  return (
    <div className={cn("h-72", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} className={chartClassName}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={gradientStartOpacity} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={gradientEndOpacity} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />

          <XAxis
            dataKey={String(xDataKey)}
            tick={{ fill: xTickColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={xTickFormatter as ((value: string) => string) | undefined}
          />

          <YAxis
            tick={{ fill: yTickColor, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yTickFormatter as ((value: string) => string) | undefined}
          />

          <Tooltip
            formatter={tooltipFormatter as ((value: unknown) => React.ReactNode) | undefined}
            labelFormatter={tooltipLabelFormatter as ((label: unknown) => React.ReactNode) | undefined}
            contentStyle={{
              background: "#1E2227",
              border: "1px solid #404448",
              color: "#F6F8FA",
              borderRadius: 8,
            }}
          />

          <Area
            type="monotone"
            dataKey={String(yDataKey)}
            stroke={strokeColor}
            fill={`url(#${gradientId})`}
            strokeWidth={2.5}
            activeDot={{ r: 4 }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
