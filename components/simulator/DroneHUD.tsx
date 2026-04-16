import { normalizeAngle } from "@/helpers/angle";
import { DroneState } from "@/lib/simulator/droneSimulator";

type Vector3 = { x: number; y: number; z: number };

type DroneHUDProps = {
  state: DroneState;
  title: string;
  description?: string;
  headingBase?: number;
  originPoint?: Vector3;
  axisHints?: { label: string; detail: string }[];
};

export default function DroneHUD({
  state,
  title,
  description,
  headingBase,
  originPoint,
  axisHints = [],
}: DroneHUDProps) {
  const storedX = state.x;
  const storedY = state.altitude;
  const storedZ = state.y;

  const adjustedX = storedX - (originPoint?.x ?? 0);
  const adjustedY = storedY - (originPoint?.z ?? 0);
  const adjustedZ = storedZ - (originPoint?.y ?? 0);

  const headingValue = normalizeAngle(state.headingDeg);

  const isRelativeMode = originPoint !== undefined;
  const displayZ = isRelativeMode ? adjustedZ : storedZ;
  const items = [
    { label: isRelativeMode ? "ΔX" : "X", value: (isRelativeMode ? adjustedX : storedX).toFixed(0) },
    { label: isRelativeMode ? "ΔY" : "Y", value: (isRelativeMode ? adjustedY : storedY).toFixed(0) },
    { label: isRelativeMode ? "ΔZ" : "Z", value: displayZ.toFixed(0) },
    { label: "Heading", value: `${headingValue.toFixed(0)}°` },
    { label: "Engines", value: state.isStarted ? "ON" : "OFF" },
  ];

  return (
    <div className="mt-2 sm:mt-5 w-full flex flex-col gap-2 sm:gap-3 rounded-xl border border-cyan-400/30 bg-slate-900/70 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-200 backdrop-blur">
      <div className="flex items-center gap-2 text-cyan-300 font-semibold uppercase tracking-wide text-xs sm:text-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>{title}</span>
      </div>
      {description && <div className="text-slate-400 text-[10px] sm:text-[11px] leading-relaxed">{description}</div>}
      <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono">
        {items.map((item) => {
          const isEngine = item.label === "Engines";
          const engineColor = state.isStarted ? "text-emerald-400" : "text-rose-400";
          return (
            <div
              key={item.label}
              className="flex-1 min-w-[60px] flex flex-col gap-0.5 sm:gap-1 rounded-lg bg-slate-900/80 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-700/60"
            >
              <span className="text-slate-500 uppercase tracking-wide text-[9px] sm:text-[10px]">
                {item.label}
              </span>
              <span className={`text-xs sm:text-sm ${isEngine ? engineColor : "text-slate-50"}`}>{item.value}</span>
            </div>
          );
        })}
      </div>
      {axisHints.length > 0 && (

        <div className="flex flex-wrap  gap-4 sm:gap-2 text-[12px] md:text-[1] sm:text-[8px] text-slate-400">
          {axisHints.map((hint) => (
            <span
              key={hint.label}
              className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/90 px-1.5 sm:px-2 py-0.5 sm:py-1"
            >
              <span className="text-cyan-300 font-semibold">{hint.label}</span>
              <span>{hint.detail}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

