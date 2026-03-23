"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { FaExclamationTriangle, FaHome, FaRedoAlt } from "react-icons/fa";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export function MapEditorErrorScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-greyscale-900 text-greyscale-0 select-none">
      {/* Background Elements similar to loading.tsx */}
      <div className="absolute inset-0 bg-(image:--bg-pattern-grid) bg-repeat bg-size-[96px_96px] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(219,65,57,0.14),transparent_30%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-lg p-8 rounded-2xl bg-greyscale-800/60 backdrop-blur-xl border border-red-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(239,68,68,0.1)] text-center"
      >
        {/* Animated Warning Icon */}
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: 0.1,
          }}
          className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-red-500/10 border border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]"
        >
          <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse" />
          <FaExclamationTriangle className="text-4xl text-red-500 z-10 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-black mb-3 tracking-tighter uppercase italic text-red-400"
        >
          Lỗi Truy Cập Dữ Liệu
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-greyscale-300 mb-8 leading-relaxed text-sm font-medium tracking-wide"
        >
          Hệ thống không thể tải dữ liệu bài Lab. Mã số không hợp lệ, dữ liệu đã bị xóa, hoặc kết nối mạng gặp sự cố.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
        >
          <button
            onClick={() => window.location.reload()}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg overflow-hidden transition-all active:scale-95 shadow-lg"
          >
            <FaRedoAlt className="text-greyscale-300 group-hover:text-white transition-colors text-xs" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-greyscale-300 group-hover:text-white">Thử lại</span>
          </button>

          <button
            onClick={() => (window.location.href = "/lab-management")}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg overflow-hidden transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-400/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <FaHome className="text-red-400 z-10 text-sm" />
            <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] text-red-400">Quản lý Lab</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export class MapEditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MapEditor Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return <MapEditorErrorScreen />;
    }

    return this.props.children;
  }
}
