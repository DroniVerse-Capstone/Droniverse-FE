"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PartsExplorerTab from "@/components/mechanics/parts-explorer/PartsExplorerTab";
import FlightMechanicsTab from "@/components/mechanics/flight-mechanics/FlightMechanicsTab";
// import PhysicsLabTab from "@/components/mechanics/physics-lab/PhysicsLabTab";
import PhysicsBasicsTab from "@/components/mechanics/physics-basics/PhysicsBasicsTab";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

const TABS = [
  { id: "parts", label: "Khám phá linh kiện" },
  { id: "physics-basics", label: "Vật lý cơ bản" },
  { id: "mechanics", label: "Cơ chế điều khiển" },
  // { id: "physlab", label: "Physics Lab" },
];

export default function QuadcopterMechanicsLab() {
  const [activeTab, setActiveTab] = useState("parts");

  return (
    <div
      className="h-screen bg-[#020617] text-white font-sans flex flex-col overflow-hidden"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-cyan-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-indigo-700/10 rounded-full blur-[140px]" />
      </div>

      {/* ── TOP BAR (Header) ── */}
      <header className="relative z-30 shrink-0 flex items-center justify-between px-8 py-9 bg-slate-900/20 backdrop-blur-md border-b border-white/5">
        {/* Title Group */}
        <div className="flex items-center gap-4">
          {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/10 ring-1 ring-white/10">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-base font-black tracking-tight flex items-center gap-2">
            Quadcopter <span className="text-white/20">/</span> <span className="text-white">Cơ Chế Máy Bay</span>
          </h1> */}
        </div>

        {/* Tab Switcher */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-md bg-black/40 border border-white/5 backdrop-blur-xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-6 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                  isActive ? "text-cyan-400" : "text-white/30 hover:text-white/60"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 rounded-md bg-cyan-500/10 border border-cyan-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions or Empty Space */}
        <div className="w-[120px]" /> {/* Balancing the logo width */}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 min-h-0 overflow-hidden p-3">
        <AnimatePresence mode="wait">
          {activeTab === "parts" ? (
            <motion.div
              key="parts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <PartsExplorerTab />
            </motion.div>
          ) : activeTab === "mechanics" ? (
            <motion.div
              key="mechanics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <FlightMechanicsTab />
            </motion.div>
          )
            // : activeTab === "physlab" ? (
            //   <motion.div
            //     key="physlab"
            //     initial={{ opacity: 0, y: 10 }}
            //     animate={{ opacity: 1, y: 0 }}
            //     exit={{ opacity: 0, y: -10 }}
            //     transition={{ duration: 0.2 }}
            //     className="h-full"
            //   >
            //     <PhysicsLabTab />
            //   </motion.div>
            // )
            : (
              <motion.div
                key="physics-basics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <PhysicsBasicsTab />
              </motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}
