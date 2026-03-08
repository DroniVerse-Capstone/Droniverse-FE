"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-greyscale-900 text-greyscale-0">
      <div className="absolute inset-0 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[96px_96px] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(219,65,57,0.14),transparent_30%)]" />

      <div className="relative flex flex-col items-center gap-8 px-6">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div className="absolute h-48 w-48 rounded-full border border-greyscale-700/80" />
          <div className="absolute h-36 w-36 rounded-full border border-greyscale-600/70" />
          <div className="absolute h-24 w-24 rounded-full border border-greyscale-500/50" />

          <div className="absolute h-48 w-48 rounded-full border border-secondary/25 animate-radar-ping" />
          <div className="absolute h-48 w-48 rounded-full border-2 border-transparent border-t-primary/70 animate-orbit-fast" />
          <div className="absolute h-36 w-36 rounded-full border-2 border-transparent border-t-tertiary/70 animate-orbit-slow" />

          <div className="absolute h-px w-40 bg-linear-to-r from-transparent via-greyscale-500/50 to-transparent" />
          <div className="absolute h-40 w-px bg-linear-to-b from-transparent via-greyscale-500/50 to-transparent" />

          <div className="absolute h-3 w-3 rounded-full bg-secondary shadow-[0_0_24px_rgba(45,212,191,0.85)] animate-drone-dot" />

          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/25 bg-greyscale-800/85 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="absolute inset-2 rounded-2xl border border-white/6" />
            <Image
              src="/images/Logo-NoBg.png"
              alt="Droniverse"
              width={40}
              height={40}
              className="relative h-10 w-10 object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.42em] text-primary-100/90">
            DroniVerse System
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-greyscale-400">
          <span className="h-2 w-2 rounded-full bg-primary animate-status-pulse" />
          <span>Loading...</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit-fast {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbit-slow {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes radar-ping {
          0% {
            transform: scale(0.72);
            opacity: 0;
          }
          25% {
            opacity: 0.9;
          }
          100% {
            transform: scale(1.18);
            opacity: 0;
          }
        }

        @keyframes drone-dot {
          0% {
            transform: rotate(0deg) translateX(96px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(96px) rotate(-360deg);
          }
        }

        @keyframes status-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.7);
          }
        }

        .animate-orbit-fast {
          animation: orbit-fast 2.8s linear infinite;
        }

        .animate-orbit-slow {
          animation: orbit-slow 4.8s linear infinite;
        }

        .animate-radar-ping {
          animation: radar-ping 2.2s ease-out infinite;
        }

        .animate-drone-dot {
          animation: drone-dot 4.2s linear infinite;
        }

        .animate-status-pulse {
          animation: status-pulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
