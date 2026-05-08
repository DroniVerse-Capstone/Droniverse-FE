"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MissionSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export default function MissionSuccessModal({ isOpen, onClose, onContinue }: MissionSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-hidden">
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#05050f]/80 backdrop-blur-2xl"
          />

          {/* Animated Glow Elements in Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 rotate: [0, 90, 0],
                 opacity: [0.1, 0.2, 0.1]
               }}
               transition={{ duration: 10, repeat: Infinity }}
               className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]" 
             />
             <motion.div 
               animate={{ 
                 scale: [1.2, 1, 1.2],
                 rotate: [90, 0, 90],
                 opacity: [0.1, 0.2, 0.1]
               }}
               transition={{ duration: 12, repeat: Infinity }}
               className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" 
             />
          </div>

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="relative w-full max-w-lg bg-[#0f172a]/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl ring-1 ring-white/20"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />

            {/* Top Decorative Header */}
            <div className="h-44 relative flex items-center justify-center overflow-hidden">
              {/* Spinning Ring Background */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute w-64 h-64 border border-dashed border-emerald-500/30 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute w-48 h-48 border border-dashed border-cyan-500/20 rounded-full"
              />
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] shadow-[0_0_40px_rgba(52,211,153,0.5)] flex items-center justify-center"
                >
                  <CheckCircle2 size={48} className="text-white drop-shadow-lg" />
                </motion.div>
                
                {/* Floating Particles */}
                <motion.div 
                  animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 text-emerald-400 opacity-60"
                >
                  <Sparkles size={20} />
                </motion.div>
              </div>
            </div>

            <div className="px-10 pb-12 pt-4">
              <div className="text-center space-y-4 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2 block">Nhiệm vụ thành công</span>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none">
                    TUYỆT VỜI!
                  </h2>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-slate-400 text-sm font-medium leading-relaxed max-w-[280px] mx-auto"
                >
                  Bạn đã hoàn thành bài học và sẵn sàng tiến đến thử thách tiếp theo.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col gap-4"
              >
                <button
                  onClick={onContinue}
                  className="group relative w-full h-16 flex items-center justify-center gap-3 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.25em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 group-hover:text-white transition-colors">Tiếp tục bài tiếp theo</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:text-white transition-all group-hover:translate-x-1" />
                </button>

                <button
                  onClick={onClose}
                  className="group flex items-center justify-center gap-2 w-full py-4 text-[9px] font-black text-slate-500 hover:text-slate-200 uppercase tracking-[0.3em] transition-all"
                >
                  <div className="w-4 h-[1px] bg-slate-800 group-hover:w-8 group-hover:bg-emerald-500 transition-all" />
                  Xem lại kết quả
                  <div className="w-4 h-[1px] bg-slate-800 group-hover:w-8 group-hover:bg-emerald-500 transition-all" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
