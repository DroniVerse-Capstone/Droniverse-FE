"use client";

import ChallengeSimulator from "@/components/challenges/ChallengeSimulator";
import { ChevronLeft } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function DroneChallengeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnUrl = searchParams.get("returnUrl");

  const isAdmin = returnUrl ? (returnUrl.includes("course-management") || returnUrl.includes("system")) : false;

  return (
    <div className="h-screen bg-slate-950 text-white font-sans flex flex-col overflow-hidden">
      {/* HEADER - Back button bar */}
      <header className="relative z-30 shrink-0 flex items-center px-4 py-2 bg-slate-950 border-b border-slate-800">
        {returnUrl && (
          <button
            onClick={() => router.push(returnUrl)}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
              {isAdmin
                ? "Quay lại quản trị"
                : "Quay lại bài học"}
            </span>
          </button>
        )}
        <div className="flex-1" />
      </header>

      {/* CONTENT */}
      <main className="relative z-10 flex-1 min-h-0 overflow-hidden">
        <ChallengeSimulator labId={id} returnUrl={returnUrl} isAdmin={isAdmin} />
      </main>
    </div>
  );
}
