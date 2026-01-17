"use client";

import Link from "next/link";

export type ExperienceMode = "sandbox" | "lab";

type Props = {
  title?: string;
  mode: ExperienceMode;
  onModeChange?: (mode: ExperienceMode) => void;
  showModeToggle?: boolean;
  onRun: () => void;
  onDebug?: () => void;
  onReset: () => void;
  onStartLab?: () => void;
  showStartLabButton?: boolean;
  labActive?: boolean;
  status: string;
  levelId: string;
  levels: { id: string; name: string }[];
  onChangeLevel?: (id: string) => void;
  showLevelSelector?: boolean;
  backLink?: { href: string; label: string };
  runDisabled?: boolean;
  onSettingsClick?: () => void;
  showSettings?: boolean;
  debugActive?: boolean;
  onStartDebug?: () => void;
  onStopDebug?: () => void;
  onStepDebug?: () => void;
  onTogglePlayDebug?: () => void;
  onRepeatDebug?: () => void;
  isPlayingDebug?: boolean;
  isDebugFinished?: boolean;
  remainingSteps?: number;
  // run mode: 'restart' | 'continue'
  runMode?: "restart" | "continue";
  onToggleRunMode?: () => void;
};

export default function Toolbar(props: Props) {
  const {
    title = "Droniverse",
    mode,
    onModeChange,
    showModeToggle = true,
    onRun,
    onDebug,
    onReset,
    onStartLab,
    showStartLabButton = true,
    labActive = false,
    status,
    levelId,
    levels,
    onChangeLevel,
    showLevelSelector = true,
    backLink,
    runDisabled = false,
    onSettingsClick,
    showSettings = false,
    debugActive = false,
    onStartDebug,
    onStopDebug,
    onStepDebug,
    onTogglePlayDebug,
    isPlayingDebug = false,
    remainingSteps = 0,
    onRepeatDebug,
    isDebugFinished = false,
    runMode = "restart",
    onToggleRunMode,
  } = props;

  const renderModeButton = (value: ExperienceMode, label: string) => {
    const isActive = mode === value;
    return (
      <button
        key={value}
        onClick={() => {
          if (debugActive) return;
          onModeChange?.(value);
        }}
        disabled={debugActive}
        className={`px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
          isActive
            ? "bg-linear-to-r from-cyan-500/30 to-blue-500/20 border-cyan-400/70 text-white shadow-sm shadow-cyan-400/20"
            : debugActive
            ? "bg-slate-700/30 border-slate-600/30 text-slate-400 cursor-not-allowed"
            : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200 hover:bg-slate-800/70"
        }`}
        aria-pressed={isActive}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-6 py-3 border-b border-slate-700/50 bg-linear-to-r from-slate-900 via-slate-800/95 to-slate-900 text-white shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-cyan-400/30 to-blue-500/20 border-2 border-cyan-400/60 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-cyan-400/20">
          <span className="text-sm sm:text-lg">🚁</span>
        </div>
        <h1 className="text-sm sm:text-base font-bold tracking-wide truncate bg-linear-to-r from-white to-slate-200 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end w-full sm:w-auto">
        {backLink && (
          <Link
            href={backLink.href}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-cyan-400/60 hover:text-cyan-200 hover:bg-slate-800/60 hover:shadow-md hover:shadow-cyan-400/10 whitespace-nowrap"
          >
            <span>←</span>
            <span>{backLink.label}</span>
          </Link>
        )}
        {showModeToggle && (
          <>
            {!debugActive ? (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-800/70 backdrop-blur-sm rounded-xl px-1.5 sm:px-2 py-1 border border-slate-700/50 shadow-inner">
                {renderModeButton("sandbox", "Sandbox")}
                {renderModeButton("lab", "Lab")}
              </div>
            ) : (
              <div className="hidden sm:inline-flex items-center gap-1 sm:gap-1.5 bg-slate-800/40 rounded-xl px-2 py-1 border border-slate-700/30 text-slate-300 text-xs">
                Mode: {mode === "sandbox" ? "Sandbox" : "Lab"}
              </div>
            )}
          </>
        )}
        {!debugActive && (
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <label className="text-xs text-slate-300 mr-1">Run:</label>
            <button
              className={`px-2 py-1 text-xs rounded-md ${
                runMode === "continue" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-300"
              }`}
              onClick={() => onToggleRunMode?.()}
              title="Toggle Run mode: Restart (reset before run) / Continue (append new blocks)"
            >
              {runMode === "continue" ? "Continue" : "Restart"}
            </button>
          </div>
        )}

        {showLevelSelector && mode === "lab" && onChangeLevel && (
          <select
            className={`text-[10px] sm:text-xs rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 ${
              debugActive ? "bg-slate-800/40 text-slate-400 cursor-not-allowed" : "bg-slate-800/80 text-white"
            } border border-slate-600/50 hover:border-cyan-400/60 transition-all ${
              debugActive ? "pointer-events-none" : "pointer-events-auto"
            } focus:ring-2 focus:ring-cyan-400/50 focus:outline-none focus:border-cyan-400 shadow-sm hover:shadow-md hover:shadow-cyan-400/10 max-w-[120px] sm:max-w-none`}
            value={levelId}
            onChange={(e) => {
              if (!debugActive) onChangeLevel(e.target.value);
            }}
          >
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        )}

        {mode === "lab" && showStartLabButton && onStartLab && (
          <button
            className={`hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
              labActive
                ? "bg-emerald-600/20 border-emerald-400/50 text-emerald-200 cursor-not-allowed shadow-sm"
                : "bg-emerald-500/20 border-emerald-400/60 text-emerald-100 hover:bg-emerald-500/30 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-400/20"
            }`}
            onClick={onStartLab}
            disabled={labActive}
          >
            {labActive ? "Đang trong lab" : "Bắt đầu bài lab"}
          </button>
        )}

        <div className="flex items-center gap-2">
          {!debugActive && (
            <button
              className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all shadow-md whitespace-nowrap ${
                (runDisabled && !debugActive)
                  ? "bg-slate-600/50 text-slate-400 cursor-not-allowed"
                  : "bg-linear-to-r from-green-500 via-emerald-500 to-green-500 text-white hover:from-green-600 hover:via-emerald-600 hover:to-green-600 hover:shadow-lg hover:shadow-green-500/40 shadow-green-500/30"
              }`}
              onClick={() => {
                // allow Run to exit debug mode if active
                if (debugActive && typeof onStopDebug === "function") {
                  onStopDebug();
                }
                onRun();
              }}
              disabled={runDisabled && !debugActive}
            >
              ▶ Run
            </button>
          )}

          {!debugActive ? (
            <button
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                runDisabled
                  ? "bg-slate-700/40 text-slate-400 cursor-not-allowed"
                  : "bg-yellow-600/10 text-yellow-300 hover:bg-yellow-600/20 hover:shadow-sm"
              }`}
              onClick={onStartDebug}
              disabled={runDisabled}
              title="Enter debug mode (prepare program for step-through)"
            >
              Debug
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-300 mr-1">Remain: {remainingSteps}</div>
              <button
                className={`w-8 h-8 flex items-center justify-center text-xs rounded-md ${
                  isDebugFinished || remainingSteps === 0
                    ? "bg-slate-700/30 text-slate-400 cursor-not-allowed"
                    : "bg-slate-700/60 text-white"
                }`}
                onClick={onStepDebug}
                title="Step"
                disabled={isDebugFinished || remainingSteps === 0}
              >
                ▶|
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center text-xs rounded-md ${
                  isPlayingDebug
                    ? "bg-rose-600/60 text-white"
                    : isDebugFinished || remainingSteps === 0
                    ? "bg-slate-700/30 text-slate-400 cursor-not-allowed"
                    : "bg-slate-700/60 text-white"
                }`}
                onClick={onTogglePlayDebug}
                title={isPlayingDebug ? "Pause" : "Play"}
                disabled={isDebugFinished || remainingSteps === 0}
              >
                {isPlayingDebug ? "⏸" : "⏵"}
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center text-xs rounded-md bg-slate-700/60 text-white"
                onClick={onRepeatDebug}
                title="Repeat (reset debug and replay)"
              >
                ↺
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center text-xs rounded-md bg-slate-700/60 text-white"
                onClick={onStopDebug}
                title="Stop debug"
              >
                ■
              </button>
            </div>
          )}
        </div>

        {!debugActive && (
          <button
            className="px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-slate-700/80 text-white hover:bg-slate-600 transition-all shadow-md hover:shadow-lg border border-slate-600/50 whitespace-nowrap"
            onClick={onReset}
          >
            ↻ Reset
          </button>
        )}

        <span className="text-[10px] sm:text-xs text-cyan-200 font-medium px-2 sm:px-3 py-0.5 sm:py-1 bg-linear-to-r from-cyan-400/10 to-blue-500/10 rounded-full border border-cyan-400/40 shadow-sm whitespace-nowrap backdrop-blur-sm min-w-[110px] text-center">
          {status}
        </span>

        {showSettings && onSettingsClick && (
          <button
            className="px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-slate-700/80 text-white hover:bg-slate-600 transition-all shadow-md hover:shadow-lg border border-slate-600/50 whitespace-nowrap"
            onClick={onSettingsClick}
          >
            ⚙️ 
          </button>
        )}
      </div>
    </div>
  );
}
