import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaBatteryFull, FaRulerCombined, FaLayerGroup, FaRedo, FaCloudUploadAlt, FaTrophy, FaStar } from 'react-icons/fa';
import { LabSolution } from '@/types/lab';

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
  onSubmit: (score: number) => void;
}

export const MissionVictoryHUD: React.FC<MissionVictoryHUDProps> = ({
  studentMetrics,
  adminMetrics,
  onRetry,
  onSubmit,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Default benchmarks if Admin solution is missing (though it shouldn't be)
  const benchmarks = adminMetrics || {
    timeSpent: studentMetrics.timeSpent * 0.8,
    fuelConsumed: studentMetrics.fuelConsumed * 0.8,
    logicalDistance: studentMetrics.logicalDistance * 0.8,
    blockCount: studentMetrics.blockCount - 2,
  };

  // 1. Calculate Pilar Scores (Max 25 each)
  const scores = useMemo(() => {
    const calc = (mine: number, target: number) => Math.min(25, Math.max(0, (target / (mine || 1)) * 25));
    
    return {
      time: Math.round(calc(studentMetrics.timeSpent, benchmarks.timeSpent)),
      fuel: Math.round(calc(studentMetrics.fuelConsumed, benchmarks.fuelConsumed)),
      dist: Math.round(calc(studentMetrics.logicalDistance, benchmarks.logicalDistance)),
      blocks: Math.round(calc(studentMetrics.blockCount, benchmarks.blockCount)),
    };
  }, [studentMetrics, benchmarks]);

  const totalScore = scores.time + scores.fuel + scores.dist + scores.blocks;

  // 2. Determine Rank
  const rank = useMemo(() => {
    if (totalScore >= 95) return { label: 'S', color: 'text-yellow-400', glow: 'shadow-yellow-500/50', desc: 'BẬC THẦY PHI CÔNG' };
    if (totalScore >= 80) return { label: 'A', color: 'text-emerald-400', glow: 'shadow-emerald-500/40', desc: 'XUẤT SẮC' };
    if (totalScore >= 60) return { label: 'B', color: 'text-sky-400', glow: 'shadow-sky-500/30', desc: 'HOÀN THÀNH' };
    return { label: 'C', color: 'text-orange-400', glow: 'shadow-orange-500/30', desc: 'CẦN TỐI ƯU THÊM' };
  }, [totalScore]);

  // 3. Count-up Animation
  useEffect(() => {
    setShowContent(true);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = totalScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalScore) {
        setDisplayScore(totalScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalScore]);

  const MetricCard = ({ icon: Icon, label, value, target, score, color }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-white/20 transition-all"
    >
      <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 -mr-4 -mt-4 rotate-12 transition-transform group-hover:scale-110 ${color}`}>
        <Icon size={64} />
      </div>

      <div className="flex items-center gap-2 mb-1">
        <div className={`p-2 rounded-lg bg-black/40 ${color} border border-white/5`}>
          <Icon size={14} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      </div>

      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-xl font-black text-white">{value}</span>
          <span className="text-[9px] text-slate-500 font-bold">MỤC TIÊU: {target}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-lg font-black ${color}`}>{score} <span className="text-[10px] opacity-60">/ 25</span></span>
          <div className="h-1 w-16 bg-white/10 rounded-full mt-1 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(score / 25) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full ${color.replace('text', 'bg')}`} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 bg-slate-950/80 backdrop-blur-2xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#0b0c10] border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col md:flex-row"
      >
        {/* Left: Decorative Rank Section */}
        <div className="w-full md:w-2/5 p-12 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className={`absolute inset-0 opacity-10 blur-[100px] ${rank.color.replace('text', 'bg')}`} />
          
          <motion.div 
            initial={{ rotate: -10, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative z-10"
          >
            <div className={`text-[120px] md:text-[180px] font-black italic select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] ${rank.color}`}>
              {rank.label}
            </div>
            <motion.div 
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute -inset-4 blur-2xl opacity-40 -z-10 ${rank.color.replace('text', 'bg')}`}
            />
          </motion.div>

          <div className="text-center mt-4">
            <h2 className={`text-xl font-black uppercase tracking-[0.4em] ${rank.color}`}>RANK</h2>
            <p className="text-slate-400 font-bold tracking-widest mt-2">{rank.desc}</p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar key={s} className={totalScore >= s * 20 ? 'text-yellow-400 shadow-yellow-500' : 'text-white/10'} />
              ))}
            </div>
            <span className="text-[10px] text-slate-600 font-mono uppercase">Mission Performance Audit</span>
          </div>
        </div>

        {/* Right: Stats & Scoring Section */}
        <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col gap-10 bg-black/40 backdrop-blur-md">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Nhiệm vụ hoàn tất</h3>
              <h2 className="text-2xl font-bold text-white tracking-tight italic">BÁO CÁO CÔNG VIỆC</h2>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TỔNG ĐIỂM</span>
              <div className="text-4xl font-black text-white font-mono flex items-baseline gap-1">
                {displayScore} <span className="text-sm opacity-30">/ 100</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard 
              icon={FaClock} 
              label="Thời gian bay" 
              value={`${studentMetrics.timeSpent}s`} 
              target={`${benchmarks.timeSpent}s`}
              score={scores.time}
              color="text-sky-400"
            />
            <MetricCard 
              icon={FaBatteryFull} 
              label="Năng lượng" 
              value={`${studentMetrics.fuelConsumed}U`} 
              target={`${benchmarks.fuelConsumed}U`}
              score={scores.fuel}
              color="text-emerald-400"
            />
            <MetricCard 
              icon={FaRulerCombined} 
              label="Quãng đường" 
              value={`${Math.round(studentMetrics.logicalDistance)}m`} 
              target={`${Math.round(benchmarks.logicalDistance)}m`}
              score={scores.dist}
              color="text-amber-400"
            />
            <MetricCard 
              icon={FaLayerGroup} 
              label="Số khối lệnh" 
              value={`${studentMetrics.blockCount}`} 
              target={`${benchmarks.blockCount}`}
              score={scores.blocks}
              color="text-purple-400"
            />
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onRetry}
              className="flex-1 py-4 flex items-center justify-center gap-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 group"
            >
              <FaRedo className="group-hover:rotate-[-45deg] transition-transform" />
              Giải lại
            </button>
            <button 
              onClick={() => onSubmit(totalScore)}
              className="flex-[2] py-4 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-black font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all active:scale-95"
            >
              <FaCloudUploadAlt />
              Xác nhận nộp bài
            </button>
          </div>

          {/* System Info Footer */}
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-700 uppercase pt-4 border-t border-white/5 tracking-widest">
            <span>DRONIVERSE ANALYTICS v4.0</span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              DIAGNOSTICS_LEGACY_PASS
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
