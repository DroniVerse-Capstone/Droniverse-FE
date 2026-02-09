"use client";

import Link from "next/link";
import { useTranslations } from "@/providers/i18n-provider";
import { LanguageSwitcher } from "../layouts/LanguageSwitcher";

type Props = {
  onRun: () => void;
  onDebug?: () => void;
  onReset: () => void;
  status: string;
  backLink?: { href: string; label?: string };
  hasBlocks?: boolean;
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
};

export default function Toolbar(props: Props) {
  const {
    onRun,
    onReset,
    status,
    backLink,
    hasBlocks = false,
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
  } = props;

  const t = useTranslations("Sandbox");
  const runDisabled = !hasBlocks;

  return (
    <div className="w-full flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-800/40 bg-slate-950/60 text-white backdrop-blur-sm">
      {/* Logo + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {t("toolbar.title")}
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-3">
        {backLink && (
          <Link
            href={backLink.href}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>←</span>
            <span>{backLink.label || t("toolbar.backToHome")}</span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          {!debugActive && (
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${runDisabled
                ? "bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-700/30"
                : "bg-emerald-600/80 text-white hover:bg-emerald-500/90 border border-emerald-500/30"
                }`}
              onClick={() => {
                if (debugActive && typeof onStopDebug === "function") {
                  onStopDebug();
                }
                onRun();
              }}
              disabled={runDisabled}
            >
              {t("toolbar.run")}
            </button>
          )}

          {!debugActive ? (
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${!hasBlocks
                ? "bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-700/30"
                : "bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-600/30"
                }`}
              onClick={onStartDebug}
              disabled={!hasBlocks}
              title="Debug mode"
            >
              {t("toolbar.debug")}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-400 px-2 py-1 bg-slate-800/30 rounded border border-slate-700/30">
                {remainingSteps}
              </div>
              <button
                className={`w-7 h-7 flex items-center justify-center text-xs rounded transition-all ${isDebugFinished || remainingSteps === 0
                  ? "bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 border border-slate-700/40"
                  }`}
                onClick={onStepDebug}
                title="Step"
                disabled={isDebugFinished || remainingSteps === 0}
              >
                ▶
              </button>
              <button
                className={`w-7 h-7 flex items-center justify-center text-xs rounded transition-all ${isPlayingDebug
                  ? "bg-rose-600/60 text-white border border-rose-500/40"
                  : isDebugFinished || remainingSteps === 0
                    ? "bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 border border-slate-700/40"
                  }`}
                onClick={onTogglePlayDebug}
                title={isPlayingDebug ? "Pause" : "Play"}
                disabled={isDebugFinished || remainingSteps === 0}
              >
                {isPlayingDebug ? "⏸" : "⏵"}
              </button>
              <button
                className="w-7 h-7 flex items-center justify-center text-xs rounded transition-all bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 border border-slate-700/40"
                onClick={onRepeatDebug}
                title="Repeat"
              >
                ↺
              </button>
              <button
                className="w-7 h-7 flex items-center justify-center text-xs rounded transition-all bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 border border-slate-700/40"
                onClick={onStopDebug}
                title="Stop"
              >
                ■
              </button>
            </div>
          )}
        </div>

        {!debugActive && (
          <button
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/30 hover:bg-slate-800/50 rounded transition-all border border-slate-700/30"
            onClick={onReset}
          >
            {t("toolbar.reset")}
          </button>
        )}

        <span className="text-xs text-slate-400 px-3 py-1 bg-slate-800/30 rounded border border-slate-700/30">
          {t("status." + status.toLowerCase())}
        </span>
        {showSettings && onSettingsClick && (
          <button
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/30 hover:bg-slate-800/50 rounded transition-all border border-slate-700/30"
            onClick={onSettingsClick}
            title={t("toolbar.settings")}
          >
            {t("toolbar.settings")}
          </button>
        )}

        <LanguageSwitcher />

      </div>
    </div>
  );
}
