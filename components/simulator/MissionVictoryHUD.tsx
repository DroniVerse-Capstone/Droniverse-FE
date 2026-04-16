import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaBatteryFull, FaRulerCombined, FaLayerGroup, FaRedo, FaCloudUploadAlt, FaStar, FaLock, FaArrowRight } from 'react-icons/fa';
import { calculateLabScore, getRankDetails } from '@/lib/simulator/labScoring';


const TIMING = {
  countDuration: 1000,
  countSteps: 50,
  rankRevealDelay: 250,
  buttonsUnlockDelay: 600,
};


interface MissionVictoryHUDProps {
  studentMetrics: {
    timeSpent: number;
    fuelConsumed: number;
    logicalDistance: number;
    blockCount: number;
  };
  adminMetrics?: {
    timeSpent: number;
    fuelConsumed: number;
    logicalDistance: number;
    blockCount: number;
  };
  onRetry: () => void;
  onNext?: () => void;
}

const StatRow: React.FC<{ icon: React.ElementType; label: string; value: string; delay: number }> = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: 12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
  >
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-slate-500 shrink-0">
        <Icon size={12} />
      </div>
      <span className="text-sm text-slate-400 font-medium">{label}</span>
    </div>
    <span className="text-sm font-black text-white tabular-nums">{value}</span>
  </motion.div>
);

// --- Main HUD ---
export const MissionVictoryHUD: React.FC<MissionVictoryHUDProps> = ({
  studentMetrics,
  adminMetrics,
  onRetry,
  onNext,
}) => {
  const [phase, setPhase] = useState<'counting' | 'rank' | 'done'>('counting');
  const [displayScore, setDisplayScore] = useState(0);

  const totalScore = useMemo(() =>
    calculateLabScore(studentMetrics, adminMetrics),
    [studentMetrics, adminMetrics]
  );

  const rank = useMemo(() =>
    getRankDetails(totalScore),
    [totalScore]
  );

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let countTimer: ReturnType<typeof setInterval>;

    const steps = TIMING.countSteps;
    const duration = TIMING.countDuration;
    const stepMs = duration / steps;
    const increment = totalScore / steps;
    let current = 0;
    let step = 0;

    countTimer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayScore(totalScore);
        clearInterval(countTimer);
        t1 = setTimeout(() => {
          setPhase('rank');
          setTimeout(() => setPhase('done'), TIMING.buttonsUnlockDelay);
        }, TIMING.rankRevealDelay);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, stepMs);

    return () => {
      clearTimeout(t1);
      clearInterval(countTimer);
    };
  }, [totalScore]);

  const buttonsReady = phase === 'done';
  const rankVisible = phase === 'rank' || phase === 'done';

  const statRows = [
    { icon: FaClock, label: 'Thời gian bay', value: `${studentMetrics.timeSpent}s` },
    { icon: FaBatteryFull, label: 'Năng lượng tiêu thụ', value: `${studentMetrics.fuelConsumed}U` },
    { icon: FaRulerCombined, label: 'Quãng đường bay', value: `${Math.round(studentMetrics.logicalDistance)}m` },
    { icon: FaLayerGroup, label: 'Số khối lệnh dùng', value: `${studentMetrics.blockCount} khối` },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-4xl bg-[#0b0c10] border border-white/10 rounded-xl shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row"
      >
        <div className="w-full md:w-2/5 min-h-[300px] flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/8 bg-gradient-to-br from-white/[0.02] to-transparent p-10">

          <AnimatePresence>
            {rankVisible && (
              <motion.div
                key="glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                className="absolute inset-0 blur-[80px] pointer-events-none"
                style={{ backgroundColor: rank.glow }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!rankVisible ? (
              <motion.div
                key="counting"
                exit={{ opacity: 0, scale: 0.7, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-3 z-10"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Tổng điểm đạt được</p>
                <div className="flex items-end gap-2">
                  <span className="text-[100px] md:text-[130px] font-black font-mono tabular-nums leading-none text-white">
                    {displayScore}
                  </span>
                </div>
                {/* Pulsing dots below */}
                <div className="flex gap-1.5 mt-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }}
                      className="w-1.5 h-1.5 rounded-full bg-white/25"
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="rank"
                initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 11, stiffness: 140 }}
                className="flex flex-col items-center gap-3 relative z-10"
              >
                {/* Rank letter */}
                <div
                  className={`text-[150px] md:text-[190px] font-black italic leading-none select-none ${rank.color}`}
                  style={{ textShadow: `0 0 80px ${rank.glow}` }}
                >
                  {rank.label}
                </div>

                {/* Pulsing glow behind letter */}
                <motion.div
                  animate={{ opacity: [0.2, 0.55, 0.2], scale: [0.88, 1.06, 0.88] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className={`absolute inset-0 blur-3xl -z-10 ${rank.bg} opacity-20`}
                />

                {/* Rank name + stars */}
                <div className="flex flex-col items-center gap-2 -mt-4">
                  <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${rank.color}`}>RANK</p>
                  <p className="text-slate-400 font-bold text-sm tracking-widest">{rank.desc}</p>
                  {/* <div className="flex gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s, i) => (
                      <motion.div
                        key={s}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.07, type: 'spring', stiffness: 200 }}
                      >
                        <FaStar
                          size={15}
                          className={totalScore >= s * 20 ? 'text-yellow-400' : 'text-white/10'}
                          style={totalScore >= s * 20 ? { filter: 'drop-shadow(0 0 5px rgba(250,204,21,0.8))' } : {}}
                        />
                      </motion.div>
                    ))}
                  </div> */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== RIGHT: Stats + Actions ===== */}
        <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col gap-6 bg-black/40">

          {/* Header */}
          <div className="border-b border-white/5 pb-5">
            <h2 className="text-xl font-bold text-white italic tracking-tight">KẾT QUẢ CHUYẾN BAY</h2>
          </div>

          {/* Stat rows */}
          <div className="flex flex-col flex-1">
            {statRows.map((row, i) => (
              <StatRow key={row.label} {...row} delay={i * 0.07} />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!buttonsReady ? (
              /* Locked placeholder — completely replaces buttons, no bleed-through */
              <div className="flex gap-3 flex-1">
                <div className="flex-1 py-4 flex items-center justify-center rounded border border-white/5 bg-white/[0.02]">
                  <span className="text-[10px] text-white/15 font-black uppercase tracking-widest">Giải lại</span>
                </div>
                <div className="flex-[2] py-4 flex items-center justify-center gap-2 rounded bg-white/[0.03] border border-white/5">
                  <FaLock size={10} className="text-white/20" />
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                    {phase === 'counting' ? 'Đang tính điểm...' : 'Đang xếp hạng...'}
                  </span>
                </div>
              </div>
            ) : (
              /* Real buttons — only rendered when fully ready */
              <>
                <button
                  onClick={onRetry}
                  className="flex-1 py-4 flex items-center justify-center gap-2 rounded bg-white/[0.04] border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 group"
                >
                  <FaRedo size={12} className="group-hover:rotate-[-45deg] transition-transform duration-300" />
                  Giải lại
                </button>
                <button
                  onClick={onNext}
                  className="flex-[2] py-4 flex items-center justify-center gap-2 rounded bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:shadow-[0_0_36px_rgba(16,185,129,0.4)] transition-all active:scale-95"
                >
                  Tiếp tục bài học
                  <FaArrowRight size={13} />
                </button>
              </>
            )}
          </div>


          {/* Footer */}
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-700 uppercase tracking-widest border-t border-white/5 pt-4 -mt-2">

          </div>
        </div>
      </motion.div>
    </div>
  );
};
