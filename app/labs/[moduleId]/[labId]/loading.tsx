export default function LabLoading() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Toolbar skeleton */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-6 py-3 border-b border-slate-700/50 bg-linear-to-r from-slate-900 via-slate-800/95 to-slate-900 text-white shadow-xl backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-cyan-400/20 to-blue-500/10 border-2 border-cyan-400/40 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-cyan-400/10 animate-pulse">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-cyan-400/20 rounded" />
          </div>
          <div className="h-4 sm:h-5 w-32 sm:w-40 bg-slate-800/60 rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end w-full sm:w-auto">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-1.5">
            <div className="h-3 w-3 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-800/50 rounded animate-pulse" />
          </div>
          <div className="h-7 w-20 bg-slate-800/50 rounded-lg animate-pulse" />
          <div className="h-7 w-16 bg-green-500/20 rounded-lg animate-pulse" />
          <div className="h-7 w-16 bg-slate-800/50 rounded-lg animate-pulse" />
          <div className="h-6 w-20 bg-cyan-400/10 rounded-full border border-cyan-400/20 animate-pulse" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-4 overflow-y-auto min-h-0 relative bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Blockly Workspace skeleton */}
        <div className="border-2 border-cyan-400/30 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-shadow min-h-[600px] sm:min-h-[500px] lg:min-h-0">
          <div className="px-3 sm:px-5 py-2 sm:py-3 bg-linear-to-r from-blue-500 via-blue-400 to-cyan-400 text-white flex items-center justify-between shrink-0">
            <div className="h-4 sm:h-5 w-32 sm:w-36 bg-white/10 rounded animate-pulse" />
            <div className="h-4 sm:h-5 w-20 sm:w-24 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex-1 min-h-0 bg-slate-900 relative">
            {/* Toolbox skeleton */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-20 bg-slate-800/80 border-r border-slate-700/50">
              <div className="flex flex-col gap-2 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 w-full bg-slate-700/40 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            {/* Blocks skeleton */}
            <div className="absolute left-16 sm:left-20 top-0 bottom-0 right-0 p-4">
              <div className="space-y-3">
                <div className="h-12 w-full bg-slate-800/50 rounded-lg animate-pulse" />
                <div className="h-12 w-4/5 bg-slate-800/50 rounded-lg animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="h-12 w-full bg-slate-800/50 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-12 w-3/4 bg-slate-800/50 rounded-lg animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 3D Simulator skeleton */}
        <div className="border-2 border-cyan-400/30 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 overflow-hidden flex flex-col shadow-2xl min-h-[600px] sm:min-h-[500px] lg:min-h-0">
          <div className="px-3 sm:px-5 py-2 sm:py-3 border-b-2 border-cyan-400 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between shrink-0">
            <div className="h-4 sm:h-5 w-36 sm:w-44 bg-cyan-400/10 rounded animate-pulse" />
            <div className="h-5 w-28 bg-emerald-400/10 rounded-full border border-emerald-400/20 animate-pulse" />
          </div>
          <div className="p-4 flex flex-col flex-1 min-h-0 bg-slate-900">
            {/* Canvas skeleton */}
            <div className="relative w-full flex-1 rounded-2xl border border-cyan-400/20 bg-linear-to-br from-slate-900/80 via-slate-950 to-slate-900 overflow-hidden min-h-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-linear-to-br from-cyan-400/5 to-blue-500/5 border-2 border-cyan-400/10 animate-pulse" />
              </div>
            </div>
            
            {/* HUD skeleton */}
            <div className="shrink-0 mt-3 rounded-xl border border-cyan-400/20 bg-slate-900/90 px-2 sm:px-4 py-2 sm:py-3 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/20 animate-pulse" />
                <div className="h-3 w-24 bg-slate-800/60 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg bg-slate-950/80 px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-800/60">
                    <div className="h-2 w-8 bg-slate-800/50 rounded mb-1 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    <div className="h-4 w-12 bg-slate-800/50 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
              {/* Axis hints skeleton */}
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-5 w-20 bg-slate-900/60 rounded-full border border-slate-800/60 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>

            {/* Actor Legend skeleton */}
            <div className="shrink-0 mt-3 px-4 py-2 bg-slate-900/60 rounded-lg border border-slate-800 backdrop-blur-sm">
              <div className="flex justify-center gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-800/50 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    <div className="h-3 w-12 bg-slate-800/50 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

