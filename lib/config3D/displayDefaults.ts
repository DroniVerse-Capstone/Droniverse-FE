export type DisplayConfig = {
  trailEnabled?: boolean;
  trailColor?: string;
  trailMaxLength?: number; 
  smoothing?: boolean;
  fade?: boolean;
  sampleDistance?: number;
  lineWidth?: number;
};

export const DEFAULT_DISPLAY_CONFIG: DisplayConfig = {
  trailEnabled: true,
  trailColor: "#33F6FF",
  trailMaxLength: 500,
  smoothing: true,
  fade: false,
  sampleDistance: 0.15,
  lineWidth: 2,
};


