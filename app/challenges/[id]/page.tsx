"use client";

import ChallengeSimulator from "@/components/challenges/ChallengeSimulator";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockLabs } from "@/components/challenges/levels/registry";

export default function DroneChallengeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const lab = mockLabs[id];

  return (
    <div className="h-screen bg-[#020617] text-white font-sans flex flex-col overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-cyan-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-indigo-700/10 rounded-full blur-[140px]" />
      </div>

      {/* HEADER - Simple */}
      <header className="relative z-30 shrink-0 flex items-center justify-between px-4 py-3 bg-slate-900/40 backdrop-blur-md border-b border-white/5">
        <Link
          href="/mechanics/quadcopter"
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">Quay lại</span>
        </Link>

        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold uppercase tracking-wide text-white">
          {lab?.title || "Thử thách"}
        </h1>

        <div className="w-[80px]" />
      </header>

      {/* CONTENT */}
      <main className="relative z-10 flex-1 min-h-0 overflow-hidden">
        <ChallengeSimulator labId={id} />
      </main>
    </div>
  );
}
